const grid=document.getElementById('caseGrid');
const filters=document.getElementById('filters');
const dialog=document.getElementById('caseDialog');
const modal=document.getElementById('modalContent');
const close=document.getElementById('closeDialog');
let cases=[];
const groups={all:'Alle',citizen:'Bürger',business:'Unternehmen',health:'Gesundheit',government:'Verwaltung'};
const groupFor=id=>id==='careos-hospital'?'health':['gmbh-formation','industrial-permit'].includes(id)?'business':['building-permit','public-ai-procurement'].includes(id)?'government':'citizen';
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderFilter(active='all'){
  filters.innerHTML=Object.entries(groups).map(([id,label])=>`<button class="filter ${id===active?'active':''}" data-filter="${id}">${label}</button>`).join('');
  filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{renderFilter(b.dataset.filter);renderCases(b.dataset.filter)});
}
function renderCases(group='all'){
  const list=group==='all'?cases:cases.filter(c=>groupFor(c.id)===group);
  grid.innerHTML=list.map(c=>`<article class="case-card" tabindex="0" role="button" data-id="${esc(c.id)}" aria-label="${esc(c.title)} öffnen"><div class="case-top"><div><h3 class="case-title">${esc(c.title)}</h3><div class="audience">${esc(c.audience)}</div></div><div class="emoji">${esc(c.emoji)}</div></div><p class="pain">${esc(c.pain)}</p><div class="target"><b>Zielbild</b><span>${esc(c.synthetic_scenario.target)}</span></div><span class="synthetic-tag">SYNTHETISCH · NICHT GEMESSEN</span></article>`).join('');
  grid.querySelectorAll('.case-card').forEach(card=>{card.onclick=()=>openCase(card.dataset.id);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCase(card.dataset.id)}}});
}
function openCase(id){
  const c=cases.find(x=>x.id===id);if(!c)return;
  modal.innerHTML=`<div class="emoji">${esc(c.emoji)}</div><h2>${esc(c.title)}</h2><div class="meta">${esc(c.audience)}</div><p>${esc(c.pain)}</p><div class="compare"><div class="lane"><h3>Heute</h3><ol>${c.today.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div><div class="lane after"><h3>Mit OpenAction</h3><ol>${c.openaction.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div></div><div class="scenario"><b>Synthetisches Zielbild</b><div><strong>Heute:</strong> ${esc(c.synthetic_scenario.before)}</div><div><strong>Ziel:</strong> ${esc(c.synthetic_scenario.target)}</div><p><strong>Annahmen:</strong> ${c.synthetic_scenario.assumptions.map(esc).join(' · ')}</p><small>Zu messen: ${esc(c.synthetic_scenario.measure)}</small></div><div class="sources"><h3>Aktuelle Evidenz</h3>${c.current_evidence.map(s=>`<p>${esc(s.claim)}${s.source.startsWith('http')?`<a href="${esc(s.source)}" target="_blank" rel="noreferrer">Quelle ↗</a>`:''}</p>`).join('')}</div>`;
  dialog.showModal();
}
close.onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
fetch('./examples/use-cases.json').then(r=>{if(!r.ok)throw new Error('examples unavailable');return r.json()}).then(data=>{cases=data.use_cases||[];renderFilter();renderCases()}).catch(()=>{grid.innerHTML='<p>Die Beispiele konnten gerade nicht geladen werden. Sie stehen in examples/use-cases.json.</p>'});
