const {QUESTIONS,score,TYPES}=require("./data.js");let fail=0;
const want={1:[7,4],2:[4,8],3:[6,9],4:[1,2],5:[8,7],6:[9,3],7:[5,1],8:[2,5],9:[3,6]};
for(let t=1;t<=9;t++){if(TYPES[t].growth!==want[t][0]||TYPES[t].stress!==want[t][1]){fail++;console.log("lines wrong",t)}
const a=QUESTIONS.map(q=>q.type===t?5:(q.type===(t%9)+1?3:2));const r=score(a);
const ok=r.top===t&&r.wing===(t%9)+1;if(!ok)fail++;console.log(`type ${t}: top=${r.top} wing=${r.wing} ${ok?"PASS":"FAIL"}`)}
console.log("questions:",QUESTIONS.length,"fail:",fail);process.exit(fail?1:0)
