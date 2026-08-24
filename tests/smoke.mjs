import fs from 'node:fs';

const readJSON=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const uses=readJSON('examples/use-cases.json');
const core=readJSON('spec/0.2/openaction.schema.json');
const approval=readJSON('spec/0.2/approval-path.schema.json');
const trust=readJSON('spec/0.2/trust-passport.schema.json');

const errors=[];
if(!uses.disclaimer?.toLowerCase().includes('illustrative')) errors.push('use-case disclaimer missing');
if(uses.use_cases?.length!==10) errors.push(`expected 10 use cases, got ${uses.use_cases?.length}`);
for(const c of uses.use_cases||[]){
  for(const key of ['id','title','pain','today','openaction','synthetic_scenario','current_evidence']) if(c[key]==null) errors.push(`${c.id||'unknown'} missing ${key}`);
  if(!c.synthetic_scenario?.assumptions?.length) errors.push(`${c.id} missing assumptions`);
  if(!c.synthetic_scenario?.measure) errors.push(`${c.id} missing pilot measure`);
  for(const e of c.current_evidence||[]) if(!e.claim||!e.source) errors.push(`${c.id} has incomplete evidence entry`);
}
if(core.$schema!=='https://json-schema.org/draft/2020-12/schema') errors.push('core schema draft mismatch');
if(approval.$schema!==core.$schema||trust.$schema!==core.$schema) errors.push('schema draft mismatch');
if(!core.properties?.approval||!approval.properties?.gates||!trust.properties?.evaluations) errors.push('foundation schemas incomplete');

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`OpenAction smoke OK: ${uses.use_cases.length} use cases, 3 foundation schemas.`);
