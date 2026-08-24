# Adoption-ready checklist

OpenAction can be useful as a working specification today. For organisations to treat it as a dependable interoperability standard, more must be true than “the JSON looks sensible.”

## The adoption contract

A team should be able to answer **yes** to four questions:

1. **Can I understand it?** A non-technical stakeholder understands the problem and the approval state in seconds.
2. **Can I integrate it?** A developer can validate, emit and consume an Action/Approval object without a central vendor.
3. **Can I trust it?** Identity, evidence, scope, permissions, decision conditions and auditability are explicit.
4. **Can I depend on it?** Versioning, governance, conformance and backwards compatibility are predictable.

## Required for 1.0

### Semantics
- freeze a deliberately small core vocabulary
- define lifecycle/state transitions normatively
- define scope, conditions, expiry and revocation for approvals
- define evidence references without copying unnecessary personal data
- define change-impact semantics

### Developer experience
- JSON Schemas with test vectors
- JavaScript/TypeScript, Python and Java reference SDKs
- CLI + browser validator
- OpenAPI gateway contract
- webhook/event profile
- conformance suite runnable in CI
- copy-paste quickstarts under 15 minutes

### Security and trust
- threat model including forged approvals, confused deputy, replay and privilege escalation
- mandatory identity binding profile for production approvals
- signed/attributable decision receipts or integration with trusted organisational signatures
- idempotency/replay rules
- least-privilege permission vocabulary
- tamper-evident audit recommendations
- privacy/data-minimisation profile

### Organisation adoption
- Approval Graph template library
- Trust Passport template library
- Adoption Package generator
- bounded-pilot profiles
- domain mappings (health, government, SME) that extend rather than fork the core
- explicit “not a legal approval” language

### Open standard credibility
- public RFC process
- semantic versioning + deprecation windows
- conformance levels and compatibility matrix
- neutral naming/namespace governance
- independent maintainers beyond the original author
- published decision log
- protocol/spec licence that encourages independent implementations
- reference implementation kept separate from normative specification

### Evidence
- public synthetic corpus
- adversarial cases
- at least 3 domains
- at least 3 independent implementations or adapters
- real pilot measurements: lead time, reuse, late blockers, errors, outcomes
- published failures and changes driven by them

## Maturity ladder

**0.2 Working Draft — now**
: schemas, SDK, OpenAPI, Approval Path, Trust Passport, public examples.

**0.5 Pilot Profile**
: validator, conformance tests, bounded pilot profiles, first real workshop data.

**0.8 Multi-organisation**
: independent adapters, signed decision profile, change-impact diff, multiple real organisations.

**1.0 Stable Core**
: stable semantics, governance, backwards compatibility, security profile, conformance badge and empirical evidence.

## The rule

> **Do not optimise for being called a standard. Optimise for being so useful and easy to interoperate with that independent organisations choose the same contract.**
