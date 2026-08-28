# OpenProof Phase 2 — issuer-bound Midnight ZK proofs

**Status:** implementation under adversarial CI validation.

Phase 1 established the public proof envelope and three product integrations. Phase 2 moves the hidden predicate evaluation from an issuer-trusted application backend into a compiled Midnight Compact contract.

## What changed

The Compact contract now includes:

- **registered attestation providers** — a private claim must carry an in-circuit Schnorr signature matching a provider key registered on the ledger;
- **purpose-separated subject binding** — a private user secret derives different subject identifiers for different proof purposes;
- **on-ledger policy registries** — family, agent and CareOS predicates use versioned public policy state rather than caller-selected thresholds;
- **ledger-time expiry checks** — validity uses Compact's `blockTimeLt` against the credential's signed Unix-seconds expiry instead of trusting a caller-supplied current time;
- **revocation** — credentials carry a random signed revocation handle checked against a public revocation set;
- **verifier challenges + nullifiers** — each proof consumes a nonce-derived nullifier so the same verifier challenge cannot be replayed;
- **agent action binding** — authority proofs bind the exact action hash and human-approval receipt hash;
- **CareOS workflow binding** — Trust Passport proofs bind the exact workflow scope.

## Current compiler target

The CI gate pins:

- Compact toolchain: **0.31.1**
- Compact language: **0.22–0.23**
- Compact runtime reported by compiler: **0.16.0**

This is intentionally the current ledger-8/mainnet-compatible line used by Midnight's maintained ZK Loan example rather than the newer ledger-9 compiler line.

## What has already been proven

The Phase 2 verification contract has compiled successfully with Compact 0.31.1 and generated:

- JavaScript contract bindings;
- proving/verifying key material;
- ZKIR artifacts.

Compilation is necessary, not sufficient. The release gate now additionally compiles issuer-side challenge helpers, typechecks the private-state/issuer adapters, and executes the generated contract in the Compact simulator against positive and adversarial cases.

## Adversarial matrix

| Case | Required result |
|---|---|
| registered issuer + valid family credential | PASS |
| same verifier challenge reused | REJECT |
| forged issuer signature | REJECT |
| revoked credential | REJECT |
| stale policy version | REJECT |
| valid agent action + matching approval receipt | PASS |
| different action hash | REJECT |
| valid CareOS trust state in approved workflow scope | PASS |
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

- versioned policy state;
- issuer public keys/provider IDs;
- one-time proof nullifiers;
- current revocation handles when checked;
- exact action/workflow hashes where the verifier must know what is being authorised;
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
compiled Compact contract
        ↓
issuer + private-state adapters typecheck
        ↓
Compact simulator adversarial matrix
        ↓
standalone local Midnight node + proof server transaction
        ↓
inspect ledger/indexer visibility for privacy leakage
        ↓
Preprod deployment + real transaction receipt
        ↓
CARE / Agent / CareOS consume the same Midnight backend
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
