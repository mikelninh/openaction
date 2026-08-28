// @ts-nocheck
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  CompactTypeBytes,
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
  transientHash,
} from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { Contract, ledger, pureCircuits } from '../managed/openproof/contract/index.js';
import { witnesses } from '../witnesses.ts';
import {
  generateIssuerKeyPair,
  signAgentAttestation,
  signCareAttestation,
  signFamilyAttestation,
} from '../issuer.ts';

const bytes32Type = new CompactTypeBytes(32);
const future = () => BigInt(Math.floor(Date.now() / 1000) + 86_400);
const secret = () => new Uint8Array(crypto.randomBytes(32));

class OpenProofSimulator {
  contract;
  context;
  userSecretKey;

  constructor() {
    this.userSecretKey = secret();
    this.contract = new Contract(witnesses);
    const privateState = { userSecretKey: this.userSecretKey };
    const ownerHex = '01'.padStart(64, '0');
    const initial = this.contract.initialState(createConstructorContext(privateState, ownerHex));
    this.context = createCircuitContext(
      sampleContractAddress(),
      initial.currentZswapLocalState,
      initial.currentContractState,
      initial.currentPrivateState,
    );
  }

  getLedger() {
    return ledger(this.context.currentQueryContext.state);
  }

  setPrivate(patch) {
    this.context = {
      ...this.context,
      currentPrivateState: { ...this.context.currentPrivateState, ...patch },
    };
  }

  call(name, ...args) {
    const out = this.contract.impureCircuits[name](this.context, ...args);
    this.context = out.context;
    return out.result;
  }

  subjectHash(purposeCode) {
    const subject = pureCircuits.deriveSubjectPublicKey(this.userSecretKey, purposeCode);
    return transientHash(bytes32Type, subject);
  }
}

function familyFixture(sim, providerSecret, overrides = {}, providerId = 1n) {
  const claim = {
    credentialId: 1001n,
    revocationHandle: 90001n,
    purposeCode: 101n,
    policyVersion: 1n,
    validUntil: future(),
    residentCountryCode: 276n,
    childCount: 2n,
    monthlyIncomeEur: 2_000n,
    ...overrides,
  };
  return {
    claim,
    signature: signFamilyAttestation(providerSecret, claim, sim.subjectHash(claim.purposeCode)),
    providerId,
  };
}

function agentFixture(sim, providerSecret, overrides = {}) {
  const claim = {
    credentialId: 2001n,
    revocationHandle: 90002n,
    purposeCode: 201n,
    policyVersion: 1n,
    validUntil: future(),
    capabilityCode: 7n,
    approvedAmountEur: 1_000n,
    requestedAmountEur: 742n,
    scopeHash: 7007n,
    actionHash: 742_001n,
    approvalReceiptHash: 555_001n,
    humanApproved: true,
    ...overrides,
  };
  return {
    claim,
    signature: signAgentAttestation(providerSecret, claim, sim.subjectHash(claim.purposeCode)),
    providerId: 1n,
  };
}

function careFixture(sim, providerSecret, overrides = {}) {
  const claim = {
    credentialId: 3001n,
    revocationHandle: 90003n,
    purposeCode: 301n,
    policyVersion: 1n,
    validUntil: future(),
    workflowScopeHash: 8008n,
    licenceActive: true,
    roleAuthorised: true,
    consentValid: true,
    privacyReviewCurrent: true,
    securityReviewCurrent: true,
    ...overrides,
  };
  return {
    claim,
    signature: signCareAttestation(providerSecret, claim, sim.subjectHash(claim.purposeCode)),
    providerId: 1n,
  };
}

function setupFamily() {
  const sim = new OpenProofSimulator();
  const provider = generateIssuerKeyPair();
  sim.call('registerProvider', 1n, provider.publicKey);
  sim.call('setFamilyPolicy', 101n, {
    version: 1n,
    requiredProviderId: 1n,
    requiredCountryCode: 276n,
    minimumChildren: 1n,
    maximumMonthlyIncomeEur: 2_500n,
  });
  return { sim, provider };
}

