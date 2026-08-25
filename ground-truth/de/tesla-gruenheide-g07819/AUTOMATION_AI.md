# AI + Automation Map for Administrative Cases

Goal: use AI where it removes coordination work **without transferring legal authority to the model**.

## Automation ladder

| Capability | Default automation | Human role | Why |
|---|---|---|---|
| ingest published/received documents | automatic | audit exceptions | deterministic, reversible |
| OCR/text extraction when needed | automatic + quality flags | inspect low confidence | mechanical preprocessing |
| document classification | automatic | correct exceptions | low consequence if reversible |
| version diff | automatic | domain review of materiality | AI can find changes; humans decide legal significance |
| metadata / timeline extraction | automatic proposal | verify source-backed events | reduces clerical reconstruction |
| duplicate evidence detection | automatic proposal | authority confirms reuse | supports Once Only without inventing equivalence |
| completeness preflight | automatic proposal | case owner confirms | ideal for preventing avoidable rework |
| requirement-to-evidence matching | AI-assisted | authorised reviewer validates | legal/factual context matters |
| owner / office routing | automatic where rule is explicit | human on ambiguity | routing is high-volume coordination work |
| deadline / inactivity monitoring | automatic | escalation owner | excellent 24/7 agent task |
| status explanation | automatic from authoritative state | none for factual rendering | plain-language service layer |
| draft request for missing information | automatic draft | authorised sender approves | language can be automated; authority cannot |
| public transparency summary | automatic draft + policy redaction | publication owner approves material cases | same graph, permissioned projection |
| change-impact analysis | AI proposal | affected authorities validate | prevents unnecessary full re-review |
| parallelisation suggestion | AI proposal | process/legal owner validates | never assume legal independence |
| counterfactual lead-time simulation | automatic once dependencies are validated | analyst interprets | useful evidence, not a legal decision |
| substantive legal balancing | assist only | authorised authority decides | consequential public-power decision |
| final permit / benefit / sanction decision | **never autonomous by default** | legally competent authority | authority, due process and accountability |
| override of required safeguard | **never** | only lawful competent authority | speed cannot remove legal safeguards |

## Recommended agent system

### 1. Source Agent

Watches approved authoritative sources and case inboxes. Produces immutable source references, hashes and parse status.

**May:** ingest, hash, classify, extract metadata.  
**May not:** declare a requirement satisfied.

### 2. Timeline Agent

Turns source-backed events into a proposed case chronology.

Every event must include:

`fact -> source -> exact location -> extraction confidence`

It must distinguish **observed** from **inferred**.

### 3. Preflight Agent

Checks new submissions against a machine-readable checklist before formal review starts.

Best use: catch missing files, stale versions, inconsistent identifiers, incomplete signatures and obvious schema errors within minutes instead of weeks later.

### 4. Evidence Reuse Agent

Searches the same case and authorised registers for evidence that may already satisfy a requirement.

It proposes reuse; the receiving authority or explicit rule confirms equivalence.

### 5. Change Impact Agent

Compares version N with N+1 and proposes which reviews are affected.

Example:

- changed hazardous substance inventory -> reopen major-accident / water / safety reviews;
- changed contact phone number -> do not reopen technical reviews.

This is one of the highest-potential uses of AI in complex permitting.

### 6. Constraint Agent

Derives the current constraint set from validated dependencies and authoritative task states.

It can say:

- `3 required reviews are open`;
- `2 are validated as parallelisable`;
- `this evidence request is waiting on applicant`.

It cannot say a statutory review is unnecessary unless the competent legal/process rule says so.

### 7. Routing Agent

Routes a new evidence package to every already-validated affected owner simultaneously.

This removes coordination delay without weakening review quality.

### 8. Waiting-Time Agent

Runs continuously over event timestamps and identifies:

- ready but unstarted review;
- unanswered information request;
- duplicated evidence request;
- owner unknown;
- dependency satisfied but downstream task not activated;
- SLA at risk.

It should be the core **24/7 agent** for OpenAction.

### 9. Reviewer Copilot

For a human reviewer, produces:

- relevant changed sections;
- supporting source documents;
- prior findings;
- applicable checklist;
- unresolved contradictions;
- a draft review note.

The human sees less noise but retains the decision.

### 10. Communication Agent

Explains the same state differently to applicant, specialist authority, project lead and public viewer.

It must never invent an ETA. Unknown remains unknown.

### 11. Audit Agent

Continuously checks:

- green state without evidence;
- owner verifying own consequential work;
- expired approval still being reused;
- payment without acceptance/reconciliation;
- public projection leaking restricted evidence;
- material scope change without affected reopen.

### 12. Simulation Agent

Runs counterfactuals only on **validated dependency graphs**:

- what if independent reviews started on the same day?
- what if preflight removed one rework cycle?
- what if evidence was reused Once Only?

Outputs must always be labelled `counterfactual`, never measured outcome.

## High-value human/AI split

The best model is not “AI replaces Sachbearbeitung”. It is:

> **AI handles search, comparison, coordination, monitoring and drafting. Humans exercise authority, judgement and accountability.**

That is where both speed and trust can improve at the same time.

## What the Tesla case teaches us

The G07819 record shows repeated plan changes, repeated specialist participation, multiple public rounds and many information requests. This is exactly the environment where agents can reduce:

- manual diffing between huge document versions;
- repeated distribution to affected reviewers;
- unnoticed downstream readiness;
- duplicate evidence requests;
- status-reconstruction meetings;
- slow applicant feedback loops.

But the public record is insufficient to quantify saved days. We need internal per-gate timestamps before making a numerical impact claim.
