import assert from 'node:assert/strict';
import OpenProof from '../openproof.js';

const { publicKeyPem, privateKeyPem } = OpenProof.generateIssuerKeyPair();
const privateClaims = {
  identity: { resident_country: 'DE', resident_city: 'Berlin' },
  household: { children: 2 },
  finance: { monthly_income_eur: 2000, warm_rent_eur: 1100 },
  credential: { valid_until: '2027-08-28T00:00:00Z' },
};

const predicates = [
  { id: 'resident_de', claim: 'identity.resident_country', op: 'eq', value: 'DE' },
  { id: 'has_children', claim: 'household.children', op: 'gte', value: 1 },
  { id: 'income_under_demo_ceiling', claim: 'finance.monthly_income_eur', op: 'lte', value: 2500 },
  { id: 'credential_current', claim: 'credential.valid_until', op: 'not_expired' },
];

const proof = OpenProof.issueAttestation({
  subject: 'did:example:family-001',
  purpose: 'care.family.precheck',
  issuer: 'urn:issuer:synthetic-benefit-advice',
  privateClaims,
  predicates,
  disclose: ['identity.resident_city'],
  privateKeyPem,
  publicKeyPem,
  issuedAt: '2026-08-28T10:00:00Z',
  expiresAt: '2026-08-29T10:00:00Z',
  nonce: 'test-nonce-not-for-production',
});

assert.equal(proof.disclosures['identity.resident_city'], 'Berlin');
assert.equal(proof.disclosures['finance.monthly_income_eur'], undefined);
assert.equal(JSON.stringify(proof).includes('2000'), false, 'raw income must not leak');
assert.equal(JSON.stringify(proof).includes('1100'), false, 'raw rent must not leak');
assert.equal(proof.predicate_results.every(x => x.passed), true);

const verified = OpenProof.verifyAttestation(proof, publicKeyPem, {
  purpose: 'care.family.precheck',
  requiredPredicates: predicates.map(p => p.id),
  now: new Date('2026-08-28T12:00:00Z'),
});
assert.deepEqual(verified, { ok: true, errors: [] });

const tampered = structuredClone(proof);
tampered.predicate_results[0].passed = false;
assert.equal(OpenProof.verifyAttestation(tampered, publicKeyPem).ok, false, 'tampering must break signature');

const expired = OpenProof.verifyAttestation(proof, publicKeyPem, { now: new Date('2026-08-30T00:00:00Z') });
assert.equal(expired.ok, false);
assert(expired.errors.includes('proof expired'));

console.log('OpenProof v0.1 tests: PASS');
