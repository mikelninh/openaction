import assert from 'node:assert/strict';
import fs from 'node:fs';

const model=JSON.parse(fs.readFileSync(new URL('../examples/v1/trust-control-v10.json',import.meta.url),'utf8'));
const requiredSimple=['goal','shared_now','my_action','definition_of_done','verifier','next_unlock','eta_or_unknown'];
const requiredProof=['authority','evidence','scope','validity','history'];

const personas=[
  ['careos','clinical_owner','owner'],['careos','clinical_safety','verifier'],['careos','privacy','owner'],['careos','dpo','verifier'],['careos','security','owner'],['careos','security_lead','verifier'],['careos','procurement','owner'],['careos','legal','verifier'],['careos','finance','owner'],['careos','pilot_sponsor','owner_and_verifier'],
  ['naturalization','applicant','submitted_or_owner'],['naturalization','case_worker','verifier'],['naturalization','specialist_review','future_owner'],['naturalization','decision_authority','authoritative_outcome'],
  ['housing','applicant','owner'],['housing','case_worker','future_owner_or_verifier'],['housing','specialist_review','future_owner'],
  ['ug_formation','founder','submitted_or_owner'],['ug_formation','notary','verifier_and_owner'],['ug_formation','register','authoritative_outcome'],
  ['government_project','project_owner','owner_and_verifier'],['government_project','procurement','submitted_or_owner'],['government_project','finance','owner_and_verifier'],['government_project','supplier','future_owner'],['government_project','independent_qa','verifier_and_owner'],['government_project','public_observer','read_only'],['government_project','auditor','proof_read_only']
];

const byId=Object.fromEntries(model.cases.map(c=>[c.id,c]));
for(const [caseId,stakeholder] of personas){
  assert.ok(byId[caseId],`missing case ${caseId}`);
  assert.ok(byId[caseId].stakeholders.includes(stakeholder),`${caseId} missing stakeholder ${stakeholder}`);
}

// Every stakeholder class must be able to answer the same simple questions.
const simpleContract={goal:true,shared_now:true,my_action:true,definition_of_done:true,verifier:true,next_unlock:true,eta_or_unknown:true};
for(const key of requiredSimple) assert.equal(simpleContract[key],true,`simple view missing ${key}`);

// Review/audit roles need proof without forcing proof density on everyone else.
const proofContract={authority:true,evidence:true,scope:true,validity:true,history:true};
for(const key of requiredProof) assert.equal(proofContract[key],true,`proof view missing ${key}`);

assert.ok(model.principles.includes('unknown ETA stays unknown'));
assert.ok(model.principles.includes('public internal restricted are projections of the same graph'));
assert.ok(model.principles.includes('material disputes block terminal completion'));
assert.ok(model.cases.find(c=>c.id==='government_project').has_finance_flow);
assert.ok(model.cases.find(c=>c.id==='careos').has_finance_flow);
assert.equal(model.cases.find(c=>c.id==='housing').has_finance_flow,false);

console.log(`✓ V10 stakeholder clarity contract covers ${personas.length} stakeholder perspectives`);