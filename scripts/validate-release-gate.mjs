import fs from 'node:fs';

export const RELEASE_STAGES = Object.freeze({
  R0: 'outcome',
  R1: 'evidence',
  R2: 'authority',
  R3: 'reliability',
  R4: 'reality'
});

const STATUS = new Set(['pass', 'review', 'blocked', 'todo']);
const OWNER = new Set(['automated', 'human', 'external']);
const EVIDENCE_CLASS = new Set(['automated', 'synthetic', 'human', 'external', 'source']);

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

export function validateReleaseGate(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return { ok: false, errors: ['manifest_must_be_object'] };
  if (manifest.schema !== 'openaction.release-gate.v1') errors.push('unsupported_schema');
  if (!manifest.project) errors.push('project_required');
  if (!manifest.release) errors.push('release_required');
  if (!manifest.outcome?.human_outcome) errors.push('human_outcome_required');
  if (!nonEmptyArray(manifest.gates)) errors.push('gates_required');

  const seenStages = new Set();
  for (const gate of manifest.gates || []) {
    if (!gate?.id) { errors.push('gate_id_required'); continue; }
    if (!Object.hasOwn(RELEASE_STAGES, gate.stage)) errors.push(`invalid_stage:${gate.id}`);
    else seenStages.add(gate.stage);
    if (!STATUS.has(gate.status)) errors.push(`invalid_status:${gate.id}`);
    if (!OWNER.has(gate.owner)) errors.push(`invalid_owner:${gate.id}`);
    if (!gate.claim) errors.push(`claim_required:${gate.id}`);
    if (typeof gate.blocking !== 'boolean') errors.push(`blocking_boolean_required:${gate.id}`);
    if (!Array.isArray(gate.evidence)) errors.push(`evidence_array_required:${gate.id}`);

    for (const evidence of gate.evidence || []) {
      if (!EVIDENCE_CLASS.has(evidence?.class)) errors.push(`invalid_evidence_class:${gate.id}`);
      if (!evidence?.ref) errors.push(`evidence_ref_required:${gate.id}`);
    }

    if (gate.status === 'pass' && !nonEmptyArray(gate.evidence)) {
      errors.push(`pass_requires_evidence:${gate.id}`);
    }

    if (gate.status === 'pass') {
      const classes = new Set((gate.evidence || []).map(item => item.class));
      if (gate.owner === 'automated' && !classes.has('automated')) errors.push(`automated_pass_requires_automated_evidence:${gate.id}`);
      if (gate.owner === 'human' && !classes.has('human')) errors.push(`human_pass_requires_human_evidence:${gate.id}`);
      if (gate.owner === 'external' && !classes.has('external')) errors.push(`external_pass_requires_external_evidence:${gate.id}`);
    }

    if (gate.stage === 'R4') {
      if (gate.owner === 'automated') errors.push(`r4_cannot_be_automated:${gate.id}`);
      if (gate.status === 'pass') {
        const classes = new Set((gate.evidence || []).map(item => item.class));
        if (!classes.has('human') && !classes.has('external')) errors.push(`r4_pass_requires_human_or_external_evidence:${gate.id}`);
      }
    }
  }

  for (const stage of Object.keys(RELEASE_STAGES)) {
    if (!seenStages.has(stage)) errors.push(`missing_stage:${stage}`);
  }

  return { ok: errors.length === 0, errors };
}

export function releaseVerdict(manifest) {
  const validation = validateReleaseGate(manifest);
  if (!validation.ok) return { verdict: 'BLOCK', reasons: validation.errors };

  const blocking = manifest.gates.filter(gate => gate.blocking);
  const blocked = blocking.filter(gate => gate.status === 'blocked');
  if (blocked.length) return { verdict: 'BLOCK', reasons: blocked.map(gate => gate.id) };

  const incomplete = blocking.filter(gate => gate.status !== 'pass');
  if (incomplete.length) return { verdict: 'REVIEW', reasons: incomplete.map(gate => gate.id) };

  return { verdict: 'PASS', reasons: [] };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll('\\\\', '/'))) {
  const files = process.argv.slice(2);
  if (!files.length) throw new Error('Usage: node scripts/validate-release-gate.mjs <file...>');
  let failed = false;
  for (const file of files) {
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    const validation = validateReleaseGate(manifest);
    const verdict = releaseVerdict(manifest);
    console.log(JSON.stringify({ file, ...validation, ...verdict }));
    if (!validation.ok) failed = true;
  }
  if (failed) process.exitCode = 2;
}
