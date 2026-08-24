# OpenAction Trust & Control V10

Status: non-normative product/UX contract for OpenAction 1.0-rc1. It does not change the normative protocol schemas.

## North star

**One case. One shared truth. Different permissioned views.**

Every stakeholder must be able to answer, without reconstructing the process from email or meetings:

1. Where are we now?
2. Who owns each open item?
3. Is that person merely assigned, actively working, submitted, or actually verified?
4. What exactly counts as done?
5. Who verifies it?
6. What evidence proves it?
7. What is the authoritative source?
8. When is the next milestone expected, and how certain is that estimate?
9. What does my action unlock?
10. What still prevents the case from being terminally complete?

## Two-layer UX

### Simple
Default for citizens, clinicians, founders, sponsors and most daily use.

Shows only:
- case goal
- Shared Now
- current required work and state
- expected next milestone
- My Action / no-action state
- Definition of Done
- verifier
- visual route to terminal outcome

### Proof
Opt-in for reviewers, auditors, controllers, security, legal and investigations.

Adds:
- identity and authority source
- scope and validity
- authoritative evidence source
- evidence reference
- integrity hash
- attributable verifier/signature or authoritative receipt
- event history
- change impact and reopen reason
- disputes
- permissioned financial flow

## Completion Contract

A consequential node moves through explicit states:

`assigned → in_progress → submitted → verified`

Alternative transitions:

- `submitted → rejected → in_progress`
- `verified → expired`
- `verified → reopened` after relevant scope change

Rules:

- `submitted` is never complete.
- Green means `verified`, not "someone clicked done".
- A task must declare Definition of Done before execution.
- Verification requires evidence or an authoritative receipt.
- For consequential peer-reviewed tasks, Owner and Verifier must be distinct authorities.
- A true authoritative outcome may use its authoritative receipt instead of a second human reviewer.
- Every transition is attributable and timestamped.
- Rejection or reopen affects only impacted nodes.

## Terminal case completion

A case is complete only when:

- all required terminal-path tasks are verified;
- the declared outcome Definition of Done is satisfied;
- no material unresolved dispute still blocks the outcome;
- required financial reconciliation is complete when money is part of the outcome;
- required authoritative receipts remain valid for the current scope.

The final state must be explicit. The last workflow stage is not automatically equivalent to completion.

## Time and forecast

OpenAction separates:

- planned duration / SLA
- started_at
- submitted_at
- verified_at
- due_at
- current expected milestone date/range
- confidence / provenance of the estimate

Unknown or organisation-dependent duration must remain explicitly unknown. Do not manufacture precise ETAs.

Historical real data may later power empirical forecasts, but synthetic demo values must stay labelled as illustrative.

## Identity and authority

A display name is not authority.

Every consequential actor or verifier should resolve to an authoritative identity/mandate source, for example:

- hospital IAM + role assignment
- DPO register
- procurement approval group
- finance role registry
- eID + applicant identity
- notarial mandate
- authoritative register office
- public-project owner mandate

A verifier action is valid only inside the actor's current mandate and scope.

## Evidence and integrity

OpenAction should reference authoritative evidence rather than duplicate systems of record.

Evidence records should support:

- source system
- stable evidence ID
- scope
- content hash or equivalent integrity proof where appropriate
- attributable signature / verifier or authoritative receipt
- created/submitted/verified timestamps
- validity / expiry
- supersedes / superseded-by relationship

OpenAction is a coordination and evidence graph, not the new system of record for every domain.

## Money & Resource Trail

Financial state is deliberately non-collapsed:

`approved → committed → invoiced → paid → reconciled`

These are not synonyms.

- invoice != payment
- payment != accepted delivery
- accepted delivery != verified outcome
- budget != forecast

Each financial node references an authoritative budget, procurement, accounting or payment source.

For public projects, a public projection may expose budget, award/contract, supplier, milestones, aggregate payments, reconciliation and outcomes while restricted fields remain protected.

Public, internal and restricted views must be projections of the **same graph**, not separately maintained copies.

## Permissions

Visibility is field/node scoped, not all-or-nothing.

Typical projections:

- `public`: purpose, budget/contract values where publishable, milestones, aggregate payments, outcomes, public evidence IDs
- `internal`: operational owners, forecasts, internal milestones, cost-centre references
- `restricted`: personal data, bank details, privileged legal/security detail, sensitive invoice data

Redaction must never change the state or identity of the underlying node.

## Change Impact

A relevant change must declare which assumptions it invalidates.

Examples:

- model version change → clinical / evaluation review
- hosting or data-flow change → privacy + security
- contract value/scope change → procurement + finance + sponsor
- UI copy only → no approval reopen unless it changes intended use or user behaviour materially

A case must never use "everything green forever" semantics.

## Disputes

Conflicting claims are first-class state, not hidden in comments.

Examples:

- supplier says delivered; QA says acceptance criteria failed
- finance says paid; controller cannot reconcile payment to accepted milestone
- forecast exceeds approved budget

A material unresolved dispute blocks terminal completion until a named resolution task or authoritative decision disposes it.

## Accessibility and clarity acceptance

The default case screen should let a first-time stakeholder answer in ~10 seconds:

- What is the goal?
- Where are we?
- Am I required now?
- If yes, what exactly do I do?
- What counts as done?
- Who checks me?
- What happens next?

The proof view should let a reviewer answer:

- What evidence supports this green state?
- Who had authority to verify it?
- Is it still valid for this scope?
- What changed since the last verification?

## Cross-domain stress cases

V10 must work for at least:

- CareOS hospital pilot
- naturalisation application
- housing-benefit application
- UG formation
- publicly funded government digital project

The interaction grammar stays constant while domain evidence, authorities, visibility and completion definitions vary.
