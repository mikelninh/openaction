"""HausPilot ZeroOps HTTP service. Local SQLite for pilots; durable managed DB required for production."""
from __future__ import annotations
import hashlib, hmac, json, os, secrets, sqlite3, time, uuid
from contextlib import contextmanager
from pathlib import Path
from urllib.parse import quote
import httpx
from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr, Field
from .actionrail import category, decide, draft_reply, receipt, verify_resend_signature, verify_stripe_signature

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = os.getenv('DATABASE_PATH', str(ROOT / 'data.sqlite3'))
DEMO_MODE = os.getenv('DEMO_MODE', 'false').lower() == 'true'
PAYMENT_LINK = os.getenv('STRIPE_PAYMENT_LINK', '')
INBOUND_DOMAIN = os.getenv('RESEND_INBOUND_DOMAIN', '').strip().lower()
RESEND_KEY = os.getenv('RESEND_API_KEY', '')
RESEND_FROM = os.getenv('RESEND_FROM', '')
WEBHOOK_SECRET = os.getenv('RESEND_WEBHOOK_SECRET', '')
STRIPE_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')
PUBLIC_BASE_URL = os.getenv('PUBLIC_BASE_URL', 'http://localhost:8000')
app = FastAPI(title='HausPilot + ActionRail', version='0.1.0')

@contextmanager
def db():
    p = Path(DB_PATH)
    p.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(str(p), timeout=10)
    con.row_factory = sqlite3.Row
    con.execute('PRAGMA foreign_keys = ON')
    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()

def init_db():
    with db() as c:
        c.executescript('''
        CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, company TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE, token_hash TEXT NOT NULL, state TEXT NOT NULL,
          automation_enabled INTEGER NOT NULL DEFAULT 1, inbox TEXT UNIQUE, created INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY, company TEXT NOT NULL,
          email TEXT NOT NULL, token_hash TEXT NOT NULL, expires INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
          source_id TEXT NOT NULL, sender TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL,
          category TEXT NOT NULL, priority INTEGER NOT NULL, state TEXT NOT NULL,
          draft TEXT NOT NULL, created INTEGER NOT NULL, updated INTEGER NOT NULL,
          UNIQUE(tenant_id, source_id));
        CREATE TABLE IF NOT EXISTS receipts (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL,
          action TEXT NOT NULL, previous_hash TEXT NOT NULL, hash TEXT NOT NULL, payload TEXT NOT NULL, created INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS webhook_events (provider TEXT NOT NULL, event_id TEXT NOT NULL,
          created INTEGER NOT NULL, PRIMARY KEY(provider,event_id));
        ''')
init_db()

class Signup(BaseModel):
    company: str = Field(min_length=2, max_length=120)
    email: EmailStr

class CaseIn(BaseModel):
    sender: EmailStr
    subject: str = Field(min_length=1, max_length=180)
    body: str = Field(min_length=1, max_length=8000)
    source_id: str | None = Field(default=None, max_length=128)

class PolicyEvaluation(BaseModel):
    action: str = Field(min_length=1, max_length=80)
    confidence: float = Field(default=0, ge=0, le=1)
    input_trusted: bool = False

class Feedback(BaseModel):
    case_id: str
    verdict: str = Field(pattern='^(accepted|corrected|unsafe)$')
    notes: str = Field(default='', max_length=600)

def sha(token): return hashlib.sha256(token.encode()).hexdigest()

def issue_tenant(company: str, email: str):
    token = secrets.token_urlsafe(36)
    tid = 'hp_' + uuid.uuid4().hex[:14]
    with db() as c:
        old = c.execute('SELECT id FROM tenants WHERE email=?',(email,)).fetchone()
        if old: raise HTTPException(409,'Account already exists. Contact your account owner.')
        c.execute('INSERT INTO tenants VALUES (?,?,?,?,?,?,?,?)',
                  (tid,company,email,sha(token),'trial',1,tid+'@'+INBOUND_DOMAIN if INBOUND_DOMAIN else tid+'@inbox.invalid',int(time.time())))
    return {'tenant_id':tid,'access_token':token,'state':'trial','note':'Save this token securely; it is shown once.'}

