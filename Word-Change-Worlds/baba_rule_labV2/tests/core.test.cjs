const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../dist/core'),{puzzles}=require('../dist/levels');
const obj=(kind,x,y,dir='right')=>({kind,x,y,dir});
const w=(word,x,y)=>({kind:'TEXT',word,x,y});
const phrase=(words,x,y,vertical=false)=>words.split(' ').map((v,i)=>w(v,x+(vertical?0:i),y+(vertical?i:0)));
const state=(...units)=>C.create(12,9,units.flat());
const ruleNames=s=>C.parse(s).map(r=>`${r.subject} ${r.verb} ${r.predicateNegated?'NOT ':''}${r.predicate}`);
const rules=(...tokens)=>phrase(tokens.join(' '),0,0);
const get=(s,kind)=>s.entities.filter(x=>x.kind===kind);
const getWord=(s,word)=>s.entities.filter(x=>x.word===word);
const actions={R:'right',L:'left',U:'up',D:'down',W:'wait'};
const plans=[
'R D D D D U U U U R R R R R R',
'R R D D D D D D L U R U U U U U',
'R R D D D D D D L U R U U L',
'R R R D D D D D L U R R R U U U U R R',
'L L D D D D D D R R R U R R U U',
'L R R R D D',
'U R R R R D D D D'
];
for(let i=0;i<puzzles.length;i++)test(`Full puzzle replay ${i+1}: exact winning step and trace`,()=>{
  const inputs=plans[i].split(' ').map(x=>actions[x]);const outcome=C.replay(puzzles[i].state,inputs);
  assert.equal(outcome.states.length,inputs.length+1);
  assert.equal(outcome.states.at(-2).status,'playing');assert.equal(outcome.states.at(-1).status,'won');
  assert.equal(outcome.states.at(-1).turn,inputs.length);
  assert.ok(outcome.turns.some(t=>t.events.some(e=>e.type==='move')));
});
test('rule syntax parses vertically and from right-hand internal starts',()=>{
  const s=state(phrase('ROCK IS WIN',4,2,true),obj('ROCK',5,5));assert.ok(ruleNames(s).includes('ROCK IS WIN'));
});
test('AND in both subject and predicate creates Cartesian expansion',()=>{
  const s=state(phrase('BABA AND ROCK IS YOU AND PUSH',0,2));
  assert.deepEqual(new Set(ruleNames(s)),new Set(['BABA IS YOU','ROCK IS YOU','BABA IS PUSH','ROCK IS PUSH']));
});
test('stacked text tiles produce independent valid rules',()=>{
  const s=state(w('BABA',0,2),w('ROCK',0,2),w('IS',1,2),w('YOU',2,2));
  assert.deepEqual(new Set(ruleNames(s)),new Set(['BABA IS YOU','ROCK IS YOU']));
});
test('invalid grammar does not generate an accidental positive rule',()=>{
  const s=state(phrase('BABA IS NOT',0,3));assert.deepEqual(C.parse(s),[]);
});
test('negation wins regardless of parse order',()=>{
  const s=state(phrase('WALL IS STOP',0,1),phrase('WALL IS NOT STOP',0,3),obj('WALL',10,6));
  assert.equal(C.has(s,get(s,'WALL')[0],'STOP',C.parse(s)),false);
});
test('TEXT is push by default, and TEXT IS NOT PUSH cancels it',()=>{
  const s=state(phrase('TEXT IS NOT PUSH',0,3),w('WIN',9,5));
  assert.equal(C.has(s,getWord(s,'WIN')[0],'PUSH',C.parse(s)),false);
});
test('negative subject excludes that type',()=>{
  const s=state(phrase('NOT ROCK IS YOU',0,2),obj('ROCK',8,4),obj('BABA',8,5));
  assert.equal(C.has(s,get(s,'ROCK')[0],'YOU',C.parse(s)),false);
  assert.equal(C.has(s,get(s,'BABA')[0],'YOU',C.parse(s)),true);
});
test('ON checks overlapping entity, including negated condition',()=>{
  const s=state(phrase('BABA ON ROCK IS WIN',0,2),obj('BABA',8,4),obj('ROCK',8,4),obj('BABA',8,5));
  const p=C.parse(s);assert.equal(C.has(s,get(s,'BABA')[0],'WIN',p),true);assert.equal(C.has(s,get(s,'BABA')[1],'WIN',p),false);
});
test('NEAR includes diagonal adjacent cells',()=>{
  const s=state(phrase('BABA NEAR ROCK IS YOU',0,2),obj('BABA',8,4),obj('ROCK',9,5));
  assert.equal(C.has(s,get(s,'BABA')[0],'YOU',C.parse(s)),true);
});
test('LONELY applies only to unstacked entity',()=>{
  const s=state(phrase('LONELY BABA IS YOU',0,2),obj('BABA',8,4),obj('BABA',8,5),obj('FLAG',8,5));
  assert.equal(C.has(s,get(s,'BABA')[0],'YOU',C.parse(s)),true);
  assert.equal(C.has(s,get(s,'BABA')[1],'YOU',C.parse(s)),false);
});
test('SINK removes the overlapping entities and does not delete elsewhere',()=>{
  const s=state(phrase('WATER IS SINK',0,0),obj('WATER',4,3),obj('ROCK',4,3),obj('BABA',6,6));
  const t=C.step(s,'wait').state;assert.equal(get(t,'WATER').length,0);assert.equal(get(t,'ROCK').length,0);assert.equal(get(t,'BABA').length,1);
});
test('float isolates a SINK interaction but not STOP blockers',()=>{
  const s=state(phrase('ROCK IS FLOAT',0,0),phrase('WATER IS SINK',0,1),obj('WATER',4,4),obj('ROCK',4,4));
  assert.equal(get(C.step(s,'wait').state,'ROCK').length,1);
  const t=state(phrase('BABA IS YOU',0,0),phrase('BABA IS FLOAT',0,1),phrase('WALL IS STOP',0,2),obj('BABA',4,5),obj('WALL',5,5));
  assert.equal(get(C.step(t,'right').state,'BABA')[0].x,4);
});
test('a text push chain is an atomic transaction',()=>{
  const s=state(phrase('BABA IS YOU',0,0),obj('BABA',4,4),w('ROCK',5,4),w('IS',6,4),w('WIN',7,4));
  const t=C.step(s,'right').state;assert.deepEqual(getWord(t,'ROCK').map(e=>e.x),[6]);assert.equal(get(t,'BABA')[0].x,5);
});
test('blocked text push chain rolls back without partial movement',()=>{
  const s=state(phrase('BABA IS YOU',0,0),obj('BABA',8,4),w('ROCK',9,4),w('IS',10,4),w('WIN',11,4));
  const t=C.step(s,'right').state;assert.equal(get(t,'BABA')[0].x,8);assert.deepEqual(getWord(t,'IS').filter(e=>e.y===4).map(e=>e.x),[10]);
});
test('two YOU movers each move only once and input stays immutable',()=>{
  const s=state(phrase('BABA IS YOU',0,0),obj('BABA',2,5),obj('BABA',3,5));const old=C.fingerprint(s);
  const t=C.step(s,'right').state;assert.deepEqual(get(t,'BABA').map(e=>e.x).sort(),[3,4]);assert.equal(C.fingerprint(s),old);
});
test('noun transformation is simultaneous and creates fresh entity ids',()=>{
  const s=state(phrase('ROCK IS BABA',0,0),obj('ROCK',6,5));const result=C.step(s,'wait');
  assert.equal(get(result.state,'ROCK').length,0);assert.equal(get(result.state,'BABA').length,1);
  assert.ok(result.events.some(e=>e.phase==='transform'&&e.type==='transform'));
});
test('transformation negation blocks one target',()=>{
  const s=state(phrase('ROCK IS BABA',0,0),phrase('ROCK IS NOT BABA',0,2),obj('ROCK',7,6));
  assert.equal(get(C.step(s,'wait').state,'ROCK').length,1);
});
test('self YOU WIN triggers victory without touching another object',()=>{
  const s=state(phrase('BABA IS YOU',0,0),phrase('BABA IS WIN',0,2),obj('BABA',6,5));
  assert.equal(C.step(s,'wait').state.status,'won');
});
test('MAKE creates an object only if not already present at maker tile',()=>{
  const s=state(phrase('BABA MAKE ROCK',0,0),obj('BABA',7,6));
  const t=C.step(s,'wait').state;assert.equal(get(t,'ROCK').length,1);
  const t2=C.step(t,'wait').state;assert.equal(get(t2,'ROCK').length,1);
});
test('event trace records each phase and allows deterministic replay',()=>{
  const s=state(phrase('BABA IS YOU',0,0),obj('BABA',5,5));
  const a=C.replay(s,['right','down','left']),b=C.replay(s,['right','down','left']);
  assert.equal(C.fingerprint(a.states.at(-1)),C.fingerprint(b.states.at(-1)));
  assert.ok(a.turns.every(t=>t.events.filter(e=>e.type==='reparse').length>=3));
});
test('a turn never mutates its input state even when entities are destroyed',()=>{
  const s=state(phrase('WATER IS SINK',0,0),obj('ROCK',6,6),obj('WATER',6,6));
  const raw=JSON.stringify(s);C.step(s,'wait');assert.equal(JSON.stringify(s),raw);
});
test('all entity IDs remain unique after transforms',()=>{
  const s=state(phrase('ROCK IS BABA AND FLAG',0,0),obj('ROCK',7,6));
  const t=C.step(s,'wait').state;assert.equal(new Set(t.entities.map(e=>e.id)).size,t.entities.length);
});
test('out of bounds movement does not erase entities',()=>{
  const s=state(phrase('BABA IS YOU',0,0),obj('BABA',0,6));
  const t=C.step(s,'left').state;assert.equal(get(t,'BABA')[0].x,0);
});
test('partial input rule is not a rule until completed',()=>{
  const s=state(w('ROCK',0,3),w('IS',1,3),w('WIN',2,4));
  assert.equal(ruleNames(s).includes('ROCK IS WIN'),false);
});
test('PULL drags a single follower behind the moving player',()=>{
  const s=state(phrase('BABA IS YOU',0,0),phrase('ROCK IS PULL',0,2),obj('ROCK',4,6),obj('BABA',5,6));
  const t=C.step(s,'right').state;assert.equal(get(t,'BABA')[0].x,6);assert.equal(get(t,'ROCK')[0].x,5);
});
test('MOVE advances a facing entity on WAIT',()=>{
  const s=state(phrase('ROCK IS MOVE',0,0),obj('ROCK',4,6,'right'));
  const t=C.step(s,'wait').state;assert.equal(get(t,'ROCK')[0].x,5);
});
test('basic SHIFT moves an entity sharing a conveyor tile',()=>{
  const s=state(phrase('WALL IS SHIFT',0,0),obj('WALL',4,6,'right'),obj('ROCK',4,6));
  const t=C.step(s,'wait').state;assert.equal(get(t,'ROCK')[0].x,5);
});
test('SWAP exchanges mover and encountered object',()=>{
  const s=state(phrase('BABA IS YOU',0,0),phrase('ROCK IS SWAP',0,2),obj('BABA',4,6),obj('ROCK',5,6));
  const t=C.step(s,'right').state;assert.equal(get(t,'BABA')[0].x,5);assert.equal(get(t,'ROCK')[0].x,4);
});
test('HAS spawns a flag on a destroyed rock position',()=>{
  const s=state(phrase('ROCK HAS FLAG',0,0),phrase('WATER IS SINK',0,2),obj('ROCK',6,6),obj('WATER',6,6));
  const t=C.step(s,'wait').state;assert.equal(get(t,'ROCK').length,0);assert.equal(get(t,'WATER').length,0);
  assert.equal(get(t,'FLAG').length,1);assert.equal(get(t,'FLAG')[0].x,6);
});

