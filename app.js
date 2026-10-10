const KEY="enneagram-progress-v2",N=QUESTIONS.length,SECS=7,PERSEC=N/SECS;
const LABELS=["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"];
const $=s=>document.querySelector(s),main=$("#main");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const say=m=>{$("#live").textContent="";setTimeout(()=>$("#live").textContent=m,30)};
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{answers:[],i:0}}catch{return{answers:[],i:0}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
let state=load(),cleanup=null;
const answered=()=>state.answers.filter(Boolean).length;
const tlink=t=>`<a href="#/type/${t}">Type ${t}: ${TYPES[t].name}</a>`;
const li=a=>"<ul>"+a.map(x=>`<li>${x}</li>`).join("")+"</ul>";

// theme
$("#theme").onclick=()=>{const d=document.documentElement,cur=d.dataset.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"),n=cur==="dark"?"light":"dark";d.dataset.theme=n;localStorage.setItem("enneagram-theme",n);say(n+" mode")};
addEventListener("beforeprint",()=>document.querySelectorAll("details").forEach(d=>d.open=true));

// Enneagram circle SVG
function ring(top,wing,size=300){const c=size/2,R=size/2-28,pos=n=>{const a=(n%9)*40*Math.PI/180;return[c+R*Math.sin(a),c-R*Math.cos(a)]};
const line=(a,b,cls)=>{const[p,q]=[pos(a),pos(b)];return`<line class="${cls}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`};
let s=`<svg class="ring" viewBox="0 0 ${size} ${size}" role="img" aria-label="Enneagram diagram${top?`: type ${top} highlighted, wing ${wing}, growth toward ${TYPES[top].growth}, stress toward ${TYPES[top].stress}`:""}">`;
s+=`<circle class="inner" cx="${c}" cy="${c}" r="${R}"/>`;
[1,4,2,8,5,7,1].forEach((n,i,a)=>{if(i)s+=line(a[i-1],n,"inner")});[3,6,9,3].forEach((n,i,a)=>{if(i)s+=line(a[i-1],n,"inner")});
if(top){s+=line(top,TYPES[top].growth,"grow")+line(top,TYPES[top].stress,"stress")}
for(let n=1;n<=9;n++){const[x,y]=pos(n);s+=`<g class="${n===top?"top":n===wing?"wing":""}"><circle class="pt" cx="${x}" cy="${y}" r="17"/><text class="lbl" x="${x}" y="${y}">${n}</text></g>`}
return s+"</svg>"+(top?`<div class="legend"><span><i style="background:var(--warm)"></i>Your type</span><span><i style="background:var(--acc)"></i>Wing</span><span><i style="background:#2e9d5b"></i>Growth → ${TYPES[top].growth}</span><span><i style="background:var(--gut)"></i>Stress → ${TYPES[top].stress}</span></div>`:"")}

function intro(){const d=answered();
main.innerHTML=`<section class="card hero fade"><div><p class="pill">Free · Private · About 8–10 minutes</p><h1>Discover your Enneagram type</h1>
<p>The Enneagram maps nine personality types, each built around a core motivation: a basic fear and a basic desire that shape how you see the world. You'll rate ${N} short statements, one at a time, and get your likely type, wing subtype, and a full profile.</p>
${d&&d<N?`<div class="note" role="status"><strong>Welcome back.</strong> You've answered ${d} of ${N}. <a href="#/quiz">Resume where you left off →</a></div>`:""}
<div class="row" style="justify-content:flex-start"><a class="btn" href="#/quiz">${d&&d<N?"Resume quiz":d>=N?"See my results":"Start the quiz"} →</a>${d?`<button class="btn ghost" id="fresh">Start fresh</button>`:""}<a class="btn ghost" href="#/types">Browse types</a></div></div>
<div>${ring()}</div></section>
<div class="cols fade"><section class="card"><h2>How it works</h2><ul><li><strong>Three centers:</strong> <span class="badge Gut">Gut</span> 8, 9, 1 · <span class="badge Heart">Heart</span> 2, 3, 4 · <span class="badge Head">Head</span> 5, 6, 7</li><li><strong>Wings:</strong> the neighboring types that flavor your core type (e.g. 4w5)</li><li><strong>Lines:</strong> each type moves toward one type in growth and another under stress</li></ul></section>
<section class="card"><h2>Tips for accurate results</h2><ul><li>Answer for how you've been most of your life, not how you'd like to be</li><li>Go with your first instinct</li><li>Keyboard: <kbd>1</kbd>–<kbd>5</kbd> to answer, <kbd>←</kbd>/<kbd>→</kbd> to move</li></ul><p class="note"><strong>Disclaimer:</strong> This is a self-reflection tool, not a clinical or diagnostic assessment.</p></section></div>`;
const f=$("#fresh");if(f)f.onclick=()=>{state={answers:[],i:0};save();intro();say("Answers cleared")}}

function quiz(){if(answered()>=N&&state.i>=N){location.hash="#/results";return}
state.i=Math.max(0,Math.min(state.i,N-1));const i=state.i,q=QUESTIONS[i],sec=Math.floor(i/PERSEC),cur=state.answers[i];
main.innerHTML=`<section class="card qcard fade" aria-labelledby="qt"><div class="row" style="margin:0"><span class="mute">Section ${sec+1} of ${SECS}</span><span class="mute">${i+1} / ${N}</span></div>
<div class="progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${answered()}"><div style="width:${100*answered()/N}%"></div></div>
<div class="secs" aria-hidden="true">${Array.from({length:SECS},(_,k)=>`<span class="${k<=sec?"on":""}"></span>`).join("")}</div>
<p class="qtext" id="qt">${esc(q.text)}</p>
<div class="answers" role="radiogroup" aria-labelledby="qt">${LABELS.map((l,v)=>`<button class="ans" role="radio" aria-checked="${cur===v+1}" data-v="${v+1}"><kbd>${v+1}</kbd>${l}</button>`).join("")}</div>
<div class="row"><button class="btn ghost" id="back" ${i===0?"disabled":""}>← Back</button><a href="#/" class="mute">Save &amp; exit</a><button class="btn" id="next" ${cur?"":"disabled"}>${i===N-1?"See results":"Next →"}</button></div>
<p class="hint noprint">Press 1–5 to answer · ← → to navigate · progress saves automatically</p></section>`;
const btns=[...main.querySelectorAll(".ans")];(btns[(cur||3)-1]).focus({preventScroll:true});
const go=d=>{if(d>0&&!state.answers[i])return;if(d>0&&i===N-1){state.i=N;save();location.hash="#/results";return}state.i=i+d;save();quiz()};
let timer;const pick=v=>{state.answers[i]=v;save();btns.forEach(b=>b.setAttribute("aria-checked",b.dataset.v==v));$("#next").disabled=false;
$(".progress>div").style.width=100*answered()/N+"%";clearTimeout(timer);timer=setTimeout(()=>go(1),320)};
btns.forEach(b=>b.onclick=()=>pick(+b.dataset.v));
btns.forEach((b,k)=>b.onkeydown=e=>{if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();btns[(k+(e.key==="ArrowDown"?1:4))%5].focus()}});
$("#back").onclick=()=>go(-1);$("#next").onclick=()=>go(1);
const key=e=>{if(e.target.closest&&e.target.closest("input,textarea"))return;if(e.key>="1"&&e.key<="5"){pick(+e.key)}else if(e.key==="ArrowRight"){go(1)}else if(e.key==="ArrowLeft"){go(-1)}};
document.addEventListener("keydown",key);cleanup=()=>{document.removeEventListener("keydown",key);clearTimeout(timer)}}

function analyze(pct){const ranked=Object.keys(pct).map(Number).sort((a,b)=>pct[b]-pct[a]||a-b),top=ranked[0],[wa,wb]=wingsOf(top),wing=pct[wa]>=pct[wb]?wa:wb,other=wing===wa?wb:wa,gap=pct[wing]-pct[other];
return{pct,ranked,top,wing,otherWing:other,wingGap:gap,wingStrength:gap<=5?"Balanced":gap<=15?"Moderate":"Strong",subtype:top+"w"+wing,close:pct[top]-pct[ranked[1]]<=5}}
function wingCard(t,w,extra=""){const W=WINGS[t+"w"+w];return`<article class="wingcard"><h3>${t}w${w}: ${W.nick}</h3>${extra}<p>${W.color}</p>
<details><summary>Strengths &amp; blind spots</summary><div class="cols"><div><strong>Strengths</strong>${li(W.strengths)}</div><div><strong>Blind spots</strong>${li(W.blind)}</div></div></details>
<details><summary>Relationships &amp; work</summary><p><strong>Relationships:</strong> ${W.rel}</p><p><strong>Work:</strong> ${W.work}</p></details>
<details><summary>How to tell it apart</summary><p>${W.vs}</p></details></article>`}

function results(share){let pct;
if(share){const v=share.split("-").map(Number);if(v.length!==9||v.some(x=>isNaN(x)||x<0||x>100)){main.innerHTML=`<section class="card"><h1>Invalid share link</h1><a class="btn" href="#/quiz">Take the quiz</a></section>`;return}pct={};v.forEach((x,k)=>pct[k+1]=x)}
else{if(answered()<N){main.innerHTML=`<section class="card fade"><h1>Almost there</h1><p>You've answered ${answered()} of ${N}. Finish the quiz to see your results.</p><a class="btn" href="#/quiz">Continue quiz →</a></section>`;return}pct=score(state.answers).pct}
const r=analyze(pct),T=TYPES[r.top],W=WINGS[r.subtype],link=location.href.split("#")[0]+"#/r/"+[1,2,3,4,5,6,7,8,9].map(k=>pct[k]).join("-");
const lean=r.wingGap===0?50:Math.round(100*pct[r.wing]/(pct[r.wing]+pct[r.otherWing]||1));
main.innerHTML=`${share?`<p class="note noprint">You're viewing a shared result. <a href="#/quiz">Take the quiz yourself →</a></p>`:""}
<section class="card hero fade" aria-labelledby="rt"><div><p class="mute">${share?"Shared result":"Your most likely type"}</p><div class="num">${r.subtype}</div><h1 id="rt">${T.name} · <span style="color:var(--acc)">${W.nick}</span></h1>
<p><em>${T.nick}</em> · <span class="badge ${T.center}">${T.center} center</span></p><p>${T.motivation}</p>
<div class="stats"><div><b>${pct[r.top]}%</b>Type ${r.top} score</div><div><b>${r.wingStrength}</b>wing lean (${r.wing}: ${pct[r.wing]}% vs ${r.otherWing}: ${pct[r.otherWing]}%)</div></div>
${r.close?`<p class="note">Your top two types are close (${pct[r.top]}% vs ${pct[r.ranked[1]]}%). Read both ${tlink(r.top)} and ${tlink(r.ranked[1])}, then pick the core motivation that fits you best.</p>`:""}
<div class="row noprint" style="justify-content:flex-start"><a class="btn" href="#/type/${r.top}">Full Type ${r.top} profile</a><button class="btn ghost" id="copy">Copy share link</button><button class="btn ghost" onclick="print()">Print</button>${share?"":`<button class="btn ghost" id="retake">Retake</button>`}</div></div>
<div>${ring(r.top,r.wing)}</div></section>
<section class="card fade"><h2>Your wing: ${r.subtype} ${W.nick}</h2><p class="mute">How your two wings compare: ${r.wingStrength==="Balanced"?"they're nearly even, so read both subtypes":r.wingStrength==="Moderate"?"one wing leans noticeably stronger":"one wing clearly dominates"}.</p>
<div class="meter" role="img" aria-label="Wing ${r.wing} ${lean} percent, wing ${r.otherWing} ${100-lean} percent"><span style="width:${lean}%"></span><span style="width:${100-lean}%"></span></div>
<div class="row" style="margin-top:0"><span>${r.top}w${r.wing} · ${lean}%</span><span>${r.top}w${r.otherWing} · ${100-lean}%</span></div>
${wingCard(r.top,r.wing)}<p><a href="#/wings/${r.top}">Compare ${r.top}w${r.wing} with ${r.top}w${r.otherWing} →</a></p></section>
<section class="card fade"><h2>Your top three</h2><div class="top3">${r.ranked.slice(0,3).map((t,k)=>`<a href="#/type/${t}"><span class="mute">#${k+1} · ${pct[t]}%</span><h3 style="margin:.2em 0">${t}: ${TYPES[t].name}</h3><span class="mute">${TYPES[t].desire}</span></a>`).join("")}</div></section>
<section class="card fade"><h2>All nine scores</h2><div class="bars">${r.ranked.map(t=>`<div class="bar ${t===r.top?"top":""}"><a href="#/type/${t}">${t} · ${TYPES[t].name}</a><div class="t" role="img" aria-label="Type ${t} ${pct[t]} percent"><div style="width:${pct[t]}%"></div></div><span>${pct[t]}%</span></div>`).join("")}</div></section>
<section class="card fade"><h2>Your type at a glance</h2>
<details open><summary>Core fear, desire &amp; motivation</summary><dl><dt>Fear</dt><dd>${T.fear}</dd><dt>Desire</dt><dd>${T.desire}</dd></dl></details>
<details><summary>Strengths &amp; challenges</summary><div class="cols"><div>${li(T.strengths)}</div><div>${li(T.challenges)}</div></div></details>
<details><summary>Growth &amp; stress</summary><p>In growth you take on the healthy qualities of ${tlink(T.growth)}. Under stress you slip toward ${tlink(T.stress)}.</p></details>
<details><summary>Growth practices</summary>${li(T.practices)}</details></section>`;
$("#copy").onclick=async()=>{try{await navigator.clipboard.writeText(link);say("Link copied");$("#copy").textContent="Copied ✓"}catch{prompt("Copy this link:",link)}};
const rt=$("#retake");if(rt)rt.onclick=()=>{if(confirm("Clear your answers and start again?")){state={answers:[],i:0};save();location.hash="#/quiz"}}}

function types(){main.innerHTML=`<h1 class="fade">The nine types</h1><p class="mute">Select a type to read its full profile and wing subtypes.</p><div class="grid fade">${Object.entries(TYPES).map(([n,t])=>`<a href="#/type/${n}"><div class="card"><div class="num">${n}</div><h2>${t.name}</h2><p><em>${t.nick}</em> <span class="badge ${t.center}">${t.center}</span></p><p class="mute">${t.desire}</p><p class="mute">Wings: ${wingsOf(+n).map(w=>`${n}w${w} ${WINGS[n+"w"+w].nick}`).join(" · ")}</p></div></a>`).join("")}</div>`}

function wings(n){if(!n||!TYPES[n]){main.innerHTML=`<h1 class="fade">Wing subtypes</h1><p class="mute">Each type is colored by one of its neighbors. Pick a type to compare its two subtypes side by side.</p><div class="grid fade">${Object.keys(TYPES).map(t=>`<a href="#/wings/${t}"><div class="card"><h2>Type ${t}: ${TYPES[t].name}</h2>${wingsOf(+t).map(w=>`<p><strong>${t}w${w}</strong> ${WINGS[t+"w"+w].nick}</p>`).join("")}</div></a>`).join("")}</div>`;return}
const [a,b]=wingsOf(+n),A=WINGS[n+"w"+a],B=WINGS[n+"w"+b],rowf=(h,f)=>`<tr><th scope="row">${h}</th><td>${f(A)}</td><td>${f(B)}</td></tr>`;
main.innerHTML=`<section class="card fade"><p><a href="#/wings">← All wings</a></p><h1>Type ${n} wings compared</h1><p class="mute">${TYPES[n].name}: ${TYPES[n].nick}</p>
<table><thead><tr><th></th><th scope="col">${n}w${a}: ${A.nick}</th><th scope="col">${n}w${b}: ${B.nick}</th></tr></thead><tbody>
${rowf("Flavor",W=>W.color)}${rowf("Strengths",W=>W.strengths.join(", "))}${rowf("Blind spots",W=>W.blind.join(", "))}${rowf("Relationships",W=>W.rel)}${rowf("Work",W=>W.work)}${rowf("Telling apart",W=>W.vs)}</tbody></table>
<div class="row"><a class="btn ghost" href="#/type/${n}">Type ${n} profile</a><a class="btn ghost" href="#/wings/${n==1?9:n-1}">← Type ${n==1?9:n-1}</a><a class="btn ghost" href="#/wings/${n==9?1:+n+1}">Type ${n==9?1:+n+1} →</a></div></section>`}

function type(n){const t=TYPES[n];if(!t)return types();const [wa,wb]=wingsOf(+n);
main.innerHTML=`<section class="card hero fade"><div><div class="num">${n}</div><h1>${t.name}</h1><p><em>${t.nick}</em> · <span class="badge ${t.center}">${t.center} center</span></p>
<dl><dt>Core fear</dt><dd>${t.fear}</dd><dt>Core desire</dt><dd>${t.desire}</dd><dt>Core motivation</dt><dd>${t.motivation}</dd></dl></div><div>${ring(+n,null)}</div></section>
<div class="cols fade"><section class="card"><h2>Key strengths</h2>${li(t.strengths)}</section><section class="card"><h2>Common challenges</h2>${li(t.challenges)}</section></div>
<section class="card fade" style="margin-top:20px"><h2>Levels of health</h2><dl><dt>Healthy</dt><dd>${t.healthy}</dd><dt>Average</dt><dd>${t.average}</dd><dt>Unhealthy</dt><dd>${t.unhealthy}</dd></dl></section>
<section class="card fade"><h2>Growth &amp; stress</h2><p><strong>Growth (integration):</strong> moves toward the healthy side of ${tlink(t.growth)}.</p><p><strong>Stress (disintegration):</strong> takes on the average-to-unhealthy traits of ${tlink(t.stress)}.</p></section>
<section class="card fade"><h2>Wing subtypes</h2><p class="mute">Most people lean toward one neighbor, which flavors the core type. <a href="#/wings/${n}">Compare side by side →</a></p><div class="cols">${wingCard(n,wa)}${wingCard(n,wb)}</div></section>
<div class="cols fade"><section class="card"><h2>Relationships</h2><p>${t.rel}</p></section><section class="card"><h2>At work</h2><p>${t.work}</p></section></div>
<section class="card fade" style="margin-top:20px"><h2>Growth practices</h2>${li(t.practices)}</section>
<div class="row"><a class="btn ghost" href="#/type/${n==1?9:n-1}">← Type ${n==1?9:n-1}</a><a class="btn ghost" href="#/types">All types</a><a class="btn ghost" href="#/type/${n==9?1:+n+1}">Type ${n==9?1:+n+1} →</a></div>`}

function route(){if(cleanup){cleanup();cleanup=null}const h=location.hash.slice(1)||"/",[,a="",b]=h.split("/");
const R={"":intro,quiz,results:()=>results(),r:()=>results(b),types,type:()=>type(b),wings:()=>wings(b)};(R[a]||intro)();
const nm={"":"Home",quiz:"Quiz",results:"Results",r:"Shared result",types:"Types",type:"Type "+b,wings:"Wings"}[a]||"Home";document.title=nm+" · Enneagram Type Finder";
document.querySelectorAll("nav .links a").forEach(l=>l.getAttribute("href")==="#/"+a?l.setAttribute("aria-current","page"):l.removeAttribute("aria-current"));
if(a!=="quiz"){scrollTo(0,0);main.focus({preventScroll:true})}}
addEventListener("hashchange",route);route();
