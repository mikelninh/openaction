# Shared Now UX Contract (V8)

> **Same case. Same now. Different next actions.**

This document is a **non-normative product/UX contract** for OpenAction interfaces. It does not change the 1.0-rc1 protocol schemas.

## Why

Earlier OpenAction workspaces made individual tasks clearer but still forced users to infer the shared organisational state. V8 separates the interface into two layers:

1. **Shared Now** — identical for every stakeholder in the same case.
2. **My Action** — scoped to the current user/role.

The goal is to let every participant answer, within seconds:

- Where are we together?
- What is blocking the next meaningful milestone?
- Who is currently responsible?
- What do I need to do now?
- What will my action unlock?

## Shared Now

The default shared view contains only:

- **Goal** — the outcome the case is trying to reach.
- **Now** — the current stage in plain language.
- **Open owners/actions** — only the work required to unlock the next stage.
- **Next unlock** — what becomes possible when the current requirements are closed.

It should not default to readiness percentages, full approval graphs, large KPI grids, or all historical evidence.

## My Action

Each person gets one of three first-class states:

### Active
Exactly one primary action is visible.

The interface shows:
- one action statement,
- one currently missing input or decision,
- one concrete primary CTA,
- the effect on Shared Now.

### Waiting
The user has no decisionable action yet.

The interface says this explicitly and names what the shared case is waiting on. It must not invent busy work.

### Done
The user's contribution for the current scope is complete.

The interface remains quiet until a relevant change or later stage requires that role again.

## State mutation

Completing a real task must mutate the shared case state, not only the local role card.

Examples:

- CareOS: `3 open reviews → 2 → 1 → Pilot Decision`.
- Wohngeld: `Applicant evidence → caseworker income check → specialist review`.
- Naturalisation: `Applicant evidence → completeness confirmation → domain review`.
- Company formation: `Founder bank proof → notary filing → registry review`.

The shared state is therefore a projection of the underlying Approval Path / case workflow, not a separate manually maintained dashboard.

## Progressive disclosure

Default surface:

`Goal → Shared Now → My Action → Effect`

Collapsed / secondary:

- existing evidence,
- full journey,
- historical decisions,
- Trust Passport detail,
- Approval Receipts,
- Change Impact detail,
- protocol/API objects.

## Design constraints

- One shared case state per case.
- One primary action per person.
- One visible missing input by default.
- No percentage that lacks a real operational meaning.
- `Nothing to do` and `Not your turn yet` are valid states.
- The shared state must remain identical when only the viewer role changes.
- Completing an action must update the shared state immediately.
- Demo controls such as scenario/role switching must be visually separated from production UX.

## CareOS reference projection

Initial synthetic state:

```text
CAREOS PILOT

SHARED NOW
Reviews

Open:
- Clinical
- Privacy
- Procurement / Legal

Already complete:
- Security

Next unlock:
Pilot Decision
```

A Clinical user then sees only:

```text
MY ACTION
Define the clinical critical-error boundary.

Missing:
Critical-error list

[ Confirm error boundaries ]

Effect:
3 open actions → 2
```

A Sponsor sees the same Shared Now but no active approval action until the required reviews are closed.

## What V8 is not

Shared Now is not:

- a new OpenAction core schema,
- a substitute for authoritative domain systems,
- an approval itself,
- a readiness score,
- a promise that every workflow is linear.

It is the human-facing projection that keeps all stakeholders aligned on the same current case state while preserving role-specific responsibility.
