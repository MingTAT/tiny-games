const assert = require('node:assert/strict');
const {Game}=require('./engine.js');
const {levels}=require('./levels.js');
let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓',name);}catch(e){console.error('✗',name);throw e;}}
function g(objects,width=12,height=10){return new Game({width,height,objects});}
function thing(type,x,y,dir=1){return {type,x,y,dir};}
function words(string,x,y,dx=1,dy=0){return string.split(' ').map((word,i)=>({type:'text',word,x:x+i*dx,y:y+i*dy}));}
const obj=(game,type)=>game.objs.filter(o=>o.type===type);

test('25 authored levels initialize and basic expected rules parse',()=>{
 assert.equal(levels.length,25);
 for(const l of levels){const game=new Game(l);assert(game.rules.some(r=>r.verb==='IS'));game.step(null);}
});
test('IS YOU permits movement; undo and redo restore state',()=>{
 const game=g([...words('BABA IS YOU',0,0),thing('baba',3,3)]);
 game.step(1);assert.equal(obj(game,'baba')[0].x,4);
 assert.equal(game.undo(),true);assert.equal(obj(game,'baba')[0].x,3);
 assert.equal(game.redo(),true);assert.equal(obj(game,'baba')[0].x,4);
});
test('BABA cannot move when no YOU rule',()=>{
 const game=g([thing('baba',2,2)]);game.step(1);assert.equal(obj(game,'baba')[0].x,2);
});
test('rules parse vertically and become active',()=>{
 const game=g([...words('BABA IS YOU',0,1,0,1),thing('baba',4,3)]);
 assert(game.rules.some(r=>r.subject==='BABA'&&r.target==='YOU'));game.step(1);assert.equal(obj(game,'baba')[0].x,5);
});
test('text is pushable; moving word breaks WALL IS STOP',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('WALL IS STOP',4,3),thing('baba',6,4),thing('wall',8,6)]);
 assert(game.has(obj(game,'wall')[0],'STOP'));
 game.step(0);assert(!game.has(obj(game,'wall')[0],'STOP'));
});
test('text stops moving when pushing word against boundary',()=>{
 const game=g([...words('BABA IS YOU',0,0),thing('text',11,5,1),thing('baba',10,5)]);
 game.objs.find(o=>o.type==='text'&&o.x===11).word='PUSH';game.refresh();
 game.step(1);assert.equal(obj(game,'baba')[0].x,10);
});
test('chain pushes are transactional if final tile blocked',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('ROCK IS PUSH',2,2),...words('WALL IS STOP',6,0),thing('baba',2,5),thing('rock',3,5),thing('rock',4,5),thing('wall',5,5)]);
 game.step(1);assert.equal(obj(game,'baba')[0].x,2);assert.deepEqual(obj(game,'rock').map(r=>r.x),[3,4]);
});
test('IS noun transformation changes type',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('ROCK IS FLAG',1,2),thing('rock',5,5),thing('baba',3,6)]);
 game.step(null);assert.equal(obj(game,'rock').length,0);assert.equal(obj(game,'flag').length,1);
});
test('IS SAME prevents conflicting conversion',()=>{
 const game=g([...words('ROCK IS ROCK',0,0),...words('ROCK IS FLAG',0,2),thing('rock',5,5)]);
 game.step(null);assert.equal(obj(game,'rock').length,1);assert.equal(obj(game,'flag').length,0);
});
test('YOU and WIN overlapping wins',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('FLAG IS WIN',0,2),thing('baba',5,5),thing('flag',6,5)]);
 game.step(1);assert(game.won);
});
test('BABA IS YOU AND WIN wins without another object',()=>{
 const game=g([...words('BABA IS YOU AND WIN',0,0),thing('baba',4,5)]);
 game.step(null);assert(game.won);
});
test('AND joins multiple subject types',()=>{
 const game=g([...words('BABA AND KEKE IS YOU',0,0),thing('baba',3,5),thing('keke',4,6)]);
 game.step(1);assert.equal(obj(game,'baba')[0].x,4);assert.equal(obj(game,'keke')[0].x,5);
});
test('ON condition only applies while stacked',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('BABA ON ROCK IS WIN',0,2),thing('baba',4,5),thing('rock',5,5)]);
 assert.equal(game.won,false);game.step(1);assert(game.won);
});
test('sink deletes itself and another object',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('WATER IS SINK',0,2),thing('baba',4,5),thing('water',5,5)]);
 game.step(1);assert.equal(obj(game,'baba').length,0);assert.equal(obj(game,'water').length,0);
});
test('DEFEAT deletes YOU, but not the skull',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('SKULL IS DEFEAT',0,2),thing('baba',4,5),thing('skull',5,5)]);
 game.step(1);assert.equal(obj(game,'baba').length,0);assert.equal(obj(game,'skull').length,1);
});
test('FLOAT avoids ordinary STOP and ordinary WIN',()=>{
 const game=g([...words('GHOST IS YOU',0,0),...words('GHOST IS FLOAT',0,2),...words('WALL IS STOP',0,4),thing('ghost',4,7),thing('wall',5,7)]);
 game.step(1);assert.equal(obj(game,'ghost')[0].x,5);
});
test('OPEN and SHUT annihilate',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('BABA IS OPEN',0,2),...words('DOOR IS SHUT',0,4),thing('baba',3,7),thing('door',4,7)]);
 game.step(1);assert.equal(obj(game,'baba').length,0);assert.equal(obj(game,'door').length,0);
});
test('HAS spawns something when the object is destroyed',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('BABA HAS KEY',0,2),...words('SKULL IS DEFEAT',0,4),thing('baba',3,7),thing('skull',4,7)]);
 game.step(1);assert.equal(obj(game,'baba').length,0);assert.equal(obj(game,'key').length,1);
});
test('MAKE spawns a unit at the source tile',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('BABA MAKE ROCK',0,2),thing('baba',4,7)]);
 game.step(null);assert.equal(obj(game,'rock').length,1);
});
test('MOVE advances a unit on every turn',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('KEKE IS MOVE',0,2),thing('keke',4,7,1),thing('baba',7,7)]);
 game.step(null);assert.equal(obj(game,'keke')[0].x,5);
});
test('TELE transfers a unit between portals',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('STAR IS TELE',0,2),thing('star',4,7),thing('star',9,7),thing('baba',3,7)]);
 game.step(1);assert.equal(obj(game,'baba')[0].x,9);
});
test('NOT PUSH suppresses default text push',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('TEXT IS NOT PUSH',0,2),thing('baba',4,7),...words('WALL',5,7)]);
 game.step(1);assert.equal(obj(game,'baba')[0].x,5);
});
test('standalone score and refresh stay consistent across turns',()=>{
 const game=new Game(levels[0]);for(let i=0;i<10;i++)game.step(i%4);
 assert.equal(game.turn,10);assert.equal(game.history.length,10);game.restart();assert.equal(game.turn,0);
});
test('level 02 requires breaking WALL IS STOP before walking through wall barrier',()=>{
 const game=new Game(levels[1]);
 assert.equal(game.has(game.at(8,8).find(o=>o.type==='wall'),'STOP'),true);
 // Bring BABA below STOP text at (3,3), then push it up.
 for(const dir of [1,0,0,0,0,0]) game.step(dir);
 assert(game.rules.every(r=>r.subject!=='WALL'||r.target!=='STOP'));
});
test('level 08 key can open locked door inside a one-tile corridor',()=>{
 const game=new Game(levels[7]);
 for(let i=0;i<8;i++)game.step(1);
 assert.equal(game.objs.filter(o=>o.type==='door').length,0);
 assert.equal(game.objs.filter(o=>o.type==='key').length,0);
});
test('level 20 creates independently controllable rock',()=>{
 const game=new Game(levels[19]);game.step(null);
 assert(game.objs.some(o=>o.type==='rock'&&game.has(o,'YOU')));
});
test('WORD lets an ordinary object act as its noun text in rule parsing',()=>{
 const game=g([...words('ROCK IS WORD',0,0),...words('BABA IS YOU',0,2),...words('IS WIN',6,7),thing('rock',5,7),thing('baba',4,7)]);
 assert(game.rules.some(r=>r.subject==='ROCK'&&r.target==='WIN'));
 assert(game.wordIds.has(obj(game,'rock')[0].id));
 assert(!game.has(obj(game,'rock')[0],'PUSH'),'WORD should not automatically confer PUSH');
 game.step(1);assert.equal(game.won,true);
});
test('WORD rule disappears when its originating text is dismantled',()=>{
 const game=g([...words('ROCK IS WORD',0,0),...words('IS WIN',6,6),thing('rock',5,6)]);
 assert(game.rules.some(r=>r.subject==='ROCK'&&r.target==='WIN'));
 game.objs=game.objs.filter(o=>o.y!==0);game.refresh();
 assert(!game.rules.some(r=>r.subject==='ROCK'&&r.target==='WIN'));
 assert.equal(game.wordIds.size,0);
});
test('WORD cannot self sustain through itself once its literal source vanishes',()=>{
 const game=g([...words('ROCK IS WORD',0,0),...words('IS WORD',6,6),thing('rock',5,6)]);
 assert.equal(game.wordIds.size,1);
 game.objs=game.objs.filter(o=>o.y!==0);game.refresh();
 assert.equal(game.wordIds.size,0);
});
test('IS NOT NOUN vetoes an otherwise valid noun transformation',()=>{
 const game=g([...words('ROCK IS FLAG',0,0),...words('ROCK IS NOT FLAG',0,2),thing('rock',8,7)]);
 game.step(null);assert.equal(obj(game,'rock').length,1);assert.equal(obj(game,'flag').length,0);
});
test('X IS NOT X destroys X rather than creating every other noun',()=>{
 const game=g([...words('ROCK IS NOT ROCK',0,0),thing('rock',8,7)]);
 game.step(null);assert.equal(obj(game,'rock').length,0);
});
test('NOT NOT cancels negation for properties',()=>{
 const game=g([...words('ROCK IS NOT NOT PUSH',0,0),thing('rock',8,7)]);
 assert(game.has(obj(game,'rock')[0],'PUSH'));
});
test('NOT noun applies to every other ordinary object',()=>{
 const game=g([...words('NOT ROCK IS WIN',0,0),thing('rock',8,7),thing('keke',7,7),thing('wall',6,7)]);
 assert(!game.has(obj(game,'rock')[0],'WIN'));
 assert(game.has(obj(game,'keke')[0],'WIN'));
 assert(game.has(obj(game,'wall')[0],'WIN'));
});
test('YOU2 can win against WIN overlap',()=>{
 const game=g([...words('BABA IS YOU2',0,0),...words('FLAG IS WIN',0,2),thing('baba',5,6),thing('flag',6,6)]);
 game.step(1);assert.equal(game.won,true);
});
test('DEFEAT also destroys YOU2 on overlap',()=>{
 const game=g([...words('BABA IS YOU2',0,0),...words('SKULL IS DEFEAT',0,2),thing('baba',5,6),thing('skull',6,6)]);
 game.step(1);assert.equal(obj(game,'baba').length,0);
});
test('WEAK + STOP target is enterable and disappears on overlap',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('WALL IS STOP',0,2),...words('WALL IS WEAK',0,4),thing('baba',6,7),thing('wall',7,7)]);
 game.step(1);assert.equal(obj(game,'baba')[0].x,7);assert.equal(obj(game,'wall').length,0);
});
test('WEAK controller colliding with solid STOP is destroyed',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('BABA IS WEAK',0,2),...words('WALL IS STOP',0,4),thing('baba',6,7),thing('wall',7,7)]);
 game.step(1);assert.equal(obj(game,'baba').length,0);
});
test('SWAP bypasses STOP and exchanges positions',()=>{
 const game=g([...words('BABA IS YOU',0,0),...words('BABA IS SWAP',0,2),...words('WALL IS STOP',0,4),thing('baba',6,7),thing('wall',7,7)]);
 game.step(1);assert.equal(obj(game,'baba')[0].x,7);assert.equal(obj(game,'wall')[0].x,6);
});
test('WEAK isolated on a tile survives empty turns',()=>{
 const game=g([...words('ROCK IS WEAK',0,0),thing('rock',6,7)]);
 game.step(null);assert.equal(obj(game,'rock').length,1);
});
test('YOU adjacent controlled push object moves only one square per input',()=>{
 const game=g([...words('BABA AND KEKE IS YOU',0,0),...words('KEKE IS PUSH',0,2),thing('baba',5,7),thing('keke',6,7)]);
 game.step(1);assert.equal(obj(game,'keke')[0].x,7);assert.equal(obj(game,'baba')[0].x,6);
});
test('direction properties set facing without causing automatic movement',()=>{
 const game=g([...words('BABA IS UP',0,0),thing('baba',5,7,1)]);
 game.step(null);assert.equal(obj(game,'baba')[0].dir,0);assert.equal(obj(game,'baba')[0].x,5);
});
test('negative property veto applies even to default TEXT PUSH',()=>{
 const game=g([...words('TEXT IS NOT PUSH',0,0),thing('text',6,7,1)]);
 const t=game.at(6,7)[0];t.word='WIN';game.refresh();assert(!game.has(t,'PUSH'));
});

