const {QUESTIONS,score,TYPES,wingsOf}=require("./data.js");const {WINGS}=require("./wings.js");let fail=0,n=0;
const ck=(c,m)=>{n++;if(!c){fail++;console.log("FAIL",m)}};
const lines={1:[7,4],2:[4,8],3:[6,9],4:[1,2],5:[8,7],6:[9,3],7:[5,1],8:[2,5],9:[3,6]};
const fields=["nick","color","strengths","blind","rel","work","vs"];
ck(QUESTIONS.length===63,"63 questions");ck(Object.keys(WINGS).length===18,"18 wings");
for(let t=1;t<=9;t++){ck(TYPES[t].growth===lines[t][0]&&TYPES[t].stress===lines[t][1],`lines ${t}`);
 for(const w of wingsOf(t)){const W=WINGS[t+"w"+w];ck(W&&fields.every(f=>W[f]&&W[f].length),`wing ${t}w${w} complete`);
  const a=QUESTIONS.map(q=>q.type===t?5:q.type===w?4:2),r=score(a);
  ck(r.top===t&&r.wing===w&&r.subtype===t+"w"+w&&r.wingStrength==="Strong",`type ${t} wing ${w}: got ${r.subtype} ${r.wingStrength}`);
  console.log(`type ${t} favoring wing ${w}: ${r.subtype} (${r.wingStrength}) ${r.top===t&&r.wing===w?"PASS":"FAIL"}`)}
 const [a1,b1]=wingsOf(t),r=score(QUESTIONS.map(q=>q.type===t?5:(q.type===a1||q.type===b1)?3:1));ck(r.top===t&&r.wingStrength==="Balanced",`balanced ${t}`)}
const c=score(QUESTIONS.map(q=>q.type===2||q.type===6?5:2));ck(c.close,"close flag");
console.log(`${n-fail}/${n} checks passed`);process.exit(fail?1:0)
