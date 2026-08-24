(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  let pilot,passport;
  let mode=new URLSearchParams(location.search).get('view')||'simple';
  let activeRole='all';
  const roleNames={};
  const statusLabel={approved:'Erledigt',in_review:'In Arbeit',todo:'Offen',blocked:'Blockiert'};
  const statusClass={approved:'done',in_review:'doing',todo:'open',blocked:'blocked'};
  const blockerPriority=['privacy','clinical_safety','security','ti_scope','procurement'];
  const nextHeadline={privacy:'DPIA-Screening abschließen',clinical_safety:'Clinical-Eval definieren',security:'Threat Model reviewen',ti_scope:'Systemrolle klassifizieren',procurement:'Vendor-Paket vervollständigen'};
  const metricNames={
    'Days from first pilot conversation to approved bounded pilot':'Zeit vom ersten Gespräch bis zum sicheren Pilot',
    '% reviewer questions answered from Trust Passport':'Anteil der Reviewer-Fragen, die vorhandene Nachweise beantworten',
    'Duplicate evidence requests':'Doppelte Nachfragen nach denselben Nachweisen',
    'Blockers discovered after pilot design freeze':'Blocker, die erst spät entdeckt werden',
    'Reviewer turnaround by gate':'Warte- und Bearbeitungszeit pro Prüfung',
    'Gates reopened after a change':'Prüfungen, die nach Änderungen neu geöffnet werden',
    'End-user workflow outcomes':'Ergebnis und Nutzbarkeit im echten Arbeitsablauf'
  };

  async function load(){
    [pilot,passport]=await Promise.all([
      fetch('./data/careos-pilot.json').then(r=>{if(!r.ok)throw new Error('pilot');return r.json()}),
      fetch('./data/careos-trust-passport.json').then(r=>{if(!r.ok)throw new Error('passport');return r.json()})
    ]);
    pilot.roles.forEach(r=>roleNames[r.id]=r.label);
    if(!['simple','reviewer','builder'].includes(mode))mode='simple';
    render();bind();setMode(mode,false);
  }

  function openBlocking(){return pilot.gates.filter(g=>g.blocking&&g.status!=='approved'&&g.id!=='pilot_governance')}
  function orderedBlockers(){return openBlocking().sort((a,b)=>blockerPriority.indexOf(a.id)-blockerPriority.indexOf(b.id))}

  function render(){
    renderTopDecisions();renderJourney();renderFocus();renderEvidence();renderPackage();renderBenefit();renderRealProof();renderRoles();renderReviewerGates();
  }

  function renderTopDecisions(){
    const blockers=orderedBlockers();
    const top=blockers.slice(0,2),first=top[0];
    $('#plainStatus').textContent=blockers.length?'Noch nicht pilotbereit':'Bereit für den bounded Pilot';
    $('#plainStatusNote').textContent=blockers.length?`${blockers.length} notwendige Entscheidungen sind noch offen. Wir sehen jetzt genau welche.`:'Alle blocking Prüfungen sind geschlossen; der Pilot-Sponsor kann die finale scoped Entscheidung treffen.';
    $('#plainBlocker').textContent=top.length?top.map(g=>shortGate(g)).join(' + '):'Kein blocking Gate offen';
    $('#plainBlockerNote').textContent=top.length>1&&top.every(g=>g.parallel)?'Diese Prüfungen können bereits parallel weiterlaufen — keine muss auf die andere warten.':'Der aktuelle Blocker ist sichtbar und hat einen benannten Owner.';
    $('#plainNext').textContent=first?(nextHeadline[first.id]||'Offenen Blocker schließen'):'Pilot-Governance bestätigen';
    $('#plainNextNote').textContent=first?first.next:'Scope, Stop Conditions, Erfolgskriterien und Rollback als finale Pilotentscheidung bestätigen.';
  }

  function shortGate(g){return ({privacy:'Datenschutz',clinical_safety:'Clinical Safety',security:'Security',ti_scope:'Interoperabilität / TI',procurement:'Einkauf / Legal'}[g.id]||g.title)}

  function combinedStatus(ids){
    const states=ids.map(id=>pilot.gates.find(g=>g.id===id)?.status).filter(Boolean);
    if(states.includes('blocked'))return'blocked';
    if(states.includes('todo'))return'todo';
    if(states.includes('in_review'))return'in_review';
    return'approved';
  }

  function renderJourney(){
    const steps=[
      ['Zweck klar',['purpose']],
      ['Datenschutz',['privacy']],
      ['Sicherheit',['security']],
      ['Clinical Safety',['clinical_safety']],
      ['Organisation & TI',['ti_scope','workforce','procurement']],
      ['Sicherer Pilot',['pilot_governance']]
    ];
    $('#journey').innerHTML=steps.map(([label,ids],i)=>{const st=combinedStatus(ids);return `<div class="journey-step ${statusClass[st]}"><span class="journey-index">${i+1}</span><b>${label}</b><small>${statusLabel[st]}</small></div>${i<steps.length-1?'<span class="journey-arrow">→</span>':''}`}).join('');
  }

  function renderFocus(){
    const top=orderedBlockers().slice(0,2);
    $('#focusGrid').innerHTML=top.length?top.map(g=>`<article class="focus-card"><span class="state ${g.status}">${statusLabel[g.status]}</span><h3>${shortGate(g)}</h3><p>${g.question}</p><div><b>Nächster Schritt</b><span>${g.next}</span></div></article>`).join(''):'<article class="focus-card"><h3>Keine blocking Prüfung offen</h3><p>Der nächste Schritt ist die finale bounded-pilot Entscheidung.</p></article>';
  }

  function renderEvidence(){
    const items=[
      ['Zweck beschrieben','ready','Intended use + klare Non-goals'],
      ['Architektur','partial','Grundprinzip dokumentiert; Deployment-Details offen'],
      ['Daten & Datenschutz','partial',`DPIA: ${passport.data.dpia_status}`],
      ['Sicherheitskonzept','partial',`Security Review: ${passport.security.security_review_status}`],
      ['Evaluationsplan','open',passport.evaluations.every(e=>e.status==='planned')?'Noch nicht ausgeführt':'Teilweise ausgeführt']
    ];
    $('#evidenceSimpleGrid').innerHTML=items.map(([title,status,note])=>`<article class="evidence-chip-card ${status}"><span>${status==='ready'?'✓':status==='partial'?'◐':'○'}</span><div><b>${title}</b><small>${note}</small></div></article>`).join('');
  }

  function renderPackage(){
    const blockers=orderedBlockers();
    $('#packageSimple').innerHTML=`<div><small>1 · DAS SOLL CAREOS TUN</small><p>${pilot.intended_use}</p></div><div><small>2 · DAS SOLL ES NICHT TUN</small><p>${passport.explicit_non_goals.slice(0,3).join(' · ')}</p></div><div><small>3 · OFFENE ENTSCHEIDUNGEN</small><p>${blockers.map(shortGate).join(' · ')}</p></div>`;
  }

  function renderBenefit(){
    const b=pilot.synthetic_benefits;
    $('#todayWeeks').textContent=b.today.weeks;$('#oaWeeks').textContent=b.openaction.weeks;
    $('#benefitExplanation').textContent=`${b.assumption} „Heute“ ist eine serielle Beispielrechnung; „OpenAction“ nimmt frühe Gate-Erkennung, parallele unabhängige Reviews und wiederverwendbare Evidence an. Reale Pilotdaten müssen diesen Unterschied bestätigen oder widerlegen.`;
  }

  function renderRealProof(){
    $('#realProofGrid').innerHTML=pilot.pilot_metrics.slice(0,6).map((m,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><p>${metricNames[m]||m}</p></article>`).join('');
  }

  function renderRoles(){
    $('#rolePills').innerHTML=pilot.roles.map(r=>`<button class="role-pill ${r.id===activeRole?'active':''}" data-role="${r.id}">${r.label}</button>`).join('');
    $$('.role-pill').forEach(b=>b.onclick=()=>{activeRole=b.dataset.role;renderRoles();renderReviewerGates()});
  }

  function renderReviewerGates(){
    const open=pilot.gates.filter(g=>g.status!=='approved').length;
    const blocking=pilot.gates.filter(g=>g.blocking&&g.status!=='approved').length;
    $('#reviewSummary').innerHTML=`<span><b>${pilot.gates.length}</b> Prüfungen insgesamt</span><span><b>${open}</b> offen</span><span><b>${blocking}</b> davon blockieren den Pilot</span><span class="synthetic-note">synthetischer Stand</span>`;
    $('#gateGrid').innerHTML=pilot.gates.map(g=>{
      const relevant=activeRole==='all'||g.roles.includes(activeRole);
      return `<article class="gate-card ${!relevant&&activeRole!=='all'?'dimmed':''}" data-gate="${g.id}" tabindex="0"><div class="gate-top"><div><small>${g.category.replaceAll('_',' ')}</small><h3>${g.title}</h3></div><span class="state ${g.status}">${statusLabel[g.status]}</span></div><p>${g.question}</p><div class="gate-bottom"><span><b>${g.ready} von ${g.total}</b> Beispiel-Nachweisen vorhanden</span><span>${g.parallel?'kann parallel laufen':'hat Abhängigkeiten'}</span></div><div class="owner">Owner · <strong>${g.owner}</strong></div></article>`;
    }).join('');
    $$('.gate-card').forEach(c=>{const open=()=>showGate(c.dataset.gate);c.onclick=open;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}});
  }

  function showGate(id){
    const g=pilot.gates.find(x=>x.id===id);if(!g)return;
    const deps=(g.depends_on||[]).map(id=>pilot.gates.find(x=>x.id===id)?.title).filter(Boolean);
    $('#gateDetail').innerHTML=`<span class="state ${g.status}">${statusLabel[g.status]}</span><h2>${g.title}</h2><p class="dialog-question">${g.question}</p><div class="detail-grid"><div class="detail-box"><small>Owner</small><strong>${g.owner}</strong></div><div class="detail-box"><small>Blockiert Pilot?</small><strong>${g.blocking?'Ja':'Nein'}</strong></div><div class="detail-box"><small>Arbeitsweise</small><strong>${g.parallel?'Parallel möglich':'Abhängig'}</strong></div><div class="detail-box"><small>Stand</small><strong>${g.ready} / ${g.total} synthetische Nachweise</strong></div></div><h3>Benötigte Nachweise</h3><ul class="evidence-list">${g.evidence.map((e,i)=>`<li>${i<g.ready?'✓':'○'} ${e}</li>`).join('')}</ul>${deps.length?`<p><strong>Hängt ab von:</strong> ${deps.join(', ')}</p>`:''}<div class="next-step"><strong>Nächster sinnvoller Schritt</strong><br>${g.next}</div>`;
    $('#gateDialog').showModal();
  }

  function setMode(next,scroll=true){
    mode=next;
    $$('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
    $$('[data-view]').forEach(p=>p.hidden=p.dataset.view!==mode);
    const url=new URL(location.href);if(mode==='simple')url.searchParams.delete('view');else url.searchParams.set('view',mode);history.replaceState(null,'',url);
    if(scroll&&mode!=='simple')document.querySelector(`[data-view="${mode}"]`)?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function markdown(){
    const blockers=orderedBlockers();
    return `# CareOS Gesprächspaket — OpenAction 1.0-RC1\n\n> Synthetisches Gesprächsbeispiel. Keine Freigabe und keine Rechts-/Medizinproduktbewertung.\n\n## Das soll CareOS tun\n${pilot.intended_use}\n\n## Das soll CareOS nicht tun\n${passport.explicit_non_goals.map(x=>`- ${x}`).join('\n')}\n\n## Pilotgrenze\n${pilot.pilot_boundary}\n\n## Offene blocking Entscheidungen\n${blockers.map(g=>`### ${shortGate(g)}\nOwner: ${g.owner}\nFrage: ${g.question}\nNächster Schritt: ${g.next}`).join('\n\n')}\n\n## Ziel des nächsten Gesprächs\nFreigabeweg, Owner und fehlende Nachweise korrigieren. Den kleinsten verantwortbaren Pilot definieren.\n`;
  }

  function download(name,content,type='text/plain'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)}
  function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1700)}

  function bind(){
    $$('.mode').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
    $$('.reviewer-jump').forEach(b=>b.onclick=()=>setMode(b.dataset.go));
    $('#closeDialog').onclick=()=>$('#gateDialog').close();
    $('#gateDialog').onclick=e=>{if(e.target===$('#gateDialog'))$('#gateDialog').close()};
    $('#downloadPackageBtn').onclick=()=>download('careos-gespraechspaket.synthetic.md',markdown(),'text/markdown');
    $('#exportPassportBtn').onclick=()=>download('careos-trust-passport.synthetic.json',JSON.stringify(passport,null,2),'application/json');
    $('#shareBtn').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);toast('Link kopiert')}catch{toast('Link steht in der Adresszeile')}};
  }

  load().catch(err=>{console.error(err);document.body.innerHTML='<main style="font-family:system-ui;padding:40px"><h1>Workspace konnte nicht geladen werden.</h1><p>Bitte Seite neu laden.</p></main>'});
})();
