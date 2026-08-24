#!/usr/bin/env node
import fs from 'node:fs';import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const OA=require('../sdk/openaction.js');
const [cmd,file]=process.argv.slice(2);const fail=m=>{console.error(`✗ ${m}`);process.exitCode=1};
if(!cmd||cmd==='help'){console.log('openaction validate <file> | receipt <file> | simulate');process.exit(0)}
if(cmd==='simulate'){const {spawnSync}=await import('node:child_process');const r=spawnSync(process.execPath,[new URL('../scripts/simulate.mjs',import.meta.url).pathname,'--summary'],{stdio:'inherit'});process.exitCode=r.status??1;process.exit()}
if(!file){fail('file required');process.exit()}
let x;try{x=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){fail(`invalid JSON: ${e.message}`);process.exit()}
if(cmd==='validate'){const r=OA.validate(x);if(!r.ok)r.errors.forEach(fail);else console.log('✓ OpenAction Core semantic checks passed')}
else if(cmd==='receipt'){const errs=[];if(x.version!=='openaction-receipt/1.0-rc1')errs.push('wrong receipt version');if(!x.id?.startsWith('oar_'))errs.push('receipt id');if(!x.scope?.subject)errs.push('scope subject');if(!x.approver?.id)errs.push('approver');if(!/^[a-fA-F0-9]{64}$/.test(x.evidence_snapshot?.sha256||''))errs.push('evidence snapshot hash');if(x.scope?.environment==='production'&&(!x.proof||x.proof.type==='none'))errs.push('production receipt requires external verifiable proof');errs.length?errs.forEach(fail):console.log('✓ Approval Receipt semantic checks passed')}
else fail('unknown command');