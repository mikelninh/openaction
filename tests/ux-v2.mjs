import fs from 'node:fs';
import assert from 'node:assert/strict';

const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const homeJs=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const workspace=fs.readFileSync(new URL('../workspace/index.html',import.meta.url),'utf8');
const workspaceJs=fs.readFileSync(new URL('../workspace/app.js',import.meta.url),'utf8');

assert.match(home,/Heute sieht jeder nur/);
assert.match(home,/Was fehlt noch\? Wer muss entscheiden\? Was blockiert gerade\?/);
assert.match(home,/CareOS Beispiel ansehen/);
assert.match(home,/Woher kommen diese Zahlen\?/);
assert.match(home,/Kein gemessener Krankenhauswert/);
assert.match(homeJs,/featuredIds/);

assert.match(workspace,/WO STEHEN WIR\?/);
assert.match(workspace,/WAS BLOCKIERT GERADE\?/);
assert.match(workspace,/WAS IST DER NÄCHSTE SCHRITT\?/);
assert.match(workspace,/data-mode="simple"/);
assert.match(workspace,/data-mode="reviewer"/);
assert.match(workspace,/data-mode="builder"/);
assert.match(workspace,/Woher kommen die Zahlen\?/);
assert.match(workspace,/Kein gemessener Krankenhauswert/);
assert.doesNotMatch(workspace,/id="readinessValue"/);
assert.doesNotMatch(workspace,/id="blockerCount"/);
assert.doesNotMatch(workspace,/id="evidenceValue"/);
assert.doesNotMatch(workspace,/id="parallelValue"/);
assert.doesNotMatch(workspace,/class="tabs"/);
assert.match(workspaceJs,/function setMode/);
assert.doesNotMatch(workspaceJs,/renderMetrics/);

console.log('✓ UX V2 hierarchy smoke test passed');
