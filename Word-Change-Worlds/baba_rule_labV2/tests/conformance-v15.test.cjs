const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../dist/core');
const W=(str,x,y,vertical=false)=>str.split(' ').map((word,i)=>({kind:'TEXT',word,x:x+(vertical?0:i),y:y+(vertical?i:0)}));
const O=(kind,x,y,dir='right')=>({kind,x,y,dir});
const S=(...rows)=>C.create(14,11,rows.flat());
const entity=(s,k,x,y)=>s.entities.find(e=>e.kind===k&&(x===undefined||(e.x===x&&e.y===y)));
const count=(s,k)=>s.entities.filter(e=>e.kind===k).length;
// Reference-derived behavioral checks, NOT original-game observed replay.
test('recursive GROUP -> GROUP2 -> GROUP3 -> WIN inheritance reaches fixed point',()=>{
 const s=S(W('ROCK IS GROUP',0,0),W('GROUP IS GROUP2',0,1),W('GROUP2 IS GROUP3',0,2),W('GROUP3 IS WIN',0,3),O('ROCK',9,8));
 const rock=entity(s,'ROCK'); const groups=C.groupMembers(s,C.parse(s));
 assert.ok(groups.GROUP.includes(rock.id));assert.ok(groups.GROUP2.includes(rock.id));assert.ok(groups.GROUP3.includes(rock.id));
 assert.equal(C.has(s,rock,'WIN',C.parse(s)),true);
});
test('GROUP2 negative rule overrides positive membership inherited from GROUP',()=>{
 const s=S(W('ROCK IS GROUP',0,0),W('GROUP IS GROUP2',0,1),W('ROCK IS NOT GROUP2',0,2),W('GROUP2 IS WIN',0,3),O('ROCK',9,8));
 const rock=entity(s,'ROCK');assert.equal(C.groupMembers(s,C.parse(s)).GROUP2.includes(rock.id),false);
 assert.equal(C.has(s,rock,'WIN',C.parse(s)),false);
});
test('positive group cycle terminates and does not invent members',()=>{
 const s=S(W('GROUP IS GROUP2',0,0),W('GROUP2 IS GROUP',0,1),O('ROCK',8,7));
 assert.deepEqual(C.groupMembers(s,C.parse(s)),{GROUP:[],GROUP2:[],GROUP3:[]});
});
test('conditional membership inherits only for qualifying instance',()=>{
 const s=S(W('ROCK ON WATER IS GROUP',0,0),W('GROUP IS GROUP2',0,1),W('GROUP2 IS STOP',0,2),O('ROCK',7,6),O('WATER',7,6),O('ROCK',10,6));
 const rr=C.parse(s),rocks=s.entities.filter(e=>e.kind==='ROCK');
 assert.equal(C.has(s,rocks[0],'STOP',rr),true);assert.equal(C.has(s,rocks[1],'STOP',rr),false);
});
test('EMPTY exists only on vacant cells, and EMPTY IS ROCK converts exactly those cells',()=>{
 const s=C.create(7,5,[...W('EMPTY IS ROCK',0,0),O('BABA',5,4)]);
 const originallyOccupied=new Set(s.entities.map(e=>`${e.x},${e.y}`));
 const n=C.step(s,'wait').state;
 const rocks=n.entities.filter(e=>e.kind==='ROCK');
 assert.equal(rocks.length,35-originallyOccupied.size);
 assert.equal(n.entities.some(e=>e.kind==='EMPTY'),false);
 assert.ok(rocks.every(e=>!originallyOccupied.has(`${e.x},${e.y}`)));
});
test('OBJECT IS EMPTY erases the object without creating an EMPTY entity',()=>{
 const s=S(W('ROCK IS EMPTY',0,0),O('ROCK',9,7));
 const n=C.step(s,'wait').state;assert.equal(count(n,'ROCK'),0);assert.equal(count(n,'EMPTY'),0);
});
test('EMPTY IS WIN alone cannot be entered by BABA; EMPTY IS YOU AND WIN can win',()=>{
 const a=S(W('BABA IS YOU',0,0),W('EMPTY IS WIN',0,1),O('BABA',8,7));
 assert.equal(C.step(a,'wait').state.status,'playing');
 const b=S(W('EMPTY IS YOU AND WIN',0,0),O('BABA',8,7));
 assert.equal(C.step(b,'wait').state.status,'won');
});
test('EMPTY IS STOP blocks entry into actual vacancies but not occupied, non-STOP tiles',()=>{
 const s=S(W('BABA IS YOU',0,0),W('EMPTY IS STOP',0,1),O('BABA',9,7),O('FLAG',9,8));
 assert.equal(entity(C.step(s,'right').state,'BABA').x,9);
 assert.equal(entity(C.step(s,'down').state,'BABA').y,8);
});
test('EMPTY IS PUSH can be pushed onto a non-solid occupied tile, not into the board edge',()=>{
 const s=C.create(9,7,[...W('BABA IS YOU',0,0),...W('EMPTY IS PUSH',0,1),O('BABA',3,5),O('ROCK',6,5)]);
 const a=C.step(s,'right');assert.equal(entity(a.state,'BABA').x,4);
 const b=C.create(9,7,[...W('BABA IS YOU',0,0),...W('EMPTY IS PUSH',0,1),O('BABA',3,5)]);
 assert.equal(entity(C.step(b,'right').state,'BABA').x,3);
});
test('blocked EMPTY PUSH produces no partial position or stray empty-push event',()=>{
 const s=C.create(9,7,[...W('BABA IS YOU',0,0),...W('EMPTY IS PUSH',0,1),O('BABA',3,5),O('ROCK',6,5),...W('ROCK IS STOP',0,2)]);
 const r=C.step(s,'right');assert.equal(entity(r.state,'BABA').x,3);
 assert.equal(r.events.some(e=>e.type==='empty-push'),false);
});
test('EMPTY NEAR BABA and BABA NEAR EMPTY evaluate virtual tiles',()=>{
 const s=S(W('BABA NEAR EMPTY IS WIN',0,0),O('BABA',9,7));
 assert.equal(C.has(s,entity(s,'BABA'),'WIN',C.parse(s)),true);
});
test('two stacked SHIFT objects move the rider two cells in one turn',()=>{
 const s=S(W('WALL IS SHIFT',0,0),O('WALL',6,6),O('WALL',6,6),O('BABA',6,6));
 const n=C.step(s,'wait');assert.equal(entity(n.state,'BABA').x,8);
 assert.equal(n.events.filter(e=>e.type==='move').length>=2,true);
});
test('TELE moves a passenger only between matching teleporter kinds',()=>{
 const s=S(W('WALL IS TELE',0,0),W('ROCK IS TELE',0,1),O('WALL',6,5),O('WALL',10,5),O('ROCK',6,7),O('ROCK',10,7),O('BABA',6,5));
 const n=C.step(s,'wait');assert.equal(entity(n.state,'BABA').x,10);assert.equal(entity(n.state,'BABA').y,5);
});
test('stage trace reparses after moves, transformations, TELE and collision phases',()=>{
 const s=S(W('BABA IS YOU',0,0),O('BABA',8,7));
 const labels=C.step(s,'right').events.filter(e=>e.type==='reparse').map(e=>e.detail);
 for(const k of ['post YOU','post MOVE','post SHIFT','post transform','post TELE','post interactions'])assert.ok(labels.includes(k),k);
});
test('EMPTY may join GROUP; its inherited properties apply only to virtual vacant cells',()=>{
 const s=C.create(10,6,[...W('EMPTY IS GROUP',0,0),...W('GROUP IS STOP',0,1),...W('BABA IS YOU',0,2),O('BABA',8,4)]);
 const groups=C.groupMembers(s,C.parse(s));assert.ok(groups.GROUP.some(id=>id<0));
 assert.equal(entity(C.step(s,'left').state,'BABA').x,8);
});
