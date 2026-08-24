import assert from 'node:assert/strict';

const states=['assigned','in_progress','submitted','verified','rejected','expired'];

function task(overrides={}){
  return {
    id:'t1',owner:'owner',verifier:'verifier',status:'assigned',
    definition_of_done:'required result exists and is in scope',
    evidence:null,started_at:null,submitted_at:null,completed_at:null,
    verified_by:null,expires_at:null,eta:'<= 1 working day',receipt_mode:false,
    ...overrides,
  };
}

function transition(t,actor,action,at='2026-08-24T16:00:00Z',evidence=null){
  const n={...t};
  if(action==='start'){
    assert.equal(actor,t.owner,'only owner may start');
    assert.equal(t.status,'assigned','start requires assigned');
    n.status='in_progress'; n.started_at=at; return n;
  }
  if(action==='submit'){
    assert.equal(actor,t.owner,'only owner may submit');
    assert.ok(['in_progress','rejected'].includes(t.status),'submit requires work or rework');
    assert.ok(evidence,'submission requires evidence');
    n.status='submitted'; n.submitted_at=at; n.evidence=evidence; return n;
  }
  if(action==='verify'){
    assert.equal(t.status,'submitted','verify requires submitted');
    assert.equal(actor,t.verifier,'only verifier may verify');
    assert.ok(t.evidence,'verification requires evidence');
    n.status='verified'; n.completed_at=at; n.verified_by=actor; return n;
  }
  if(action==='reject'){
    assert.equal(t.status,'submitted','reject requires submitted');
    assert.equal(actor,t.verifier,'only verifier may reject');
    n.status='rejected'; n.verified_by=actor; return n;
  }
  if(action==='record_receipt'){
    assert.equal(t.receipt_mode,true,'receipt action only for authoritative receipts');
    assert.equal(actor,t.owner,'receipt is recorded by responsible authority');
    assert.ok(evidence,'authoritative completion requires receipt evidence');
    n.status='verified'; n.evidence=evidence; n.completed_at=at; n.verified_by='authoritative_receipt'; return n;
  }
  throw new Error('unknown action');
}

function effectiveStatus(t,now){
  if(t.status==='verified' && t.expires_at && new Date(now)>new Date(t.expires_at)) return 'expired';
  return t.status;
}

function stageComplete(tasks,now='2026-08-24T16:00:00Z'){
  return tasks.every(t=>effectiveStatus(t,now)==='verified');
}
function caseComplete(stages,now){return stages.every(s=>stageComplete(s,now))}
function reopenForChange(tasks,impactedIds){return tasks.map(t=>impactedIds.includes(t.id)&&t.status==='verified'?{...t,status:'rejected',verified_by:null,completed_at:null}:t)}

// Happy path: assigned -> in progress -> submitted -> independently verified.
let t=task();
t=transition(t,'owner','start');
assert.equal(t.status,'in_progress');
t=transition(t,'owner','submit','2026-08-24T16:30:00Z','evidence:v1');
assert.equal(t.status,'submitted');
assert.equal(stageComplete([t]),false,'submitted is not done');
t=transition(t,'verifier','verify','2026-08-24T16:45:00Z');
assert.equal(t.status,'verified');
assert.ok(t.completed_at);
assert.equal(t.verified_by,'verifier');
assert.equal(stageComplete([t]),true);

// Owner cannot self-verify a peer-verified task.
let self=task({status:'submitted',evidence:'evidence:v1'});
assert.throws(()=>transition(self,'owner','verify'),/only verifier/);

// Verifier can reject; rejected reopens ownership and cannot count as complete.
let rejected=transition(task({status:'submitted',evidence:'bad:evidence'}),'verifier','reject');
assert.equal(rejected.status,'rejected');
assert.equal(stageComplete([rejected]),false);
rejected=transition(rejected,'owner','submit','2026-08-24T17:00:00Z','evidence:v2');
assert.equal(rejected.status,'submitted');

// Missing evidence can never be submitted or verified.
assert.throws(()=>transition(task({status:'in_progress'}),'owner','submit'),/requires evidence/);
assert.throws(()=>transition(task({status:'submitted',evidence:null}),'verifier','verify'),/requires evidence/);

// Authoritative receipt may replace peer verification, but only with proof.
let receipt=task({receipt_mode:true,verifier:null,status:'in_progress'});
assert.throws(()=>transition(receipt,'owner','record_receipt'),/requires receipt evidence/);
receipt=transition(receipt,'owner','record_receipt','2026-08-24T17:10:00Z','receipt:#42');
assert.equal(receipt.status,'verified');
assert.equal(receipt.verified_by,'authoritative_receipt');

// Expiry invalidates an otherwise verified decision.
const expiring=task({status:'verified',evidence:'approval',verified_by:'verifier',completed_at:'2026-08-24T10:00:00Z',expires_at:'2026-08-25T00:00:00Z'});
assert.equal(effectiveStatus(expiring,'2026-08-24T23:00:00Z'),'verified');
assert.equal(effectiveStatus(expiring,'2026-08-25T01:00:00Z'),'expired');
assert.equal(stageComplete([expiring],'2026-08-25T01:00:00Z'),false);

// Scope changes reopen only impacted verified work.
const a=task({id:'a',status:'verified',evidence:'a',verified_by:'v',completed_at:'x'});
const b=task({id:'b',status:'verified',evidence:'b',verified_by:'v',completed_at:'x'});
const changed=reopenForChange([a,b],['a']);
assert.equal(changed[0].status,'rejected');
assert.equal(changed[1].status,'verified');

// Stage and case completion are explicit terminal predicates.
const verified=task({status:'verified',evidence:'ok',verified_by:'v',completed_at:'x'});
const submitted=task({id:'s',status:'submitted',evidence:'ok'});
assert.equal(caseComplete([[verified],[submitted]]),false);
assert.equal(caseComplete([[verified],[verified]]),true);

// Every real task must expose the data needed to answer: who, done-when, proof, ETA.
for(const key of ['owner','definition_of_done','eta']) assert.ok(verified[key],`missing ${key}`);
for(const s of states) assert.ok(states.includes(s));

console.log('✓ Completion Contract V9 edge cases passed');