// Behavior descriptions checked against Baba Is You Wiki (not original-game recordings).
test('WORD turns a real ROCK icon into a grammatical noun without granting PUSH',()=>{
  const s=state(phrase('ROCK IS WORD',0,0),obj('ROCK',3,5),w('IS',4,5),w('WIN',5,5),obj('ROCK',8,6));
  assert.ok(ruleNames(s).includes('ROCK IS WIN'));
  const rock=get(s,'ROCK')[1];
  assert.equal(C.has(s,rock,'WIN',C.parse(s)),true);
  assert.equal(C.has(s,rock,'PUSH',C.parse(s)),false);
  assert.ok(C.parse(s).some(r=>r.wordIds.includes(get(s,'ROCK')[0].id)));
});
test('NOT WORD cancels object sentence while preserving base text sentence',()=>{
  const s=state(phrase('ROCK IS WORD',0,0),phrase('ROCK IS NOT WORD',0,1),obj('ROCK',3,5),w('IS',4,5),w('WIN',5,5));
  assert.ok(ruleNames(s).includes('ROCK IS WORD'));
  assert.ok(!ruleNames(s).includes('ROCK IS WIN'));
  assert.equal(C.has(s,get(s,'ROCK')[0],'WORD',C.parse(s)),false);
});
test('removing the WORD sentence also removes grammar formed by rock objects',()=>{
  const s=state(phrase('ROCK IS WORD',0,0),obj('ROCK',3,5),w('IS',4,5),w('WIN',5,5));
  assert.ok(ruleNames(s).includes('ROCK IS WIN'));
  const tile=getWord(s,'WORD')[0];s.entities=s.entities.filter(e=>e.id!==tile.id);
  assert.ok(!ruleNames(s).includes('ROCK IS WIN'));
});
test('BABA IS TEXT creates a genuine pushable BABA word, not an inert TEXT icon',()=>{
  const s=state(phrase('BABA IS TEXT',0,0),obj('BABA',4,5));
  const t=C.step(s,'wait').state;
  const created=getWord(t,'BABA').find(e=>e.x===4&&e.y===5);
  assert.ok(created);assert.equal(created.kind,'TEXT');
  assert.equal(C.has(t,created,'PUSH',C.parse(t)),true);
});
test('an object converted to TEXT can complete a rule on that turn',()=>{
  const s=state(phrase('ROCK IS TEXT',0,0),obj('ROCK',4,5),w('IS',5,5),w('WIN',6,5));
  const t=C.step(s,'wait').state;
  assert.ok(C.parse(t).some(r=>r.subject==='ROCK'&&r.predicate==='WIN'));
  assert.ok(getWord(t,'ROCK').some(e=>e.x===4&&e.y===5));
});
test('TEXT IS ROCK transforms a literal word into a ROCK object',()=>{
  const s=state(phrase('TEXT IS ROCK',0,0),w('FLAG',6,6));
  const t=C.step(s,'wait').state;
  assert.equal(get(t,'ROCK').length,4);
  assert.equal(t.entities.some(e=>e.kind==='TEXT'),false);
});
test('X IS X protects objects from other positive transformations',()=>{
  const s=state(phrase('BABA IS BABA',0,0),phrase('BABA IS ROCK',0,2),obj('BABA',8,7));
  const t=C.step(s,'wait').state;
  assert.equal(get(t,'BABA').length,1);assert.equal(get(t,'ROCK').length,0);
});
test('X IS NOT X removes its own entities',()=>{
  const s=state(phrase('BABA IS NOT BABA',0,0),obj('BABA',8,7));
  const result=C.step(s,'wait');
  assert.equal(get(result.state,'BABA').length,0);
  assert.ok(result.events.some(e=>e.type==='vanish'));
});
test('X HAS TEXT spawns a text tile naming X when destroyed',()=>{
  const s=state(phrase('ROCK HAS TEXT',0,0),phrase('WATER IS SINK',0,2),obj('ROCK',6,6),obj('WATER',6,6));
  const t=C.step(s,'wait').state;
  assert.equal(getWord(t,'ROCK').filter(e=>e.x===6).length,1);
});

