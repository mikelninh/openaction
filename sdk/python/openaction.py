from __future__ import annotations
from copy import deepcopy
from datetime import datetime, timezone
from uuid import uuid4
VERSION="1.0-rc1"; RISKS={"low","medium","high","critical"}
TRANSITIONS={"proposed":{"ready","cancelled"},"ready":{"approved","cancelled","expired"},"approved":{"executing","cancelled","expired"},"executing":{"succeeded","failed"},"succeeded":set(),"failed":set(),"cancelled":set(),"expired":set()}
def _now(): return datetime.now(timezone.utc).isoformat().replace("+00:00","Z")
def _uid(p): return f"{p}_{uuid4()}"
def create(**input):
    for k in ("kind","label","reason"):
        if not input.get(k): raise ValueError(f"{k} is required")
    risk=input.get("risk","low"); high=risk in {"high","critical"}
    if risk not in RISKS: raise ValueError("invalid risk")
    approval=input.get("approval") or {"required":high,"mode":"qualified_human" if high else "none","status":"pending" if high else "not_required"}
    if high and (not approval.get("required") or approval.get("mode") not in {"human","qualified_human"}): raise ValueError("high/critical actions require human approval")
    evidence=[]
    for item in input.get("evidence",[]):
        item={"kind":"other","source":item} if isinstance(item,str) else dict(item); item.setdefault("id",_uid("ev")); item.setdefault("kind","other"); item.setdefault("source","unknown"); evidence.append(item)
    out={"openaction":VERSION,"id":input.get("id",_uid("oa")),"kind":input["kind"],"label":input["label"],"status":input.get("status","proposed"),"reason":input["reason"],"actor":input.get("actor",{"type":"service","id":"local"}),"created_at":input.get("created_at",_now()),"evidence":evidence,"risk":risk,"permissions":input.get("permissions",[]),"approval":approval,"reversible":bool(input.get("reversible",False))}
    for k in ("case_id","idempotency_key","correlation_id"):
        if input.get(k): out[k]=input[k]
    return out
def validate(action):
    errors=[]
    if action.get("openaction")!=VERSION: errors.append("openaction must be 1.0-rc1")
    if not str(action.get("id","")).startswith("oa_"): errors.append("id must start oa_")
    if "." not in str(action.get("kind","")): errors.append("kind must be namespaced")
    if not action.get("created_at"): errors.append("created_at required")
    if not action.get("evidence"): errors.append("evidence required")
    if action.get("risk") not in RISKS: errors.append("invalid risk")
    if action.get("risk") in {"high","critical"} and (not action.get("approval",{}).get("required") or action.get("approval",{}).get("mode") not in {"human","qualified_human"}): errors.append("high/critical requires human approval")
    return {"ok":not errors,"errors":errors}
def transition(action,next_status):
    if next_status not in TRANSITIONS.get(action.get("status"),set()): raise ValueError(f"invalid transition {action.get('status')} -> {next_status}")
    out=deepcopy(action); out["status"]=next_status; out["updated_at"]=_now(); return out
def apply_receipt(action,receipt):
    if receipt.get("decision")!="approved": raise ValueError("approved receipt required")
    if receipt.get("scope",{}).get("subject") not in {action.get("id"),action.get("kind")}: raise ValueError("receipt scope mismatch")
    out=deepcopy(action); out["approval"]={**out.get("approval",{}),"required":True,"status":"approved","receipt_id":receipt["id"],"conditions":receipt.get("conditions",[])}
    if receipt.get("expires_at"): out["approval"]["expires_at"]=receipt["expires_at"]
    if out.get("status")=="ready": out["status"]="approved"
    out["updated_at"]=_now(); return out
