# OpenAction

> **Information is not the goal. Human agency is.**

**OpenAction connects people, organisations and software so good actions can happen safely, faster.**

Most difficult digital projects are no longer blocked by whether software can be built. They are blocked by everything around deployment: missing evidence, unclear owners, serial reviews, privacy/security questions, licences, procurement, regulation, workforce participation and repeated requests for the same facts.

OpenAction turns that hidden work into a shared, interoperable path.

```text
TODAY
idea → prototype → ??? → emails → meetings → missing document → new reviewer → rework → maybe approval

OPENACTION
idea → preflight → shared approval graph → reusable evidence → parallel review → accountable approval → action → outcome
```

## The four objects

1. **Action** — what should happen, why, with which evidence and permissions?
2. **Approval Path** — who must decide what before it may happen?
3. **Trust Passport** — which reusable facts and proofs can reviewers reuse?
4. **Adoption Package** — what does this specific organisation still need to approve a bounded pilot?

AI may prepare evidence, find gaps and route work. **AI never impersonates the authorised approver.**

## See it in 10 seconds

Open `index.html` locally or use the public GitHub Pages deployment when enabled. Pick a use case and compare **Today → OpenAction**.

The first examples deliberately span different systems:

- 🇩🇪 Naturalisation / citizenship
- 🌍 Residence permits & skilled migration
- 🏠 Housing benefit (Wohngeld)
- 🚀 GmbH / startup formation
- 🏗️ Building permits
- 🏭 Industrial permits
- 🎓 Recognition of foreign qualifications
- 🏥 CareOS hospital adoption
- 🏛️ Public procurement / government AI pilots
- 🪪 Everyday Bürgeramt journeys

The numbers shown in the demo are **synthetic scenarios, not measured impact**. Each scenario names the assumptions and the real metric we would collect in a pilot.

## Why this is plausible

German public-sector research already points at the same bottlenecks OpenAction models. A 2025 Destatis/National Regulatory Control Council study of industrial permitting found inadequate application documents to be the biggest practical obstacle. Around three quarters of surveyed permitting staff rated missing automated reuse of existing data and missing end-to-end digital processing as strong or very strong obstacles.

Berlin's naturalisation service says digital applications can still take a year or longer. Berlin building law requires an early completeness check, yet the decision clock depends on all required statements and evidence being available. Company formation can already use online notarisation, while tax registration remains a separate process. These are not primarily “better chatbot” problems. They are **coordination, evidence and interoperability problems**.

Sources and assumptions are linked in [`examples/use-cases.json`](./examples/use-cases.json).

## Three integration levels

### 1. JSON only

Emit an OpenAction object that validates against [`spec/0.2/openaction.schema.json`](./spec/0.2/openaction.schema.json).

### 2. Tiny SDK

```js
const action = OpenAction.create({
  kind: "public.citizenship.review",
  label: "Review naturalisation application",
  reason: "Application package passed completeness preflight.",
  evidence: [{ kind: "document", source: "application-package" }],
  risk: "high",
  approval: { required: true, mode: "qualified_human", status: "pending" }
});
```

### 3. Gateway / existing system adapter

Implement [`openapi.yaml`](./openapi.yaml) or map from the system you already use.

```text
propose → approve → complete
```

OpenAction does **not** require a central OpenAction cloud.

## Existing standards stay authoritative

OpenAction is intentionally thin.

- Healthcare keeps FHIR / hospital systems as the clinical source of truth.
- Government keeps registers and specialist procedures authoritative.
- SMEs keep ERP, CRM, accounting and email.
- Identity and access remain with the organisation's trusted identity layer.
- OpenAction composes with JSON Schema, OpenAPI and CloudEvents-style lifecycle events.

The job of OpenAction is to make **the action, evidence, permission, approval and outcome understandable across those boundaries**.

## The adoption loop

```text
Organisation A asks 42 questions
        ↓
Trust Passport answers 31
        ↓
11 organisation-specific decisions remain
        ↓
real pilot produces evidence
        ↓
Organisation B starts better prepared
```

That gives us the metrics that matter:

- time to identify all required gates
- time to first safe pilot
- evidence reuse rate
- duplicate evidence requests
- late blockers discovered
- review turnaround by gate
- reopened reviews after a change
- completed real-world outcomes

## Can “8 weeks” become days?

Sometimes. Not always.

OpenAction can remove **avoidable waiting**: late discovery, missing documents, serial reviews, repeated questionnaires, unclear ownership and unnecessary re-review. It cannot legitimately remove statutory waiting periods, qualified-human judgment, physical document production, external checks or rights of participation.

The fast-lane design is therefore:

```text
minutes   classify use case + preflight completeness
hours     generate Trust Passport + reviewer packets
Day 1     start all independent reviews in parallel
Day 2-5   reviewers decide / request focused evidence
Day 5-10  resolve only blocking gaps
Day 10+   bounded pilot when all mandatory gates are satisfied
```

For highly regulated healthcare or complex public approvals, the critical path may remain weeks. The win is that **we can finally see exactly what those weeks are waiting for**.

See [`docs/ADOPTION_READY.md`](./docs/ADOPTION_READY.md).

## What must be true before organisations can adopt OpenAction immediately?

We should not ask the world to trust a clever README. A credible open standard needs:

- tiny stable core semantics
- versioned JSON Schemas
- conformance tests
- reference SDKs
- human-readable validator/playground
- signed / attributable approval receipts for production profiles
- security and threat model
- privacy/data-minimisation profile
- change-impact semantics
- domain profiles without forking the core
- adapters to standards organisations already use
- public example corpus and adversarial test cases
- clear compatibility/versioning policy
- open governance beyond one vendor/person
- real pilots with published measurements

Until then, OpenAction is an **open working specification and reference implementation**, not an official standard.

## First pilot workshop

Do not ask “do you like it?”

Ask a real organisation:

1. Is this the complete approval path?
2. Which gate is wrong or missing?
3. Who actually owns each decision?
4. Which evidence do you ask every vendor/project for repeatedly?
5. Which reviews can run in parallel?
6. What is the smallest bounded pilot you could responsibly approve?

Then update the graph from reality.

See [`docs/PILOT_PLAYBOOK.md`](./docs/PILOT_PLAYBOOK.md).

## Status

**0.2 / public working draft.** Built to be criticised, corrected and piloted.

## License

Reference implementation: **AGPL-3.0-or-later**. The protocol is provider-neutral; organisations can run their own infrastructure and build domain integrations without depending on a central OpenAction service.
