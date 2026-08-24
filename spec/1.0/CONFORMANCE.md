# OpenAction 1.0 RC1 conformance

OpenAction uses three cumulative conformance levels.

## Core
An implementation MUST validate/emit the Core Action contract, enforce lifecycle transitions, require explicit human/qualified-human approval for high/critical actions, preserve evidence references, and support idempotency keys for side-effecting execution.

## Trust
Core + Approval Receipt. A receipt MUST bind decision, scope, approver, evidence snapshot, conditions and time. Production approvals MUST use an external verifiable proof/identity mechanism; OpenAction does not invent a new signature scheme.

## Organisation
Trust + Approval Path + Trust Passport + Change Impact + Pilot Profile. Implementations MUST keep legal/clinical/security decisions attributable to authorised humans and MUST NOT infer that a reusable passport equals organisation-specific approval.

## Compatibility
`1.0-rc1` is a prerelease. A conforming implementation MUST reject unknown breaking major versions and SHOULD preserve unknown extension keys only inside the explicit `extensions` object.

## Existing standards
JSON Schema 2020-12 remains the validation dialect. CloudEvents-style envelopes MAY transport lifecycle events. Domain standards such as FHIR remain authoritative for domain meaning.