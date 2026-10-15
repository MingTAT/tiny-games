/** Exhaustively checks for extremely short unintended paths.  This is NOT a
 * complete solver and does not prove uniqueness or original-game parity. */
const {puzzles}=require('../dist/levels');
const {step}=require('../dist/core');
const inputs=['up','down','left','right'];
function key(s){return s.entities.map(e=>[e.kind,e.word||'',e.x,e.y,e.dir].join(':')).sort().join('|')+'|'+s.status;}
for(const n of [16,17,18]){
 const LIMIT=30000,MAX_DEPTH=n===18?8:11;const root=puzzles[n-1].state;
 const q=[{s:root,d:0,parent:-1,move:null}],seen=new Set([key(root)]);let head=0,win=null,truncated=false;
 while(head<q.length){const {s,d,parent,move}=q[head++];if(s.status==='won'){
     win=d;let i=head-1,route=[];while(q[i].parent!==-1){route.push(q[i].move[0].toUpperCase());i=q[i].parent;}
     console.log(`  SHORTEST PATH: ${route.reverse().join('')}`);break;
   }
   if(d===MAX_DEPTH)continue;
   for(const input of inputs){const next=step(s,input).state,k=key(next);if(seen.has(k))continue;seen.add(k);q.push({s:next,d:d+1,parent:head-1,move:input});}
   if(q.length>LIMIT){truncated=true;break;}
 }
 const conclusion=win!==null?`WIN in ${win} moves`:truncated?'INCONCLUSIVE, state limit reached':`NO WIN within ${MAX_DEPTH} moves`;
 console.log(`Level ${n}: ${conclusion}; ${seen.size} states; ${head} expanded`);
 if(win!==null)process.exitCode=1;
}