test('puzzle 06 — player must finish a sentence that begins with a ROCK entity',()=>{
  const s=puzzles[5].state;
  assert.equal(ruleNames(s).includes('ROCK IS WIN'),false);
  const after=C.step(s,'left');
  assert.equal(ruleNames(after.state).includes('ROCK IS WIN'),true);
  assert.equal(after.state.status,'playing');
  assert.ok(after.rules.some(r=>r.subject==='ROCK'&&r.predicate==='WIN'&&r.wordIds.some(id=>after.state.entities.some(e=>e.id===id&&e.kind==='ROCK'))));
  const end=C.replay(s,['left','right','right','right','down','down']);
  assert.equal(end.states.at(-2).status,'playing');assert.equal(end.states.at(-1).status,'won');
});
test('puzzle 07 — condition converts only submerged rock into text to complete a new rule',()=>{
  const s=puzzles[6].state;
  assert.equal(ruleNames(s).includes('ROCK IS WIN'),false);
  const first=C.step(s,'up');
  assert.ok(first.rules.some(r=>r.subject==='ROCK'&&r.verb==='IS'&&r.predicate==='WIN'));
  assert.equal(first.state.entities.some(e=>e.kind==='TEXT'&&e.word==='ROCK'&&e.x===3&&e.y===5),true);
  assert.equal(first.state.entities.some(e=>e.kind==='ROCK'&&e.x===8&&e.y===6),true);
  const plan=['up','right','right','right','right','down','down','down','down'];
  const out=C.replay(s,plan);
  assert.equal(out.states.at(-2).status,'playing');assert.equal(out.states.at(-1).status,'won');
});
