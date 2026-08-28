import type { Ledger } from './managed/openproof/contract/index.js';
import type { WitnessContext } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';

export type SchnorrSignature = {
  announcement: { x: bigint; y: bigint };
  response: bigint;
};

export type FamilyAttestation = {
  credentialId: bigint;
  revocationHandle: bigint;
  purposeCode: bigint;
  policyVersion: bigint;
  validUntil: bigint;
  residentCountryCode: bigint;
  childCount: bigint;
  monthlyIncomeEur: bigint;
};

export type AgentAttestation = {
  credentialId: bigint;
  revocationHandle: bigint;
  purposeCode: bigint;
  policyVersion: bigint;
  validUntil: bigint;
  capabilityCode: bigint;
  approvedAmountEur: bigint;
  requestedAmountEur: bigint;
  scopeHash: bigint;
  actionHash: bigint;
  approvalReceiptHash: bigint;
  humanApproved: boolean;
};

export type CareAttestation = {
  credentialId: bigint;
  revocationHandle: bigint;
  purposeCode: bigint;
  policyVersion: bigint;
  validUntil: bigint;
  workflowScopeHash: bigint;
  licenceActive: boolean;
  roleAuthorised: boolean;
  consentValid: boolean;
  privacyReviewCurrent: boolean;
  securityReviewCurrent: boolean;
};

export type Attested<T> = {
  claim: T;
  signature: SchnorrSignature;
  providerId: bigint;
};

export type OpenProofPrivateState = {
  userSecretKey: Uint8Array;
  family?: Attested<FamilyAttestation>;
  agent?: Attested<AgentAttestation>;
  care?: Attested<CareAttestation>;
};

const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;

function required<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`${label} private attestation is not loaded`);
  return value;
}

export const witnesses = {
  getUserSecret: ({
    privateState,
  }: WitnessContext<Ledger, OpenProofPrivateState>): [OpenProofPrivateState, Uint8Array] => {
    if (!(privateState.userSecretKey instanceof Uint8Array) || privateState.userSecretKey.length !== 32) {
      throw new Error('getUserSecret: userSecretKey must contain exactly 32 bytes');
    }
    return [privateState, privateState.userSecretKey];
  },

  getFamilyAttestation: ({
    privateState,
  }: WitnessContext<Ledger, OpenProofPrivateState>): [
    OpenProofPrivateState,
    [FamilyAttestation, SchnorrSignature, bigint],
  ] => {
    const attested = required(privateState.family, 'family');
    return [privateState, [attested.claim, attested.signature, attested.providerId]];
  },

  getAgentAttestation: ({
    privateState,
  }: WitnessContext<Ledger, OpenProofPrivateState>): [
    OpenProofPrivateState,
    [AgentAttestation, SchnorrSignature, bigint],
  ] => {
    const attested = required(privateState.agent, 'agent');
    return [privateState, [attested.claim, attested.signature, attested.providerId]];
  },

  getCareAttestation: ({
    privateState,
  }: WitnessContext<Ledger, OpenProofPrivateState>): [
    OpenProofPrivateState,
    [CareAttestation, SchnorrSignature, bigint],
  ] => {
    const attested = required(privateState.care, 'care');
    return [privateState, [attested.claim, attested.signature, attested.providerId]];
  },

  // Mirrors Midnight's official ZK Loan Schnorr reduction witness. The circuit
  // verifies q is in range and that q*2^248+r reconstructs the challenge hash.
  getSchnorrReduction: (
    { privateState }: WitnessContext<Ledger, OpenProofPrivateState>,
    challengeHash: bigint,
  ): [OpenProofPrivateState, [bigint, bigint]] => {
    const q = challengeHash / TWO_248;
    const r = challengeHash % TWO_248;
    return [privateState, [q, r]];
  },
};