def auth(authorization: str | None):
    token = (authorization or '').removeprefix('Bearer ').strip()
    if len(token)<32: raise HTTPException(401,'Access token required')
    with db() as c:
        row=c.execute('SELECT * FROM tenants WHERE token_hash=?',(sha(token),)).fetchone()
    if not row: raise HTTPException(401,'Invalid access token')
    return dict(row)

def write_receipt(tenant_id: str, action: dict):
    with db() as c:
        last = c.execute('SELECT hash FROM receipts WHERE tenant_id=? ORDER BY rowid DESC LIMIT 1',(tenant_id,)).fetchone()
        item=receipt(last['hash'] if last else 'GENESIS',action)
        c.execute('INSERT INTO receipts VALUES (?,?,?,?,?,?,?)',
                  (uuid.uuid4().hex,tenant_id,action.get('type','unknown'),item['previous_hash'],item['hash'],json.dumps(action,ensure_ascii=False),item['created_at']))
    return item

def new_case(tenant_id: str, item: CaseIn):
    source=item.source_id or uuid.uuid4().hex
    kind,priority,risk=category(item.subject+'\n'+item.body)
    text=draft_reply(kind)
    # No auto send for untrusted inbound content, emergencies, legal or financial matters.
    policy=decide('acknowledge_static',confidence=.95,input_trusted=False)
    state='needs_review' if risk in {'SAFETY','LEGAL_OR_HEALTH','FINANCE'} else 'draft_ready'
    ident='case_'+uuid.uuid4().hex[:14]
    with db() as c:
        existing=c.execute('SELECT id FROM cases WHERE tenant_id=? AND source_id=?',(tenant_id,source)).fetchone()
        if existing:return {'id':existing['id'],'duplicate':True}
        c.execute('INSERT INTO cases VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                  (ident,tenant_id,source,item.sender,item.subject,item.body,kind,priority,state,text,int(time.time()),int(time.time())))
    write_receipt(tenant_id,{'type':'classify','case_id':ident,'category':kind,'priority':priority,'risk':risk,'decision':policy.verdict,'status':state})
    return {'id':ident,'category':kind,'priority':priority,'risk':risk,'status':state,'draft':text,'duplicate':False,'policy':policy.verdict}

async def intake(tenant:dict,item:CaseIn):
    result=new_case(tenant['id'],item)
    if result.get('duplicate'):
        return result
    # Zero routine founder involvement: only static, preapproved acknowledgement,
    # never a generated commitment or answer to untrusted email instructions.
    # Paid tenant opt-in and verified provider settings are both mandatory.
    safe=result['category'] in {'General','Maintenance','Heating'}
    eligible=safe and result['status']=='draft_ready' and tenant['state']=='active' and tenant['automation_enabled']
    if eligible and RESEND_KEY and RESEND_FROM and item.sender.lower()!=RESEND_FROM.lower():
        try:
            outcome=await send_email(str(item.sender),'Re: '+item.subject,result['draft'])
            if outcome['sent']:
                with db() as c:
                    c.execute('UPDATE cases SET state=?,updated=? WHERE tenant_id=? AND id=?',
                              ('acknowledged',int(time.time()),tenant['id'],result['id']))
                write_receipt(tenant['id'],{'type':'send_static_acknowledgement',
                                            'case_id':result['id'],'provider_id':outcome.get('result'),
                                            'policy':'preapproved_static_only'})
                result['status']='acknowledged'
        except Exception:
            # Failed provider calls leave the case visible for customer handling.
            write_receipt(tenant['id'],{'type':'send_failed','case_id':result['id']})
    return result

async def send_email(to: str, subject: str, body: str, *, reply_to=None):
    if not (RESEND_KEY and RESEND_FROM): return {'sent':False,'reason':'Resend not configured'}
    data={'from':RESEND_FROM,'to':[to],'subject':subject,'text':body}
    if reply_to: data['reply_to'] = reply_to
    async with httpx.AsyncClient(timeout=15) as client:
        response=await client.post('https://api.resend.com/emails',json=data,headers={'Authorization':'Bearer '+RESEND_KEY})
        response.raise_for_status()
        return {'sent':True,'result':response.json().get('id')}

@app.get('/api/health')
def health():return {'status':'ok','mode':'demo' if DEMO_MODE else 'pilot','billing_configured':bool(PAYMENT_LINK),'email_configured':bool(RESEND_KEY and RESEND_FROM),'caveat':'SQLite is local pilot storage'}

@app.get('/',response_class=HTMLResponse)
def homepage():return (ROOT/'web'/'index.html').read_text(encoding='utf-8')

@app.post('/api/signup/request')
async def signup_request(model: Signup):
    if not (RESEND_KEY and RESEND_FROM):raise HTTPException(503,'Email delivery not configured; public signup disabled')
    token=secrets.token_urlsafe(36)
    key=uuid.uuid4().hex
    with db() as c:
        if c.execute('SELECT 1 FROM tenants WHERE email=?',(str(model.email),)).fetchone():
            return {'status':'check_email'}
        c.execute('INSERT INTO invites VALUES (?,?,?,?,?)',
                  (key,model.company,str(model.email),sha(token),int(time.time())+900))
    url=f'{PUBLIC_BASE_URL}/api/signup/verify?id={quote(key)}&token={quote(token)}'
    await send_email(str(model.email),'Verify your HausPilot account',f'Open this link within 15 minutes:\n{url}')
    return {'status':'check_email'}

@app.get('/api/signup/verify')
def signup_verify(id:str,token:str):
    with db() as c:
        row=c.execute('SELECT * FROM invites WHERE id=?',(id,)).fetchone()
        if not row or row['expires']<time.time() or not hmac.compare_digest(sha(token),row['token_hash']):
            raise HTTPException(400,'Invalid or expired invitation')
        c.execute('DELETE FROM invites WHERE id=?',(id,))
    return issue_tenant(row['company'],row['email'])

@app.post('/api/demo/register')
def demo_register(model:Signup):
    if not DEMO_MODE:raise HTTPException(404)
    return issue_tenant(model.company,str(model.email))

@app.get('/api/account')
def account(authorization:str|None=Header(default=None)):
    t=auth(authorization)
    return {k:t[k] for k in ('id','company','email','state','automation_enabled','inbox')}

@app.get('/api/billing/link')
def billing_link(authorization:str|None=Header(default=None)):
    t=auth(authorization)
    if not PAYMENT_LINK:raise HTTPException(503,'Stripe payment link not configured')
    sep='&' if '?' in PAYMENT_LINK else '?'
    return {'url':PAYMENT_LINK+sep+'client_reference_id='+quote(t['id'])}

@app.post('/api/webhooks/stripe')
async def stripe_hook(request:Request):
    body=await request.body()
    if not verify_stripe_signature(body,request.headers.get('stripe-signature',''),STRIPE_SECRET):raise HTTPException(401)
    event=json.loads(body)
    event_id=event.get('id','')
    if not event_id:raise HTTPException(400)
    kind=event.get('type','')
    obj=event.get('data',{}).get('object',{})
    with db() as c:
        try: c.execute('INSERT INTO webhook_events VALUES (?,?,?)',('stripe',event_id,int(time.time())))
        except sqlite3.IntegrityError: return {'status':'duplicate'}
        if kind=='checkout.session.completed' and obj.get('payment_status')=='paid':
            tid=obj.get('client_reference_id','')
            c.execute('UPDATE tenants SET state=? WHERE id=?',('active',tid))
        # Subscription state transitions require a verified customer/subscription mapping;
        # do not infer tenant from arbitrary metadata or silently deactivate accounts.
    return {'status':'received','type':kind}

@app.get('/api/cases')
def cases(authorization:str|None=Header(default=None)):
    t=auth(authorization)
    with db() as c:rows=c.execute('SELECT id,subject,sender,category,priority,state,draft,created FROM cases WHERE tenant_id=? ORDER BY created DESC LIMIT 100',(t['id'],)).fetchall()
    return {'cases':[dict(x) for x in rows]}

@app.post('/api/cases')
async def create_case(item:CaseIn,authorization:str|None=Header(default=None)):
    t=auth(authorization)
    if t['state'] not in ('trial','active'):raise HTTPException(402,'Subscription inactive')
    return await intake(t,item)

@app.post('/api/cases/{case_id}/approve')
async def approve(case_id:str,authorization:str|None=Header(default=None)):
    t=auth(authorization)
    with db() as c:
        row=c.execute('SELECT * FROM cases WHERE tenant_id=? AND id=?',(t['id'],case_id)).fetchone()
    if not row:raise HTTPException(404)
    if row['state']=='sent':raise HTTPException(409,'Already sent')
    # Authorized tenant owner explicitly approves the single draft; no silent third-party booking.
    send=await send_email(row['sender'],'Re: '+row['subject'],row['draft'])
    if not send['sent']:raise HTTPException(503,send['reason'])
    with db() as c:
        c.execute('UPDATE cases SET state=?,updated=? WHERE id=? AND tenant_id=?',('sent',int(time.time()),case_id,t['id']))
    write_receipt(t['id'],{'type':'send_approved_reply','case_id':case_id,'email_id':send.get('result'),'approved_by':'tenant_owner'})
    return {'status':'sent','provider_id':send.get('result')}

@app.get('/api/receipts')
def receipts(authorization:str|None=Header(default=None)):
    t=auth(authorization)
    with db() as c:rows=c.execute('SELECT action,previous_hash,hash,payload,created FROM receipts WHERE tenant_id=? ORDER BY rowid DESC LIMIT 100',(t['id'],)).fetchall()
    return {'receipts':[dict(x) for x in rows]}

@app.post('/api/actions/evaluate')
def evaluate_action(item:PolicyEvaluation, authorization:str|None=Header(default=None)):
    """Horizon 2: authenticated policy evaluation, never permission or execution.

    Caller cannot assert human approval. A REVIEW verdict is not executable.
    """
    tenant=auth(authorization)
    decision=decide(item.action,confidence=item.confidence,input_trusted=item.input_trusted,
                    policy_enabled=bool(tenant['automation_enabled']),has_customer_approval=False)
    write_receipt(tenant['id'],{'type':'policy_evaluation','action':item.action,'verdict':decision.verdict,
                                 'policy_version':decision.policy_version})
    return {'verdict':decision.verdict,'reason':decision.reason,'policy_version':decision.policy_version,
            'executed':False,'customer_approval_required':decision.verdict=='REVIEW'}

@app.get('/api/metrics')
def metrics(authorization:str|None=Header(default=None)):
    t=auth(authorization)
    with db() as c:
        rows=c.execute('SELECT state,COUNT(*) n FROM cases WHERE tenant_id=? GROUP BY state',(t['id'],)).fetchall()
        total=sum(x['n'] for x in rows)
    return {'cases':total,'by_state':{x['state']:x['n'] for x in rows},'verified_minutes_saved':None,
            'message':'Minutes saved require observed baseline and time studies; not inferred from case count.'}

@app.post('/api/webhooks/resend')
async def resend_hook(request:Request):
    body=await request.body()
    if not verify_resend_signature(body,{k.lower():v for k,v in request.headers.items()},WEBHOOK_SECRET):raise HTTPException(401)
    event=json.loads(body)
    event_id=request.headers.get('svix-id','')
    with db() as c:
        try:c.execute('INSERT INTO webhook_events VALUES (?,?,?)',('resend',event_id,int(time.time())))
        except sqlite3.IntegrityError:return {'status':'duplicate'}
    if event.get('type')!='email.received':return {'status':'ignored'}
    payload=event.get('data',{})
    to=payload.get('to',[])
    if not isinstance(to,list) or not to:return {'status':'ignored'}
    # Routing tenant-specific verified inboxes only. Never trust arbitrary sender-provided tenant ID.
    address=to[0].lower()
    with db() as c:tenant=c.execute('SELECT * FROM tenants WHERE lower(inbox)=?',(address,)).fetchone()
    if not tenant:return {'status':'unmapped'}
    eid=payload.get('email_id')
    if not eid or not RESEND_KEY:raise HTTPException(503,'Resend fetch not configured')
    async with httpx.AsyncClient(timeout=15) as client:
        r=await client.get('https://api.resend.com/emails/receiving/'+quote(eid,safe=''),headers={'Authorization':'Bearer '+RESEND_KEY})
        r.raise_for_status();data=r.json()
    content=data.get('text') or 'No plain text available; requires human review'
    info=CaseIn(sender=payload.get('from','unknown@example.com').split('<')[-1].rstrip('>'),subject=payload.get('subject','(no subject)')[:180],body=content[:8000],source_id=eid)
    return await intake(dict(tenant),info)