const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../dist/core');
const W=(str,x,y,vertical=false)=>str.split(' ').map((word,i)=>({kind:'TEXT',word,x:x+(vertical?0:i),y:y+(vertical?i:0)}));
const O=(kind,x,y)=>({kind,x,y});
const S=(...rows)=>C.create(14,11,rows.flat());
const object=(s,kind)=>s.entities.find(e=>e.kind===kind);

// Grounding: Baba Is You Wiki, Infinite Loop; GROUP (secondary documentation).
test('GROUP IS NOT GROUP oscillates when a physical GROUP member exists',()=>{
  const s=S(W('ROCK IS GROUP',0,0),W('GROUP IS NOT GROUP',0,1),O('ROCK',10,8));
  assert.equal(C.groupDiagnostic(s,C.parse(s)).loop,true);
  const n=C.step(s,'wait');
  assert.equal(n.state.status,'loop');
  assert.ok(n.events.some(e=>e.type==='infinite-loop'));
  assert.equal(object(n.state,'ROCK').x,10);
});
test('GROUP IS NOT GROUP without any member does not create a paradox',()=>{
  const s=S(W('GROUP IS NOT GROUP',0,0),O('ROCK',10,8));
  assert.equal(C.groupDiagnostic(s,C.parse(s)).loop,false);
  assert.equal(C.step(s,'wait').state.status,'playing');
});
test('NOT GROUP IS GROUP creates a cycle when regular objects are outside GROUP',()=>{
  const s=S(W('NOT GROUP IS GROUP',0,0),O('ROCK',10,8));
  assert.equal(C.step(s,'wait').state.status,'loop');
});
test('direct negation ROCK IS NOT GROUP cancels admission and suppresses group oscillation',()=>{
  const s=S(W('ROCK IS GROUP',0,0),W('ROCK IS NOT GROUP',0,1),W('GROUP IS NOT GROUP',0,2),O('ROCK',11,8));
  assert.equal(C.groupDiagnostic(s,C.parse(s)).loop,false);
  assert.equal(C.step(s,'wait').state.status,'playing');
});
test('positive GROUP and GROUP2 cycle converges without falsely triggering loop',()=>{
  const s=S(W('ROCK IS GROUP',0,0),W('GROUP IS GROUP2',0,1),W('GROUP2 IS GROUP',0,2),W('GROUP2 IS WIN',0,3),O('ROCK',11,8));
  const rock=object(s,'ROCK');
  assert.equal(C.groupDiagnostic(s,C.parse(s)).loop,false);
  assert.equal(C.has(s,rock,'WIN',C.parse(s)),true);
  assert.equal(C.step(s,'wait').state.status,'playing');
});
test('an unsteady rule assembled by pushing text enters loop after YOU movement',()=>{
  const s=S(W('ROCK IS GROUP',0,0),W('GROUP IS NOT',0,1),W('BABA IS YOU',7,0),O('ROCK',12,8),{kind:'TEXT',word:'GROUP',x:3,y:2},O('BABA',3,3));
  const before=C.groupDiagnostic(s,C.parse(s));assert.equal(before.loop,false);
  const n=C.step(s,'up');
  assert.equal(n.state.status,'loop');
  assert.ok(n.events.some(e=>e.type==='rule-change'&&e.detail==='post YOU'));
  assert.ok(n.events.some(e=>e.type==='infinite-loop'&&e.detail.includes('post YOU')));
  assert.equal(n.state.entities.find(e=>e.word==='GROUP'&&e.x===3).y,1);
});
test('a loop state does not advance without undo or restarting',()=>{
  const s=S(W('NOT GROUP IS GROUP',0,0),O('ROCK',10,8));
  const n=C.step(s,'wait').state;
  const again=C.step(n,'right').state;
  assert.equal(C.fingerprint(n),C.fingerprint(again));
});
// Grounding: Steam developer explanation EMPTY is transient; Wiki EMPTY/PUSH.
test('EMPTY IS YOU pushes a PUSH object in the chosen direction',()=>{
  const s=S(W('EMPTY IS YOU',0,0),W('ROCK IS PUSH',0,1),O('ROCK',7,7));
  const n=C.step(s,'right');
  assert.equal(object(n.state,'ROCK').x,8);
  assert.ok(n.events.some(e=>e.type==='empty-push-object'));
  assert.equal(n.state.entities.some(e=>e.kind==='EMPTY'),false);
});
test('EMPTY IS YOU cannot push a STOP-only object',()=>{
  const s=S(W('EMPTY IS YOU',0,0),W('ROCK IS STOP',0,1),O('ROCK',7,7));
  const n=C.step(s,'right');
  assert.equal(object(n.state,'ROCK').x,7);
  assert.equal(n.events.some(e=>e.type==='empty-push-object'),false);
});
test('EMPTY IS YOU cannot push an object beyond the board edge',()=>{
  const s=C.create(12,9,[...W('EMPTY IS YOU',0,0),...W('ROCK IS PUSH',0,1),O('ROCK',11,5)]);
  const n=C.step(s,'right');
  assert.equal(object(n.state,'ROCK').x,11);
});
test('EMPTY IS YOU passes through a non-solid occupant without displacing it',()=>{
  const s=S(W('EMPTY IS YOU',0,0),O('ROCK',7,7));
  const n=C.step(s,'right');
  assert.equal(object(n.state,'ROCK').x,7);
  assert.equal(n.events.some(e=>e.type==='empty-push-object'),false);
});
test('EMPTY IS YOU AND STILL cannot move real objects',()=>{
  const s=S(W('EMPTY IS YOU AND STILL',0,0),W('ROCK IS PUSH',0,1),O('ROCK',7,7));
  const n=C.step(s,'right');
  assert.equal(object(n.state,'ROCK').x,7);
});
test('post-YOU event is a real rule-change detection after pushing text',()=>{
  const s=S(W('BABA IS YOU',0,0),W('ROCK IS PUSH',6,5),O('BABA',7,6));
  const n=C.step(s,'up');
  assert.ok(n.events.some(e=>e.type==='rule-change'&&e.detail==='post YOU'));
  assert.equal(C.parse(n.state).some(r=>r.subject==='ROCK'&&r.predicate==='PUSH'),false);
});
test('prior 18 puzzles and replay data remain accessible',()=>{
  const {puzzles}=require('../dist/levels');
  assert.ok(puzzles.length>=18);
  assert.ok(puzzles.every(p=>p.title&&p.state.entities.length>0));
});
test('EMPTY IS PUSH transmits a push across vacancies to another PUSH object and a transparent anchor',()=>{
  const s=C.create(12,9,[...W('BABA IS YOU',0,0),...W('EMPTY IS PUSH',0,1),...W('ROCK IS PUSH',0,2),O('BABA',3,6),O('ROCK',6,6),O('FLAG',9,6)]);
  const n=C.step(s,'right');
  assert.equal(object(n.state,'BABA').x,4);
  assert.equal(object(n.state,'ROCK').x,7);
});
test('EMPTY PUSH chain with real PUSH object rolls back if the anchor is STOP',()=>{
  const s=C.create(12,9,[...W('BABA IS YOU',0,0),...W('EMPTY IS PUSH',0,1),...W('ROCK IS PUSH',0,2),...W('WALL IS STOP',0,3),O('BABA',3,6),O('ROCK',6,6),O('WALL',9,6)]);
  const n=C.step(s,'right');
  assert.equal(object(n.state,'BABA').x,3);
  assert.equal(object(n.state,'ROCK').x,6);
  assert.equal(n.events.some(e=>e.type==='empty-push-object'),false);
});
