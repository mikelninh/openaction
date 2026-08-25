# OpenAction V12 — Constraint Set

Status: **non-normative UX / operations guidance**. This document does not create a new protocol object and does not replace domain law, policy, safety review or authoritative systems.

## Core operating grammar

> **One mission. One shared truth. One current constraint set. One next action per person.**

The goal is not to make every project look identical. The goal is to give every participant the same answer to four operational questions:

1. What are we trying to achieve?
2. What currently prevents the next meaningful unlock?
3. What do I need to do now?
4. What evidence proves that the constraint is actually cleared?

## Why a constraint *set*, not always one constraint

Simple flows often have one dominant blocker. Complex regulated work may have several independent constraints that can move in parallel.

Examples:

- Wohngeld: one missing payslip may be the current constraint.
- CareOS: Clinical, Privacy and Contract review can be open in parallel.
- Building permit: after application readiness, several required technical reviews may proceed independently where the real process allows it.
- Government delivery: procurement, budget, delivery, independent acceptance and outcome evidence are different constraint types.

OpenAction should never invent serial dependencies merely because the organisation historically worked sequentially.

## Bureaucracy rule

**Required controls stay. Avoidable coordination friction goes.**

OpenAction must distinguish:

### Domain-required constraints

Examples:

- statutory or regulatory evidence;
- formal authority decisions;
- safety review;
- privacy/security controls;
- mandatory technical review;
- legally required notice, consultation or receipt.

These are not labelled "waste" simply because they take time. OpenAction may make their owner, evidence, scope, status and dependencies clearer, but the domain authority determines whether they are required.

### Coordination constraints

Examples:

- nobody knows who owns the next step;
- evidence already exists but is requested again;
- two independent reviews are artificially sequential;
- a reviewer receives an incomplete package and reopens the case later;
- a decision waits in an invisible queue;
- a changed field causes unrelated approvals to restart;
- status meetings are used to reconstruct state that should already be observable.

These are the primary targets for simplification.

## Derived view

The V12 `Constraint Set` is derived from existing OpenAction state:

```text
mission / target outcome
        ↓
current incomplete stage
        ↓
required non-verified tasks / gates
        ↓
real dependency graph
        ↓
current constraint set
```

A constraint item should be traceable to:

- owner;
- status;
- Definition of Done;
- required evidence;
- verifier / authoritative receipt;
- scope;
- validity / expiry;
- dependency or parallelism;
- next unlock.

The UI may summarize this, but it must not create a second source of truth.

## Constraint states

A useful human projection is:

```text
waiting / assigned
    ↓
in progress
    ↓
submitted
    ↓
verified
```

with explicit branches for:

- rejected;
- expired;
- reopened after relevant change;
- disputed.

**In progress is never visually equivalent to verified.**

## Parallelism

Parallelism is allowed only when the underlying dependency graph supports it.

OpenAction should ask:

> If task B does not consume the result of task A, why are we waiting for A before starting B?

But the answer may legitimately be:

> Because law, safety, jurisdiction, data access or operational sequencing requires it.

That dependency remains.

## Evidence reuse / Once Only

Where an authoritative source already holds a valid evidence item, the preferred pattern is a scoped reference or authorised retrieval rather than asking the person to recreate or upload it again.

OpenAction does not become the authoritative register. It points to the source, receipt or retrieval proof.

## Five simplification questions

For every current constraint:

1. **Why does this requirement exist?** Name the domain owner or authority.
2. **Can it be removed?** Only the competent domain authority can answer for required controls.
3. **Can its evidence be reused or preflighted?** Reduce rework and duplicate requests.
4. **Can it run in parallel?** Respect only real dependencies.
5. **Can the feedback loop be shorter?** Expose owner, queue, ETA, evidence and decision immediately.

Automation comes after those questions, not before them.

## Example: synthetic building permit

This is a coordination example, not a universal legal model. Exact gates differ by jurisdiction and project.

```text
MISSION
Authoritative building-permit decision

CURRENT CONSTRAINT
Required fire-safety supplement missing
        ↓
Applicant / planning submits
        ↓
Completeness verifier checks
        ↓
NEXT CONSTRAINT SET
Fire review  ─┐
Environment   ├─ parallel only where the real dependency graph permits
Access        ─┘
        ↓
Authoritative final decision
```

The point is not to bypass review. The point is to prevent a required review from spending most of its elapsed time in avoidable waiting.

## UX acceptance questions

A first-time stakeholder should answer within seconds:

- What is the mission?
- What is blocking the next unlock?
- Is that one constraint or a parallel set?
- Is my role needed now?
- What exactly do I need to do?
- What proves completion?
- Who verifies it?
- What happens next?

An auditor or domain reviewer should additionally be able to answer:

- Why is this constraint required?
- Which authoritative source supports it?
- What changed?
- Why was a node reopened?
- Was a supposedly parallel task truly independent?

## What V12 does **not** claim

- It does not claim every project has exactly one bottleneck.
- It does not claim all bureaucracy can be parallelised.
- It does not determine legal necessity.
- It does not make OpenAction an authoritative register, ledger or case-management replacement.
- It does not prove time savings until real processes are instrumented.

The real-world KPI is **avoidable waiting time removed without weakening required controls**.
