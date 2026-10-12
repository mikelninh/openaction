import base64, hashlib, hmac, os, time
os.environ["DATABASE_PATH"] = "/tmp/hauspilot_test_" + str(os.getpid()) + ".sqlite3"
os.environ["DEMO_MODE"] = "true"
from fastapi.testclient import TestClient
from api.actionrail import decide, category, verify_stripe_signature, verify_resend_signature
from api.main import app
client = TestClient(app)

def test_gate():
    assert decide("spend_money", confidence=1).verdict == "REVIEW"
    assert decide("unknown_permission", confidence=1).verdict == "DENY"
    assert decide("acknowledge_static", confidence=.95, input_trusted=False).verdict == "AUTO"
    assert decide("acknowledge", confidence=.95, input_trusted=False).verdict == "REVIEW"

def test_routing():
    assert category("Gasgeruch im Haus")[0] == "Emergency"
    assert category("Anwalt und Schimmel")[0] == "Sensitive"
    assert category("Heizung kaputt")[0] == "Heating"

def test_stripe_hmac():
    payload = b"{}"
    now = int(time.time())
    sig = hmac.new(b"sec", str(now).encode() + b"." + payload, hashlib.sha256).hexdigest()
    assert verify_stripe_signature(payload, f"t={now},v1={sig}", "sec", now=now)
    assert not verify_stripe_signature(payload+b"!", f"t={now},v1={sig}", "sec", now=now)

def test_svix_hmac():
    payload = b"{}"
    now = int(time.time())
    key = b"svix_test"
    secret = "whsec_" + base64.b64encode(key).decode()
    val = base64.b64encode(hmac.new(key,b"m."+str(now).encode()+b"."+payload,hashlib.sha256).digest()).decode()
    h = {"svix-id":"m","svix-timestamp":str(now),"svix-signature":"v1,"+val}
    assert verify_resend_signature(payload,h,secret,now=now)
    assert not verify_resend_signature(payload+b"x",h,secret,now=now)

def test_multi_tenant_and_fail_closed():
    a = client.post("/api/demo/register", json={"company":"Example A","email":"p_a@example.com"}).json()
    b = client.post("/api/demo/register", json={"company":"Example B","email":"p_b@example.com"}).json()
    h = {"Authorization":"Bearer "+a["access_token"]}
    r = client.post("/api/cases",headers=h,json={"sender":"r@example.com","subject":"Gasgeruch","body":"urgent","source_id":"one"})
    assert r.status_code == 200
    assert r.json()["status"]=="needs_review"
    assert client.post("/api/cases",headers=h,json={"sender":"r@example.com","subject":"Gasgeruch","body":"urgent","source_id":"one"}).json()["duplicate"]
    assert len(client.get("/api/cases",headers=h).json()["cases"])==1
    assert client.get("/api/cases",headers={"Authorization":"Bearer "+b["access_token"]}).json()["cases"] == []
    assert client.post("/api/cases/"+r.json()["id"]+"/approve",headers=h).status_code==503
    assert client.post("/api/webhooks/stripe",content=b"{}").status_code==401
    assert client.post("/api/webhooks/resend",content=b"{}").status_code==401

def test_actionrail_api_never_executes_sensitive_action():
    t=client.post("/api/demo/register",json={"company":"Security Tester","email":"security_tester@demo.de"}).json()
    headers={"Authorization":"Bearer "+t["access_token"]}
    result=client.post("/api/actions/evaluate",headers=headers,json={"action":"spend_money","confidence":1,"input_trusted":True})
    assert result.status_code==200
    assert result.json()["verdict"]=="REVIEW"
    assert result.json()["executed"] is False
    assert client.post("/api/actions/evaluate",json={"action":"classify"}).status_code==401
