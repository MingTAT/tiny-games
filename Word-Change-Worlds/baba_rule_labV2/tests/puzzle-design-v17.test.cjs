const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../dist/core'),{puzzles}=require('../dist/levels');
const plans=[
  'D L L U R R U U R U R R L D L L L U L D R R D D L U U R R R U R R R R R R R R R',
  'R U R U U L U L L L L L U'
];
const dir={R:'right',U:'up',D:'down',L:'left'};
const rules=s=>C.parse(s).map(r=>`${r.subject} ${r.verb} ${r.predicate}`);
function trace(idx){const s=[C.clone(puzzles[idx].state)];for(const key of plans[idx-18].split(' '))s.push(C.step(s.at(-1),dir[key]).state);return s;}
test('19: controlled deaths transfer BABA → KEKE → BABA and recycle a noun word',()=>{
 const ss=trace(18);
 assert.equal(ss.length,41);
 assert.equal(ss.at(-1).status,'won');
 // HAS is deliberately composed before the first sacrifice.
 assert.ok(rules(ss[4]).includes('BABA HAS KEKE'));
 assert.ok(rules(ss[8]).includes('BABA IS OPEN'));
 assert.ok(rules(ss[8]).includes('BABA HAS KEKE'));
 assert.equal(ss[11].entities.filter(e=>e.kind==='DOOR').length,2);
 assert.equal(ss[12].entities.filter(e=>e.kind==='DOOR').length,1);
 assert.equal(ss[12].entities.filter(e=>e.kind==='BABA').length,0);
 assert.equal(ss[12].entities.filter(e=>e.kind==='KEKE').length,1);
 // Move the word BABA away; reuse the same KEKE tile from HAS as new subject.
 assert.ok(!rules(ss[18]).includes('BABA IS OPEN'));
 assert.ok(!rules(ss[26]).includes('BABA HAS KEKE'));
 assert.ok(rules(ss[27]).includes('KEKE IS OPEN'));
 assert.equal(ss[35].entities.filter(e=>e.kind==='DOOR').length,1);
 assert.equal(ss[36].entities.filter(e=>e.kind==='DOOR').length,0);
 assert.equal(ss[36].entities.filter(e=>e.kind==='KEKE').length,0);
 assert.equal(ss[36].entities.filter(e=>e.kind==='BABA').length,1);
 const ke=ss[4].entities.find(e=>e.kind==='TEXT'&&e.word==='KEKE'&&e.y===8);
 assert.ok(ke);
 assert.deepEqual([ss[27].entities.find(e=>e.id===ke.id).x,ss[27].entities.find(e=>e.id===ke.id).y],[3,6]);
});
test('19: both inheritance rules, movable KEKE and OPEN are necessary for the recorded route',()=>{
 const cases=[
  (e)=>!(e.kind==='TEXT'&&e.word==='HAS'&&e.x===2&&e.y===8),
  (e)=>!(e.kind==='TEXT'&&e.word==='HAS'&&e.x===1&&e.y===0),
  (e)=>!(e.kind==='TEXT'&&e.word==='KEKE'&&e.x===3&&e.y===9),
  (e)=>!(e.kind==='TEXT'&&e.word==='OPEN'&&e.x===5&&e.y===7)
 ];
 for(const keep of cases){
  let s=C.clone(puzzles[18].state);s.entities=s.entities.filter(keep);
  for(const key of plans[0].split(' '))s=C.step(s,dir[key]).state;
  assert.notEqual(s.status,'won');
 }
});
test('19: neither of two doors has a geometric bypass through solid walls',()=>{
 const start=[5,9],goal=[14,6],s=puzzles[18].state;
 const solid=new Set(s.entities.filter(e=>e.kind==='WALL'||e.kind==='GRASS').map(e=>`${e.x},${e.y}`));
 const canReach=(door)=>{const blocked=new Set([...solid,door]);const q=[start],seen=new Set([start.join(',')]);let h=0;
  while(h<q.length){const [x,y]=q[h++];if(x===goal[0]&&y===goal[1])return true;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,k=`${xx},${yy}`;
    if(xx<0||yy<0||xx>=s.width||yy>=s.height||blocked.has(k)||seen.has(k))continue;
    seen.add(k);q.push([xx,yy]);}}
  return false;};
 assert.equal(canReach('8,6'),false);
 assert.equal(canReach('11,6'),false);
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
