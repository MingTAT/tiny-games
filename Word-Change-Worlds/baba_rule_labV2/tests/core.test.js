const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine.js'),levels=require('../levels.js');
const actions={R:'right',L:'left',U:'up',D:'down'};
const plans=[
 'R D D D D U U U U R R R R R R',
 'R R D D D D D D L U R U U U U U',
 'R R D D D D D D L U R U U L',
 'R R D D D D D D L U R U U',
 'R R R R R R U U R',
 'L L D D D D D D R R R U R R U U',
 'R R R D D D D D L U R R R U U U U R R',
 'R R D D D D D D L U'
];
function play(level,moves){let s=E.make(level),states=[s];for(const m of moves.trim().split(/\s+/)){s=E.step(s,actions[m]);states.push(s);}return states;}
function simple(units,w=8,h=5){return {name:'test',w,h,units};}
const obj=(type,x,y)=>({type,x,y}), word=(name,x,y)=>({type:'TEXT',word:name,x,y});
const phrase=(words,x,y,vertical=false)=>words.map((n,i)=>word(n,x+(vertical?0:i),y+(vertical?i:0)));
for(let i=0;i<levels.length;i++){
 test(`puzzle ${String(i+1).padStart(2,'0')} has a verified winning sequence`,()=>{
   const s=play(levels[i],plans[i]);assert.equal(s.at(-1).status,'won',levels[i].name);
   assert.equal(s.at(-2).status,'playing');
   assert.equal(s.at(-1).turn,plans[i].split(' ').length);
 });
}
test('rule disappears immediately after one word is pushed away',()=>{
 const l=simple([obj('BABA',2,1),obj('WALL',4,1),...phrase(['BABA','IS','YOU'],0,0),...phrase(['WALL','IS','STOP'],1,3)]);
 const a=E.make(l);assert.ok(E.parse(a).rules.some(r=>r.display==='WALL IS STOP'));
 const moved=play(l,'D D')[2];assert.equal(E.parse(moved).rules.some(r=>r.display==='WALL IS STOP'),false);
});
test('text is PUSH by default; push chain moves all tiles',()=>{
 const l=simple([obj('BABA',1,2),...phrase(['BABA','IS','YOU'],0,0),word('ROCK',2,2),word('IS',3,2)]);
 const b=E.step(E.make(l),'right');assert.equal(b.units.find(u=>u.word==='ROCK').x,3);assert.equal(b.units.find(u=>u.word==='IS'&&u.y===2).x,4);
});
test('blocked push chain rolls back atomically',()=>{
 const l=simple([obj('BABA',4,1),...phrase(['BABA','IS','YOU'],0,0),word('ROCK',5,1),word('IS',6,1),word('WIN',7,1)]);
 const a=E.make(l),b=E.step(a,'right');assert.equal(E.fingerprint(a),E.fingerprint(b));
});
test('vertical word rule is parsed',()=>{
 const l=simple([...phrase(['ROCK','IS','WIN'],2,0,true),obj('ROCK',4,2)]);
 const s=E.make(l);assert.ok(E.parse(s).rules.some(r=>r.display==='ROCK IS WIN'));
});
test('AND spreads one property to two subjects',()=>{
 const l=simple([...phrase(['ROCK','AND','BABA','IS','YOU'],0,0),obj('ROCK',1,2),obj('BABA',2,2)]);
 const s=E.make(l),p=E.describe(s);assert.equal(s.units.filter(u=>E.propsFor(u,p.rules).has('YOU')).length,2);
});
test('a negative rule supersedes a positive rule regardless of order',()=>{
 const l=simple([...phrase(['WALL','IS','STOP'],0,0),...phrase(['WALL','IS','NOT','STOP'],0,2),obj('WALL',5,2)]);
 const s=E.make(l),r=E.parse(s).rules;assert.equal(E.propsFor(s.units.at(-1),r).has('STOP'),false);
});
test('noun transformation changes the controlled object',()=>{
 const l=simple([...phrase(['BABA','IS','YOU'],0,0),...phrase(['ROCK','IS','BABA'],0,3),obj('ROCK',5,1)]);
 const b=E.step(E.make(l),'right');assert.equal(b.units.some(u=>u.type==='ROCK'),false);
 assert.ok(b.units.some(u=>u.type==='BABA'&&u.x===5&&u.y===1));
});
test('YOU plus WIN on the same object wins without touching the flag',()=>{
 const l=simple([...phrase(['BABA','IS','YOU'],0,0),...phrase(['BABA','IS','WIN'],0,3),obj('BABA',5,1)]);
 assert.equal(E.step(E.make(l),'left').status,'won');
});
test('SINK destroys itself and overlapping ROCK',()=>{
 const l=simple([...phrase(['BABA','IS','YOU'],0,0),...phrase(['ROCK','IS','PUSH'],3,0),...phrase(['WATER','IS','SINK'],1,4),obj('BABA',1,2),obj('ROCK',2,2),obj('WATER',3,2)],9,6);
 const b=E.step(E.make(l),'right');assert.ok(!b.units.some(u=>['ROCK','WATER'].includes(u.type)&&u.y===2));
});
test('puzzle 01 cannot cross WALL while STOP still applies',()=>{
 const l=levels[0],s=play(l,'R R R');assert.equal(s.at(-1).units.find(u=>u.type==='BABA').x,5);
 assert.ok(E.parse(s.at(-1)).rules.some(r=>r.display==='WALL IS STOP'));
});
test('puzzle 01 must break WALL IS STOP before winning',()=>{
 const s=play(levels[0],plans[0]);assert.equal(s.at(-1).status,'won');
 assert.ok(s.some((state)=>!E.parse(state).rules.some(r=>r.display==='WALL IS STOP')));
});
test('puzzle 02 changes ROCK to WIN before victory',()=>{
 const s=play(levels[1],plans[1]);assert.ok(s.some(st=>E.parse(st).rules.some(r=>r.display==='ROCK IS WIN')));
});
test('puzzle 03 gives remote KEKE control',()=>{
 const s=play(levels[2],plans[2]);assert.ok(s.some(st=>E.parse(st).rules.some(r=>r.display==='KEKE IS YOU')));
});
test('puzzle 04 transforms a distant ROCK into BABA',()=>{
 const s=play(levels[3],plans[3]);assert.ok(s.some(st=>st.units.filter(u=>u.type==='BABA').length>=2));
});
test('puzzle 06 requires both transformation and new YOU',()=>{
 const states=play(levels[5],plans[5]);assert.ok(states.some(st=>E.parse(st).rules.some(r=>r.display==='FLAG IS ROCK')));
 assert.ok(states.some(st=>E.parse(st).rules.some(r=>r.display==='ROCK IS YOU')));
});
test('puzzle 07 keeps STOP yet negates it via a new sentence',()=>{
 const s=play(levels[6],plans[6]).at(-1),r=E.parse(s).rules;
 assert.ok(r.some(x=>x.display==='WALL IS STOP'));
 assert.ok(r.some(x=>x.display==='WALL IS NOT STOP'));
 assert.equal(E.propsFor(s.units.find(u=>u.type==='WALL'),r).has('STOP'),false);
});
test('puzzle 08 wins through BABA IS WIN, not flag collision',()=>{
 const s=play(levels[7],plans[7]).at(-1);assert.ok(E.parse(s).rules.some(r=>r.display==='BABA IS WIN'));
 assert.equal(s.units.find(u=>u.type==='BABA').x,3);
});
test('source state is immutable and supports reliable undo history',()=>{
 const s=E.make(levels[0]),initial=JSON.stringify(s);E.step(s,'right');assert.equal(JSON.stringify(s),initial);
});
