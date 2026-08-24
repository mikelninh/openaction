# OpenAction Project Graph V9

> Non-normative UX / implementation guidance. This does not change the OpenAction 1.0-rc1 protocol schemas.

## Principle

**One case. One graph. Multiple permissioned projections.**

A complex project is not only a task list. The same case can contain linked nodes for:

- people / organizations
- tasks and milestones
- approvals / decisions
- evidence
- budget sources
- commitments / contracts
- invoices
- payments
- reconciliations
- outcomes

OpenAction should not become the authoritative ledger, HR system, procurement system, hospital system, register or document archive. It stores or exchanges the minimum case state plus stable references to the authoritative source.

## Completion contract

A required task moves through explicit states:

`assigned -> in_progress -> submitted -> verified`

Alternative transitions:

`submitted -> rejected -> submitted`

`verified -> expired`

`verified -> reopened` when a material change invalidates the prior scope.

A task is **done** only if:

1. its Definition of Done is satisfied;
2. required evidence is present;
3. the correct verifier confirms it, or an authoritative receipt proves completion;
4. the decision/evidence is still valid for the current scope.

Owner and verifier should be different for consequential peer-reviewed tasks. An authoritative receipt can replace peer verification where the source system itself is the authority (for example a formal register entry or official decision).

## Project completion

Task complete != stage complete != project complete.

- **Task complete:** one Definition of Done is verified.
- **Stage complete:** every required task in the stage is verified and valid.
- **Milestone unlocked:** its declared dependencies are complete.
- **Project complete:** the final outcome Definition of Done is verified by evidence.

The UI must show an explicit terminal state. The final stage must not remain displayed as “current” after completion.

## Shared Now

Every stakeholder receives the same shared projection of:

- current milestone
- required tasks
- exact state of each task
- responsible owner
- verifier
- expected duration / SLA / due date where known
- evidence / receipt reference
- next unlock

A stakeholder-specific view adds only the person's next action.

## Financial flow

Financial states must not be conflated:

`approved -> committed -> invoiced -> paid -> reconciled`

Examples:

- **approved:** budget or grant authority exists;
- **committed:** a contract, purchase order or other obligation binds funds;
- **invoiced:** a supplier requests payment;
- **paid:** a transaction is recorded by the authoritative payment/ledger system;
- **reconciled:** payment, contract scope and accepted delivery have been matched.

An invoice is not evidence of payment. A payment is not evidence that the promised result was delivered.

Useful project-level aggregates include:

- approved budget
- committed amount
- invoiced amount
- paid amount
- reconciled amount
- uncommitted balance
- forecast at completion

## Public projects

Public-sector projects should support a **public projection** of the same graph, not a manually maintained transparency copy.

Typical public nodes can include:

- project purpose
- public budget line / funding source
- procurement process identifier
- awarded contract and value
- amendments
- implementation milestones
- aggregate transactions
- acceptance evidence
- outcome evidence

Restricted detail can remain protected, for example:

- bank account data
- personal data
- security-sensitive architecture
- protected commercial detail
- draft legal advice

Visibility is a property of fields/evidence references, not a separate source of truth.

## Linked standards

For government procurement, an adapter can map relevant graph references to standards such as OCDS / OC4IDS rather than inventing a second procurement model. Budget and spending references can point to authoritative fiscal datasets or finance systems.

## Evidence rule

Each consequential state transition should answer:

1. **Who** changed the state?
2. **What** exactly changed?
3. **When** did it change?
4. **For which scope** is it valid?
5. **What evidence** supports it?
6. **Who verified it?**
7. **When does it expire / reopen?**

This is the minimum needed for a shared case state to be trustworthy rather than merely collaborative.