test('21 WORD makes physical rock part of ROCK IS WIN and can win',()=>{
 const game=new Game(levels[20]);assert(game.rules.some(r=>r.subject==='ROCK'&&r.target==='WIN'));
 for(let i=0;i<6;i++)game.step(1);assert(game.won);
});
test('22 physical wall is blocked until NOT STOP is assembled',()=>{
 const game=new Game(levels[21]);assert(game.has(game.at(8,8)[0],'STOP'));
 game.step(0);game.step(0);
 assert(game.rules.some(r=>r.subject==='WALL'&&r.target==='STOP'&&r.targetNot));
 assert(!game.has(game.at(8,8)[0],'STOP'));
 for(let i=0;i<3;i++)game.step(2);
 for(let i=0;i<9;i++)game.step(1);assert(game.won);
});
test('23 WALL IS NOT WALL deletes icon walls but not their text tiles',()=>{
 const game=new Game(levels[22]);assert(game.objs.some(o=>o.type==='wall'));
 game.step(0);game.step(0);
 assert.equal(game.objs.filter(o=>o.type==='wall').length,0);
 assert(game.objs.some(o=>o.type==='text'&&o.word==='WALL'));
 for(let i=0;i<4;i++)game.step(2);
 for(let i=0;i<9;i++)game.step(1);assert(game.won);
});
test('24 SWAP tile must be inserted to exchange with STOP walls',()=>{
 const game=new Game(levels[23]);assert(!game.has(obj(game,'baba')[0],'SWAP'));
 game.step(0);game.step(0);assert(game.has(obj(game,'baba')[0],'SWAP'));
 for(let i=0;i<3;i++)game.step(2);
 for(let i=0;i<9;i++)game.step(1);assert(game.won);
});
test('25 WEAK STOP wall is consumed when player steps into it',()=>{
 const game=new Game(levels[24]);assert(game.at(8,8).some(o=>o.type==='wall'));
 for(let i=0;i<11;i++)game.step(1);
 assert(!game.at(8,8).some(o=>o.type==='wall'));assert(game.won);
});

console.log(`\n${passed} tests passed`);
