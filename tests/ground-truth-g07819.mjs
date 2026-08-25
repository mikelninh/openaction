import fs from 'node:fs';
import assert from 'node:assert/strict';

const path='ground-truth/de/tesla-gruenheide-g07819/case.json';
const c=JSON.parse(fs.readFileSync(path,'utf8'));
const policy=JSON.parse(fs.readFileSync('ground-truth/de/tesla-gruenheide-g07819/agent-policy.json','utf8'));

const days=(a,b)=>Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/86400000);
assert.equal(c.status,'completed');
assert.equal(days(c.application_received,c.final_decision),805);
assert.equal(c.observed_total_calendar_days,805);
assert.equal(c.observed_metrics.public_display_rounds,3);
assert.equal(c.observed_metrics.early_start_authorizations_reported,19);
assert.equal(c.observed_metrics.task_force_meetings_reported_before_final_approval,26);
assert.equal(c.observed_metrics.application_pages_referenced_in_final_decision,23726);
assert.ok(c.events.some(e=>e.type==='final_decision'&&e.date==='2022-03-04'));
assert.ok(c.events.filter(e=>e.type==='scope_change').length>=2,'real case must preserve applicant scope changes');
assert.ok(c.events.filter(e=>e.type==='public_display').length===3,'three public-display rounds must remain explicit');
assert.ok(c.observed_drivers.some(x=>x.driver==='covid_disruption'));
assert.ok(c.unknowns_required_for_avoidable_waiting_analysis.includes('per-gate review_started_at'));
assert.match(c.claim_boundary,/does not infer avoidable authority waiting time/i);

const finalAgent=policy.agents.find(a=>a.id==='reviewer_copilot');
assert.ok(finalAgent.forbidden.includes('final_permit_decision'));
const constraintAgent=policy.agents.find(a=>a.id==='constraint');
assert.ok(constraintAgent.forbidden.includes('remove_required_gate'));
const simulationAgent=policy.agents.find(a=>a.id==='simulation');
assert.ok(simulationAgent.forbidden.includes('label_counterfactual_as_observed'));
assert.ok(policy.hard_rules.some(x=>x.includes('Unknown ETA remains unknown')));
assert.ok(policy.hard_rules.some(x=>x.includes('not deleted for speed')));

console.log('✓ G07819 real administrative ground-truth contract passed');
