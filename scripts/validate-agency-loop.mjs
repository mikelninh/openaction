import fs from 'node:fs';

const ALLOWED_AUTHORITY = new Set(['observe', 'propose', 'prepare', 'execute']);
const ALLOWED_OWNER = new Set(['human', 'shared', 'policy']);

export function validateAgencyLoop(loop) {
  const errors = [];
  if (!loop || typeof loop !== 'object') return { ok: false, errors: ['loop_must_be_object'] };
  if (loop.schema !== 'openaction.agency-loop.v1') errors.push('unsupported_schema');
  if (!String(loop.id || '').startsWith('agency_')) errors.push('id_must_start_agency_');

  const required = {
    goal: ['statement', 'human_outcome'],
    state: ['current', 'evidence'],
    gap: ['blocker', 'why_now'],
    decision: ['selected_path', 'decision_owner', 'rationale'],
    action: ['next_action', 'executor', 'authority', 'external_side_effects'],
    proof: ['success_metrics', 'stop_conditions', 'evidence_required'],
    feedback: ['observations', 'next_cycle_trigger']
  };
  for (const [section, fields] of Object.entries(required)) {
    if (!loop[section] || typeof loop[section] !== 'object') {
      errors.push(`missing_section:${section}`);
      continue;
    }
    for (const field of fields) {
      if (!(field in loop[section])) errors.push(`missing_field:${section}.${field}`);
    }
  }

  if (loop.action && !ALLOWED_AUTHORITY.has(loop.action.authority)) errors.push('invalid_action_authority');
  if (loop.decision && !ALLOWED_OWNER.has(loop.decision.decision_owner)) errors.push('invalid_decision_owner');
  if (loop.action?.external_side_effects === true && loop.action?.authority === 'execute' && loop.decision?.decision_owner === 'shared') {
    errors.push('consequential_shared_execute_requires_explicit_human_or_policy_owner');
  }
  for (const path of [['state','evidence'],['proof','success_metrics'],['proof','stop_conditions'],['proof','evidence_required'],['feedback','observations']]) {
    const value = loop[path[0]]?.[path[1]];
    if (!Array.isArray(value)) errors.push(`must_be_array:${path.join('.')}`);
  }
  if (loop.proof?.success_metrics?.length === 0) errors.push('success_metrics_required');
  if (loop.proof?.evidence_required?.length === 0) errors.push('evidence_required');
  return { ok: errors.length === 0, errors };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll('\\','/'))) {
  const files = process.argv.slice(2);
  if (!files.length) throw new Error('Usage: node scripts/validate-agency-loop.mjs <file...>');
  let failed = false;
  for (const file of files) {
    const loop = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = validateAgencyLoop(loop);
    console.log(JSON.stringify({ file, ...result }));
    if (!result.ok) failed = true;
  }
  if (failed) process.exitCode = 2;
}
