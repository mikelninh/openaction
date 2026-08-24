# V10 Stakeholder Review

Status: simulated design/acceptance review. This is **not** evidence of real-user usability, legal approval, clinical safety, institutional authority or production interoperability.

## Pass bar

A stakeholder perspective passes only if it can answer, from the default Simple view, without reconstructing the process elsewhere:

1. What is the goal?
2. Where are we now?
3. Is anything required from me now?
4. If yes, what exactly?
5. What counts as done?
6. Who checks / authoritatively confirms it?
7. What happens after my action?
8. When is the next milestone expected, or is timing explicitly unknown?

A reviewer/auditor perspective additionally must answer from Proof:

9. What evidence supports this state?
10. Which authoritative source owns that evidence?
11. Who had authority to submit/verify it?
12. What scope and validity does the verification have?
13. What changed or reopened?
14. Is there an unresolved dispute?
15. If money is relevant, where is it from budget through reconciliation?

## Simulated perspectives

### CareOS hospital pilot

| Perspective | Core state | Strict result |
|---|---|---|
| Clinical Owner | in progress | PASS — one clinical task, DoD and independent Clinical Safety verifier |
| Clinical Safety | waits / verifies | PASS — activates only on submitted clinical evidence; later owns Shadow evaluation |
| Privacy preparation | assigned | PASS — one scoped DPIA action, DPO verifier |
| DPO | waits / verifies | PASS — no work before submission, then explicit review |
| Security | verified | PASS — no artificial work; validity and change triggers available in Proof |
| Security Lead | verified verifier | PASS — attribution/evidence shown in Proof |
| Procurement | submitted | PASS — clearly says submitted and waiting on Legal rather than pretending complete |
| Legal | verifier | PASS — explicit submitted package and reject/verify path |
| Finance / Controlling | verified | PASS — budget state distinct from invoice/payment/reconciliation |
| Pilot Sponsor | waiting | PASS — not asked to approve until prerequisite reviews verify; also independently verifies budget scope |

Critical edge cases exercised:
- submitted contract != complete
- rejected evidence returns exactly to owner
- hosting change reopens Privacy + Security, not unrelated work
- model/safety change reopens Clinical/Evaluation
- old verified state can expire
- final pilot milestone is distinct from previous stage completion

### Naturalisation application

| Perspective | Core state | Strict result |
|---|---|---|
| Applicant | submitted | PASS — sees “submitted, waiting for case worker”, no duplicate upload prompt |
| Case worker | verifier | PASS — sees evidence acceptance DoD rather than generic “process application” |
| Specialist review | future owner | PASS — no artificial queue work before completeness |
| Decision authority | authoritative outcome | PASS — final decision requires authoritative receipt / delivery evidence |

Critical edge cases:
- document uploaded != document accepted
- completeness != substantive decision
- unknown authority SLA is not replaced with invented dates
- final state includes delivery/notification evidence, not merely “decision drafted”

### Housing benefit application

| Perspective | Core state | Strict result |
|---|---|---|
| Applicant | owner | PASS — exactly one missing document/action |
| Case worker | future owner/verifier | PASS — waits until required document arrives, then verifies |
| Specialist review | future owner / outcome authority | PASS — activated only after prerequisites |

Critical edge cases:
- missing month is explicit
- duplicate requests avoided by shared state
- “in processing” is not treated as useful status
- final notice must be generated/delivered to reach terminal outcome

### UG formation

| Perspective | Core state | Strict result |
|---|---|---|
| Founder | submitted | PASS — bank evidence submitted but not yet accepted |
| Notary | verifier then owner | PASS — verifies capital evidence, later owns filing |
| Register | verifier / authoritative outcome | PASS — filing acceptance and final register entry are distinct |

Critical edge cases:
- bank proof submitted != accepted
- notarial filing != register entry
- authoritative register receipt can close outcome without artificial second reviewer

### Publicly funded government digital project

| Perspective | Core state | Strict result |
|---|---|---|
| Project Owner | verifier / future owner | PASS — sees contract + budget blockers and later acceptance/outcome responsibilities |
| Procurement | submitted | PASS — contract record submitted, waiting for Project Owner verification |
| Finance / Controlling | in progress | PASS — budget binding distinct from invoice, payment and reconciliation |
| Supplier | future owner | PASS — delivery does not begin as “required” until contract/budget stage verifies |
| Independent QA | future verifier / owner | PASS — delivery and acceptance are distinct responsibilities |
| Public observer | read-only projection | PASS — sees publishable project/finance state without protected internal evidence IDs |
| Audit / Rechnungshof | proof read-only | PASS — can inspect authority, evidence, money trail, changes and disputes without mutating state |

Critical edge cases:
- €3.0m approved != €2.1m committed != €0.75m invoiced != €0.5m paid != €0.5m reconciled
- protected evidence IDs do not leak through public projection
- forecast €3.4m > approved €3.0m is surfaced as a dispute/risk
- material dispute blocks terminal completion until named resolution work verifies it
- paid != accepted delivery
- accepted delivery != measured outcome

## Cross-cutting correctness results

PASS:
- state vocabulary is non-collapsed
- owner/verifier separation for consequential peer review
- authoritative-receipt exception is explicit
- Definition of Done is mandatory at the interaction layer
- Evidence source and integrity proof are available in Proof
- scopes/validity are visible
- targeted Change Impact is represented
- expiry/reopen are first-class states
- terminal outcome is explicit
- timeline/history is attributable
- Simple view avoids proof density
- public/internal/restricted projections derive from the same graph
- finance states are separate from one another and from outcome
- responsive route supports desktop and mobile patterns

## What is NOT yet proven

The current pass is a **simulated acceptance pass**. The following remain empirical production gates:

1. first-time comprehension by real clinicians, DPOs, security staff, procurement, finance, citizens, case workers, founders, notaries, auditors and public observers;
2. real identity/authority connectors and revocation;
3. cryptographic signature/receipt verification against production trust anchors;
4. real hospital/authority/procurement/accounting integrations;
5. real ETA calibration from timestamps rather than illustrative plans;
6. real permission-policy review and redaction testing;
7. accessibility testing with assistive technology;
8. adversarial security/privacy review;
9. independent interoperability implementation;
10. real outcome and avoidable-waiting-time measurement.

## Real-world graduation test

V10 should graduate from “strong prototype” only after real participants complete representative cases without coaching and can answer the eight Simple-view questions above. Reviewers must independently trace a green node back to authority + evidence + scope + validity. Public observers must understand funding/outcome without seeing protected fields.

Target evidence:
- ≥ 5 external organisations or process owners
- ≥ 3 domains
- ≥ 2 independent implementations/adapters
- ≥ 20 first-time participants across stakeholder classes
- task comprehension / correct next action ≥ 90%
- false belief that “submitted = done” = 0%
- protected-data disclosure in public projection = 0 observed
- every green consequential node traceable to evidence + verifier/receipt = 100%

Until then, call V10 **10/10 design target / reference prototype**, not a proven 10/10 production system.
