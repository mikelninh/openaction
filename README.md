# OpenAction

> **Information is not the goal. Human agency is.**

**OpenAction connects people, organisations and software so good actions can happen safely, faster.**

Today each participant often sees only a slice: the citizen sees an application, security sees controls, privacy sees data, legal sees rules and management sees status meetings. OpenAction gives them a shared interoperable path:

`evidence → action → permissions → approval path → scoped decision → execution → outcome`

## Status

**1.0-rc1 — integration-ready release candidate, not an official standard.**

We have implemented everything we can responsibly validate ourselves. Stable `1.0.0` is deliberately gated on external review, independent interoperability and real pilot evidence. See [`ROADMAP_V1.md`](./ROADMAP_V1.md).

## What exists now

1. **Action Core** — evidence-linked action, explicit permissions, lifecycle and outcome.
2. **Approval Path** — owners, blockers, dependencies, reviewer SLA, conditions and gates that can run in parallel.
3. **Trust Passport** — reusable architecture/data/model/security/evaluation evidence. Passport is never itself an approval.
4. **Approval Receipt** — who decided what, for which scope/environment, using which evidence snapshot, under which conditions and until when.
5. **Change Impact** — declared system changes reopen only gates whose assumptions changed.
6. **Bounded Pilot Profile** — smallest useful safe experiment with explicit users/data/side-effects/stop conditions.

Normative candidates live under [`spec/1.0`](./spec/1.0/).

## Quick start

```bash
node bin/openaction.mjs validate examples/v1/action.json
node bin/openaction.mjs receipt examples/v1/approval-receipt.json
node bin/openaction.mjs simulate
```

Reference SDKs:
- JavaScript: [`sdk/openaction.js`](./sdk/openaction.js)
- Python: [`sdk/python/openaction.py`](./sdk/python/openaction.py)
- Java: [`sdk/java/OpenAction.java`](./sdk/java/OpenAction.java)

HTTP integration: [`openapi.yaml`](./openapi.yaml).

## Synthetic Pilot Lab

We now have a deterministic coordination model covering 10 use-case families × 6 variants = **60 synthetic pilots**. The inputs are explicit in [`pilots/synthetic/model.json`](./pilots/synthetic/model.json); the generator is [`scripts/simulate.mjs`](./scripts/simulate.mjs); the committed summary is [`pilots/synthetic/results.json`](./pilots/synthetic/results.json).

**These are not measured public-sector, hospital or business processing times. They are a prioritisation model, not a forecast.**

Current modeled median:

| Stage | Working days |
|---|---:|
| synthetic serial baseline | 138.4 |
| after completeness preflight | 119.6 |
| after independent reviews run in parallel | 85.8 |
| after evidence reuse | 75.4 |
| after reviewer queue/SLA target | 60.8 |
| after bounded profile where applicable | 55.5 |

Modeled share of total improvement:

- **parallel independent reviews: 53.1%**
- completeness preflight: 19.4%
- reviewer queue/SLA: 16.7%
- evidence reuse: 8.7%
- bounded-profile scope reduction: 2.1% overall (only applied to organisational-AI scenarios)

### First leverage hypothesis

> **The biggest coordination lever is not more AI. It is proving which reviews are independent and starting them together.**

The next hypotheses are: prevent incomplete submissions before the official process, then expose reviewer queues and expected response windows. Real pilots must validate or falsify this ranking.

## Germany examples

The public explorer includes 10 deliberately different flows: naturalisation, residence/migration, Wohngeld, company formation, building permits, industrial permits, qualification recognition, CareOS hospital adoption, public AI procurement and Bürgeramt journeys.

Each example separates:
- current sourced evidence,
- Today → OpenAction journey,
- synthetic target,
- assumptions,
- metric that a real pilot must collect.

See [`examples/use-cases.json`](./examples/use-cases.json).

## Trust model

High/critical actions require human or qualified-human approval in Core. A Trust Passport answers questions; it never grants authority. An Approval Receipt binds decision, scope, approver, evidence snapshot, conditions and expiry/revocation.

For production, OpenAction intentionally **does not invent a new signature scheme**. The adopter must bind receipts to an identity/proof mechanism it already trusts and verify it before execution. See [`docs/THREAT_MODEL.md`](./docs/THREAT_MODEL.md).

## Change without restarting everything

When model/vendor/data/workflow/hosting/permissions change, a Change Impact object maps those dimensions to each gate's declared `reopen_on` dependencies.

```text
model changed
├ AI eval        → reopen
├ privacy        → verify
└ clinical flow  → unchanged
```

This does not auto-approve unchanged gates; it makes the re-review decision explicit and auditable.

## Existing standards stay authoritative

OpenAction remains intentionally thin.

- JSON Schema 2020-12 is the schema dialect.
- OpenAPI describes the minimal HTTP gateway.
- CloudEvents-compatible envelopes may transport lifecycle events.
- FHIR/hospital systems remain authoritative for clinical meaning.
- Government registers/fachverfahren remain authoritative for official facts.
- ERP/CRM/accounting remain authoritative for business records.
- identity/signing remains with the organisation's trusted identity layer.

## Conformance

See [`spec/1.0/CONFORMANCE.md`](./spec/1.0/CONFORMANCE.md). The repository CI checks schema parseability, JS semantics, lifecycle safety, Approval Receipt handling, synthetic model reproducibility, Python syntax and Java compilation.

## What is still missing before stable 1.0

We should not solve social proof with a version number. `1.0.0` requires:

- first 5+ external review workshops without a breaking Core flaw,
- at least 3 exercised domains,
- at least 2 independently written interoperable adapters/implementations,
- real measurements for gate discovery, evidence reuse, late blockers and approval lead time,
- an independent technical reviewer/maintainer plus domain reviewers,
- published failures and resulting changes.

See [`ROADMAP_V1.md`](./ROADMAP_V1.md) and [`GOVERNANCE.md`](./GOVERNANCE.md).

## First review

Do not ask someone "do you like it?" Ask:

1. What gate is missing?
2. Who really owns each decision?
3. What evidence is repeatedly requested today?
4. Which reviews truly depend on each other, and which can start together?
5. What is the smallest bounded pilot you could responsibly approve?
6. Which wait is legally/physically irreducible and which is just coordination loss?

That feedback is the path from release candidate to stable standard.

## License

Reference implementation: **AGPL-3.0-or-later**. OpenAction does not require a central OpenAction cloud.