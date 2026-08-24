import assert from 'node:assert/strict';

const allowed = new Set(['assigned','in_progress','submitted','verified','rejected','expired','reopened']);
function work(task, actor){assert.equal(actor,task.owner);assert.ok(['assigned','rejected','expired','reopened'].includes(task.status));task.status='in_progress';}
function submit(task, actor, evidence){assert.equal(actor,task.owner);assert.equal(task.status,'in_progress');assert.ok(evidence);task.evidence=evidence;task.status='submitted';}
function verify(task, actor){assert.equal(task.status,'submitted');assert.ok(task.evidence,'evidence required');if(task.receipt){assert.equal(actor,task.authority);}else{assert.notEqual(actor,task.owner,'owner cannot self-verify peer-reviewed work');assert.equal(actor,task.verifier);}task.status='verified';task.verifiedBy=actor;}
function reject(task, actor){assert.equal(task.status,'submitted');assert.equal(actor,task.verifier);task.status='rejected';}
function expire(task){assert.equal(task.status,'verified');task.status='expired';}
function reopen(task){assert.equal(task.status,'verified');task.status='reopened';}
function complete(project){return project.tasks.every(t=>t.status==='verified') && !project.disputes.some(d=>d.material&&d.state==='open') && (!project.financeRequired || project.money.reconciled===project.money.paid);}

const clinical={owner:'clinical',verifier:'clinical-safety',status:'assigned'};
work(clinical,'clinical');
submit(clinical,'clinical','clinical-boundary-v1');
assert.equal(clinical.status,'submitted');
assert.equal(complete({tasks:[clinical],disputes:[],financeRequired:false}),false,'submitted must not equal complete');
assert.throws(()=>verify(clinical,'clinical'),/owner cannot self-verify/);
assert.throws(()=>verify(clinical,'privacy'),/Expected values to be strictly equal/);
verify(clinical,'clinical-safety');
assert.equal(clinical.status,'verified');
expire(clinical);
assert.equal(clinical.status,'expired');
work(clinical,'clinical');
submit(clinical,'clinical','clinical-boundary-v2');
reject(clinical,'clinical-safety');
assert.equal(clinical.status,'rejected');
work(clinical,'clinical');
submit(clinical,'clinical','clinical-boundary-v3');
verify(clinical,'clinical-safety');
reopen(clinical);
assert.equal(clinical.status,'reopened');

const authoritative={owner:'register',authority:'commercial-register',receipt:true,status:'assigned'};
work(authoritative,'register');
submit(authoritative,'register','register-entry-123');
verify(authoritative,'commercial-register');
assert.equal(authoritative.status,'verified');

const security={owner:'security',verifier:'security-lead',status:'verified',evidence:'SEC-1'};
const privacy={owner:'privacy',verifier:'dpo',status:'verified',evidence:'DPIA-1'};
const uiCopy={owner:'product',verifier:'product-owner',status:'verified',evidence:'COPY-1'};
for(const t of [security,privacy,uiCopy]) assert.ok(allowed.has(t.status));
// Hosting change impacts only privacy + security, not harmless UI copy.
reopen(security); reopen(privacy);
assert.equal(uiCopy.status,'verified');

const government={
  tasks:[{status:'verified'},{status:'verified'}],
  disputes:[{material:true,state:'open',reason:'forecast exceeds approved budget'}],
  financeRequired:true,
  money:{paid:500000,reconciled:500000}
};
assert.equal(complete(government),false,'material dispute must block terminal completion');
government.disputes[0].state='resolved';
assert.equal(complete(government),true);
government.money.paid=600000;
assert.equal(complete(government),false,'payment without reconciliation must block completion');
government.money.reconciled=600000;
assert.equal(complete(government),true);

const money={approved:3000000,committed:2100000,invoiced:750000,paid:500000,reconciled:500000};
assert.notEqual(money.approved,money.committed);
assert.notEqual(money.committed,money.invoiced);
assert.notEqual(money.invoiced,money.paid);
assert.equal(money.paid,money.reconciled);
assert.ok(money.committed<=money.approved);

console.log('✓ V10 trust/control edge cases passed');