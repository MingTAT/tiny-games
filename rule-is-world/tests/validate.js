const {LEVELS}=require('../levels.js');
const {RuleWorldEngine}=require('../engine.js');
const MOVE={R:[1,0],L:[-1,0],U:[0,-1],D:[0,1]};
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];

// Known-good regression routes. These are intentionally not shown in the game UI.
const SOLUTIONS={
  1:'RRUUUULDRRRRRDDD',2:'RRRRRRUUUDDD',3:'RUUURRDDDRRRR',4:'RRRUUURRRDDD',5:'RUUUDDDRUUU',6:'RUUUDRRDDR',
  7:'RRRRUUDDLLLUR',8:'RUURR',9:'DRUUR',10:'RRRRRUUURDDD',11:'DRUURRRDRRDRR',12:'RUURUUURRRD',
  13:'RRRRRUUURDDD',14:'RUUUDDDRUUU',15:'RUURRRRDD',16:'LUURRRRRDD',17:'DRRRRUUDDLLLURRRRRRR',18:'RRRRUUURRDDD',
  19:'RRRRRRUUURDDD',20:'RRRRRRUUUDD',21:'RRRRRUURD',22:'URRRRUUUDDDDLULDRRRRRRR',23:'RRRRUUU',24:'UURRDD',
  25:'DRRRRRRUUU',26:'RRUUUR',27:'RRRRUU',28:'DRRRUUU',29:'RUUDDRRRUUU',30:'RRRUUUUDDRRDLLUUU'
};

let failures=0;
for(const level of LEVELS){
  const engine=new RuleWorldEngine(level);
  const initial=engine.ruleSignature();
  const route=SOLUTIONS[level.id];
  if(!route){console.error(`Missing regression route for L${level.id}`);failures++;continue;}
  for(const c of route){
    if(engine.won) break;
    engine.movePlayer(...MOVE[c]);
  }
  const changed=engine.ruleSignature()!==initial || engine.changedRules;
  const ok=engine.won && changed;
  console.log(`L${String(level.id).padStart(2,'0')} ${ok?'PASS':'FAIL'} · ${level.mechanic} · ${engine.steps} turns`);
  if(!ok) failures++;
}

// Multi-stage narrative regression: the revised rooms must enact their
// intended *sequence*, not merely eventually display a victory overlay.
const SEQUENCE_CHECKS = {
  7: [
    [0, e => e.nounHasUnconditionalProperty('ROCK','STOP'), 'ROCK initially blocks the wall'],
    [6, e => !e.nounHasUnconditionalProperty('ROCK','STOP'), 'ROCK STOP is revoked first'],
    [12, e => e.metaHasProperty('WALL','YOU') && !e.metaHasProperty('PLAYER','YOU'), 'control transfers to WALL'],
  ],
  9: [
    [3, e => e.metaHasProperty('ROCK','WIN') && !e.metaHasProperty('FLAG','WIN'), 'temporary false victory'],
    [4, e => e.rules.some(r => r.type==='transform'&&r.subjects.includes('ROCK')&&r.target==='PLAYER') && e.metaHasProperty('FLAG','WIN'), 'noun transform and target rule activate together']
  ],
  26: [
    [5, e => e.metaHasProperty('TEXT','YOU') && !e.won, 'TEXT is controlled before winning'],
    [6, e => e.won && e.metaHasProperty('FLAG','WIN'), 'controlled word reaches flag']
  ],
  29: [
    [0, e => e.metaHasProperty('ROCK','STOP'), 'ROCK STOP initially holds'],
    [3, e => !e.metaHasProperty('ROCK','STOP'), 'revoke STOP before WIN can move'],
    [11, e => e.metaHasProperty('LEVEL','WIN') && e.won, 'promote LEVEL after revocation']
  ],
  30: [
    [0, e => e.metaHasProperty('ROCK','STOP'), 'stone clearance is initially denied'],
    [7, e => !e.metaHasProperty('ROCK','STOP'), 'revoke STOP before handing over control'],
    [14, e => e.metaHasProperty('TEXT','YOU') && !e.won, 'transfer agency to TEXT'],
    [17, e => e.metaHasProperty('LEVEL','WIN') && e.won, 'TEXT completes the final rule']
  ]
};
for(const [key,expectations] of Object.entries(SEQUENCE_CHECKS)){
  const id=Number(key),level=LEVELS.find(l=>l.id===id);
  const e=new RuleWorldEngine(level);
  let turn=0;
  for(const [at,assertion,description] of expectations){
    while(turn<at){e.movePlayer(...MOVE[SOLUTIONS[id][turn]]);turn++;}
    if(!assertion(e)){console.error(`L${id} SEQUENCE FAIL at ${at}: ${description}`);failures++;}
  }
}
console.log('Narrative milestones checked: L07, L09, L26, L29, L30.');

