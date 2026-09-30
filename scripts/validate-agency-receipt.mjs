const ALLOWED_OWNERS = new Set(['human', 'shared', 'policy']);
const ALLOWED_AUTHORITIES = new Set(['observe', 'propose', 'prepare', 'execute']);
const ALLOWED_OUTCOMES = new Set(['succeeded', 'partial', 'failed', 'unknown']);
const ALLOWED_EVIDENCE_CLASSES = new Set(['synthetic', 'observed', 'external', 'failure']);

function nonEmptyRefItems(value) {
  return Array.isArray(value)
    && value.length > 0
    && value.every(item => item && typeof item === 'object' && typeof item.ref === 'string' && item.ref.trim().length > 0);
}

export function validateAgencyReceipt(receipt) {
  const errors = [];
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return { ok: false, errors: ['receipt_must_be_object'] };
  }

  if (receipt.schema !== 'openaction.agency-receipt.v1') errors.push('unsupported_schema');
  for (const field of ['mission_id', 'project', 'observed_at']) {
    if (typeof receipt[field] !== 'string' || !receipt[field].trim()) errors.push(`${field}_required`);
  }
  if (receipt.observed_at && Number.isNaN(Date.parse(receipt.observed_at))) errors.push('observed_at_must_be_iso_date');

  if (!nonEmptyRefItems(receipt.evidence)) errors.push('evidence_requires_nonempty_refs');

  const owner = receipt.decision?.owner;
  if (!owner) errors.push('decision_owner_required');
  else if (!ALLOWED_OWNERS.has(owner)) errors.push('invalid_decision_owner');
  if (typeof receipt.decision?.rationale !== 'string' || !receipt.decision.rationale.trim()) {
    errors.push('decision_rationale_required');
  }

  const authority = receipt.action?.authority;
  if (!authority) errors.push('action_authority_required');
  else if (!ALLOWED_AUTHORITIES.has(authority)) errors.push('invalid_action_authority');
  if (typeof receipt.action?.external_side_effects !== 'boolean') {
    errors.push('external_side_effects_boolean_required');
  }
  if (typeof receipt.action?.description !== 'string' || !receipt.action.description.trim()) {
    errors.push('action_description_required');
  }

  const outcome = receipt.outcome?.status;
  if (!outcome) errors.push('outcome_status_required');
  else if (!ALLOWED_OUTCOMES.has(outcome)) errors.push('invalid_outcome_status');

  const evidenceClass = receipt.outcome?.evidence_class;
  if (!evidenceClass) errors.push('outcome_evidence_class_required');
  else if (!ALLOWED_EVIDENCE_CLASSES.has(evidenceClass)) errors.push('invalid_outcome_evidence_class');

  if (outcome === 'succeeded' && !nonEmptyRefItems((receipt.outcome?.evidence || []).map(ref => typeof ref === 'string' ? { ref } : ref))) {
    errors.push('successful_outcome_requires_evidence');
  }

  if (receipt.action?.external_side_effects === true && authority === 'execute' && !['human', 'policy'].includes(owner)) {
    errors.push('consequential_execute_requires_human_or_policy_owner');
  }

  if (!receipt.learning?.next_change && !receipt.learning?.next_unknown) {
    errors.push('learning_requires_next_change_or_unknown');
  }

  return { ok: errors.length === 0, errors };
}
