# Ground Truth Case — Tesla Gigafactory Grünheide G07819

Status: **public-document reconstruction of a completed German administrative approval case**.

This pack exists to test OpenAction against reality rather than synthetic workflow assumptions.

## What is proven

- application received: **20 Dec 2019**;
- final BImSchG approval: **4 Mar 2022**;
- observed elapsed time: **805 calendar days**;
- three public-display rounds are documented;
- the final decision records substantial applicant-side changes in 2020 and 2021, including the later addition of battery-cell production;
- multiple specialist authorities and internal LfU units were repeatedly involved;
- Brandenburg reports **19 early-start authorizations** before final approval, at investor risk;
- the final decision references **23,726 pages of application material**;
- the state government reported 26 Task Force meetings before final approval.

## What is NOT proven

This dataset **does not** currently prove how many of the 805 days were avoidable bureaucracy.

Public documents give excellent event chronology, but not the timestamps required to decompose every gate into:

`preparation -> ready for review -> queue -> active review -> rework -> decision`

Without those timestamps it would be misleading to label a gap as authority delay. A gap may instead reflect applicant revision, expert work, statutory public participation, a true dependency, litigation, pandemic disruption, or other necessary work.

## Why this is useful for OpenAction

The case already demonstrates five patterns OpenAction needs to handle:

1. **many authorities, one case** — one shared state must not mean one central authority;
2. **scope change** — changed plans should reopen affected reviews, not blindly restart everything;
3. **parallel work** — specialist reviews and early-start decisions can coexist with the final approval path;
4. **public participation** — consultation is a required process, not waste to delete;
5. **evidence provenance** — every reconstructed event must point back to an authoritative record.

## Three-layer evidence model

### Layer 1 — observed

Dates, documents, decisions, published consultation periods and published counts.

### Layer 2 — interpreted

Candidate dependencies, constraint categories and responsibility mappings. These must be reviewable by domain experts.

### Layer 3 — counterfactual

Questions such as “what could have run in parallel?” or “how much waiting could have been removed?”. These are **hypotheses**, never ground truth, until validated against internal case timestamps and legal/process experts.

## Next data request to Brandenburg / another authority

For a truly quantitative Avoidable Waiting Time study, ask for an anonymised event export with at least:

- gate / work-package ID;
- owner organisation;
- `submitted_at`;
- `ready_for_review_at`;
- `review_started_at`;
- `information_requested_at`;
- `information_received_at`;
- `decision_at`;
- dependency IDs;
- statutory/mandatory flag;
- reason for reopen;
- scope/version ID.

No personal data is needed for this analysis.

## Success criterion for Ground Truth v1

Ground Truth v1 is reached when a permitting authority or independent administrative-law/process expert reviews this reconstruction and marks each major dependency as one of:

- required serial;
- legally independent / parallelisable;
- operationally independent / parallelisable;
- unknown;
- incorrectly reconstructed.

Until then, OpenAction may visualise the observed timeline but must not claim a measured time saving.
