import assert from 'node:assert/strict';
import fs from 'node:fs';

const doc = fs.readFileSync(new URL('../docs/CONSTRAINT_SET_V12.md', import.meta.url), 'utf8');

for (const phrase of [
  'One mission. One shared truth. One current constraint set. One next action per person.',
  'Required controls stay. Avoidable coordination friction goes.',
  'In progress is never visually equivalent to verified.',
  'OpenAction should never invent serial dependencies',
  'avoidable waiting time removed without weakening required controls'
]) assert.ok(doc.includes(phrase), `missing V12 contract phrase: ${phrase}`);

const currentConstraints = tasks => tasks.filter(t => t.required && t.status !== 'verified');
const canStartTogether = (a,b) => !a.dependsOn.includes(b.id) && !b.dependsOn.includes(a.id);

const simple = [
  {id:'payslip',required:true,status:'assigned',dependsOn:[]},
  {id:'income-review',required:true,status:'assigned',dependsOn:['payslip']}
];
assert.deepEqual(currentConstraints(simple).map(x=>x.id), ['payslip','income-review']);
assert.equal(canStartTogether(simple[0],simple[1]), false, 'real dependency must remain serial');

const parallelReviews = [
  {id:'clinical',required:true,status:'in_progress',dependsOn:[]},
  {id:'privacy',required:true,status:'assigned',dependsOn:[]},
  {id:'contract',required:true,status:'submitted',dependsOn:[]},
  {id:'security',required:true,status:'verified',dependsOn:[]}
];
assert.deepEqual(currentConstraints(parallelReviews).map(x=>x.id), ['clinical','privacy','contract']);
assert.equal(canStartTogether(parallelReviews[0],parallelReviews[1]), true, 'independent reviews may move in parallel');
assert.equal(currentConstraints(parallelReviews).some(x=>x.id==='security'), false, 'verified work is not a current constraint');

const reopened = {id:'privacy',required:true,status:'reopened',dependsOn:[]};
assert.equal(currentConstraints([reopened]).length,1,'relevant change must make a reopened required node visible again');

const optional = {id:'nice-to-have-report',required:false,status:'assigned',dependsOn:[]};
assert.equal(currentConstraints([optional]).length,0,'optional work must not impersonate a blocking required constraint');

console.log('✓ Constraint Set V12 invariants passed');
