import * as crypto from 'node:crypto';
import { ecMulGenerator, type JubjubPoint } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { pureCircuits as signingCircuits } from './managed/openproof-signing/contract/index.js';
import type {
  AgentAttestation,
  CareAttestation,
  FamilyAttestation,
  SchnorrSignature,
} from './witnesses.js';

const JUBJUB_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;

export type ProofDomain = 'family' | 'agent' | 'care';

function randomScalar(): bigint {
  return BigInt(`0x${crypto.randomBytes(32).toString('hex')}`) % JUBJUB_ORDER;
}

export function generateIssuerKeyPair(): { secretKey: bigint; publicKey: JubjubPoint } {
  const secretKey = randomScalar();
  return { secretKey, publicKey: ecMulGenerator(secretKey) };
}

export function publicKeyFromSecret(secretKey: bigint): JubjubPoint {
  const normalized = ((secretKey % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;
  return ecMulGenerator(normalized);
}

function challenge(domain: ProofDomain, R: JubjubPoint, pk: JubjubPoint, msg: bigint[]): bigint {
  switch (domain) {
    case 'family':
      if (msg.length !== 9) throw new Error('family message must contain 9 fields');
      return signingCircuits.familyAttestationChallenge(R.x, R.y, pk.x, pk.y, msg);
    case 'agent':
      if (msg.length !== 13) throw new Error('agent message must contain 13 fields');
      return signingCircuits.agentAttestationChallenge(R.x, R.y, pk.x, pk.y, msg);
    case 'care':
      if (msg.length !== 12) throw new Error('care message must contain 12 fields');
      return signingCircuits.careAttestationChallenge(R.x, R.y, pk.x, pk.y, msg);
  }
}

export function schnorrSign(domain: ProofDomain, secretKey: bigint, msg: bigint[]): SchnorrSignature {
  const sk = ((secretKey % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;
  const pk = ecMulGenerator(sk);
  const k = randomScalar();
  const announcement = ecMulGenerator(k);
  const fullChallenge = challenge(domain, announcement, pk, msg);
  const reducedChallenge = fullChallenge % TWO_248;
  const response = ((k + reducedChallenge * sk) % JUBJUB_ORDER + JUBJUB_ORDER) % JUBJUB_ORDER;
  return { announcement, response };
}

export function familyMessage(claim: FamilyAttestation, subjectHash: bigint): bigint[] {
  return [
    claim.credentialId,
    claim.revocationHandle,
    claim.purposeCode,
    claim.policyVersion,
    claim.validUntil,
    claim.residentCountryCode,
    claim.childCount,
    claim.monthlyIncomeEur,
    subjectHash,
  ];
}

export function agentMessage(claim: AgentAttestation, subjectHash: bigint): bigint[] {
  return [
    claim.credentialId,
    claim.revocationHandle,
    claim.purposeCode,
    claim.policyVersion,
    claim.validUntil,
    claim.capabilityCode,
    claim.approvedAmountEur,
    claim.requestedAmountEur,
    claim.scopeHash,
    claim.actionHash,
    claim.approvalReceiptHash,
    signingCircuits.booleanMessageField(claim.humanApproved),
    subjectHash,
  ];
}

export function careMessage(claim: CareAttestation, subjectHash: bigint): bigint[] {
  return [
    claim.credentialId,
    claim.revocationHandle,
    claim.purposeCode,
    claim.policyVersion,
    claim.validUntil,
    claim.workflowScopeHash,
    signingCircuits.booleanMessageField(claim.licenceActive),
    signingCircuits.booleanMessageField(claim.roleAuthorised),
    signingCircuits.booleanMessageField(claim.consentValid),
    signingCircuits.booleanMessageField(claim.privacyReviewCurrent),
    signingCircuits.booleanMessageField(claim.securityReviewCurrent),
    subjectHash,
  ];
}

export function signFamilyAttestation(secretKey: bigint, claim: FamilyAttestation, subjectHash: bigint): SchnorrSignature {
  return schnorrSign('family', secretKey, familyMessage(claim, subjectHash));
}

export function signAgentAttestation(secretKey: bigint, claim: AgentAttestation, subjectHash: bigint): SchnorrSignature {
  return schnorrSign('agent', secretKey, agentMessage(claim, subjectHash));
}

export function signCareAttestation(secretKey: bigint, claim: CareAttestation, subjectHash: bigint): SchnorrSignature {
  return schnorrSign('care', secretKey, careMessage(claim, subjectHash));
}
