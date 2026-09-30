import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { releaseVerdict, validateReleaseGate } from './validate-release-gate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, '../examples/release-gate');
const files = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort();

const rows = files.map((file) => {
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const validation = validateReleaseGate(manifest);
  const verdict = releaseVerdict(manifest);
  const stages = Object.fromEntries(
    (manifest.gates || []).map((gate) => [gate.stage, gate.status.toUpperCase()])
  );
  return {
    project: manifest.project,
    release: manifest.release,
    valid: validation.ok,
    verdict: verdict.verdict,
    reasons: verdict.reasons,
    stages,
    file
  };
});

const counts = rows.reduce((acc, row) => {
  acc[row.verdict] = (acc[row.verdict] || 0) + 1;
  return acc;
}, { PASS: 0, REVIEW: 0, BLOCK: 0 });

const output = {
  schema: 'openaction.portfolio-release-summary.v1',
  generated_from: 'examples/release-gate/*.json',
  projects: rows.length,
  counts,
  rows
};

const markdown = process.argv.includes('--markdown');
if (markdown) {
  console.log('# Portfolio Release Summary');
  console.log('');
  console.log(`**Projects:** ${rows.length} · **PASS:** ${counts.PASS} · **REVIEW:** ${counts.REVIEW} · **BLOCK:** ${counts.BLOCK}`);
  console.log('');
  console.log('| Project | Release | R0 | R1 | R2 | R3 | R4 | Verdict | Blocking / review reasons |');
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const row of rows) {
    const reason = row.reasons.length ? row.reasons.join(', ') : '—';
    console.log(`| ${row.project} | ${row.release} | ${row.stages.R0 || '—'} | ${row.stages.R1 || '—'} | ${row.stages.R2 || '—'} | ${row.stages.R3 || '—'} | ${row.stages.R4 || '—'} | **${row.verdict}** | ${reason} |`);
  }
} else {
  console.log(JSON.stringify(output, null, 2));
}

if (rows.some((row) => !row.valid)) process.exitCode = 2;