function setupAgent() {
  const sim = new OpenProofSimulator();
  const provider = generateIssuerKeyPair();
  sim.call('registerProvider', 1n, provider.publicKey);
  sim.call('setAgentPolicy', 201n, {
    version: 1n,
    requiredProviderId: 1n,
    requiredCapabilityCode: 7n,
    maximumActionAmountEur: 1_000n,
    requiredScopeHash: 7007n,
    requireHumanApproval: true,
  });
  return { sim, provider };
}

function setupCare() {
  const sim = new OpenProofSimulator();
  const provider = generateIssuerKeyPair();
  sim.call('registerProvider', 1n, provider.publicKey);
  sim.call('setCarePolicy', 301n, {
    version: 1n,
    requiredProviderId: 1n,
    requiredWorkflowScopeHash: 8008n,
    requireLicenceActive: true,
    requireRoleAuthorised: true,
    requireConsentValid: true,
    requirePrivacyReviewCurrent: true,
    requireSecurityReviewCurrent: true,
  });
  return { sim, provider };
}

function expectThrow(fn, contains) {
  assert.throws(fn, (error) => {
    assert.match(String(error), new RegExp(contains, 'i'));
    return true;
  });
}

function receiptAt(sim, nullifier) {
  const state = sim.getLedger();
  assert.equal(state.proofReceipts.member(nullifier), true, 'proof receipt must exist');
  return state.proofReceipts.lookup(nullifier);
}

// 1) CARE family proof succeeds and writes a verifier-queryable receipt.
{
  const { sim, provider } = setupFamily();
  const requestBinding = 44_001n;
  const nonce = 11_001n;
  sim.setPrivate({ family: familyFixture(sim, provider.secretKey) });
  const nullifier = sim.call('proveFamilyEligibility', 101n, requestBinding, nonce);
  const state = sim.getLedger();
  assert.equal(state.usedNullifiers.size(), 1n);
  assert.equal(state.proofReceipts.size(), 1n);

  const receipt = receiptAt(sim, nullifier);
  assert.equal(receipt.proofType, 1n);
  assert.equal(receipt.purposeCode, 101n);
  assert.equal(receipt.policyVersion, 1n);
  assert.equal(receipt.providerId, 1n);
  assert.equal(receipt.bindingHash, requestBinding);
  assert.equal(receipt.auxiliaryBindingHash, 0n);
  assert.equal(receipt.verifierChallengeHash, pureCircuits.verifierChallengeHash(nonce));
}

// 2) Reusing the same verifier challenge is rejected.
{
  const { sim, provider } = setupFamily();
  sim.setPrivate({ family: familyFixture(sim, provider.secretKey) });
  sim.call('proveFamilyEligibility', 101n, 44_002n, 11_002n);
  expectThrow(() => sim.call('proveFamilyEligibility', 101n, 44_002n, 11_002n), 'already used');
}

// 3) A credential signed by a forged key cannot satisfy the registered issuer key.
{
  const { sim } = setupFamily();
  const rogue = generateIssuerKeyPair();
  sim.setPrivate({ family: familyFixture(sim, rogue.secretKey) });
  expectThrow(() => sim.call('proveFamilyEligibility', 101n, 44_003n, 11_003n), 'signature');
}

// 4) Even a globally registered issuer is rejected when this policy pins another issuer.
{
  const { sim } = setupFamily();
  const secondIssuer = generateIssuerKeyPair();
  sim.call('registerProvider', 2n, secondIssuer.publicKey);
  sim.setPrivate({ family: familyFixture(sim, secondIssuer.secretKey, {}, 2n) });
  expectThrow(() => sim.call('proveFamilyEligibility', 101n, 44_004n, 11_004n), 'issuer not authorised');
}

