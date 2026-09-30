import assert from 'node:assert/strict';
import { councilChiefToDecisionEvidence } from '../integrations/council.mjs';

const brief = {
  schema: 'council-chief-v1',
  recommendation: {
    project: 'OpsPilot',
    nextMove: 'Run one paid supervised shadow sprint.',
    rationale: 'Highest current combination of cash and real failure evidence.',
    confidencePercent: 82,
    evidenceType: 'chief_estimate_v1'
  },
  alternatives: [
    {
      project: 'Agent-Proof',
      nextMove: 'Sell one trust audit.',
      rationale: 'Strong adjacent assurance wedge.',
      confidencePercent: 75
    }
  ]
};

const evidence = councilChiefToDecisionEvidence(brief);
assert.equal(evidence.schema, 'openaction.decision-evidence.v1');
assert.equal(evidence.decision_owner, 'human');
assert.equal(evidence.authority_granted, 'none');
assert.equal(evidence.advisory, true);
assert.equal(evidence.selected_path, 'Run one paid supervised shadow sprint.');
assert.equal(evidence.alternatives.length, 1);
assert.match(evidence.rule, /does not authorize execution/);

assert.throws(
  () => councilChiefToDecisionEvidence({ schema: 'council-chief-v1', recommendation: null }),
  /recommendation/
);

console.log('✓ Council Chief recommendation converts to advisory decision evidence without granting authority.');
