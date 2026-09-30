export function validateAgencyReceipt(receipt) {
  const errors = [];
  if (!receipt || typeof receipt !== 'object') return { ok: false, errors: ['receipt_must_be_object'] };
  if (receipt.schema !== 'openaction.agency-receipt.v1') errors.push('unsupported_schema');
  for (const field of ['mission_id', 'project', 'observed_at']) if (!receipt[field]) errors.push(`${field}_required`);
  if (!Array.isArray(receipt.evidence) || receipt.evidence.length === 0) errors.push('evidence_required');
  if (!receipt.decision?.owner) errors.push('decision_owner_required');
  if (!receipt.decision?.rationale) errors.push('decision_rationale_required');
  if (!receipt.action?.authority) errors.push('action_authority_required');
  if (typeof receipt.action?.external_side_effects !== 'boolean') errors.push('external_side_effects_boolean_required');
  if (!receipt.outcome?.status) errors.push('outcome_status_required');
  if (receipt.outcome?.status === 'succeeded' && (!Array.isArray(receipt.outcome.evidence) || receipt.outcome.evidence.length === 0)) {
    errors.push('successful_outcome_requires_evidence');
  }
  if (receipt.action?.external_side_effects === true && receipt.action?.authority === 'execute' && !['human', 'policy'].includes(receipt.decision?.owner)) {
    errors.push('consequential_execute_requires_human_or_policy_owner');
  }
  if (!receipt.learning?.next_change && !receipt.learning?.next_unknown) errors.push('learning_requires_next_change_or_unknown');
  return { ok: errors.length === 0, errors };
}
