# Ground Truth v1 — Expert Dependency Review Scorecard

Reviewer role: permitting authority / administrative-law expert / specialist reviewer / process owner.

Goal: validate the reconstructed dependency graph, **not** rate the idea or UI.

For every major work package, choose exactly one:

- **RS — Required serial:** downstream work cannot lawfully or factually begin before this completes.
- **RP — Required but parallelisable:** work is required, but may run in parallel with named other work.
- **OP — Operationally parallelisable:** current sequencing is organisational rather than legally/factually required.
- **NA — Not applicable / incorrectly reconstructed.**
- **U — Unknown without more evidence.**

## Review table

| work package | proposed class | reviewer class | depends on | evidence / legal basis | correction |
|---|---|---|---|---|---|
| application completeness / scoping | required |  |  |  |  |
| initial specialist-authority participation | required, partly parallel |  |  |  |  |
| public display / objections | required process |  |  |  |  |
| building / planning review | required |  |  |  |  |
| water / groundwater review | required |  |  |  |  |
| nature / species review | required |  |  |  |  |
| emissions / noise review | required |  |  |  |  |
| major-accident-law expert review | required for final scope |  |  |  |  |
| early-start authorisations | separate bounded decisions |  |  |  |  |
| final integrated decision | serial final authority step |  |  |  |  |

## Scope-change questions

For each historical major change (June 2020, June 2021):

1. Which completed reviews genuinely became stale?
2. Which could legally remain valid?
3. Which new reviews became necessary?
4. Which public-participation steps were triggered by the materiality of the change?
5. Which evidence could have been reused without re-review?

## AI questions

For each work package mark:

- document extraction can be automated? yes/no;
- completeness preflight can be automated? yes/no;
- version diff useful? yes/no;
- evidence reuse can be proposed? yes/no;
- routing can be rule-based? yes/no;
- AI summary acceptable as reviewer aid? yes/no;
- final legal/factual conclusion requires human authority? yes/no.

## Completion

Ground Truth v1 requires:

- at least one qualified external reviewer;
- explicit correction of wrong dependencies;
- source or legal/process rationale for all `RS` classifications;
- no numerical time-saving claim until the event data support it.
