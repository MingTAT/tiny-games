function O(noun,x,y,dir='right'){ return {type:'object',noun,x,y,dir}; }
function W(word,kind,x,y){ return {type:'word',word,kind,x,y}; }
function V(noun,x,y0,y1){ const a=[]; for(let y=y0;y<=y1;y++) a.push(O(noun,x,y)); return a; }
function H(noun,y,x0,x1){ const a=[]; for(let x=x0;x<=x1;x++) a.push(O(noun,x,y)); return a; }

const LEVELS = [
  // WORLD 1 — PLEASE DO NOT TOUCH THE GRAMMAR
  {
    id:1, world:1, chapter:'PLEASE DO NOT TOUCH THE GRAMMAR',
    title:'The Wall Is Only a Sentence', mechanic:'BREAK A RULE',
    hint:'The wall is impossible only while STOP remains attached to it.',
    width:9,height:7,
    entities:[
      O('PLAYER',1,5), O('FLAG',7,5),
      ...V('WALL',4,0,6),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('FLAG','noun',6,0),W('IS','op',7,0),W('WIN','prop',8,0),
      W('WALL','noun',0,2),W('IS','op',1,2),W('STOP','prop',2,2)
    ]
  },
  {
    id:2, world:1, chapter:'PLEASE DO NOT TOUCH THE GRAMMAR',
    title:'Victory Pending Approval', mechanic:'CREATE WIN',
    hint:'The flag is merely decorative until the sentence is completed.',
    width:9,height:7,
    entities:[
      O('PLAYER',1,5), O('FLAG',7,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('FLAG','noun',5,1),W('IS','op',6,1),
      W('WIN','prop',7,4)
    ]
  },
  {
    id:3, world:1, chapter:'PLEASE DO NOT TOUCH THE GRAMMAR',
    title:'Push Permit Required', mechanic:'CREATE PUSH WITHOUT LOSING STOP',
    hint:'The rock must stay solid and become movable. One property is not enough.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5), O('ROCK',5,5), O('FLAG',8,5),
      ...V('WALL',5,0,4), ...V('WALL',5,6,6),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',6,0),W('IS','op',7,0),W('STOP','prop',8,0),
      W('ROCK','noun',0,2),W('IS','op',1,2),W('STOP','prop',2,2),
      W('AND','and',3,4),W('PUSH','prop',4,4),
      W('FLAG','noun',7,1),W('IS','op',8,1),W('WIN','prop',9,1)
    ]
  },
  {
    id:4, world:1, chapter:'PLEASE DO NOT TOUCH THE GRAMMAR',
    title:'Wrong Winner', mechanic:'MOVE WIN',
    hint:'The existing WIN belongs to something you cannot reach. Reassign it.',
    width:9,height:7,
    entities:[
      O('PLAYER',1,5), O('FLAG',7,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('ROCK','noun',4,1),W('IS','op',5,1),W('WIN','prop',6,1),
      W('FLAG','noun',4,3),W('IS','op',5,3)
    ]
  },
  {
    id:5, world:1, chapter:'PLEASE DO NOT TOUCH THE GRAMMAR',
    title:'And Also…', mechanic:'AND ON THE RIGHT',
    hint:'Put WIN in position first. If you attach AND too early, nobody will be YOU.',
    width:8,height:7,
    entities:[
      O('PLAYER',2,5),
      W('PLAYER','noun',0,1),W('IS','op',1,1),W('YOU','prop',2,1),
      W('AND','and',3,4),W('WIN','prop',4,4)
    ]
  },
  {
    id:6, world:1, chapter:'PLEASE DO NOT TOUCH THE GRAMMAR',
    title:'Grammar Inspection', mechanic:'BUILD PUSH + BUILD WIN',
    hint:'One rock seals the only corridor. The exit is not a goal yet.',
    width:11,height:8,
    entities:[
      O('PLAYER',1,6), O('ROCK',5,6), O('FLAG',9,6),
      ...V('WALL',5,0,5), ...V('WALL',5,7,7),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',6,0),W('IS','op',7,0),W('STOP','prop',8,0),
      W('ROCK','noun',0,2),W('IS','op',1,2),W('STOP','prop',2,2),
      W('AND','and',3,3),W('PUSH','prop',4,3),
      W('FLAG','noun',0,4),W('IS','op',1,4),
      W('WIN','prop',2,5)
    ]
  },

  // WORLD 2 — YOU ARE NOT WHO HR SAID YOU ARE
  {
    id:7, world:2, chapter:'YOU ARE NOT WHO HR SAID YOU ARE',
    title:'Department of Wall Promotions', mechanic:'BREAK STOP → TRANSFER YOU',
    hint:'The entire wall wants a new job, but the stone barricade on the other side still has a STOP certificate. Revoke it first.',
    width:9,height:7,
    entities:[
      O('PLAYER',1,5), O('FLAG',7,5),
      ...V('WALL',6,0,6), ...V('ROCK',7,0,6),
      W('WALL','noun',2,1),W('IS','op',2,2),
      W('PLAYER','noun',0,4),W('IS','op',1,4),W('YOU','prop',2,4),
      W('ROCK','noun',3,3),W('IS','op',4,3),W('STOP','prop',5,3),
      W('WALL','noun',3,0),W('IS','op',4,0),W('STOP','prop',5,0),
      W('FLAG','noun',6,1),W('IS','op',7,1),W('WIN','prop',8,1)
    ]
  },
  {
    id:8, world:2, chapter:'YOU ARE NOT WHO HR SAID YOU ARE',
    title:'Duplicate Employee', mechanic:'MULTIPLE YOU',
    hint:'Keep PLAYER IS YOU. Create ROCK IS YOU on the other side of the wall.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5),O('ROCK',6,5),O('FLAG',8,5),
      ...V('WALL',4,0,6),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('ROCK','noun',0,2),W('IS','op',1,2),
      W('YOU','prop',2,4),
      W('WALL','noun',5,0),W('IS','op',6,0),W('STOP','prop',7,0),
      W('FLAG','noun',6,1),W('IS','op',7,1),W('WIN','prop',8,1)
    ]
  },
  {
    id:9, world:2, chapter:'YOU ARE NOT WHO HR SAID YOU ARE',
    title:'A Very Efficient Restructuring', mechanic:'PUSH CHAIN → TWO RULES',
    hint:'The paperwork forms a queue. Moving the words in the correct order can both hire a rock and authorize the flag.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5),O('ROCK',7,5),O('FLAG',8,5),
      ...V('WALL',5,0,6),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',5,0),W('IS','op',6,0),W('STOP','prop',7,0),
      W('FLAG','noun',0,2),W('IS','op',1,2),
      W('ROCK','noun',0,3),W('IS','op',1,3),
      W('WIN','prop',2,4),W('PLAYER','noun',2,5)
    ]
  },
  {
    id:10, world:2, chapter:'YOU ARE NOT WHO HR SAID YOU ARE',
    title:'The Flag Has Been Reassigned', mechanic:'TRANSFORM + INHERIT',
    hint:'ROCK is already WIN. Make the unreachable flag become ROCK.',
    width:9,height:7,
    entities:[
      O('PLAYER',1,5),O('FLAG',7,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('ROCK','noun',0,2),W('IS','op',1,2),W('WIN','prop',2,2),
      W('FLAG','noun',4,1),W('IS','op',5,1),
      W('ROCK','noun',6,4)
    ]
  },
  {
    id:11, world:2, chapter:'YOU ARE NOT WHO HR SAID YOU ARE',
    title:'Mass Restructuring', mechanic:'TRANSFORM A BARRIER',
    hint:'The wall cannot be crossed. It does not have to remain a wall.',
    width:11,height:8,
    entities:[
      O('PLAYER',1,6),O('FLAG',9,6),
      ...V('WALL',5,0,7),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',6,0),W('IS','op',7,0),W('STOP','prop',8,0),
      W('ROCK','noun',0,2),W('IS','op',1,2),W('PUSH','prop',2,2),
      W('WALL','noun',0,4),W('IS','op',1,4),
      W('ROCK','noun',2,6),
      W('FLAG','noun',8,1),W('IS','op',9,1),W('WIN','prop',10,1)
    ]
  },
  {
    id:12, world:2, chapter:'YOU ARE NOT WHO HR SAID YOU ARE',
    title:'HR Has Lost Control of the Situation', mechanic:'CHAIN IDENTITY',
    hint:'Recruit the rock as PLAYER. Use it to recruit every WALL as PLAYER.',
    width:13,height:7,
    entities:[
      O('PLAYER',1,5),O('ROCK',6,5),O('FLAG',11,5),
      ...V('WALL',4,0,6),...V('WALL',8,0,6),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('ROCK','noun',0,2),W('IS','op',1,2),W('PLAYER','noun',2,4),
      W('WALL','noun',5,1),W('IS','op',6,1),W('PLAYER','noun',7,3),
      W('WALL','noun',9,0),W('IS','op',10,0),W('STOP','prop',11,0),
      W('FLAG','noun',10,1),W('IS','op',11,1),W('WIN','prop',12,1)
    ]
  },
  {
    id:13, world:3, chapter:'WINNING IS A TEMPORARY CONDITION',
    title:'No Winner Assigned', mechanic:'CREATE WIN',
    hint:'Nothing in the room is currently a goal.',
    width:9,height:7,
    entities:[
      O('PLAYER',1,5),O('FLAG',7,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('FLAG','noun',4,1),W('IS','op',5,1),
      W('WIN','prop',6,4)
    ]
  },
  {
    id:14, world:3, chapter:'WINNING IS A TEMPORARY CONDITION',
    title:'You Are the Prize', mechanic:'YOU AND WIN',
    hint:'There is no flag. Make the controlled thing satisfy both properties.',
    width:8,height:7,
    entities:[
      O('PLAYER',2,5),
      W('PLAYER','noun',0,1),W('IS','op',1,1),W('YOU','prop',2,1),
      W('AND','and',3,4),W('WIN','prop',4,4)
    ]
  },
  {
    id:15, world:3, chapter:'WINNING IS A TEMPORARY CONDITION',
    title:'The Wall Won', mechanic:'OBSTACLE → GOAL',
    hint:'First remove STOP from WALL IS STOP. Then put WIN in exactly that place.',
    width:9,height:7,
    entities:[
      O('PLAYER',1,5),O('WALL',6,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',0,2),W('IS','op',1,2),W('STOP','prop',2,2),
      W('WIN','prop',2,4)
    ]
  },
  {
    id:16, world:3, chapter:'WINNING IS A TEMPORARY CONDITION',
    title:'Winning Somewhere Else', mechanic:'TRANSFER WIN',
    hint:'The flag is sealed away. The rock is not.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5),O('ROCK',5,5),O('FLAG',8,2),
      ...V('WALL',7,0,6),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',4,0),W('IS','op',5,0),W('STOP','prop',6,0),
      W('FLAG','noun',0,2),W('IS','op',1,2),W('WIN','prop',2,2),
      W('ROCK','noun',0,4),W('IS','op',1,4)
    ]
  },
  {
    id:17, world:3, chapter:'WINNING IS A TEMPORARY CONDITION',
    title:'The Door Does Not Know the Key', mechanic:'OPEN / SHUT',
    hint:'The key can move. It cannot open anything until you say so.',
    width:11,height:7,
    entities:[
      O('PLAYER',1,5),O('KEY',3,5),O('DOOR',6,5),O('FLAG',9,5),
      ...V('WALL',6,0,4),...V('WALL',6,6,6),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('KEY','noun',0,2),W('IS','op',1,2),W('PUSH','prop',2,2),
      W('KEY','noun',3,3),W('IS','op',4,3),
      W('OPEN','prop',5,5),
      W('WALL','noun',7,4),W('IS','op',8,4),W('STOP','prop',9,4),
      W('DOOR','noun',6,0),W('IS','op',7,0),W('SHUT','prop',8,0),
      W('DOOR','noun',6,1),W('IS','op',7,1),W('STOP','prop',8,1),
      W('FLAG','noun',8,2),W('IS','op',9,2),W('WIN','prop',10,2)
    ]
  },
  {
    id:18, world:3, chapter:'WINNING IS A TEMPORARY CONDITION',
    title:'Victory Services Are Unavailable', mechanic:'BREAK WIN · REASSIGN WIN',
    hint:'The original winner cannot be reached. Physically remove WIN and attach it to ROCK IS.',
    width:11,height:8,
    entities:[
      O('PLAYER',1,6),O('ROCK',7,6),O('FLAG',9,2),
      ...V('WALL',8,0,7),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',6,0),W('IS','op',7,0),W('STOP','prop',8,0),
      W('ROCK','noun',3,2),W('IS','op',4,2),
      W('FLAG','noun',3,4),W('IS','op',4,4),W('WIN','prop',5,4)
    ]
  },
  {
    id:19, world:4, chapter:'OBJECTS HAVE FILED A COMPLAINT',
    title:'Terms and Conditions Apply', mechanic:'ON',
    hint:'Complete PLAYER ON WATER IS WIN. Then make the condition true.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5),O('WATER',8,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('PLAYER','noun',3,1),W('ON','rel',4,1),W('WATER','noun',5,1),W('IS','op',6,1),
      W('WIN','prop',7,4)
    ]
  },
  {
    id:20, world:4, chapter:'OBJECTS HAVE FILED A COMPLAINT',
    title:'Personal Space', mechanic:'NEAR',
    hint:'Winning can be a relationship rather than a collision.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5),O('FLAG',7,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('PLAYER','noun',3,1),W('NEAR','rel',4,1),W('FLAG','noun',5,1),W('IS','op',6,1),
      W('WIN','prop',7,3)
    ]
  },
  {
    id:21, world:4, chapter:'OBJECTS HAVE FILED A COMPLAINT',
    title:'Please Face the Problem', mechanic:'FACING',
    hint:'The rule checks the direction you are facing. Walking into a STOP object still changes your facing.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5),O('WALL',7,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',6,0),W('IS','op',7,0),W('STOP','prop',8,0),
      W('PLAYER','noun',2,2),W('FACING','rel',3,2),W('WALL','noun',4,2),W('IS','op',5,2),
      W('WIN','prop',6,4)
    ]
  },
  {
    id:22, world:4, chapter:'OBJECTS HAVE FILED A COMPLAINT',
    title:'What Was Inside the Box?', mechanic:'HAS + WEAK',
    hint:'Make CRATE HAS KEY. The crate is weak enough to open by walking into it.',
    width:12,height:8,
    entities:[
      O('PLAYER',1,6),O('CRATE',4,6),O('DOOR',8,6),O('FLAG',10,6),
      ...V('WALL',8,0,5),...V('WALL',8,7,7),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('CRATE','noun',0,2),W('IS','op',1,2),W('WEAK','prop',2,2),
      W('CRATE','noun',3,1),W('HAS','op',4,1),
      W('KEY','noun',5,3),
      W('KEY','noun',0,4),W('IS','op',1,4),W('PUSH','prop',2,4),W('AND','and',3,4),W('OPEN','prop',4,4),
      W('DOOR','noun',6,0),W('IS','op',7,0),W('SHUT','prop',8,0),W('AND','and',9,0),W('STOP','prop',10,0),
      W('FLAG','noun',9,2),W('IS','op',10,2),W('WIN','prop',11,2),
      W('WALL','noun',9,4),W('IS','op',10,4),W('STOP','prop',11,4)
    ]
  },
  {
    id:23, world:4, chapter:'OBJECTS HAVE FILED A COMPLAINT',
    title:'Unauthorized Manufacturing', mechanic:'MAKE',
    hint:'ROCK is already WIN. Complete PLAYER MAKE ROCK.',
    width:9,height:7,
    entities:[
      O('PLAYER',2,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('ROCK','noun',0,2),W('IS','op',1,2),W('WIN','prop',2,2),
      W('PLAYER','noun',4,1),W('MAKE','op',5,1),
      W('ROCK','noun',6,4)
    ]
  },
  {
    id:24, world:4, chapter:'OBJECTS HAVE FILED A COMPLAINT',
    title:'The Objects Are Moving Without Permission', mechanic:'MOVE',
    hint:'You cannot cross the water. The flag can. Give it MOVE and let it come to you.',
    width:12,height:7,
    entities:[
      O('PLAYER',2,5),O('FLAG',9,5,'left'),
      ...V('WATER',6,0,6),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WATER','noun',6,0),W('IS','op',7,0),W('DEFEAT','prop',8,0),
      W('FLAG','noun',9,1),W('IS','op',10,1),W('WIN','prop',11,1),
      W('FLAG','noun',0,2),W('IS','op',1,2),
      W('MOVE','prop',2,4)
    ]
  },

  // WORLD 5 — THE RULEBOOK HAS ESCAPED
  {
    id:25, world:5, chapter:'THE RULEBOOK HAS ESCAPED',
    title:'Words Count as Things', mechanic:'TEXT AS A NOUN',
    hint:'Complete PLAYER NEAR TEXT IS WIN. The paperwork is now part of the physics.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('PLAYER','noun',3,2),W('NEAR','rel',4,2),W('TEXT','noun',5,2),W('IS','op',6,2),
      W('WIN','prop',7,5)
    ]
  },
  {
    id:26, world:5, chapter:'THE RULEBOOK HAS ESCAPED',
    title:'Documentation Has Become Self-Aware', mechanic:'TEXT IS YOU → MOVE THE TEXT',
    hint:'TEXT IS YOU is only the beginning. The human cannot cross the barrier, but a letter on the other side can.',
    width:12,height:8,
    entities:[
      O('PLAYER',1,6),O('FLAG',10,5),
      ...V('WALL',6,0,7),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',0,1),W('IS','op',1,1),W('STOP','prop',2,1),
      W('FLAG','noun',7,0),W('IS','op',8,0),W('WIN','prop',9,0),
      W('TEXT','noun',1,2),W('IS','op',2,2),W('YOU','prop',3,5),
      W('ROCK','noun',9,5)
    ]
  },
  {
    id:27, world:5, chapter:'THE RULEBOOK HAS ESCAPED',
    title:'The Sentence Walked Away', mechanic:'TEXT IS MOVE',
    hint:'TEXT is WIN. Complete TEXT IS MOVE, then let the paperwork come to you.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5),
      {...W('PLAYER','noun',6,0),dir:'left'},{...W('IS','op',7,0),dir:'left'},{...W('YOU','prop',8,0),dir:'left'},
      {...W('TEXT','noun',6,1),dir:'left'},{...W('IS','op',7,1),dir:'left'},{...W('WIN','prop',8,1),dir:'left'},
      {...W('TEXT','noun',3,2),dir:'left'},{...W('IS','op',4,2),dir:'left'},
      {...W('MOVE','prop',5,4),dir:'left'},
      {...W('ROCK','noun',8,5),dir:'left'}
    ]
  },
  {
    id:28, world:5, chapter:'THE RULEBOOK HAS ESCAPED',
    title:'Nobody Is Here', mechanic:'EMPTY IS WIN',
    hint:'Complete EMPTY IS WIN. Apparently absence now qualifies as a destination.',
    width:9,height:7,
    entities:[
      O('PLAYER',1,5),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('EMPTY','noun',2,2),W('IS','op',3,2),
      W('WIN','prop',4,5)
    ]
  },
  {
    id:29, world:5, chapter:'THE RULEBOOK HAS ESCAPED',
    title:'The Room Has Been Promoted', mechanic:'REVOKE STOP → LEVEL IS WIN',
    hint:'The missing WIN is on probation behind stone. Cancel ROCK IS STOP before granting the entire LEVEL the right to win.',
    width:10,height:7,
    entities:[
      O('PLAYER',1,5),O('FLAG',8,5),
      ...V('WALL',7,0,6), O('ROCK',5,2),O('ROCK',5,3),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',4,0),W('IS','op',5,0),W('STOP','prop',6,0),
      W('ROCK','noun',0,3),W('IS','op',1,3),W('STOP','prop',2,3),
      W('LEVEL','noun',3,1),W('IS','op',4,1),
      W('FLAG','noun',3,4),W('IS','op',4,4),W('WIN','prop',5,4)
    ]
  },
  {
    id:30, world:5, chapter:'THE RULEBOOK HAS ESCAPED',
    title:'RULE IS WORLD', mechanic:'REVOKE STOP → TEXT IS YOU → LEVEL IS WIN',
    hint:'Revoke the rock’s STOP privilege first. Your human body cannot cross the wall; the moving words must carry WIN through to LEVEL IS.',
    width:10,height:8,
    entities:[
      O('PLAYER',1,6), O('ROCK',8,3),
      ...V('WALL',7,0,7),
      W('PLAYER','noun',0,0),W('IS','op',1,0),W('YOU','prop',2,0),
      W('WALL','noun',0,1),W('IS','op',1,1),W('STOP','prop',2,1),
      W('ROCK','noun',3,2),W('IS','op',4,2),W('STOP','prop',5,2),
      W('TEXT','noun',1,5),W('IS','op',2,5),W('YOU','prop',5,5),
      W('LEVEL','noun',8,0),W('IS','op',8,1),W('WIN','prop',8,5)
    ]
  }
];

if (typeof module !== 'undefined') module.exports = {LEVELS};
