const {test}=require('node:test');const assert=require('node:assert/strict');
const {create,parse,has,step}=require('../dist/core');
const text=(word,x,y)=>({kind:'TEXT',word,x,y});
const phrase=(str,x,y)=>str.split(' ').map((word,i)=>text(word,x+i,y));
function state(objects){return create(12,7,objects);}
test('GROUP grants a property to the nouns selected by IS GROUP, without spawning a GROUP object',()=>{
 const s=state([{kind:'ROCK',x:7,y:4},{kind:'BABA',x:8,y:4},...phrase('ROCK IS GROUP',0,0),...phrase('GROUP IS STOP',0,1)]);
 const r=parse(s);const rock=s.entities.find(e=>e.kind==='ROCK'),baba=s.entities.find(e=>e.kind==='BABA');
 assert.equal(has(s,rock,'STOP',r),true);assert.equal(has(s,baba,'STOP',r),false);
 assert.equal(s.entities.filter(e=>e.kind==='GROUP').length,0);
});
test('IS NOT GROUP negates membership even if membership is positive',()=>{
 const s=state([{kind:'ROCK',x:7,y:4},...phrase('ROCK IS GROUP',0,0),...phrase('GROUP IS PUSH',0,1),...phrase('ROCK IS NOT GROUP',0,2)]);
 const r=parse(s);assert.equal(has(s,s.entities[0],'PUSH',r),false);
});
test('conditioned group membership applies to some instances but not all',()=>{
 const s=state([{kind:'ROCK',x:7,y:4},{kind:'ROCK',x:9,y:4},{kind:'WATER',x:7,y:4},...phrase('GROUP IS STOP',0,0),...phrase('ROCK ON WATER IS GROUP',0,1)]);
 const r=parse(s);assert.equal(has(s,s.entities[0],'STOP',r),true);assert.equal(has(s,s.entities[1],'STOP',r),false);
});
test('GROUP IS ROCK converts its members, not into a fictitious group tile',()=>{
 const s=state([{kind:'BABA',x:9,y:5},...phrase('BABA IS GROUP',0,0),...phrase('GROUP IS ROCK',0,1)]);
 const n=step(s,'wait').state;assert.ok(n.entities.some(e=>e.kind==='ROCK'&&e.x===9));
});
