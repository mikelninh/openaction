import fs from 'node:fs';
import assert from 'node:assert/strict';

const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const homeJs=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const workspace=fs.readFileSync(new URL('../workspace/index.html',import.meta.url),'utf8');

assert.match(home,/Heute sieht jeder nur/);
assert.match(home,/Was fehlt noch\? Wer muss entscheiden\? Was blockiert gerade\?/);
assert.match(home,/CareOS Beispiel ansehen/);
assert.match(home,/Woher kommen diese Zahlen\?/);
assert.match(home,/Kein gemessener Krankenhauswert/);
assert.match(homeJs,/featuredIds/);

// Case Room V4: one shared case, one primary action, needs, handoff, shared path.
assert.match(workspace,/OPENACTION CASE ROOM/);
assert.match(workspace,/ZIEL DES VORGANGS/);
assert.match(workspace,/DEINE AUFGABE JETZT/);
assert.match(workspace,/Du brauchst dafür/);
assert.match(workspace,/Danach/);
assert.match(workspace,/GEMEINSAMER PFAD/);
assert.match(workspace,/Du bist für diesen Stand fertig/);
assert.match(workspace,/Du musst gerade noch nicht freigeben/);
assert.match(workspace,/Nur Demo-Interaktion · keine echte Freigabe/);
assert.match(workspace,/Kein gemessener Krankenhauswert/);
assert.doesNotMatch(workspace,/Pilot readiness/);
assert.doesNotMatch(workspace,/id="readinessValue"/);
assert.doesNotMatch(workspace,/Evidence ready/);
assert.doesNotMatch(workspace,/class="tabs"/);

for (const role of ['clinical','privacy','security','workforce','procurement','sponsor']) {
  assert.match(workspace,new RegExp(role+':\\{'));
}

console.log('✓ Case Room V4 UX contract passed');
