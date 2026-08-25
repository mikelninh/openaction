# OpenAction

> **One case. One shared truth. Different next actions.**

OpenAction is an open coordination layer for complex work across people, organisations, software and AI.

It answers five questions that are surprisingly hard in real projects:

1. **Where are we now?**
2. **Who needs to do what next?**
3. **What counts as actually done?**
4. **What evidence proves it?**
5. **What becomes possible afterwards?**

The goal is not fewer responsible decisions. It is **less avoidable waiting, duplicate work and invisible hand-offs on the way to responsible decisions**.

## Try it

**Live Case Room:** https://mikelninh.github.io/openaction/workspace/

Switch between examples such as a hospital AI pilot, naturalisation, housing benefit, company formation and a public digital project. Then switch stakeholder perspective.

The important UX rule is:

> **Shared Now stays the same for everyone. My Action changes by role.**

A clinical owner, privacy reviewer, procurement lead and sponsor should therefore see the same project reality without each having to understand the whole bureaucracy.

## What V10 adds

The current reference UX models a real completion contract rather than a green checkbox:

`assigned → in progress → submitted → verified`

with explicit paths for:

`rejected · reopened · expired`

For consequential work:

- **Owner ≠ Verifier** by default.
- **Submitted ≠ complete.**
- Green means **Definition of Done + evidence + valid verification for the current scope**.
- A relevant change reopens only the decisions whose assumptions changed.
- Unknown timing remains unknown instead of becoming a fake ETA.

The Case Room has two layers:

- **Simple** — shared state + my next action + visual route.
- **Proof** — identity/authority, scope, validity, evidence source, integrity proof, history, change impact and disputes.

See [`docs/TRUST_CONTROL_V10.md`](docs/TRUST_CONTROL_V10.md) and the simulated [`V10 stakeholder review`](docs/V10_STAKEHOLDER_REVIEW.md).

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

- real approval/process maps from external organisations;
- observed dependency and waiting-time data;
- real evidence-reuse measurements;
- production identity/proof integrations;
- independent interoperable implementations/adapters;
- domain reviewers and an independent technical maintainer;
- published failures and changes caused by those failures.

No synthetic result is presented as measured public-sector, hospital or business impact.

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
```

Reference SDKs: JavaScript [`sdk/openaction.js`](sdk/openaction.js) · Python [`sdk/python/openaction.py`](sdk/python/openaction.py) · Java [`sdk/java/OpenAction.java`](sdk/java/OpenAction.java). HTTP: [`openapi.yaml`](openapi.yaml).

## Current synthetic lab

The repository includes a deterministic **60-case Synthetic Pilot Lab** across ten use-case families.

It is a prioritisation model, **not a forecast**.

Its current strongest hypothesis is that a large share of avoidable lead time may come from reviews that could safely start in parallel but do not. Real pilots must validate or falsify that claim.

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
7. What is the smallest real process we could map and measure?

If the model survives that, it gets stronger. If it fails, the failure is useful evidence.

## Principles

> **Information is not the goal. Human agency is.**

> **AI may prepare and propose. Humans and authoritative systems remain responsible for consequential decisions.**

> **One source of truth does not mean one database. It means one inspectable case state backed by authoritative evidence.**

## License

Reference implementation: **AGPL-3.0-or-later**. No central OpenAction cloud is required.
