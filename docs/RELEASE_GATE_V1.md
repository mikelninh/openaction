# Release Gate v1

Every serious portfolio release is evaluated with the same five stages:

| Stage | Question |
| --- | --- |
| R0 Outcome | Who is helped and what changes? |
| R1 Evidence | What representative evidence makes the claim inspectable? |
| R2 Authority | What is allowed, forbidden, private or human-controlled? |
| R3 Reliability | Does it work repeatedly at acceptable quality/cost/time? |
| R4 Reality | Did a real human/customer/reviewer/external system get the intended result? |

## Verdicts

- **PASS** — every blocking gate has matching evidence and passed.
- **REVIEW** — no critical block exists, but at least one blocking gate still needs human/external evidence.
- **BLOCK** — a blocking gate failed or the manifest itself is invalid.

The important asymmetry is deliberate: **software can prove software properties, but it cannot certify its own real-world usefulness.**

R4 therefore cannot be automated. Synthetic fixtures can prove that a measurement system works; they cannot become customer ROI, human enjoyment, qualified expert judgement or real-world adoption simply because CI is green.

## Agency receipts

A release gate answers **may this release ship?**

An Agency Receipt answers **what happened after a bounded action?**

Receipts record evidence, decision owner, authority, action, outcome and the next learned change/unknown. They are intended to be portable across OpsPilot, Agent-Proof, Game Studio, HANA and civic products without making any one model the system of record.
