const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../dist/core');
const {puzzles}=require('../dist/levels');
const load=(i)=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','replays',`puzzle-${i}.json`),'utf8'));
const get=(s,k)=>s.entities.filter(e=>e.kind===k);
for(const n of [16,17,18])test(`challenge ${n} has a verified, stepwise winning trajectory`,()=>{
 const f=load(n);const t=C.replay(puzzles[n-1].state,f.inputs);
 assert.equal(t.states.at(-2).status,'playing');assert.equal(t.states.at(-1).status,'won');
 for(let i=1;i<t.states.length;i++)assert.equal(t.states[i].turn,i);
 assert.ok(f.inputs.length>=10);assert.ok(f.states.length===f.inputs.length+1);
});
test('16: rock becomes OPEN through GROUP; without that rule, its actual solution cannot unlock the door',()=>{
 const f=load(16),t=C.replay(puzzles[15].state,f.inputs);
 const stage=t.states.find(s=>C.parse(s).some(r=>r.subject==='ROCK'&&r.predicate==='GROUP'));
 assert.ok(stage,'ROCK IS GROUP must be formed');
 const rock=get(stage,'ROCK')[0];assert.equal(C.has(stage,rock,'OPEN',C.parse(stage)),true);
 assert.equal(get(t.states.at(-1),'DOOR').length,0);
 const denied=C.clone(puzzles[15].state);
 denied.entities=denied.entities.filter(e=>!(e.kind==='TEXT'&&e.word==='OPEN'&&e.y===0));
 const t2=C.replay(denied,f.inputs);assert.notEqual(t2.states.at(-1).status,'won');
 assert.equal(get(t2.states.at(-1),'DOOR').length,1);
});
test('17: the stone must be pushed onto water before PUSH is negated',()=>{
 const f=load(17),t=C.replay(puzzles[16].state,f.inputs);
 const onWater=t.states.find(s=>get(s,'ROCK').some(r=>get(s,'WATER').some(w=>w.x===r.x&&w.y===r.y)));
 assert.ok(onWater,'ROCK must reach WATER');
 const changed=t.states.find(s=>C.parse(s).some(r=>r.subject==='ROCK'&&r.predicate==='PUSH'&&r.predicateNegated));
 assert.ok(changed,'must form ROCK IS NOT PUSH');
 assert.ok(onWater.turn<changed.turn);
 const rock=get(changed,'ROCK')[0];assert.equal(C.has(changed,rock,'PUSH',C.parse(changed)),false);
 assert.equal(C.has(changed,rock,'WIN',C.parse(changed)),true);
});
test('18: MAKE extends a conditional remote YOU into a self-sustaining water trail',()=>{
 const f=load(18),t=C.replay(puzzles[17].state,f.inputs);
 const remoteMoves=t.turns.filter(tr=>tr.events.some(e=>e.type==='create'&&e.detail==='WATER'));
 assert.equal(remoteMoves.length,7,'water should be created after each of seven remote moves');
 assert.ok(remoteMoves.every(tr=>get(tr.state,'ROCK').some(r=>get(tr.state,'WATER').some(w=>r.x===w.x&&r.y===w.y))));
 const deprived=C.clone(puzzles[17].state);
 deprived.entities=deprived.entities.filter(e=>!(e.word==='WATER'&&e.x===3&&e.y===6));
 const t2=C.replay(deprived,f.inputs);
 assert.notEqual(t2.states.at(-1).status,'won','without the MAKE sentence the same inputs do not win');
 assert.equal(get(t2.states.at(-1),'ROCK')[0].x,11,'the rock loses control after the first step');
});
