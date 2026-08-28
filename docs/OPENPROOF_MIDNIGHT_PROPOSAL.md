# OpenProof × Midnight — three-proof MVP proposal

## One sentence

**OpenProof lets a person, organisation or AI agent prove the exact fact a workflow needs without handing the workflow all of the sensitive data behind that fact.**

OpenAction answers **what may happen next**. OpenProof answers **why the actor or workflow is allowed to proceed**.

## Why this belongs under OpenAction

OpenAction already models:

- actions and approval paths;
- evidence and completion contracts;
- reusable Trust Passports;
- approval receipts;
- bounded agent permissions;
- role-specific projections of one shared case state.

The missing primitive is a portable proof object that can cross organisational boundaries while revealing less than the source evidence.

## Three reference proofs

### 1. CARE Family Eligibility Proof

Private inputs may include residency, household composition, income, housing cost and credential freshness.

Public result contains only named policy predicates such as:

- residency condition passed;
- at least one eligible child is present;
- income is below the policy threshold;
- source credential is current.

The proof is a **precheck/routing signal**, never an official entitlement decision.

### 2. Agent Authority Proof

Private inputs may include the agent's full capability envelope, internal policy data, spending limit and approval record.

Public result proves only that:

- the requested capability is present;
- the requested amount is inside the approved envelope;
- required human approval exists;
- the authority credential is current.

Execution remains behind the existing OpenAction/tool boundary.

### 3. CareOS Trust Passport Proof

Private inputs may include professional credentials, role assignments, consent state, privacy/security review evidence and expiry metadata.

Public result proves bounded readiness facts without publishing patient data or full credential documents.

A Trust Passport is **not clinical approval and not a medical decision**.

## Stable public envelope

The current local backend produces this shape:

```json
{
  "openproof": "openproof/0.1",
  "backend": "ed25519-selective-attestation-v0",
  "subject": "...",
  "purpose": "...",
  "issuer": "...",
  "issuer_key": "sha256:...",
  "issued_at": "...",
  "claims_commitment": "sha256:...",
  "predicate_results": [
    { "id": "resident_de", "claim": "identity.resident_country", "op": "eq", "passed": true }
  ],
  "disclosures": {},
  "signature": { "alg": "Ed25519", "value": "..." }
}
```

Private claim values are absent unless explicitly listed in `disclosures`.

## What is real today

`openproof/openproof.js` implements:

- canonical payload encoding;
- SHA-256 commitments over private claims plus nonce;
- deterministic predicate evaluation;
- explicit selective disclosure;
- Ed25519 issuer signatures;
- verifier-side purpose, expiry, required-predicate and signature checks;
- tamper detection.

This is a useful **signed selective attestation**, but it is **not a zero-knowledge proof**. The verifier trusts the issuer to have evaluated the hidden predicate correctly.

## Midnight upgrade path

Midnight can remove that last trust step.

The official Midnight ZK Loan example already demonstrates the desired pattern: private witness data stays client-side, an attestation provider signs the private profile, the Compact circuit verifies the provider signature and evaluates eligibility, and only the resulting decision is disclosed.

OpenProof should generalise that pattern into a reusable proof protocol:

```text
trusted credential / attestation
        ↓
private witness on user/agent device
        ↓
Compact circuit
  - verifies issuer binding
  - evaluates versioned policy predicates
  - checks freshness / scope / nonce
        ↓
Midnight proof
        ↓
OpenProof public envelope
        ↓
OpenAction policy gate
        ↓
human / authority / tool decides what happens next
```

`openproof/contracts/openproof.compact` is the first privacy-predicate scaffold. It intentionally does **not** claim production issuer binding yet; the next Compact iteration should import an audited signature-verification module or the relevant standard-library primitive and register trusted issuer keys on-ledger.

## Non-negotiable design rules

1. **No raw personal or clinical data on-chain.**
2. **No blockchain when a normal signed credential is enough.**
3. **Proof != approval.** A proof can satisfy evidence conditions; competent authorities and humans retain consequential authority.
4. **Purpose binding.** Proofs are issued for a named purpose and should not become universal tracking tokens.
5. **Short-lived and revocable where appropriate.**
6. **Policy versions must be explicit.** A proof against yesterday's rule must not silently satisfy tomorrow's rule.
7. **EUDI-compatible, not EUDI-replacing.** Official wallet credentials should be accepted as trusted inputs where available.
8. **Fail closed.** Missing, expired or unverifiable predicates never become `false == safe`; they block progression or require review.

## Proposed Midnight Foundation collaboration

### Working title

**OpenProof — privacy-preserving trust infrastructure for people, organisations and AI agents**

### Why Midnight

The project sits directly across Midnight's stated developer themes:

- digital identity and government eligibility;
- governance and policy impact;
- medical credentialing and healthcare data protection;
- autonomous AI-agent validation;
- tooling/infrastructure that makes privacy technology easier to adopt.

### What we would ask for

1. technical review of the OpenProof public envelope and Compact threat model;
2. guidance on the preferred issuer-attestation primitive for Compact v0.23 / toolchain 0.31.x;
3. review of unlinkability, nullifier/replay and revocation design;
4. support running the three reference proofs against local standalone and Preprod;
5. ecosystem partners for one civic, one agent and one healthcare shadow pilot.

### What we bring

- three concrete cross-domain reference applications instead of a generic ZK demo;
- explicit human-authority and evidence boundaries from OpenAction;
- synthetic deterministic test suites before any real sensitive data enters the system;
- a path to EUDI/official credentials rather than a competing identity silo;
- open protocol objects that can be implemented outside our own apps.

## MVP graduation gates

OpenProof does not call itself Midnight-backed until all of these are true:

- Compact contract compiles with the pinned current toolchain;
- trusted issuer signature is verified inside the circuit;
- raw private witness values are absent from ledger/indexer-visible state;
- positive and negative predicate tests pass;
- replay/nullifier behaviour is tested;
- proof expiry and policy-version mismatch fail closed;
- the three reference apps verify a real Midnight-produced proof envelope;
- threat model receives independent review.

## North star

> **Ask for the proof you need, not the person's entire life.**
