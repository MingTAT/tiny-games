const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../dist/core');
const phrase=(text,x,y)=>text.split(' ').map((word,i)=>({kind:'TEXT',word,x:x+i,y}));
const o=(kind,x,y,dir='right')=>({kind,x,y,dir});
const s=(...entries)=>E.create(18,12,entries.flat());
const things=(state,kind)=>state.entities.filter(e=>e.kind===kind);
const at=(state,kind,x,y)=>things(state,kind).some(e=>e.x===x&&e.y===y);

test('EAT is parsed as a verb and does not grant a property',()=>{
  const st=s(phrase('BABA EAT ROCK',0,0),o('BABA',4,5));
  assert.equal(E.parse(st).filter(r=>r.verb==='EAT').length,1);
  assert.equal(E.has(st,things(st,'BABA')[0],'EAT',E.parse(st)),false);
});
test('EAT consumes STOP and PUSH targets as mover enters',()=>{
  const st=s(phrase('BABA IS YOU',0,0),phrase('BABA EAT ROCK',0,1),phrase('ROCK IS STOP AND PUSH',0,2),o('BABA',5,7),o('ROCK',6,7));
  const out=E.step(st,'right');
  assert.ok(at(out.state,'BABA',6,7));
  assert.equal(things(out.state,'ROCK').length,0);
  assert.ok(out.events.some(e=>e.type==='collision-destroy'));
});
test('SAFE forbids EAT and retains STOP blocker',()=>{
  const st=s(phrase('BABA IS YOU',0,0),phrase('BABA EAT ROCK',0,1),phrase('ROCK IS STOP AND SAFE',0,2),o('BABA',5,7),o('ROCK',6,7));
  const out=E.step(st,'right');
  assert.ok(at(out.state,'BABA',5,7));assert.ok(at(out.state,'ROCK',6,7));
});
test('EAT respects FLOAT separation',()=>{
  const st=s(phrase('BABA IS YOU',0,0),phrase('BABA IS FLOAT',0,1),phrase('BABA EAT ROCK',0,2),phrase('ROCK IS STOP',0,3),o('BABA',5,7),o('ROCK',6,7));
  const out=E.step(st,'right');
  assert.ok(at(out.state,'BABA',5,7));assert.ok(at(out.state,'ROCK',6,7));
});
test('failed push chain does not accidentally EAT target',()=>{
  const st=s(phrase('BABA IS YOU',0,0),phrase('BABA EAT ROCK',0,1),phrase('WALL IS STOP',0,2),o('BABA',5,7),o('ROCK',6,7),o('WALL',6,7));
  const out=E.step(st,'right');
  assert.ok(at(out.state,'BABA',5,7));assert.ok(at(out.state,'ROCK',6,7));
});
test('EAT + HAS creates the drop in the consumed object original tile',()=>{
  const st=s(phrase('BABA IS YOU',0,0),phrase('BABA EAT ROCK',0,1),phrase('ROCK HAS KEY',0,2),phrase('ROCK IS STOP',0,3),o('BABA',5,7),o('ROCK',6,7));
  const out=E.step(st,'right');
  assert.ok(at(out.state,'BABA',6,7));assert.ok(at(out.state,'KEY',6,7));
  assert.ok(out.events.some(e=>e.type==='has'));
});
test('ON-OVERLAP EAT consumes matching target on wait',()=>{
  const st=s(phrase('BABA EAT ROCK',0,0),o('BABA',4,7),o('ROCK',4,7));
  const out=E.step(st,'wait').state;
  assert.equal(things(out,'ROCK').length,0);assert.equal(things(out,'BABA').length,1);
});
test('SAFE prevents DEFEAT and SINK destruction; other object still sinks',()=>{
  const st=s(phrase('BABA IS YOU',0,0),phrase('BABA IS SAFE',0,1),phrase('WATER IS SINK',0,2),o('BABA',5,7),o('WATER',5,7));
  const out=E.step(st,'wait').state;
  assert.equal(things(out,'BABA').length,1);assert.equal(things(out,'WATER').length,0);
});
test('SAFE does not prevent ROCK IS NOT ROCK disappearance',()=>{
  const st=s(phrase('ROCK IS SAFE',0,0),phrase('ROCK IS NOT ROCK',0,1),o('ROCK',5,7));
  assert.equal(things(E.step(st,'wait').state,'ROCK').length,0);
});
test('OPEN + SHUT handles STOP collision before movement',()=>{
  const st=s(phrase('BABA IS YOU',0,0),phrase('BABA IS OPEN',0,1),phrase('DOOR IS SHUT AND STOP',0,2),o('BABA',5,7),o('DOOR',6,7));
  const out=E.step(st,'right').state;
  assert.equal(things(out,'BABA').length,0);assert.equal(things(out,'DOOR').length,0);
});
test('PUSH KEY OPEN unlocks DOOR SHUT, preserves other push sequence',()=>{
  const st=s(phrase('BABA IS YOU',0,0),phrase('KEY IS PUSH AND OPEN',0,1),phrase('DOOR IS SHUT AND STOP',0,2),o('BABA',5,7),o('KEY',6,7),o('DOOR',7,7));
  const out=E.step(st,'right').state;
  assert.ok(at(out,'BABA',6,7));assert.equal(things(out,'KEY').length,0);assert.equal(things(out,'DOOR').length,0);
});
test('STILL blocks attempted movement and pushing',()=>{
  const st=s(phrase('BABA IS YOU',0,0),phrase('ROCK IS PUSH AND STILL',0,2),o('BABA',5,7),o('ROCK',6,7));
  assert.ok(at(E.step(st,'right').state,'BABA',5,7));
});
