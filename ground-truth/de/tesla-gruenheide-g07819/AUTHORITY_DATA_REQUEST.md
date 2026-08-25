# Minimal Authority Data Request — Avoidable Waiting Time

Purpose: measure process time without requesting personal data, substantive confidential content or a full case-file export.

## Requested unit

One completed permitting case, anonymised if necessary. The Tesla G07819 reconstruction is a reference example; a different completed case is equally useful if easier to share.

## Minimal event table

One row per review/gate/work package:

| field | example | why needed |
|---|---|---|
| `case_id` | CASE-001 | link events without names |
| `gate_id` | WATER-01 | stable work package |
| `owner_org` | authority/unit code | responsibility |
| `scope_version` | v3 | change impact |
| `mandatory` | true | safeguard vs optional work |
| `depends_on` | DOC-04;PLAN-02 | real dependency graph |
| `submitted_at` | timestamp | applicant/internal handoff |
| `ready_for_review_at` | timestamp | start of queue clock |
| `review_started_at` | timestamp | separates queue from work |
| `information_requested_at` | timestamp/null | rework cycle |
| `information_received_at` | timestamp/null | applicant response time |
| `decision_at` | timestamp | closes active review |
| `result` | approved/conditions/reopen | outcome |
| `reopen_reason` | scope_change | why work repeated |

Optional but valuable:

- statutory deadline/SLA;
- reviewer capacity band, not person name;
- evidence IDs requested;
- evidence IDs reused;
- dependency source (law / policy / local operating model).

## Explicitly not requested

- applicant personal data;
- staff names;
- protected case content;
- bank/account data;
- trade secrets;
- raw emails;
- unrestricted documents.

## What OpenAction computes

Only after dependency validation:

- preparation time;
- queue time;
- active review time;
- applicant/third-party rework time;
- required statutory waiting;
- duplicate-evidence time;
- avoidable coordination waiting;
- critical path;
- parallelisation opportunities.

## Safety rule

A time gap is not labelled “avoidable” merely because no visible action occurred. It requires a validated state indicating that all prerequisites were satisfied and the downstream review could legally and operationally have started.
