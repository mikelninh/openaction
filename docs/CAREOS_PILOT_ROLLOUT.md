# CareOS Pilot Rollout — OpenAction Case Room V5

Public interactive simulator: `https://mikelninh.github.io/openaction/workspace/`

This is a **synthetic planning model**, not a hospital approval, regulatory classification, gematik confirmation, MDR determination or measured deployment timeline.

## Goal

Run a bounded 30-day CareOS pilot with up to 20 staff:

- read-only data access in the first active scope
- human review before consequential use
- no autonomous diagnosis, therapy change, medication order or patient communication
- explicit stop conditions, incident owner and rollback

## Rollout

1. **Discovery** — choose one real workflow, name the sponsor and first 3–5 users.
2. **Scope + Synthetic** — freeze intended use/non-goals, build gold cases and critical-error taxonomy without patient data.
3. **Parallel Reviews** — Privacy, Security, Regulatory, Integration, Workforce/Change, Procurement/Legal and Operations start as early and in parallel as dependencies allow.
4. **Readiness** — convert the evidence into one bounded shadow-pilot decision with scope, conditions, owners and rollback.
5. **Shadow Mode** — run on real data in parallel without using CareOS outputs for care decisions; review about 50 cases and run the rollback drill.
6. **5 Users** — first active use with a small trained group, human review and predefined metrics.
7. **20 Users** — expand only after the 5-user evidence supports it and Change Impact says which reviews must be verified/reopened.
8. **Scale Decision** — stop, repeat the bounded pilot or prepare a larger production step using measured outcomes.

Canonical machine-readable model: [`../examples/v1/careos-pilot-rollout.json`](../examples/v1/careos-pilot-rollout.json).

## Default simulator state

The public demo intentionally starts in a realistic intermediate state:

- Discovery complete
- Scope + Synthetic complete
- Security review complete
- Workforce/Change review complete
- Privacy still open
- Regulatory memo still open
- KIS/FHIR/system-role path still open
- Procurement/Legal still open
- Incident owner / stop conditions still open

This demonstrates the intended OpenAction value: the product prototype can be ready while the **real next milestone is blocked by specific organisational decisions**.

## CareOS vs OpenAction

**CareOS** handles product/workflow risk: clinical UX, evidence-linked output, source provenance, evaluations, shadow-mode behaviour, user feedback and outcome quality.

**OpenAction** handles decision/coordination risk: one shared case, owners, dependencies, evidence reuse, parallel reviews, scoped decisions, hand-offs, change impact and outcome/approval receipts.

## Real pilot measurements

The pilot should measure at least:

- time to discover all required gates
- time from a complete review packet to decision
- avoidable waiting time
- duplicate evidence requests
- evidence reuse rate
- blockers discovered late
- critical clinical omissions
- unsupported claims
- source accuracy
- edit/reject rate
- time-to-task
- voluntary user adoption
- workflow outcome
- incidents and rollback events

The `31 → 8 weeks` illustration in the demo is only a synthetic hypothesis. Real pilot data must validate or falsify it.
