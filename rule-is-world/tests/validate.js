const {LEVELS}=require('../levels.js');
const {RuleWorldEngine}=require('../engine.js');
const MOVE={R:[1,0],L:[-1,0],U:[0,-1],D:[0,1]};

// Known-good regression routes. They are deliberately not exposed by the game UI.
const SOLUTIONS={
  1:'RRUUUULDRRRRRDDD',2:'RRRRRRUUUDDD',3:'RUUURRDDDRRRR',4:'RRRUUURRRDDD',5:'RUUUDDDRUUU',6:'RUUUDRRDDR',
  7:'RUR',8:'RUURR',9:'RUUR',10:'RRRRRUUURDDD',11:'DRUURRRDRRDRR',12:'RUURUUURRRD',
  13:'RRRRRUUURDDD',14:'RUUUDDDRUUU',15:'RUURRRRDD',16:'LUURRRRRDD',17:'DRRRRUUDDLLLURRRRRRR',18:'RRRRUUURRDDD',
  19:'RRRRRRUUURDDD',20:'RRRRRRUUUDD',21:'RRRRRUURD',22:'URRRRUUUDDDDLULDRRRRRRR',23:'RRRRUUU',24:'UURRDD'
};

let failures=0;
for(const level of LEVELS){
  const engine=new RuleWorldEngine(level);
  const initial=engine.ruleSignature();
  for(const c of SOLUTIONS[level.id]){
    if(engine.won) break;
    engine.movePlayer(...MOVE[c]);
  }
  const changed=engine.ruleSignature()!==initial || engine.changedRules;
  const ok=engine.won && changed;
  console.log(`L${String(level.id).padStart(2,'0')} ${ok?'PASS':'FAIL'} · ${level.mechanic} · ${engine.steps} turns`);
  if(!ok) failures++;
}

// Feature-presence regression checks.
const requiredWords=['ON','NEAR','FACING','HAS','MAKE','MOVE','OPEN','SHUT','AND'];
const words=new Set(LEVELS.flatMap(l=>l.entities.filter(e=>e.type==='word').map(e=>e.word)));
for(const word of requiredWords){
  if(!words.has(word)){console.error(`Missing campaign mechanic: ${word}`);failures++;}
}

if(failures) process.exit(1);
console.log(`\n${LEVELS.length} campaign rooms validated.`);
