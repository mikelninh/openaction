import fs from 'node:fs';
import assert from 'node:assert/strict';

const model=JSON.parse(fs.readFileSync(new URL('../examples/v1/careos-pilot-rollout.json',import.meta.url),'utf8'));

assert.equal(model.synthetic,true);
assert.equal(model.phases.length,8);
assert.ok(model.roles.length>=10);
assert.deepEqual(model.phases.map(p=>p.id),[
  'discovery','scope_synthetic','parallel_reviews','readiness','shadow_mode','pilot_5','pilot_20','scale_decision'
]);

const byId=Object.fromEntries(model.phases.map(p=>[p.id,p]));
assert.match(byId.parallel_reviews.goal,/parallel/i);
assert.ok(byId.parallel_reviews.blocking_tasks.some(t=>t.role==='privacy'));
assert.ok(byId.parallel_reviews.blocking_tasks.some(t=>t.role==='security'));
assert.ok(byId.parallel_reviews.blocking_tasks.some(t=>t.role==='regulatory'));
assert.ok(byId.parallel_reviews.blocking_tasks.some(t=>t.role==='integration'));
assert.ok(byId.parallel_reviews.blocking_tasks.some(t=>t.role==='procurement_legal'));
assert.ok(byId.parallel_reviews.blocking_tasks.some(t=>t.role==='operations'));
assert.equal(byId.readiness.blocking_tasks[0].role,'sponsor');
assert.match(byId.shadow_mode.goal,/without letting CareOS affect care decisions/i);
assert.ok(model.real_pilot_metrics.includes('avoidable waiting time'));
assert.ok(model.principles.includes('nothing-to-do is a valid stakeholder state'));

console.log('✓ CareOS pilot rollout invariants passed');
