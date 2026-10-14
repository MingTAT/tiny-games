const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {puzzles}=require('../dist/levels'),E=require('../dist/core');
const mustHave={8:['WALL IS NOT STOP','FLAG IS WIN'],9:['KEKE IS YOU','FLAG IS WIN'],10:['ROCK IS WIN'],11:['ROCK IS TEXT','ROCK IS WIN'],12:['ROCK IS TEXT','ROCK IS BABA'],13:['ROCK IS TEXT','ROCK IS BABA','FLAG IS WIN']};
function rules(state){return E.parse(state).map(r=>`${r.subject} ${r.verb} ${r.predicateNegated?'NOT ':''}${r.predicate}`);}
for(let level=8;level<=13;level++){
 test(`Advanced ${level}: a full winning trajectory uses the required rule changes`,()=>{
  const f=JSON.parse(fs.readFileSync(path.join(__dirname,'..','replays',`puzzle-${String(level).padStart(2,'0')}.json`),'utf8'));
  const {states}=E.replay(puzzles[level-1].state,f.inputs);
  assert.equal(states.at(-1).status,'won');
  assert.ok(f.inputs.length>=18,`Expected multi-stage trajectory: ${f.inputs.length} moves`);
  const seen=new Set(states.flatMap(rules));
  for(const rule of mustHave[level])assert.ok(seen.has(rule),`Expected to form ${rule}`);
  if(level===10){assert.ok(rules(states[0]).includes('ROCK IS PUSH'));assert.ok(!rules(states.at(-1)).includes('ROCK IS PUSH'));}
  if(level===12||level===13){assert.ok(states.at(-1).entities.some(e=>e.kind==='BABA'&&e.x>=9));}
 });
}
