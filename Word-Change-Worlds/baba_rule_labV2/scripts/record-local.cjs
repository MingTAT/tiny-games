/** LOCAL regression fixtures only; these are NOT original Baba Is You reference traces. */
const fs=require('fs'),path=require('path');const {replay}=require('../dist/core'),{puzzles}=require('../dist/levels');
const plans=[
'R D D D D U U U U R R R R R R',
'R R D D D D D D L U R U U U U U',
'R R D D D D D D L U R U U L',
'R R R D D D D D L U R R R U U U U R R',
'L L D D D D D D R R R U R R U U',
'L R R R D D',
'U R R R R D D D D'];
const map={R:'right',L:'left',D:'down',U:'up'};
for(let i=0;i<puzzles.length;i++){
 const inputs=plans[i].split(' ').map(x=>map[x]);const {states}=replay(puzzles[i].state,inputs);
 const fixture={provenance:'local engine v1.1, NOT original-game observation',level:i+1,title:puzzles[i].title,inputs,states:states.map(s=>({turn:s.turn,status:s.status,entities:s.entities.map(e=>[e.id,e.kind,e.word||null,e.x,e.y,e.dir]).sort((a,b)=>a[0]-b[0])}))};
 fs.writeFileSync(path.join(__dirname,'..','replays',`puzzle-${String(i+1).padStart(2,'0')}.json`),JSON.stringify(fixture,null,2)+'\n');
}
console.log('Created 7 local regression traces');
