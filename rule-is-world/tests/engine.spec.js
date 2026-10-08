const assert = require('node:assert/strict');
const {RuleWorldEngine} = require('../engine.js');

const O=(noun,x,y)=>({type:'object',noun,x,y,dir:'right'});
const W=(word,kind,x,y)=>({type:'word',word,kind,x,y});
const row=(subject,operator,predicate,y)=>[
  W(subject,'noun',0,y),W(operator,'op',1,y),W(predicate,predicate==='PUSH'||predicate==='YOU'||predicate==='STOP'?'prop':'noun',2,y)
];
const fixture=(objects, rules, width=7, height=6)=>({width,height,entities:[...objects,...rules]});
const position = (e,noun)=>e.entities.filter(x=>x.type==='object' && x.noun===noun).map(x=>`${x.x},${x.y}`).sort();

// An overlapping STOP and PUSH entity used to cause a partial push: the PUSH
// would move, then the STOP would reject entry into the very same tile.
{
  const e=new RuleWorldEngine(fixture(
    [O('PLAYER',0,4),O('ROCK',1,4),O('WALL',1,4)],
    [...row('PLAYER','IS','YOU',0),...row('ROCK','IS','PUSH',1),...row('WALL','IS','STOP',2)]));
  const before=e.stateKey();
  assert.equal(e.movePlayer(1,0),true);
  assert.deepEqual(position(e,'ROCK'),['1,4'],'failed push left moved ROCK');
  assert.deepEqual(position(e,'PLAYER'),['0,4']);
  assert.deepEqual(position(e,'WALL'),['1,4']);
  assert.equal(e.undo(),true);
  assert.equal(e.stateKey(),before,'undo not exact');
  console.log('PASS · atomic push rejection and exact undo');
}

// Multiple YOU objects must advance once each even if one is also PUSH.
{
  const e=new RuleWorldEngine(fixture(
    [O('PLAYER',1,4),O('ROCK',2,4)],
    [...row('PLAYER','IS','YOU',0),...row('ROCK','IS','YOU',1),...row('ROCK','IS','PUSH',2)]));
  e.movePlayer(1,0);
  assert.deepEqual(position(e,'PLAYER'),['2,4']);
  assert.deepEqual(position(e,'ROCK'),['3,4']);
  console.log('PASS · multiple YOU, no double movement');
}

// Pushing a rule away changes the syntax; undo must restore the sentence,
// active highlighted words and the world itself.
{
  const e=new RuleWorldEngine(fixture(
    [O('PLAYER',2,3)], [...row('PLAYER','IS','YOU',0),...row('ROCK','IS','PUSH',2)],7,5));
  // The PLAYER approaches the PUSH word at (2,2) from below.
  assert.equal(e.rules.length,2);
  const before=e.stateKey();
  e.movePlayer(0,-1);
  assert.equal(e.rules.some(r=>r.property==='PUSH'),false);
  assert.equal(e.lastRuleEvent.removed.some(r=>r.property==='PUSH'),true);
  e.undo();
  assert.equal(e.stateKey(),before);
  assert.equal(e.rules.some(r=>r.property==='PUSH'),true);
  assert.equal(e.activeWordIds.size,6);
  console.log('PASS · rule diff, active sentence and undo');
}

// A blocked movement still changes orientation: necessary for FACING puzzles.
{
  const e=new RuleWorldEngine(fixture(
    [O('PLAYER',1,4),O('WALL',2,4)],
    [...row('PLAYER','IS','YOU',0),...row('WALL','IS','STOP',1)]));
  const p=e.entities.find(x=>x.noun==='PLAYER');p.dir='up';
  e.movePlayer(1,0);
  assert.deepEqual(position(e,'PLAYER'),['1,4']);
  assert.equal(p.dir,'right');
  e.undo();
  assert.equal(e.entities.find(x=>x.noun==='PLAYER').dir,'up');
  console.log('PASS · blocked FACING + undo orientation');
}

// Cyclic noun transformations must terminate deterministically.
{
  const e=new RuleWorldEngine(fixture(
    [O('ROCK',3,4)],
    [W('ROCK','noun',0,0),W('IS','op',1,0),W('PLAYER','noun',2,0),
     W('PLAYER','noun',0,1),W('IS','op',1,1),W('ROCK','noun',2,1)]));
  assert.equal(e.entities.find(x=>x.type==='object').noun,'ROCK');
  e.settle(false,{allowMake:false});
  assert.equal(e.entities.find(x=>x.type==='object').noun,'ROCK');
  console.log('PASS · cyclic transformation stable');
}

console.log('5 additional engine checks passed.');
