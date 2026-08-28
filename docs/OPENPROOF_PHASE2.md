# OpenProof Phase 2 — issuer-bound Midnight ZK proofs

**Status:** local Midnight end-to-end proof transaction + authoritative indexer receipt verification green.

Phase 1 established the public proof envelope and three product integrations. Phase 2 moves hidden predicate evaluation from an issuer-trusted application backend into a compiled Midnight Compact contract and gives relying parties an authoritative minimum-data receipt to verify.

## What changed

The Compact contract now includes:

- **registered attestation providers** — a private claim must carry an in-circuit Schnorr signature matching a provider key registered on the ledger;
- **issuer-scoped policy** — each family, agent or CareOS policy pins the provider authorised to satisfy that policy; merely being a globally registered provider is insufficient;
- **purpose-separated subject binding** — a private user secret derives different subject identifiers for different proof purposes;
- **on-ledger policy registries** — family, agent and CareOS predicates use versioned public policy state rather than caller-selected thresholds;
- **ledger-time expiry checks** — validity uses Compact's `blockTimeLt` against the credential's signed Unix-seconds expiry instead of trusting a caller-supplied current time;
- **revocation** — credentials carry a random signed revocation handle checked against a public revocation set;
- **verifier challenges + nullifiers** — each proof consumes a nonce-derived nullifier so the same verifier challenge cannot be replayed;
- **authoritative proof receipts** — a successful proof writes a minimal public receipt keyed by its nullifier, so a relying party can query contract state instead of trusting prover-supplied JSON;
- **request/action/workflow binding** — receipts bind the proof to the exact CARE request, agent action + approval receipt, or CareOS workflow scope;
- **agent action binding** — authority proofs bind the exact action hash and human-approval receipt hash;
- **CareOS workflow binding** — Trust Passport proofs bind the exact workflow scope.

## The minimum public Proof Receipt

A successful proof stores only:

```text
proof type
purpose code
policy version
policy-authorised provider id
request / action / workflow binding hash
optional auxiliary binding (agent approval receipt)
hash of verifier challenge
```

It does **not** store the household income, household composition beyond the proven predicate, authority ceiling, clinical record, professional notes, user secret or issuer signing key.

The receipt is not an approval. It is cryptographic evidence that the registered contract accepted the specified predicate under a particular policy and binding.

## Current compiler / local-network target

The CI gate pins:

- Compact toolchain: **0.31.1**
- Compact language: **0.22–0.23**
- Compact runtime reported by compiler: **0.16.0**
- Midnight.js: **4.1.1**
- Ledger v8: **8.1.0**
- onchain-runtime-v3: **3.0.0**
- platform-js: **2.2.4**
- local Midnight node: **1.0.0**
- local indexer: **4.3.3**
- local proof server: **8.1.0**

The explicit runtime pins prevent multiple WASM runtime class identities from being loaded across Compact runtime and Midnight.js transaction code.

## Verified local Midnight end-to-end run

On **2026-08-28**, CI completed the complete CARE family proof path against an ephemeral local Midnight network:

```text
wallet + DUST ready
        ↓
OpenProof contract deployed
        ↓
policy-authorised issuer registered
        ↓
family policy registered
        ↓
issuer signs subject-bound private family credential
        ↓
proof server produces ZK proof
        ↓
family proof transaction submitted and finalised
        ↓
indexer queries contract state
        ↓
authoritative Proof Receipt found by expected nullifier
        ↓
receipt fields independently matched
        ↓
exact replay attempt rejected
```

Verified example transaction evidence from that ephemeral run:

- contract address: `17cbcbe259ed00a7cc13c5efad99b9d25ae7c08b41982fdf4e6c78f3fd9adfbd`
- deploy tx: `00f997781e8a05e6fae13e1192980a1826034577ca98b6fff678aef6a40d1c8c98`
- provider registration tx: `00c75bf6431d67db610afd5e41925dac9420495c930904ab542bbe67e3b0bd0230`
- family policy tx: `00688e689a028ea5a93bb54db2fa6b182f70e03c64c4ca8cd501b6315d06483f50`
- family proof tx: `00c032dc8a02266e493d2a727e45833af16a177c2a322559b91daecb11a4f30330`
- family proof block: `16`

