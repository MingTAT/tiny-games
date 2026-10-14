const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {puzzles}=require('../dist/levels'),E=require('../dist/core');
const mustHave={8:['WALL IS NOT STOP','FLAG IS WIN'],9:['KEKE IS YOU','FLAG IS WIN'],10:['ROCK IS WIN'],11:['ROCK IS TEXT','ROCK IS WIN'],12:['ROCK IS TEXT','ROCK IS BABA'],13:['ROCK IS TEXT','ROCK IS BABA','FLAG IS WIN'],14:['BABA EAT ROCK','ROCK HAS KEY','KEY IS OPEN'],15:['BABA EAT ROCK','ROCK HAS TEXT','ROCK IS YOU']};
function rules(state){return E.parse(state).map(r=>`${r.subject} ${r.verb} ${r.predicateNegated?'NOT ':''}${r.predicate}`);}
for(let level=8;level<=15;level++){
 test(`Advanced ${level}: a full winning trajectory uses the required rule changes`,()=>{
  const f=JSON.parse(fs.readFileSync(path.join(__dirname,'..','replays',`puzzle-${String(level).padStart(2,'0')}.json`),'utf8'));
  const {states}=E.replay(puzzles[level-1].state,f.inputs);
  assert.equal(states.at(-1).status,'won');
  assert.ok(f.inputs.length>= (level<=13?18:12),`Expected multi-stage trajectory: ${f.inputs.length} moves`);
  const seen=new Set(states.flatMap(rules));
  for(const rule of mustHave[level])assert.ok(seen.has(rule),`Expected to form ${rule}`);
  if(level===10){assert.ok(rules(states[0]).includes('ROCK IS PUSH'));assert.ok(!rules(states.at(-1)).includes('ROCK IS PUSH'));}
  if(level===12||level===13){assert.ok(states.at(-1).entities.some(e=>e.kind==='BABA'&&e.x>=9));}
 });
}

for(const [n,expected] of [[14,['ROCK IS SAFE','ROCK IS NOT SAFE']],[15,['ROCK HAS TEXT','ROCK IS YOU']]]){
 test(`v1.3 puzzle ${n} contains essential transformation transitions, not only final victory`,()=>{
   const f=JSON.parse(fs.readFileSync(path.join(__dirname,'..','replays',`puzzle-${n}.json`),'utf8'));
   const {states,turns}=E.replay(puzzles[n-1].state,f.inputs);
   const initial=states[0],final=states.at(-1);
   assert.equal(final.status,'won');
   assert.deepEqual(states.flatMap(s=>s.entities.filter(e=>e.kind==='WALL').map(e=>e.id)).length>0,true);
   assert.equal(initial.entities.filter(e=>e.kind==='WALL').length,final.entities.filter(e=>e.kind==='WALL').length,'Separation walls must stay intact');
   assert.ok(turns.some(t=>t.events.some(e=>e.type==='collision-destroy')),'Collision elimination required');
   assert.ok(turns.some(t=>t.events.some(e=>e.type==='has')),'HAS spawn required');
   if(n===14){
     assert.ok(rules(initial).includes('ROCK IS SAFE'));
     assert.ok(states.some(s=>!rules(s).includes('ROCK IS SAFE')));
     assert.ok(states.some(s=>s.entities.some(e=>e.kind==='KEY')));
     assert.equal(final.entities.filter(e=>e.kind==='DOOR').length,0);
     assert.equal(final.entities.filter(e=>e.kind==='KEY').length,0);
   }else{
     assert.ok(!rules(initial).includes('BABA EAT ROCK'));
     assert.ok(states.some(s=>rules(s).includes('BABA EAT ROCK')));
     assert.ok(states.some(s=>s.entities.some(e=>e.kind==='TEXT'&&e.word==='ROCK'&&e.x===5&&e.y===7)));
     assert.ok(states.some(s=>rules(s).includes('ROCK IS YOU')));
     assert.ok(final.entities.some(e=>e.kind==='ROCK'&&e.x===12&&e.y===6));
   }
 });
}
