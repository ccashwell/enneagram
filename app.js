const KEY="enneagram-progress-v1",PER=3;
const LABELS=["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"];
const $=s=>document.querySelector(s),main=$("#main");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{answers:[],page:0}}catch{return{answers:[],page:0}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
let state=load();
const tlink=t=>`<a href="#/type/${t}">Type ${t} – ${TYPES[t].name}</a>`;
function intro(){const done=state.answers.filter(Boolean).length;
main.innerHTML=`<section class="card"><h1>Discover your Enneagram type</h1>
<p>The Enneagram describes nine personality types, each organized around a core motivation: a basic fear and a basic desire that shape how we see the world. The types are grouped into three centers of intelligence: <span class="badge Gut">Gut</span> (8, 9, 1), <span class="badge Heart">Heart</span> (2, 3, 4), and <span class="badge Head">Head</span> (5, 6, 7).</p>
<p>Each type also connects to two <strong>wings</strong> (its neighbors on the circle) and to two other types along lines of <strong>growth</strong> and <strong>stress</strong>.</p>
<p>This quiz has ${QUESTIONS.length} statements and takes about 10 minutes. Answer based on how you have generally been across your life, not how you'd like to be.</p>
<p class="note"><strong>Disclaimer:</strong> This is a self-reflection tool, not a clinical or diagnostic assessment. Treat your result as a starting point for exploring, not a label.</p>
<div class="row"><a class="btn" href="#/quiz">${done?"Continue quiz ("+done+"/"+QUESTIONS.length+")":"Start the quiz"}</a><a class="btn ghost" href="#/types">Browse all types</a></div></section>`}
function quiz(){const pages=Math.ceil(QUESTIONS.length/PER);state.page=Math.min(state.page,pages-1);const p=state.page,start=p*PER;
const done=state.answers.filter(Boolean).length;let h=`<section class="card"><div class="progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="${QUESTIONS.length}" aria-valuenow="${done}"><div style="width:${100*done/QUESTIONS.length}%"></div></div>
<p style="color:var(--mute);font-size:.9rem">Page ${p+1} of ${pages} · ${done} of ${QUESTIONS.length} answered</p>`;
for(let i=start;i<Math.min(start+PER,QUESTIONS.length);i++){h+=`<fieldset><legend class="q">${i+1}. ${esc(QUESTIONS[i].text)}</legend><div class="scale">`+
LABELS.map((l,v)=>`<div class="opt"><input type="radio" name="q${i}" id="q${i}v${v+1}" value="${v+1}" ${state.answers[i]==v+1?"checked":""}><label for="q${i}v${v+1}">${l}</label></div>`).join("")+`</div></fieldset>`}
const last=p===pages-1;h+=`<div class="row"><button class="btn ghost" id="back" ${p===0?"disabled":""}>← Back</button><button class="btn ghost" id="reset">Start over</button><button class="btn" id="next">${last?"See results":"Next →"}</button></div></section>`;
main.innerHTML=h;
const ok=()=>{for(let i=start;i<Math.min(start+PER,QUESTIONS.length);i++)if(!state.answers[i])return false;return true};
const upd=()=>$("#next").disabled=!ok();upd();
main.querySelectorAll("input").forEach(r=>r.addEventListener("change",e=>{state.answers[+e.target.name.slice(1)]=+e.target.value;save(state);upd();
const d=state.answers.filter(Boolean).length;$(".progress>div").style.width=100*d/QUESTIONS.length+"%";$(".progress").setAttribute("aria-valuenow",d)}));
$("#back").onclick=()=>{state.page--;save(state);quiz();main.focus()};
$("#reset").onclick=()=>{if(confirm("Clear all answers?")){state={answers:[],page:0};save(state);quiz()}};
$("#next").onclick=()=>{if(last){location.hash="#/results"}else{state.page++;save(state);quiz();main.focus();scrollTo(0,0)}}}
function results(){if(state.answers.filter(Boolean).length<QUESTIONS.length){main.innerHTML=`<section class="card"><h1>Not finished yet</h1><p>Answer all statements to see your results.</p><a class="btn" href="#/quiz">Continue quiz</a></section>`;return}
const r=score(state.answers),T=TYPES[r.top];
main.innerHTML=`<section class="card"><p style="color:var(--mute)">Your most likely type</p><div class="num">${r.top}w${r.wing}</div><h1>${T.name}</h1><p><em>${T.nick}</em> · <span class="badge ${T.center}">${T.center} center</span></p>
<p>${T.motivation}</p><p>Likely wing: <strong>${tlink(r.wing)}</strong> (the stronger of your two neighboring types).</p>
${r.close?`<p class="note">Your top two scores are close (${r.pct[r.top]}% vs ${r.pct[r.ranked[1]]}%). Read both ${tlink(r.top)} and ${tlink(r.ranked[1])}, then see which core motivation fits you best.</p>`:""}
<div class="row"><a class="btn" href="#/type/${r.top}">Read full description</a><button class="btn ghost" id="retake">Retake quiz</button></div></section>
<section class="card"><h2>All nine scores</h2><div class="bars">${r.ranked.map(t=>`<div class="bar ${t===r.top?"top":""}"><a href="#/type/${t}">${t} · ${TYPES[t].name}</a><div class="t" role="img" aria-label="${r.pct[t]} percent"><div style="width:${r.pct[t]}%"></div></div><span>${r.pct[t]}%</span></div>`).join("")}</div></section>`;
$("#retake").onclick=()=>{state={answers:[],page:0};save(state);location.hash="#/quiz"}}
function types(){main.innerHTML=`<h1>The nine types</h1><div class="grid">${Object.entries(TYPES).map(([n,t])=>`<a href="#/type/${n}"><div class="card"><div class="num">${n}</div><h2>${t.name}</h2><p><em>${t.nick}</em></p><span class="badge ${t.center}">${t.center}</span><p>${t.desire}</p></div></a>`).join("")}</div>`}
function type(n){const t=TYPES[n];if(!t)return types();const [wa,wb]=wingsOf(+n),li=a=>"<ul>"+a.map(x=>`<li>${x}</li>`).join("")+"</ul>";
main.innerHTML=`<section class="card"><div class="num">${n}</div><h1>${t.name}</h1><p><em>${t.nick}</em> · <span class="badge ${t.center}">${t.center} center</span></p>
<dl><dt>Core fear</dt><dd>${t.fear}</dd><dt>Core desire</dt><dd>${t.desire}</dd><dt>Core motivation</dt><dd>${t.motivation}</dd></dl></section>
<div class="cols"><section class="card"><h2>Key strengths</h2>${li(t.strengths)}</section><section class="card"><h2>Common challenges</h2>${li(t.challenges)}</section></div>
<section class="card"><h2>Levels of health</h2><dl><dt>Healthy</dt><dd>${t.healthy}</dd><dt>Average</dt><dd>${t.average}</dd><dt>Unhealthy</dt><dd>${t.unhealthy}</dd></dl></section>
<div class="cols"><section class="card"><h2>Growth &amp; stress</h2><p><strong>Growth (integration):</strong> moves toward the healthy side of ${tlink(t.growth)}.</p><p><strong>Stress (disintegration):</strong> takes on the average-to-unhealthy traits of ${tlink(t.stress)}.</p></section>
<section class="card"><h2>Wings</h2><p>${tlink(wa)}: ${n}w${wa}</p><p>${tlink(wb)}: ${n}w${wb}</p><p style="color:var(--mute)">Most people lean toward one wing, which flavors the core type.</p></section></div>
<div class="cols"><section class="card"><h2>Relationships</h2><p>${t.rel}</p></section><section class="card"><h2>At work</h2><p>${t.work}</p></section></div>
<section class="card"><h2>Growth practices</h2>${li(t.practices)}</section>
<div class="row"><a class="btn ghost" href="#/type/${n==1?9:n-1}">← Type ${n==1?9:n-1}</a><a class="btn ghost" href="#/types">All types</a><a class="btn ghost" href="#/type/${n==9?1:+n+1}">Type ${n==9?1:+n+1} →</a></div>`}
function route(){const h=location.hash.slice(1)||"/",[,a,b]=h.split("/");
({"":intro,quiz,results,types,type:()=>type(b)}[a]||intro)();document.title=(a?a[0].toUpperCase()+a.slice(1)+" · ":"")+"Enneagram Type Finder";scrollTo(0,0)}
addEventListener("hashchange",()=>{route();main.focus()});route();
