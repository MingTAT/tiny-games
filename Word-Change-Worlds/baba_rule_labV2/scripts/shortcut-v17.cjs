const {puzzles}=require('../dist/levels'),{step}=require('../dist/core');
const dirs=['up','right','down','left'];
const key=s=>s.status+'|'+s.entities.map(e=>`${e.id}:${e.kind}:${e.word||''}:${e.x}:${e.y}`).sort().join(';');
for(const i of [18,19]){
 const root=puzzles[i].state,seen=new Set([key(root)]),q=[{s:root,d:0,route:''}];let head=0,found=null,cap=false;
 const maxDepth=i===18?11:9,maxStates=11000,deadline=Date.now()+1500;
 while(head<q.length){if(Date.now()>deadline){cap=true;break;}const {s,d,route}=q[head++];if(s.status==='won'){found=route;break;}
   if(d>=maxDepth)continue;
   for(let j=0;j<dirs.length;j++){
     const ns=step(s,dirs[j]).state,k=key(ns);
     if(seen.has(k))continue;
     seen.add(k);q.push({s:ns,d:d+1,route:route+'URDL'[j]});
     if(seen.size>=maxStates){cap=true;break;}
   }
   if(cap)break;
 }
 console.log(JSON.stringify({level:i+1,depth:maxDepth,states:seen.size,exhaustive:!cap,shortWin:found}));
}
