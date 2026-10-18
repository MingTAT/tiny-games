// Replays captured from a user's separately owned original-game session.
// This tool never labels self-generated outputs as original observations.
// Usage: node scripts/compare-original.cjs benchmarks/original-observations/*.json
const fs=require('node:fs');
const path=require('node:path');
const {step,parse}=require('../dist/core.js');
const VALID=new Set(['up','right','down','left','wait']);
function normalized(s){
 return s.entities.map(e=>[e.kind,e.word||null,e.x,e.y,e.dir]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
}
const paths=process.argv.slice(2);
if(!paths.length){console.log('No original-game observations supplied. Verified original-game comparisons: 0');process.exit(0);}
let pass=0,fail=0;
for(const pathname of paths){
 const doc=JSON.parse(fs.readFileSync(pathname,'utf8'));
 if(doc.provenance?.kind!=='original-game-direct-observation'||!doc.provenance?.howRecorded||!doc.provenance?.gameVersion){
   console.error('REJECT (not verified original-game observation):',pathname);fail++;continue;
 }
 if(!doc.initial||!Array.isArray(doc.turns)||!doc.turns.length){console.error('INVALID fixture:',pathname);fail++;continue;}
 let s=doc.initial,okay=true;
 for(const [i,t] of doc.turns.entries()){
   if(!VALID.has(t.input)||!Array.isArray(t.entities)||!['playing','won','loop'].includes(t.status)){console.error('INVALID turn',pathname,i+1);okay=false;break;}
   s=step(s,t.input).state;
   const actual=JSON.stringify(normalized(s)),expected=JSON.stringify(t.entities.slice().sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
   if(actual!==expected||s.status!==t.status){console.error('DIFF',pathname,'turn',i+1,JSON.stringify({expected:t.entities,actual:normalized(s),expectedStatus:t.status,actualStatus:s.status}));okay=false;break;}
 }
 if(okay){console.log('PASS original-game observation:',path.basename(pathname));pass++;}else fail++;
}
console.log(`Original-game comparisons: ${pass} passed, ${fail} failed`);
if(fail)process.exitCode=1;
