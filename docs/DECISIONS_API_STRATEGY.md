# Decisions API strategy — bounded choices, not autonomous authority

OpenAI announced the **Decisions API** in limited preview on 29 September 2026. The public announcement confirms the important product shape: developers define a question and possible answers, send text or image context, and receive a selection that can be used for classification, routing or an agent's next action.

The exact public endpoint, request schema, pricing, quotas and confidence semantics are not yet part of the public OpenAI API reference. OpenAction therefore integrates the **decision pattern**, not an invented preview endpoint.

## Where it belongs

```text
SENSE → UNDERSTAND → [CHOOSE / ROUTE] → ACT → PROVE → LEARN
                       ↑
                 Decisions API
```

Use it when all of these are true:

1. the answer space is finite and developer-defined;
2. the decision repeats often enough that latency/cost matter;
3. semantic interpretation is useful;
4. a wrong route is recoverable;
5. deterministic policy still controls consequential execution.

Do **not** use it for:

- open-ended reasoning or planning;
- writing responses;
- legal/medical/eligibility decisions;
- payment/purchase authority;
- policy enforcement that can be expressed deterministically;
- deciding whether humans enjoyed a creative work or game.

## Efficient routing ladder

1. **Deterministic rule first** — if code can decide exactly, do not call a model.
2. **Bounded decision provider** — for semantic ambiguity with known answers. Decisions API is the preferred provider once available.
3. **Responses API / Luna** — when the answer still fits a structured schema but needs more context or explanation.
4. **Sol / Astra / Council** — multi-step reasoning, trade-offs, synthesis or tool orchestration.
5. **Human / explicit policy** — consequential authority or unresolved ambiguity.

This keeps expensive reasoning off micro-decisions and keeps fast model choices away from final authority.

## Portfolio use cases

### OpsPilot
Good:
- maintenance vs invoice vs contractor vs human review;
- which bounded workflow owns an inbox item;
- choose the next *allowed* tool;
- escalation class.

Not allowed:
- send money;
- terminate a contract;
- silently widen permissions.

### Agent-Proof
Good:
- route a failure into correctness / boundary / injection / recovery / approval;
- choose fast check vs deep eval vs human review;
- select the next regression suite.

Not allowed:
- certify an agent as legally compliant.

### PrüfPilot
Good:
- document type;
- evidence-present / partial / missing routing;
- which reviewer queue should receive a case.

Not allowed:
- final funding/legal entitlement decisions.

### Game Studio
Good:
- classify a replay anomaly;
- choose simulate-more vs targeted-human-test vs block-patch;
- route a failing seed to the right regression family.

Not allowed:
- declare a game fun.

### HANA Commerce
Good:
- answer verified facts / ask clarification / recommend nothing / hand off;
- conversation-intent routing;
- product-category routing when catalog facts are verified.

Not allowed:
- invent a claim;
- create fake urgency;
- purchase on behalf of the user;
- override Hana canon.

### CivicOS / Anspruch
Good:
- which rights domain or evidence checklist applies;
- which official route needs to be shown;
- missing-document routing.

Not allowed:
- approve/deny benefit eligibility or file consequential submissions without the user's authority.

## Fail-closed contract

`integrations/bounded-decision.mjs` deliberately knows nothing about OpenAI's undocumented preview wire format.

The provider receives:

```js
{ context, question: { id, prompt, answers } }
```

and must return either a string or `{ selection }`.

If it returns anything outside the finite answer set, or the provider errors, OpenAction uses the developer-defined fallback such as `human_review` or `needs_reasoning`.

Every returned bounded decision has:

- `authority: "propose"`
- `external_side_effects: false`

A separate deterministic policy must explicitly authorize any action afterwards.

That separation is the important architecture. Decisions API can make routing very fast without becoming the authority layer.
