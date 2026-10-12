"""ActionRail: bounded agent policy & receipt contract; no LLM can grant itself authority."""
from __future__ import annotations
import base64, hashlib, hmac, json, time
from dataclasses import dataclass
from typing import Literal

Verdict = Literal['AUTO', 'REVIEW', 'DENY']
SENSITIVE = {'spend_money', 'sign_contract', 'change_bank', 'delete_data',
             'legal_commitment', 'medical_decision', 'contractor_booking',
             'safety_response', 'refund', 'grant_access'}
ALLOWED_AUTO = {'acknowledge', 'acknowledge_static', 'answer_faq', 'classify', 'prepare_draft', 'update_case', 'notify_manager'}

@dataclass(frozen=True)
class Decision:
    verdict: Verdict
    reason: str
    policy_version: str = 'actionrail.v1'

def decide(action: str, *, has_customer_approval: bool = False, confidence: float = 0,
           policy_enabled: bool = True, input_trusted: bool = True) -> Decision:
    if not policy_enabled:
        return Decision('DENY', 'Tenant automation disabled')
    if action in SENSITIVE:
        return Decision('REVIEW' if not has_customer_approval else 'AUTO', 'Requires tenant authority and documented approval')
    if action not in ALLOWED_AUTO:
        return Decision('DENY', 'Action not allowlisted')
    if not input_trusted and action not in {'classify', 'prepare_draft', 'acknowledge_static'}:
        return Decision('REVIEW', 'Untrusted input cannot trigger external actions')
    if action in {'answer_faq', 'acknowledge', 'acknowledge_static'} and confidence < .9:
        return Decision('REVIEW', 'Confidence below externally-visible automation threshold')
    return Decision('AUTO', 'Allowlisted, bounded action')

def canonical(data: dict) -> bytes:
    return json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()

def receipt(previous_hash: str, action: dict) -> dict:
    """Tamper-evident local hash chain. NOT cryptographic proof of external execution."""
    payload = {'previous_hash': previous_hash, 'action': action, 'created_at': int(time.time())}
    return {**payload, 'hash': hashlib.sha256(canonical(payload)).hexdigest()}

def verify_stripe_signature(body: bytes, signature: str, secret: str, *, now=None) -> bool:
    if not secret or not signature:
        return False
    try:
        pairs = [x.split('=', 1) for x in signature.split(',') if '=' in x]
        t = int(next(v for k, v in pairs if k == 't'))
        sigs = [v for k, v in pairs if k == 'v1']
    except (StopIteration, ValueError):
        return False
    if abs((time.time() if now is None else now) - t) > 300:
        return False
    expected = hmac.new(secret.encode(), f'{t}.'.encode() + body, hashlib.sha256).hexdigest()
    return any(hmac.compare_digest(expected, val) for val in sigs)

def verify_resend_signature(body: bytes, headers: dict, secret: str, *, now=None) -> bool:
    if not secret.startswith('whsec_'):
        return False
    mid = headers.get('svix-id', '')
    timestamp = headers.get('svix-timestamp', '')
    signature = headers.get('svix-signature', '')
    try:
        if abs((time.time() if now is None else now) - int(timestamp)) > 300:
            return False
        key = base64.b64decode(secret.removeprefix('whsec_') + '===')
        content = mid.encode() + b'.' + timestamp.encode() + b'.' + body
        expected = base64.b64encode(hmac.new(key, content, hashlib.sha256).digest()).decode()
        return any(hmac.compare_digest(expected, sig.split(',', 1)[1])
                   for sig in signature.split(' ') if sig.startswith('v1,'))
    except (ValueError, IndexError):
        return False

def category(text: str) -> tuple[str, int, str]:
    t = text.lower()
    urgent = ('gasgeruch', 'gasleck', 'gas leak', 'rauch', 'feuer', 'brand', 'wasserrohrbruch', 'flood', 'stromschlag', 'notfall')
    if any(w in t for w in urgent):
        return 'Emergency', 5, 'SAFETY'
    if any(w in t for w in ('anwalt', 'klage', 'gericht', 'datenschutz', 'kündigung', 'schimmel', 'mold', 'miete mindern', 'mietminderung')):
        return 'Sensitive', 4, 'LEGAL_OR_HEALTH'
    if any(w in t for w in ('heizung', 'heizkörper', 'heizt nicht', 'heating', 'warmwasser', 'hot water')):
        return 'Heating', 3, 'MAINTENANCE'
    if any(w in t for w in ('rechnung', 'invoice', 'zahlung', 'mahnung', 'nebenkosten')):
        return 'Finance', 3, 'FINANCE'
    if any(w in t for w in ('schlüssel', 'key', 'tür', 'door', 'klingel', 'aufzug', 'elevator')):
        return 'Maintenance', 2, 'MAINTENANCE'
    return 'General', 1, 'GENERAL'

def draft_reply(kind: str, name: str = '') -> str:
    greeting = ('Guten Tag ' + name.strip() + ',') if name.strip() else 'Guten Tag,'
    messages = {
        'Emergency': 'Ihre Nachricht wurde als möglicherweise dringender Sicherheitsvorfall markiert und an die zuständige Person zur sofortigen Prüfung weitergeleitet. Falls akute Gefahr besteht, kontaktieren Sie bitte unverzüglich die örtlichen Notdienste. Dies ist keine Bestätigung, dass bereits Hilfe unterwegs ist.',
        'Sensitive': 'Vielen Dank für Ihre Nachricht. Wir leiten diese an das zuständige Team zur persönlichen Prüfung weiter. Wir geben keine verbindliche rechtliche oder gesundheitliche Einschätzung per automatischer Antwort.',
        'Heating': 'Vielen Dank für Ihre Meldung zur Heizung oder Warmwasserversorgung. Wir haben sie erfasst und zur Bearbeitung eingeordnet. Es wurde noch kein Handwerker beauftragt.',
        'Finance': 'Vielen Dank. Ihre Anfrage zu Zahlung oder Abrechnung ist eingegangen. Sie wird durch die zuständige Stelle geprüft; es wurde keine Zahlung ausgelöst.',
        'Maintenance': 'Vielen Dank für Ihren Hinweis. Ihre technische Anfrage wurde erfasst und zur weiteren Prüfung eingeordnet. Ein Termin wurde noch nicht vereinbart.',
        'General': 'Vielen Dank für Ihre Nachricht. Wir haben Ihre Anfrage erhalten und prüfen die nächsten Schritte.'
    }
    return f'{greeting}\\n\\n{messages[kind]}\\n\\nFreundliche Grüße\\nIhr Hausverwaltungs-Team'
