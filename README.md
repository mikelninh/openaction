# OpenAction

> **One mission. One shared truth. One current constraint set. One next action per person.**

OpenAction is an open coordination layer for complex work across people, organisations, software and AI.

It answers six questions that are surprisingly hard in real projects:

1. **What are we trying to achieve?**
2. **Where are we now?**
3. **What currently blocks the next unlock?**
4. **Who needs to do what next?**
5. **What counts as actually done, and what evidence proves it?**
6. **What becomes possible afterwards?**

The goal is not fewer responsible decisions. It is **less avoidable waiting, duplicate work and invisible hand-offs on the way to responsible decisions**.

## Try it

**Live Mission Control / Case Room:** https://mikelninh.github.io/openaction/workspace/

**Real German ground-truth case:** https://mikelninh.github.io/openaction/ground-truth/g07819/

Switch between synthetic examples such as a hospital AI pilot, naturalisation, housing benefit, company formation, building permission and a public digital project. Then switch stakeholder perspective.

The important UX rule is:

> **Shared truth stays the same. Current constraints come from the case state. My Action changes by role.**

A clinical owner, privacy reviewer, procurement lead and sponsor should therefore see the same project reality without each having to understand the whole bureaucracy.

## First real ground truth: Tesla Grünheide G07819

OpenAction now includes a public-document reconstruction of the completed original BImSchG approval for the Tesla Gigafactory Berlin-Brandenburg.

Observed facts include:

- application received **20 Dec 2019**;
- final approval **4 Mar 2022**;
- **805 calendar days** elapsed;
- three public-display rounds;
- major applicant scope changes in 2020 and 2021;
- repeated specialist-authority participation;
- **19** early-start authorisations reported by Brandenburg before final approval.

Crucially, OpenAction does **not** label those 805 days “avoidable bureaucracy”. Public records do not contain the per-gate timestamps and validated dependency data needed to separate active review, applicant rework, required participation, queue time and avoidable coordination waiting.

See [`ground-truth/de/tesla-gruenheide-g07819/`](ground-truth/de/tesla-gruenheide-g07819/) and run:

```bash
node scripts/ground-truth-report.mjs
```

The runner deliberately returns `NOT_YET_MEASURABLE` for Avoidable Waiting Time until the missing evidence exists.

## What V12 adds

V12 introduces **Mission Control / Current Constraint Set** as a derived operational view over the existing case, approval and evidence state.

It does not delete required safeguards. Instead it asks:

- what genuinely blocks the next outcome?
- which constraints are legally/factually serial?
- which required reviews can safely run in parallel?
- who owns each constraint?
- what evidence makes it disappear from the constraint set?

For consequential work the existing completion contract remains:

`assigned → in progress → submitted → verified`

with explicit paths for:

`rejected · reopened · expired`

Rules:

- **Owner ≠ Verifier** by default.
- **Submitted ≠ complete.**
- Green means **Definition of Done + evidence + valid verification for the current scope**.
- A relevant change reopens only the decisions whose assumptions changed.
- Unknown timing remains unknown instead of becoming a fake ETA.

See [`docs/CONSTRAINT_SET_V12.md`](docs/CONSTRAINT_SET_V12.md), [`docs/TRUST_CONTROL_V10.md`](docs/TRUST_CONTROL_V10.md) and the simulated [`V10 stakeholder review`](docs/V10_STAKEHOLDER_REVIEW.md).

## Where AI agents fit

The best use of AI is **not autonomous public authority**. It is removing the search, comparison and coordination work surrounding human decisions.

High-value automation:

- ingest, classify and hash documents;
- compare huge document versions;
- completeness preflight;
- timeline and metadata extraction with provenance;
- evidence-reuse candidates / Once Only;
- change-impact proposals;
- rule-based routing and parallel activation;
- deadline, queue and inactivity monitoring;
- reviewer evidence summaries and draft requests;
- permissioned public status explanations;
- audit for stale approvals, missing evidence and unsafe state transitions;
- counterfactual process simulation on **validated** dependency graphs.

Consequential legal/factual balancing and final permits, benefits, sanctions or equivalent authority decisions remain with the competent human/authority by default.

See [`ground-truth/de/tesla-gruenheide-g07819/AUTOMATION_AI.md`](ground-truth/de/tesla-gruenheide-g07819/AUTOMATION_AI.md) and [`agent-policy.json`](ground-truth/de/tesla-gruenheide-g07819/agent-policy.json).