// Feature-presence checks.
const requiredWords=['ON','NEAR','FACING','HAS','MAKE','MOVE','OPEN','SHUT','AND','TEXT','EMPTY','LEVEL'];
const words=new Set(LEVELS.flatMap(l=>l.entities.filter(e=>e.type==='word').map(e=>e.word)));
for(const word of requiredWords){
  if(!words.has(word)){console.error(`Missing campaign mechanic: ${word}`);failures++;}
}

// Meta-engine checks from the actual World 5 solutions.
function solvedEngine(id){
  const level=LEVELS.find(l=>l.id===id); const e=new RuleWorldEngine(level);
  for(const c of SOLUTIONS[id]){if(e.won)break;e.movePlayer(...MOVE[c]);}
  return e;
}
const e25=solvedEngine(25);
if(!e25.rules.some(r=>r.type==='property'&&r.subjects.includes('PLAYER')&&r.condition?.relation==='NEAR'&&r.condition.targets.includes('TEXT')&&r.property==='WIN')){
  console.error('L25 failed TEXT relation regression'); failures++;
}
const e26=solvedEngine(26);
if(!e26.metaHasProperty('TEXT','YOU')||!e26.metaHasProperty('FLAG','WIN')||e26.metaHasProperty('TEXT','WIN')){console.error('L26 failed TEXT control regression');failures++;}
const e28=solvedEngine(28);
if(!e28.metaHasProperty('EMPTY','WIN')){console.error('L28 failed EMPTY regression');failures++;}
const e29=solvedEngine(29);
if(!e29.metaHasProperty('LEVEL','WIN')){console.error('L29 failed LEVEL regression');failures++;}
const e30=solvedEngine(30);
if(!e30.metaHasProperty('TEXT','YOU')||!e30.metaHasProperty('LEVEL','WIN')){console.error('L30 failed final meta chain');failures++;}

// Design guard: with word blocks frozen in place, no room should be solvable.
function frozenCanWin(level,maxDepth){
  const start=new RuleWorldEngine(level);
  const queue=[{snap:start.snapshot(),depth:0}];
  const seen=new Set([start.stateKey()]);

  while(queue.length){
    const {snap,depth}=queue.shift();
    if(depth>=maxDepth) continue;
    for(const [dx,dy] of DIRS){
      const e=new RuleWorldEngine(level); e.restore(snap);
      const basePush=e.isPushable.bind(e), baseStop=e.isStop.bind(e), baseYou=e.isYou.bind(e);
      e.isPushable=ent=>ent.type==='word'?false:basePush(ent);
      e.isStop=ent=>ent.type==='word'?true:baseStop(ent);
      e.isYou=ent=>ent.type==='word'?false:baseYou(ent);
      e.movePlayer(dx,dy);
      if(e.won) return true;
      const key=e.stateKey();
      if(!seen.has(key)){seen.add(key);queue.push({snap:e.snapshot(),depth:depth+1});}
    }
  }
  return false;
}

for(const level of LEVELS){
  const maxDepth=Math.min((SOLUTIONS[level.id]||'').length+4,28);
  if(frozenCanWin(level,maxDepth)){
    console.error(`L${level.id} DESIGN FAIL · winnable with frozen text`); failures++;
  }
}

if(failures) process.exit(1);
console.log(`\n${LEVELS.length} campaign rooms validated.`);
console.log('Meta rules validated: TEXT / EMPTY / LEVEL.');
console.log('Design guard passed: no room is solvable with frozen text within its regression horizon.');
