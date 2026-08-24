# From 8 weeks to the real critical path

The goal is not to promise that every regulated deployment can happen in days. The goal is to separate **avoidable coordination delay** from **irreducible decision time**.

## Where an illustrative 8-week path still waits

| Bottleneck | Why it exists | What OpenAction can do | What it must not do |
|---|---|---|---|
| Use-case classification | Scope determines privacy, regulatory and security obligations | guided preflight, known profiles, missing-question detection | make the accountable legal/clinical classification by itself |
| Evidence gathering | reviewers need architecture, data flows, licences, evaluations | Trust Passport, auto-prepare packets, completeness check | fabricate missing evidence |
| Reviewer queues | privacy, security, clinical, workforce and procurement teams have finite capacity | start independent gates in parallel, assign owners, expose ageing | bypass required reviewers |
| Questions / rework | reviewers discover missing facts late | focus requests on missing evidence, reuse prior answers | hide uncertainty |
| Workforce participation | staff impacts may require consultation | involve people from Day 1 with a clear workflow-impact packet | remove participation rights |
| Procurement / contracts | money, liability and vendor terms need accountable decisions | standard pilot profile, reusable vendor evidence, bounded scope | evade procurement rules |
| Technical remediation | review can reveal real flaws | change-impact graph reopens only affected gates | mark a failed control as approved |
| Final approval | someone has to own the decision | one shared decision packet + conditions + expiry | auto-sign a human approval |

## Synthetic fast-lane targets

These are **design targets for pilots**, not guarantees:

- **T0 — synthetic sandbox:** 1–3 days. No real personal data, no external side effects.
- **T1 — bounded internal pilot:** 5–10 working days where existing organisational routes allow it.
- **T2 — personal data / consequential workflow:** 2–4 weeks where evidence is prepared and reviewers have capacity.
- **T3 — regulated healthcare / production:** 4–8+ weeks depending on the actual regulatory and organisational critical path.

The stretch goal is not “approval in one click.” It is:

> **Every hour of waiting should have a visible reason, owner and next action.**

## How we push the critical path further down

1. **Pre-approved profiles.** Organisations publish reusable pilot profiles: allowed data, hosting, model classes, reversibility and approval boundaries.
2. **Reviewer SLAs.** A gate has an accountable queue and expected response window, not an invisible inbox.
3. **Evidence once.** Architecture, data-flow, licences, model cards and evals are updated once and referenced everywhere.
4. **Parallel by default.** Dependency graphs prove which reviews truly depend on each other.
5. **Exception-based review.** Machines validate routine completeness; qualified humans spend time on ambiguity and consequences.
6. **Change-impact diff.** A model/vendor/workflow change reopens only the gates whose assumptions actually changed.
7. **Bounded pilots first.** Reduce scope, permissions, users, data and reversibility until the smallest useful experiment can be responsibly approved.
8. **Receipts and expiry.** Approval is scoped, conditional and time-bounded so reuse is safe rather than informal.

## Irreducible waits

OpenAction should explicitly label waits it cannot responsibly compress:

- statutory waiting or consultation periods
- legal rights of participation or appeal
- external authority capacity
- physical document/card production
- third-party identity or authenticity checks
- genuinely novel specialist judgment
- remediation of a real security, privacy, clinical or legal defect

If a pilot still takes eight weeks, OpenAction should be able to answer: **which gate consumed each week, why, and what evidence would change that next time?**
