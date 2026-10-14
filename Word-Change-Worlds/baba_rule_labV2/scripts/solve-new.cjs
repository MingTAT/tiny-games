const {puzzles}=require('../dist/levels');const {step,parse}=require('../dist/core');
const ds=['up','down','left','right'];
function key(s){return s.entities.map(e=>[e.kind,e.word||'',e.x,e.y,e.dir].join(':')).sort().join('|')+'#'+s.status;}
for(let lev=7;lev<puzzles.length;lev++){
 let p=puzzles[lev], initial=p.state, seen=new Set([key(initial)]), q=[[initial,-1,null,0]]; let head=0, last=-1;
 const MAX=35000, MAXD=46;
 while(head<q.length && q.length<MAX){
  let idx=head++, [s,parent,dir,d]=q[idx];if(s.status==='won'){last=idx;break;}
  if(d>=MAXD)continue;
  for(const move of ds){const n=step(s,move).state,k=key(n);if(seen.has(k))continue;seen.add(k);q.push([n,idx,move,d+1]);}
  if(head%1000===0)console.log('level',lev+1,'visited',head,'queued',q.length,'depth',d);
 }
 const inputs=[];if(last!==-1){let i=last;while(q[i][1]!==-1){inputs.push(q[i][2]);i=q[i][1];}inputs.reverse();}
 console.log('SOLVE',lev+1,{success:last!==-1,visited:head,states:q.length,steps:inputs.length,moves:inputs.map(m=>m[0].toUpperCase()).join(' ')});
 if(last!==-1){const fs=require('fs');fs.writeFileSync(`advanced-${lev+1}.json`,JSON.stringify({level:lev+1,inputs},null,2));}
}
