/** LOCAL replay fixtures, not recordings from the original commercial game. */
const fs=require('fs'),path=require('path');
const {replay,parse}=require('../dist/core'),{puzzles}=require('../dist/levels');
const plans=[
'R D D D D U U U U R R R R R R',
'R R D D D D D D L U R U U U U U',
'R R D D D D D D L U R U U L',
'R R R D D D D D L U R R R U U U U R R',
'L L D D D D D D R R R U R R U U',
'L R R R D D',
'U R R R R D D D D',
'R R R U U U R R R R R D D R U U U R D D D D',
'R R U U U R R U U U U U R D D D D D',
'R R R R R R R U U D D D D D L L L L L L U R R R R U U U U U',
'R R U U U U R R R D D D D D D L U U R R R R D',
'R R U U U U L D D D D D D R R R U U R',
'R R U U U U L D D D D D D R R R U U U U U U R D D D D'
];
const map={R:'right',L:'left',D:'down',U:'up'};
if(plans.length!==puzzles.length)throw new Error(`Missing plans ${plans.length}/${puzzles.length}`);
for(let i=0;i<puzzles.length;i++){
 const inputs=plans[i].split(' ').map(x=>map[x]); const {states}=replay(puzzles[i].state,inputs);
 if(states.at(-1).status!=='won')throw new Error(`Puzzle ${i+1} replay does not win`);
 const fixture={provenance:'local engine v1.2, NOT original-game observation',level:i+1,title:puzzles[i].title,inputs,states:states.map(s=>({turn:s.turn,status:s.status,entities:s.entities.map(e=>[e.id,e.kind,e.word||null,e.x,e.y,e.dir]).sort((a,b)=>a[0]-b[0])}))};
 fs.writeFileSync(path.join(__dirname,'..','replays',`puzzle-${String(i+1).padStart(2,'0')}.json`),JSON.stringify(fixture,null,2)+'\n');
 console.log(`${String(i+1).padStart(2,'0')}: ${inputs.length} moves, won`);
}
