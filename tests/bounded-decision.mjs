import assert from 'node:assert/strict';
import {
  authorizeDecision,
  BoundedDecisionError,
  createDecisionQuestion,
  decideBounded
} from '../integrations/bounded-decision.mjs';

const routing = createDecisionQuestion({
  id: 'opspilot_inbox_route',
  prompt: 'Which bounded workflow should receive this case?',
  answers: ['maintenance', 'invoice', 'contractor', 'human_review'],
  fallback: 'human_review'
});

const deterministic = await decideBounded({
  question: routing,
  context: { subject: 'Invoice 4711' },
  provider: async () => 'maintenance',
  deterministicRule: context => context.subject.startsWith('Invoice') ? 'invoice' : null
});
assert.equal(deterministic.selection, 'invoice');
assert.equal(deterministic.source, 'deterministic_rule');

const semantic = await decideBounded({
  question: routing,
  context: { text: 'The kitchen tap is leaking again' },
  provider: async () => ({ selection: 'maintenance' })
});
assert.equal(semantic.selection, 'maintenance');
assert.equal(semantic.fallback_used, false);
assert.equal(semantic.authority, 'propose');
assert.equal(semantic.external_side_effects, false);

const invalid = await decideBounded({
  question: routing,
  context: { text: 'Do whatever you think is best' },
  provider: async () => ({ selection: 'wire_money' })
});
assert.equal(invalid.selection, 'human_review');
assert.equal(invalid.fallback_used, true);
assert.equal(invalid.fallback_reason, 'invalid_provider_selection');

const failed = await decideBounded({
  question: routing,
  context: { text: 'ambiguous' },
  provider: async () => { throw new Error('preview unavailable'); }
});
assert.equal(failed.selection, 'human_review');
assert.equal(failed.fallback_reason, 'provider_error');

const allowed = authorizeDecision(semantic, selection => selection === 'maintenance');
assert.equal(allowed.authorized, true);
const denied = authorizeDecision(invalid, selection => selection !== 'human_review');
assert.equal(denied.authorized, false);

assert.throws(
  () => createDecisionQuestion({
    id: 'unsafe',
    prompt: 'Approve benefit?',
    answers: ['approve', 'deny'],
    fallback: 'human_review'
  }),
  error => error instanceof BoundedDecisionError && error.code === 'INVALID_FALLBACK'
);

const hana = createDecisionQuestion({
  id: 'hana_commerce_next_move',
  prompt: 'What is the safest useful next conversational move?',
  answers: ['answer_verified_facts', 'ask_clarifying_question', 'recommend_nothing', 'handoff_human'],
  fallback: 'handoff_human'
});
const hanaDecision = await decideBounded({
  question: hana,
  context: { verifiedFacts: [], request: 'Promise this will cure me' },
  provider: async () => 'handoff_human'
});
assert.equal(hanaDecision.selection, 'handoff_human');
assert.ok(!hanaDecision.allowed_answers.includes('purchase'));
assert.ok(!hanaDecision.allowed_answers.includes('invent_claim'));

console.log('✓ Bounded decision router passes deterministic-first, finite-answer, fail-closed and authority-separation checks.');