## Money is part of project truth

For projects with funding, OpenAction keeps financial states distinct:

`approved → committed → invoiced → paid → reconciled`

A payment is not proof that the expected work was delivered.

Public, internal and restricted views should be **permissioned projections of the same graph**, not separately maintained versions of reality. Authoritative finance, procurement, registry, clinical and identity systems remain authoritative; OpenAction references their evidence rather than becoming another shadow ledger.

## Why this matters

A complex project often looks like this:

```text
Clinical ───────┐
Privacy ────────┤
Security ───────┤
Legal ──────────┼──→ next milestone
Procurement ────┤
Finance ────────┤
Operations ─────┘
```

The failure mode is rarely that nobody works.

It is that people cannot reliably see:

- which work can happen in parallel;
- what another stakeholder has actually done;
- whether their work was checked;
- what is blocking the next milestone;
- which evidence is still valid;
- or whether the project is truly finished.

OpenAction is an attempt to make that state explicit and interoperable.

## Status

**1.0-rc1 — release candidate for external testing, not an official standard.**

The protocol/reference implementation is substantial, but stable `1.0.0` is intentionally gated on external evidence.

Still required:

- authority/domain review of the G07819 dependency reconstruction;
- anonymised real ready/review/decision timestamps from a completed case;
- real approval/process maps from external organisations;
- observed evidence-reuse measurements;
- production identity/proof integrations;
- independent interoperable implementations/adapters;
- domain reviewers and an independent technical maintainer;
- published failures and changes caused by those failures.

No synthetic result or counterfactual is presented as measured public-sector, hospital or business impact.

## Protocol objects

1. **Action Core** — evidence-linked action, permissions, lifecycle and outcome.
2. **Approval Path** — owners, dependencies, blockers, parallelism and reopen conditions.
3. **Trust Passport** — reusable evidence; **passport ≠ approval**.
4. **Approval Receipt** — who decided what, for which scope, under which evidence and conditions.
5. **Change Impact** — reopen only affected decisions.
6. **Bounded Pilot Profile** — smallest useful experiment with explicit limits and stop conditions.

Normative candidates: [`spec/1.0`](spec/1.0/).

## Quick start

```bash
node bin/openaction.mjs validate examples/v1/action.json
node bin/openaction.mjs receipt examples/v1/approval-receipt.json
node bin/openaction.mjs simulate
node scripts/ground-truth-report.mjs
```

Reference SDKs: JavaScript [`sdk/openaction.js`](sdk/openaction.js) · Python [`sdk/python/openaction.py`](sdk/python/openaction.py) · Java [`sdk/java/OpenAction.java`](sdk/java/OpenAction.java). HTTP: [`openapi.yaml`](openapi.yaml).

## Current synthetic lab

The repository includes a deterministic **60-case Synthetic Pilot Lab** across ten use-case families.

It is a prioritisation model, **not a forecast**.

Its current strongest hypothesis is that a large share of avoidable lead time may come from reviews that could safely start in parallel but do not. The G07819 ground-truth work is the beginning of testing that hypothesis against real administration rather than assuming it is true.

See [`pilots/synthetic/`](pilots/synthetic/) and [`ROADMAP_V1.md`](ROADMAP_V1.md).

## Best way to review OpenAction

Please do **not** tell me whether you like it.

Try to break it:

1. Which decision/gate is missing or wrong?
2. Who actually owns and verifies it?
3. Which evidence gets repeatedly requested today?
4. Which reviews really depend on one another, and which only happen serially by habit?
5. When is a step genuinely complete?
6. What would make the shared state misleading or unsafe?
7. Which part of the G07819 reconstruction is wrong?
8. What is the smallest real event export we could measure next?

If the model survives that, it gets stronger. If it fails, the failure is useful evidence.

## Principles

> **Information is not the goal. Human agency is.**

> **AI may prepare and propose. Humans and authoritative systems remain responsible for consequential decisions.**

> **One source of truth does not mean one database. It means one inspectable case state backed by authoritative evidence.**

> **Required safeguards stay. Avoidable waiting around them should not.**

## License

Reference implementation: **AGPL-3.0-or-later**. No central OpenAction cloud is required.
