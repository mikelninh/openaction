export class BoundedDecisionError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'BoundedDecisionError';
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details = {}) {
  throw new BoundedDecisionError(code, message, details);
}

function cleanAnswers(answers) {
  if (!Array.isArray(answers) || answers.length < 2) {
    fail('INVALID_ANSWERS', 'answers must contain at least two values');
  }
  const cleaned = answers.map(answer => String(answer).trim());
  if (cleaned.some(answer => !answer)) fail('INVALID_ANSWERS', 'answers must be non-empty strings');
  if (new Set(cleaned).size !== cleaned.length) fail('DUPLICATE_ANSWERS', 'answers must be unique');
  return cleaned;
}

export function createDecisionQuestion({ id, prompt, answers, fallback }) {
  if (typeof id !== 'string' || !id.trim()) fail('INVALID_ID', 'id is required');
  if (typeof prompt !== 'string' || !prompt.trim()) fail('INVALID_PROMPT', 'prompt is required');
  const allowed = cleanAnswers(answers);
  if (!allowed.includes(fallback)) fail('INVALID_FALLBACK', 'fallback must be one of the allowed answers');
  return Object.freeze({
    schema: 'openaction.bounded-question.v1',
    id: id.trim(),
    prompt: prompt.trim(),
    answers: Object.freeze([...allowed]),
    fallback
  });
}

function normalizeProviderSelection(raw) {
  if (typeof raw === 'string') return raw.trim();
  if (raw && typeof raw === 'object' && typeof raw.selection === 'string') return raw.selection.trim();
  return '';
}

export async function decideBounded({
  question,
  context,
  provider,
  deterministicRule = null
}) {
  if (!question || question.schema !== 'openaction.bounded-question.v1') {
    fail('INVALID_QUESTION', 'question must come from createDecisionQuestion()');
  }

  if (deterministicRule !== null) {
    if (typeof deterministicRule !== 'function') fail('INVALID_RULE', 'deterministicRule must be a function');
    const ruled = await deterministicRule(context, question);
    if (ruled !== null && ruled !== undefined) {
      const selection = String(ruled);
      if (!question.answers.includes(selection)) {
        fail('RULE_OUTSIDE_ANSWER_SPACE', 'deterministic rule returned an answer outside the allowed set', { selection });
      }
      return {
        schema: 'openaction.bounded-decision.v1',
        question_id: question.id,
        selection,
        allowed_answers: [...question.answers],
        fallback_used: false,
        source: 'deterministic_rule',
        authority: 'propose',
        external_side_effects: false
      };
    }
  }

  if (typeof provider !== 'function') fail('PROVIDER_REQUIRED', 'provider is required when no deterministic rule resolves the question');

  try {
    const raw = await provider({
      context,
      question: {
        id: question.id,
        prompt: question.prompt,
        answers: [...question.answers]
      }
    });
    const selection = normalizeProviderSelection(raw);
    if (!question.answers.includes(selection)) {
      return {
        schema: 'openaction.bounded-decision.v1',
        question_id: question.id,
        selection: question.fallback,
        allowed_answers: [...question.answers],
        fallback_used: true,
        fallback_reason: 'invalid_provider_selection',
        source: 'provider',
        authority: 'propose',
        external_side_effects: false
      };
    }
    return {
      schema: 'openaction.bounded-decision.v1',
      question_id: question.id,
      selection,
      allowed_answers: [...question.answers],
      fallback_used: false,
      source: 'provider',
      authority: 'propose',
      external_side_effects: false
    };
  } catch (error) {
    return {
      schema: 'openaction.bounded-decision.v1',
      question_id: question.id,
      selection: question.fallback,
      allowed_answers: [...question.answers],
      fallback_used: true,
      fallback_reason: 'provider_error',
      source: 'provider',
      authority: 'propose',
      external_side_effects: false,
      provider_error: error instanceof Error ? error.name : 'unknown_error'
    };
  }
}

export function authorizeDecision(decision, policy) {
  if (!decision || decision.schema !== 'openaction.bounded-decision.v1') {
    fail('INVALID_DECISION', 'a bounded decision is required');
  }
  if (typeof policy !== 'function') fail('INVALID_POLICY', 'policy must be a function');
  const result = policy(decision.selection, decision);
  if (typeof result !== 'boolean') fail('INVALID_POLICY_RESULT', 'policy must return a boolean');
  return {
    schema: 'openaction.decision-authorization.v1',
    selection: decision.selection,
    authorized: result,
    authority_source: 'deterministic_policy'
  };
}
