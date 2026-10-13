const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const E=require('../dist/core'),{puzzles}=require('../dist/levels');
for(let i=0;i<puzzles.length;i++)test(`Replay fixture: compare every entity after every move — ${i+1}`,()=>{
 const file=path.join(__dirname,'..','replays',`puzzle-${String(i+1).padStart(2,'0')}.json`);
 const fixture=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.match(fixture.provenance,/NOT original-game observation/);
 const {states}=E.replay(puzzles[i].state,fixture.inputs);
 assert.deepEqual(states.map(s=>({turn:s.turn,status:s.status,entities:s.entities.map(e=>[e.id,e.kind,e.word||null,e.x,e.y,e.dir]).sort((a,b)=>a[0]-b[0])})),fixture.states);
});