// 5) Revocation is enforced before the proof can complete.
{
  const { sim, provider } = setupFamily();
  const attestation = familyFixture(sim, provider.secretKey);
  sim.setPrivate({ family: attestation });
  sim.call('revokeCredential', attestation.claim.revocationHandle);
  expectThrow(() => sim.call('proveFamilyEligibility', 101n, 44_005n, 11_005n), 'revoked');
}

// 6) Policy version changes invalidate stale credentials without exposing private income.
{
  const { sim, provider } = setupFamily();
  sim.setPrivate({ family: familyFixture(sim, provider.secretKey) });
  sim.call('setFamilyPolicy', 101n, {
    version: 2n,
    requiredProviderId: 1n,
    requiredCountryCode: 276n,
    minimumChildren: 1n,
    maximumMonthlyIncomeEur: 2_500n,
  });
  expectThrow(() => sim.call('proveFamilyEligibility', 101n, 44_006n, 11_006n), 'policy version');
}

// 7) Agent proof binds capability, amount, exact action and human approval receipt.
{
  const { sim, provider } = setupAgent();
  const attestation = agentFixture(sim, provider.secretKey);
  const nonce = 22_001n;
  sim.setPrivate({ agent: attestation });
  const nullifier = sim.call(
    'proveAgentAuthority',
    201n,
    attestation.claim.actionHash,
    attestation.claim.approvalReceiptHash,
    nonce,
  );
  const receipt = receiptAt(sim, nullifier);
  assert.equal(receipt.proofType, 2n);
  assert.equal(receipt.providerId, 1n);
  assert.equal(receipt.bindingHash, attestation.claim.actionHash);
  assert.equal(receipt.auxiliaryBindingHash, attestation.claim.approvalReceiptHash);
  assert.equal(receipt.verifierChallengeHash, pureCircuits.verifierChallengeHash(nonce));

  const { sim: wrongActionSim, provider: p2 } = setupAgent();
  const wrong = agentFixture(wrongActionSim, p2.secretKey);
  wrongActionSim.setPrivate({ agent: wrong });
  expectThrow(
    () => wrongActionSim.call('proveAgentAuthority', 201n, 999_999n, wrong.claim.approvalReceiptHash, 22_002n),
    'action binding',
  );
}

// 8) CareOS proof succeeds only for the policy-bound workflow trust state.
{
  const { sim, provider } = setupCare();
  const attestation = careFixture(sim, provider.secretKey);
  const nonce = 33_001n;
  sim.setPrivate({ care: attestation });
  const nullifier = sim.call('proveCareTrustPassport', 301n, attestation.claim.workflowScopeHash, nonce);
  const receipt = receiptAt(sim, nullifier);
  assert.equal(receipt.proofType, 3n);
  assert.equal(receipt.providerId, 1n);
  assert.equal(receipt.bindingHash, attestation.claim.workflowScopeHash);
  assert.equal(receipt.auxiliaryBindingHash, 0n);
  assert.equal(receipt.verifierChallengeHash, pureCircuits.verifierChallengeHash(nonce));

  const { sim: noConsentSim, provider: p2 } = setupCare();
  const noConsent = careFixture(noConsentSim, p2.secretKey, { consentValid: false });
  noConsentSim.setPrivate({ care: noConsent });
  expectThrow(
    () => noConsentSim.call('proveCareTrustPassport', 301n, noConsent.claim.workflowScopeHash, 33_002n),
    'consent',
  );
}

console.log('OpenProof Phase 2 simulator: PASS');
console.log('✓ registered + policy-authorised issuer signature');
console.log('✓ authoritative minimal proof receipts');
console.log('✓ policy version binding');
console.log('✓ revocation');
console.log('✓ verifier-challenge replay rejection');
console.log('✓ exact agent action/approval binding');
console.log('✓ CareOS workflow/consent gate');
