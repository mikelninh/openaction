import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateAgencyLoop } from '../scripts/validate-agency-loop.mjs';

for (const name of ['opspilot', 'hana-episode-1', 'game-studio']) {
  const loop = JSON.parse(fs.readFileSync(new URL(`../examples/agency-loop/${name}.json`, import.meta.url), 'utf8'));
  const result = validateAgencyLoop(loop);
  assert.equal(result.ok, true, `${name}: ${result.errors.join(', ')}`);
}

const unsafe = {
  schema: 'openaction.agency-loop.v1',
  id: 'agency_unsafe',
  goal: { statement: 'x', human_outcome: 'y' },
  state: { current: 'x', evidence: ['e'] },
  gap: { blocker: 'b', why_now: 'n' },
  decision: { selected_path: 'x', decision_owner: 'shared', rationale: 'r' },
  action: { next_action: 'send money', executor: 'agent', authority: 'execute', external_side_effects: true },
  proof: { success_metrics: ['x'], stop_conditions: ['y'], evidence_required: ['z'] },
  feedback: { observations: [], next_cycle_trigger: 'new evidence' }
};
const unsafeResult = validateAgencyLoop(unsafe);
assert.equal(unsafeResult.ok, false);
assert.ok(unsafeResult.errors.includes('consequential_shared_execute_requires_explicit_human_or_policy_owner'));

console.log('✓ Agency Loop examples validate across operations, HANA and Game Studio.');
