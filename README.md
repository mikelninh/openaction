# OpenAction

> **Information is not the goal. Human agency is.**

**OpenAction connects people, organisations and software so good actions can happen safely, faster.**

`evidence → action → permissions → approval path → scoped decision → execution → outcome`

## Status

**1.0-rc1 — integration-ready release candidate, not an official standard.** Everything we can responsibly validate ourselves is implemented; stable `1.0.0` is gated on external review, independent interoperability and real pilot evidence. See [`ROADMAP_V1.md`](./ROADMAP_V1.md).

## Try it first

- **10-second public explainer:** [`index.html`](./index.html)
- **interactive CareOS Approval Workspace:** [`workspace/`](./workspace/)
- **60-case Synthetic Pilot Lab:** [`pilots/synthetic/`](./pilots/synthetic/)

The workspace lets a reviewer switch roles without hiding the rest of the system, open blockers, inspect evidence, see the Trust Passport, export a synthetic Adoption Package and distinguish illustrative benefits from metrics that must be measured in a real pilot.

## Six v1 objects

1. **Action Core** — evidence-linked action, explicit permissions, lifecycle and outcome.
2. **Approval Path** — owners, blockers, dependencies, reviewer SLA and reopen conditions.
3. **Trust Passport** — reusable architecture/data/model/security/licensing/workforce/procurement/regulatory/evaluation evidence. Passport is never itself approval.
4. **Approval Receipt** — who decided what, for which scope/environment, evidence snapshot, conditions and expiry/revocation.
5. **Change Impact** — declared changes reopen only gates whose assumptions changed.
6. **Bounded Pilot Profile** — smallest useful safe experiment with explicit users/data/side effects/stop conditions.

Normative candidates: [`spec/1.0`](./spec/1.0/).

## Quick start

```bash
node bin/openaction.mjs validate examples/v1/action.json
node bin/openaction.mjs receipt examples/v1/approval-receipt.json
node bin/openaction.mjs simulate
```

Reference SDKs: JavaScript [`sdk/openaction.js`](./sdk/openaction.js) · Python [`sdk/python/openaction.py`](./sdk/python/openaction.py) · Java [`sdk/java/OpenAction.java`](./sdk/java/OpenAction.java). HTTP: [`openapi.yaml`](./openapi.yaml).

## Synthetic Pilot Lab

Deterministic model: 10 use-case families × 6 variants = **60 synthetic pilots**. Inputs are explicit in [`model.json`](./pilots/synthetic/model.json); generator: [`scripts/simulate.mjs`](./scripts/simulate.mjs); committed summary: [`results.json`](./pilots/synthetic/results.json).

**Not measured public-sector, hospital or business processing times. Prioritisation model, not forecast.**

| Stage | Synthetic median working days |
|---|---:|
| serial baseline | 138.4 |
| + completeness preflight | 119.6 |
| + independent reviews parallel | 85.8 |
| + evidence reuse | 75.4 |
| + reviewer queue/SLA | 60.8 |
| + bounded profile where applicable | 55.5 |

Modeled share of total improvement: **parallel reviews 53.1%**, preflight 19.4%, reviewer queue/SLA 16.7%, evidence reuse 8.7%, bounded-profile scope reduction 2.1% overall.

> **First leverage hypothesis: prove which reviews are actually independent and start them together.**

Real pilots must validate or falsify that ranking.

## Trust and safety

High/critical actions require human or qualified-human approval. Passport ≠ approval. Approval Receipts bind decision, scope, approver, evidence snapshot, conditions and expiry/revocation. Production receipts must use a proof mechanism the adopter already trusts; OpenAction deliberately does not invent a signature scheme. See [`docs/THREAT_MODEL.md`](./docs/THREAT_MODEL.md).

## Existing standards stay authoritative

JSON Schema 2020-12 validates the contracts; OpenAPI describes the gateway; CloudEvents-compatible envelopes may transport lifecycle events. FHIR/hospital systems, government registers/fachverfahren, ERP/CRM and organisational identity/signing remain authoritative in their domains.

## What is still missing before stable 1.0

- 5+ external review workshops without a breaking Core flaw
- 3+ real exercised domains
- 2+ independently written interoperable adapters/implementations
- production identity/proof integrations tested
- real gate-discovery, evidence-reuse, late-blocker and lead-time measurements
- an independent technical maintainer/reviewer plus domain reviewers
- published failures and changes driven by them

See [`ROADMAP_V1.md`](./ROADMAP_V1.md), [`GOVERNANCE.md`](./GOVERNANCE.md), and [`docs/ADOPTION_READY.md`](./docs/ADOPTION_READY.md).

## First external workshop

Do not ask “do you like it?” Ask:
1. Which gate is wrong or missing?
2. Who actually owns each decision?
3. What evidence is repeatedly requested today?
4. Which reviews truly depend on each other?
5. What is the smallest bounded pilot you could responsibly approve?
6. Which wait is irreducible and which is coordination loss?

## License

Reference implementation: **AGPL-3.0-or-later**. No central OpenAction cloud is required.