The test queried the receipt through the indexer and verified:

- `proofType = family`;
- purpose `101`;
- policy version `1`;
- policy-authorised provider `1`;
- exact CARE request binding;
- verifier-challenge hash;
- one-time nullifier consumption.

The exact same verifier challenge was then attempted again and rejected.

These addresses and transaction IDs belong to an ephemeral local development chain and are evidence of the CI execution, not public Midnight mainnet identifiers.

## Adversarial matrix

| Case | Verified result |
|---|---|
| policy-authorised issuer + valid family credential | PASS + receipt |
| globally registered but policy-unapproved issuer | REJECT |
| same verifier challenge reused | REJECT |
| forged issuer signature | REJECT |
| revoked credential | REJECT |
| stale policy version | REJECT |
| valid agent action + matching approval receipt | PASS + receipt |
| different action hash | REJECT |
| valid CareOS trust state in approved workflow scope | PASS + receipt |
| missing required consent | REJECT |

The three product integrations remain fail-closed. Passing a cryptographic predicate does not itself make a benefit decision, execute an agent action or make a clinical decision.

## Privacy boundary

### Kept private

- household income and household dossier;
- authority limits and internal agent policy details;
- professional/governance evidence and clinical data;
- user secret keys;
- issuer signing keys.

### Public / intentionally disclosed

- versioned policy state and its authorised provider ID;
- issuer public keys/provider IDs;
- one-time proof nullifiers;
- minimal proof receipts;
- current revocation handles when checked;
- exact request/action/workflow hashes where the verifier must know what the proof concerns;
- the fact that the required predicate succeeded.

### Known Phase 2 privacy debt

The first revocation design discloses a random revocation handle for a public set-membership check. Reuse of the same credential can therefore be linkable by that handle.

OpenProof **does not claim unlinkable revocation** in this phase. Before a production identity/benefits/health deployment, evaluate one or more of:

1. privacy-preserving revocation accumulator/membership proofs;
2. short-lived credentials with frequent reissuance;
3. purpose-specific rotating revocation handles;
4. a Midnight-native credential-status primitive if/when a reviewed standard becomes available.

## Trusted-time boundary

Compact's block-time comparators constrain against the ledger context's nominal Unix-seconds time. They are suitable for bounded expiry comparisons but are not a general current-time oracle, block-height proof or wall-clock-accuracy proof.

OpenProof therefore uses ledger time only for the narrow question:

> **Has this signed validity deadline already passed at this ledger execution?**

It does not derive claims about ordering, finality or exact real-world wall-clock accuracy from that primitive.

## Graduation ladder

```text
compiled Compact contract                         ✅
        ↓
issuer + private-state adapters typecheck         ✅
        ↓
Compact simulator adversarial matrix              ✅
        ↓
standalone local Midnight + real proof tx         ✅
        ↓
query authoritative Proof Receipt via indexer     ✅
        ↓
receipt binding + replay rejection                ✅
        ↓
Preprod deployment + public test transaction
        ↓
shared MidnightProofVerifier consumed by CARE / Passport / Agent / CareOS
        ↓
independent threat-model review
        ↓
external issuer / verifier interoperability test
```

No lower rung is described as a higher rung.

## Production non-claims

Phase 2 does **not** yet prove:

- deployment to Midnight Preprod or mainnet;
- EUDI Wallet interoperability;
- authority acceptance of CARE proofs;
- safe production PHI operation;
- unlinkable revocation;
- audited smart-contract security;
- legal/regulatory sufficiency;
- that a proof is equivalent to an approval.

The north star remains:

> **Ask for the proof you need, not the person's entire life.**
