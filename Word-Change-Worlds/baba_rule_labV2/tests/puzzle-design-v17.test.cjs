const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../dist/core'),{puzzles}=require('../dist/levels');
const plans=[
  'R U U U L L U U R R D D D R R R D D R R R R',
  'R U R U U L U L L L L L U'
];
const dir={R:'right',U:'up',D:'down',L:'left'};
const rules=s=>C.parse(s).map(r=>`${r.subject} ${r.verb} ${r.predicate}`);
function trace(idx){const s=[C.clone(puzzles[idx].state)];for(const key of plans[idx-18].split(' '))s.push(C.step(s.at(-1),dir[key]).state);return s;}
test('19: a single IS must be reused after irreversible wall transformation',()=>{
 const ss=trace(18);
 assert.equal(ss.at(-1).status,'won');
 assert.equal(ss[0].entities.filter(e=>e.kind==='WALL').length,7);
 assert.equal(ss[4].entities.filter(e=>e.kind==='WALL').length,0);
 assert.ok(rules(ss[4]).includes('WALL IS ROCK'));
 assert.ok(!rules(ss[11]).includes('WALL IS ROCK'));
 assert.ok(rules(ss[13]).includes('FLAG IS WIN'));
 assert.equal(ss[11].entities.filter(e=>e.kind==='WALL').length,0);
 const is=ss[0].entities.find(e=>e.kind==='TEXT'&&e.word==='IS'&&e.y>2);
 assert.deepEqual([is.x,is.y],[3,5]);
 assert.deepEqual([ss[4].entities.find(e=>e.id===is.id).x,ss[4].entities.find(e=>e.id===is.id).y],[3,4]);
 assert.deepEqual([ss[13].entities.find(e=>e.id===is.id).x,ss[13].entities.find(e=>e.id===is.id).y],[3,7]);
});
test('19: original solution fails without either essential word',()=>{
 for(const required of ['ROCK','WIN']){
   let s=C.clone(puzzles[18].state);
   s.entities=s.entities.filter(e=>!(e.kind==='TEXT'&&e.word===required&&e.x===4));
   for(const key of plans[0].split(' '))s=C.step(s,dir[key]).state;
   assert.notEqual(s.status,'won',required);
 }
});
test('20: WIN can replace YOU only after new control is secured',()=>{
 const ss=trace(19);
 assert.equal(ss.at(-1).status,'won');
 assert.ok(rules(ss[2]).includes('BABA IS YOU')&&rules(ss[2]).includes('ROCK IS YOU'));
 assert.ok(rules(ss[7]).includes('BABA IS WIN')&&rules(ss[7]).includes('ROCK IS YOU'));
 assert.ok(!rules(ss[7]).includes('BABA IS YOU'));
 const baba=ss.at(-1).entities.find(e=>e.kind==='BABA'),rock=ss.at(-1).entities.find(e=>e.kind==='ROCK');
 assert.deepEqual([baba.x,baba.y],[rock.x,rock.y]);
});
test('20: rushing to replace YOU before handing off control is a soft-lock',()=>{
 const input='R R U U U L U';let s=C.clone(puzzles[19].state);
 for(const key of input.split(' '))s=C.step(s,dir[key]).state;
 assert.ok(rules(s).includes('BABA IS WIN'));
 assert.ok(!rules(s).some(r=>r.endsWith(' IS YOU')));
 const old=C.clone(s);s=C.step(s,'right').state;
 assert.deepEqual(s.entities.map(e=>[e.id,e.x,e.y]),old.entities.map(e=>[e.id,e.x,e.y]));
 assert.equal(s.status,'playing');
});
