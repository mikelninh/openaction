const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const switcher=document.getElementById('exampleSwitcher');
const featuredTitle=document.getElementById('featuredTitle');
const featuredPain=document.getElementById('featuredPain');
const featuredExample=document.getElementById('featuredExample');
const featuredCta=document.getElementById('featuredCta');
const miniCases=document.getElementById('miniCases');
const showMore=document.getElementById('showMoreCases');
const beforeWeeks=document.getElementById('beforeWeeks');
const afterWeeks=document.getElementById('afterWeeks');
let cases=[];
let expanded=false;
const featuredIds=['careos-hospital','naturalisation-berlin','gmbh-formation'];
const shortLabels={'careos-hospital':'CareOS','naturalisation-berlin':'Einbürgerung','gmbh-formation':'Gründung'};

function renderFeatured(id){
  const c=cases.find(x=>x.id===id)||cases[0];
  if(!c)return;
  featuredTitle.textContent=c.title;
  featuredPain.textContent=c.pain;
  const today=c.today.slice(0,4).join(' → ');
  const after=c.openaction.slice(0,4).join(' → ');
  featuredExample.innerHTML=`<div><small>HEUTE</small><p>${esc(today)}</p></div><span>→</span><div><small>MIT OPENACTION</small><p>${esc(after)}</p></div>`;
  featuredCta.style.display=id==='careos-hospital'?'inline-flex':'none';
  switcher.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
}

function renderSwitcher(){
  switcher.innerHTML=featuredIds.filter(id=>cases.some(c=>c.id===id)).map(id=>`<button data-id="${id}">${shortLabels[id]||id}</button>`).join('');
  switcher.querySelectorAll('button').forEach(b=>b.onclick=()=>renderFeatured(b.dataset.id));
}

function renderMiniCases(){
  const list=expanded?cases:cases.filter(c=>featuredIds.includes(c.id)).slice(0,3);
  miniCases.innerHTML=list.map(c=>`<article><span>${esc(c.emoji)}</span><div><h3>${esc(c.title)}</h3><p>${esc(c.pain)}</p></div></article>`).join('');
  showMore.textContent=expanded?'Weniger zeigen':'Weitere Beispiele zeigen';
}

showMore?.addEventListener('click',()=>{expanded=!expanded;renderMiniCases();});

Promise.all([
  fetch('./examples/use-cases.json').then(r=>{if(!r.ok)throw new Error('use cases');return r.json()}),
  fetch('./workspace/data/careos-pilot.json').then(r=>{if(!r.ok)throw new Error('careos');return r.json()})
]).then(([caseData,careos])=>{
  cases=caseData.use_cases||[];
  renderSwitcher();
  renderFeatured('careos-hospital');
  renderMiniCases();
  if(careos?.synthetic_benefits){
    beforeWeeks.textContent=careos.synthetic_benefits.today.weeks;
    afterWeeks.textContent=careos.synthetic_benefits.openaction.weeks;
  }
}).catch(err=>{
  console.error(err);
  if(miniCases)miniCases.innerHTML='<p>Die Beispieldaten konnten gerade nicht geladen werden.</p>';
});
