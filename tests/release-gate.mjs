import assert from 'node:assert/strict';
import fs from 'node:fs';
import { releaseVerdict, validateReleaseGate } from '../scripts/validate-release-gate.mjs';
import { validateAgencyReceipt } from '../scripts/validate-agency-receipt.mjs';

for (const name of ['opspilot', 'game-studio', 'hana-atelier']) {
  const manifest = JSON.parse(fs.readFileSync(new URL(`../examples/release-gate/${name}.json`, import.meta.url), 'utf8'));
  const validation = validateReleaseGate(manifest);
  assert.equal(validation.ok, true, `${name}: ${validation.errors.join(', ')}`);
  const verdict = releaseVerdict(manifest);
  assert.equal(verdict.verdict, 'REVIEW', `${name} should stay REVIEW until real-world evidence exists`);
}

const illegalRealityPass = {
  schema: 'openaction.release-gate.v1',
  project: 'fixture',
  release: 'fixture',
  outcome: { human_outcome: 'fixture' },
  gates: [
    { id: 'r0', stage: 'R0', owner: 'automated', blocking: true, status: 'pass', claim: 'x', evidence: [{ class: 'automated', ref: 'x' }] },
    { id: 'r1', stage: 'R1', owner: 'automated', blocking: true, status: 'pass', claim: 'x', evidence: [{ class: 'automated', ref: 'x' }] },
    { id: 'r2', stage: 'R2', owner: 'automated', blocking: true, status: 'pass', claim: 'x', evidence: [{ class: 'automated', ref: 'x' }] },
    { id: 'r3', stage: 'R3', owner: 'automated', blocking: true, status: 'pass', claim: 'x', evidence: [{ class: 'automated', ref: 'x' }] },
    { id: 'r4', stage: 'R4', owner: 'external', blocking: true, status: 'pass', claim: 'x', evidence: [{ class: 'synthetic', ref: 'fake customer' }] }
  ]
};
const bad = validateReleaseGate(illegalRealityPass);
assert.equal(bad.ok, false);
assert.ok(bad.errors.includes('external_pass_requires_external_evidence:r4'));
assert.ok(bad.errors.includes('r4_pass_requires_human_or_external_evidence:r4'));

const blocked = structuredClone(JSON.parse(fs.readFileSync(new URL('../examples/release-gate/game-studio.json', import.meta.url), 'utf8')));
blocked.gates.find(gate => gate.stage === 'R2').status = 'blocked';
assert.equal(releaseVerdict(blocked).verdict, 'BLOCK');

const fullPass = structuredClone(JSON.parse(fs.readFileSync(new URL('../examples/release-gate/game-studio.json', import.meta.url), 'utf8')));
for (const gate of fullPass.gates) {
  gate.status = 'pass';
  if (gate.owner === 'human') gate.evidence = [{ class: 'human', ref: 'fixture human evidence' }];
  if (gate.owner === 'external') gate.evidence = [{ class: 'external', ref: 'fixture external evidence' }];
  if (gate.owner === 'automated') gate.evidence = [{ class: 'automated', ref: 'fixture CI evidence' }];
}
assert.equal(releaseVerdict(fullPass).verdict, 'PASS');

const receipt = JSON.parse(fs.readFileSync(new URL('../examples/agency-receipt/opspilot.json', import.meta.url), 'utf8'));
assert.equal(validateAgencyReceipt(receipt).ok, true);

const unsafeReceipt = structuredClone(receipt);
unsafeReceipt.action.authority = 'execute';
unsafeReceipt.action.external_side_effects = true;
unsafeReceipt.decision.owner = 'shared';
assert.equal(validateAgencyReceipt(unsafeReceipt).ok, false);
assert.ok(validateAgencyReceipt(unsafeReceipt).errors.includes('consequential_execute_requires_human_or_policy_owner'));

console.log('✓ Release Gate v1 + Agency Receipt v1 enforce evidence and human reality boundaries.');
