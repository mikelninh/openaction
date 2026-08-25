import fs from 'node:fs';

const input=process.argv[2]||'ground-truth/de/tesla-gruenheide-g07819/case.json';
const c=JSON.parse(fs.readFileSync(input,'utf8'));
const days=Math.round((new Date(c.final_decision+'T00:00:00Z')-new Date(c.application_received+'T00:00:00Z'))/86400000);
const scopeChanges=c.events.filter(e=>e.type==='scope_change');
const publicRounds=c.events.filter(e=>e.type==='public_display');
const final=c.events.find(e=>e.type==='final_decision');

const report={
  case_id:c.case_id,
  status:c.status,
  observed_duration_days:days,
  final_decision:final?.date||null,
  observed_public_display_rounds:publicRounds.length,
  observed_scope_changes:scopeChanges.map(e=>({date:e.date,fact:e.fact})),
  reported_early_start_authorizations:c.observed_metrics.early_start_authorizations_reported,
  observed_driver_classes:c.observed_drivers.map(x=>({driver:x.driver,classification:x.classification})),
  avoidable_waiting_time:{
    status:'NOT_YET_MEASURABLE',
    reason:'Public chronology lacks per-gate ready/review/decision and dependency timestamps.',
    missing:c.unknowns_required_for_avoidable_waiting_analysis
  },
  next_proof_gate:'Authority or independent domain review of reconstructed dependencies + anonymised per-gate event export.'
};

console.log(JSON.stringify(report,null,2));
