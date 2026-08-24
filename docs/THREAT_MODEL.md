# OpenAction threat model — v1.0 RC1

OpenAction coordinates consequential work. Its threat model treats approvals and permissions as security boundaries, not UI decoration.

| Threat | Failure | v1 control |
|---|---|---|
| Forged approval | attacker creates `approved=true` | scoped Approval Receipt, attributable approver, evidence snapshot, production proof required by conformance profile |
| Replay | valid old request executes twice | idempotency key + lifecycle state + organisation-side replay cache |
| Stale approval | system changes after review | Change Impact object + `reopen_on` dimensions + expiry/revocation |
| Confused deputy | service uses authority for another purpose | permission binds capability + resource + purpose + effect + constraints |
| Privilege escalation | agent approves its own consequential action | high/critical Core rule requires human or qualified-human approval |
| Evidence substitution | approval refers to different evidence | receipt binds a SHA-256 evidence snapshot + item ids |
| Over-broad reuse | Trust Passport treated as approval everywhere | passport is evidence only; each organisation records its own scoped decision receipt |
| Privacy leakage | raw documents copied into every workflow | prefer references, hashes, locators and minimum excerpts; domain systems remain source of truth |
| Prompt/document injection | untrusted content attempts to alter policy | content is evidence, never an approver; approval and permissions are out-of-band controls |
| Central capture | one vendor becomes mandatory trust root | no central OpenAction cloud; organisations keep identity, signing, domain records and execution infrastructure |

## Production proof
OpenAction intentionally does not invent a signature algorithm. A production receipt MUST bind to a proof mechanism the adopting organisation already trusts. Implementations MUST verify that proof before treating the receipt as authoritative.

## Non-goal
Passing OpenAction conformance is not itself legal, clinical, security or regulatory approval.