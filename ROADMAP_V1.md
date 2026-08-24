# OpenAction roadmap to v1.0

## What can be used today

`v1.0-rc1` is the first integration-ready release candidate: stable candidate schemas, approval receipts, change impact, bounded pilot profiles, SDK/CLI/conformance work, synthetic pilots and a public explainer.

## Why RC instead of pretending it is already a standard

A protocol can be technically complete before it is socially proven. Stable `v1.0.0` requires external users to try it and fail it in reality.

## Graduation gates to v1.0.0

1. **Core stability:** no breaking Core change required after the first 5 external review workshops.
2. **Cross-domain:** at least 3 domains exercised, including one public-sector and one consequential/regulated workflow.
3. **Conformance:** reference JS/Python/Java examples and CLI pass the published conformance suite.
4. **Trust:** production receipts have attributable identity, scope, conditions, expiry/revocation and a verifiable proof mechanism supplied by the adopter.
5. **Security:** threat model reviewed; replay/idempotency, confused-deputy, privilege escalation and forged-approval cases covered.
6. **Interoperability:** at least 2 independently written adapters/implementations can exchange the same test vectors.
7. **Evidence:** publish real pilot measures for gate-discovery time, evidence reuse, late blockers and approval lead time — including failures.
8. **Governance:** public RFC/decision process and at least one maintainer/reviewer beyond the original author.

## Release sequence

- **1.0-rc1 — now:** build everything we can validate ourselves; send to first reviewers.
- **1.0-rc2:** incorporate first external workshop corrections without casually expanding the Core.
- **1.0.0:** cut only when the graduation gates above are satisfied.

The goal is not to win a version-number race. The goal is that an independent organisation can understand, implement and trust the same contract without depending on an OpenAction cloud.