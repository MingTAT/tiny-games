const TILE_TYPES={OBJECT:"object",WORD:"word"};
const DIRECTIONS={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};

const LEVELS=[
{
 name:"01 / BREAK THE WALL",
 hint:"The text is movable. A rule is only true while the words stay aligned.",
 width:12,height:10,
 entities:[
  {id:"p1",type:"object",noun:"PLAYER",x:2,y:6},
  {id:"r1",type:"object",noun:"ROCK",x:5,y:6},
  {id:"f1",type:"object",noun:"FLAG",x:9,y:2},
  {id:"w1",type:"object",noun:"WALL",x:7,y:4},{id:"w2",type:"object",noun:"WALL",x:7,y:5},{id:"w3",type:"object",noun:"WALL",x:7,y:6},{id:"w4",type:"object",noun:"WALL",x:7,y:7},{id:"w5",type:"object",noun:"WALL",x:7,y:8},
  {id:"t1",type:"word",word:"PLAYER",kind:"noun",x:1,y:1},{id:"t2",type:"word",word:"IS",kind:"op",x:2,y:1},{id:"t3",type:"word",word:"YOU",kind:"prop",x:3,y:1},
  {id:"t4",type:"word",word:"WALL",kind:"noun",x:1,y:3},{id:"t5",type:"word",word:"IS",kind:"op",x:2,y:3},{id:"t6",type:"word",word:"STOP",kind:"prop",x:3,y:3},
  {id:"t7",type:"word",word:"ROCK",kind:"noun",x:1,y:8},{id:"t8",type:"word",word:"IS",kind:"op",x:2,y:8},{id:"t9",type:"word",word:"PUSH",kind:"prop",x:3,y:8},
  {id:"t10",type:"word",word:"FLAG",kind:"noun",x:8,y:1},{id:"t11",type:"word",word:"IS",kind:"op",x:9,y:1},{id:"t12",type:"word",word:"WIN",kind:"prop",x:10,y:1}
 ]
},
{
 name:"02 / BECOME THE ROCK",
 hint:"No PLAYER exists. Create ROCK IS PLAYER; PLAYER IS YOU is already waiting.",
 width:12,height:10,
 entities:[
  {id:"r1",type:"object",noun:"ROCK",x:2,y:7},{id:"r2",type:"object",noun:"ROCK",x:4,y:7},
  {id:"f1",type:"object",noun:"FLAG",x:9,y:2},
  {id:"w1",type:"object",noun:"WALL",x:7,y:3},{id:"w2",type:"object",noun:"WALL",x:7,y:4},{id:"w3",type:"object",noun:"WALL",x:7,y:5},{id:"w4",type:"object",noun:"WALL",x:7,y:6},
  {id:"t1",type:"word",word:"ROCK",kind:"noun",x:1,y:1},{id:"t2",type:"word",word:"IS",kind:"op",x:2,y:1},{id:"t3",type:"word",word:"PUSH",kind:"prop",x:3,y:1},
  {id:"t4",type:"word",word:"FLAG",kind:"noun",x:8,y:1},{id:"t5",type:"word",word:"IS",kind:"op",x:9,y:1},{id:"t6",type:"word",word:"WIN",kind:"prop",x:10,y:1},
  {id:"t7",type:"word",word:"WALL",kind:"noun",x:1,y:3},{id:"t8",type:"word",word:"IS",kind:"op",x:2,y:3},{id:"t9",type:"word",word:"STOP",kind:"prop",x:3,y:3},
  {id:"t10",type:"word",word:"PLAYER",kind:"noun",x:4,y:5},{id:"t11",type:"word",word:"IS",kind:"op",x:5,y:5},{id:"t12",type:"word",word:"YOU",kind:"prop",x:6,y:5},
  {id:"t13",type:"word",word:"ROCK",kind:"noun",x:4,y:8},{id:"t14",type:"word",word:"IS",kind:"op",x:5,y:8},{id:"t15",type:"word",word:"PLAYER",kind:"noun",x:6,y:8}
 ]
}
];

let currentLevel=0,entities=[],rules=[],won=false,history=[];
const board=document.getElementById("board"),rulesEl=document.getElementById("rules"),resetBtn=document.getElementById("resetBtn"),undoBtn=document.getElementById("undoBtn"),levelBtn=document.getElementById("levelBtn"),levelTitle=document.getElementById("levelTitle"),levelHint=document.getElementById("levelHint"),winOverlay=document.getElementById("winOverlay"),playAgainBtn=document.getElementById("playAgainBtn"),nextBtn=document.getElementById("nextBtn"),winText=document.getElementById("winText");
const level=()=>LEVELS[currentLevel];
const clone=list=>list.map(e=>({...e}));

function resetGame(){entities=clone(level().entities);won=false;history=[];winOverlay.hidden=true;settleWorld();render();}
function snapshot(){return {entities:clone(entities),won};}
function restore(s){entities=clone(s.entities);won=s.won;winOverlay.hidden=!won;settleWorld(false);render();}
function pushHistory(){history.push(snapshot());if(history.length>200)history.shift();}
function undo(){if(history.length)restore(history.pop());}
function at(x,y){return entities.filter(e=>e.x===x&&e.y===y);}
function inBounds(x,y){return x>=0&&y>=0&&x<level().width&&y<level().height;}
function hasProp(noun,prop){return rules.some(r=>r.type==="property"&&r.subject===noun&&r.property===prop);}
function isPush(e){return e.type===TILE_TYPES.WORD||hasProp(e.noun,"PUSH");}
function isStop(e){return e.type===TILE_TYPES.OBJECT&&hasProp(e.noun,"STOP");}
function isYou(e){return e.type===TILE_TYPES.OBJECT&&hasProp(e.noun,"YOU");}
function isWin(e){return e.type===TILE_TYPES.OBJECT&&hasProp(e.noun,"WIN");}

function tryMove(e,dx,dy,trail=new Set()){
 if(trail.has(e.id))return false; trail.add(e.id);
 const nx=e.x+dx,ny=e.y+dy;if(!inBounds(nx,ny))return false;
 for(const other of at(nx,ny).filter(o=>o.id!==e.id)){
   if(isPush(other)){if(!tryMove(other,dx,dy,trail))return false;}
   else if(isStop(other)) return false;
 }
 e.x=nx;e.y=ny;return true;
}

function moveYou(dx,dy){
 if(won)return;
 const movers=entities.filter(isYou); if(!movers.length)return;
 pushHistory();
 for(const m of movers) tryMove(m,dx,dy,new Set());
 settleWorld();render();
}

function parseRules(){
 const found=[];
 const wordAt=(x,y)=>entities.find(e=>e.type==="word"&&e.x===x&&e.y===y);
 function triplet(a,b,c){
   if(!a||!b||!c||a.kind!=="noun"||b.word!=="IS")return;
   if(c.kind==="prop")found.push({type:"property",subject:a.word,property:c.word});
   else if(c.kind==="noun")found.push({type:"transform",subject:a.word,target:c.word});
 }
 for(const e of entities){
   if(e.type!=="word"||e.kind!=="op"||e.word!=="IS")continue;
   triplet(wordAt(e.x-1,e.y),e,wordAt(e.x+1,e.y));
   triplet(wordAt(e.x,e.y-1),e,wordAt(e.x,e.y+1));
 }
 const seen=new Set();rules=found.filter(r=>{const k=JSON.stringify(r);if(seen.has(k))return false;seen.add(k);return true;});
}

function applyTransforms(){
 let changed=false;
 const transforms=rules.filter(r=>r.type==="transform");
 // Day 02 supports one target per subject. Multi-target duplication comes later.
 const map=new Map();
 for(const r of transforms) if(!map.has(r.subject)) map.set(r.subject,r.target);
 for(const e of entities){
   if(e.type!=="object")continue;
   const target=map.get(e.noun);
   if(target&&target!==e.noun){e.noun=target;changed=true;}
 }
 return changed;
}

function settleWorld(check=true){
 for(let pass=0;pass<8;pass++){parseRules();if(!applyTransforms())break;}
 parseRules();if(check)checkWin();
}

function checkWin(){
 const ys=entities.filter(isYou),ws=entities.filter(isWin);
 for(const y of ys)for(const w of ws)if(y.x===w.x&&y.y===w.y){
   won=true;winOverlay.hidden=false;
   winText.textContent=currentLevel===0?"You changed a property rule.":"You changed what an object is.";
   nextBtn.hidden=currentLevel>=LEVELS.length-1;return;
 }
}

function renderRules(){
 rulesEl.innerHTML="";
 if(!rules.length){rulesEl.innerHTML='<p class="muted">No active rules.</p>';return;}
 for(const r of rules){
   const d=document.createElement("div");d.className="rule-pill";
   if(r.type==="property")d.textContent=`${r.subject} IS ${r.property}`;
   else{d.classList.add("transform");d.textContent=`${r.subject} IS ${r.target}`;}
   rulesEl.appendChild(d);
 }
}

function glyph(noun){return ({PLAYER:"●",ROCK:"◆",WALL:"■",FLAG:"⚑",KEY:"⌘"})[noun]||"●";}
function render(){
 board.style.gridTemplateColumns=`repeat(${level().width}, var(--tile))`;board.innerHTML="";
 levelTitle.textContent=level().name;levelHint.textContent=level().hint;levelBtn.textContent=`Level ${currentLevel+1}`;undoBtn.disabled=!history.length;
 for(let y=0;y<level().height;y++)for(let x=0;x<level().width;x++){
   const cell=document.createElement("div");cell.className="cell";
   for(const e of at(x,y)){
     const el=document.createElement("div");el.className="entity";
     if(e.type==="word"){el.classList.add("word");el.textContent=e.word;}
     else{el.classList.add("object",e.noun.toLowerCase());el.textContent=glyph(e.noun);}
     cell.appendChild(el);
   }
   board.appendChild(cell);
 }
 renderRules();
}

document.addEventListener("keydown",e=>{
 if(e.code==="KeyZ"){e.preventDefault();undo();return;}
 if(e.code==="KeyR"){e.preventDefault();resetGame();return;}
 const d=DIRECTIONS[e.code]||DIRECTIONS[e.key];if(!d)return;e.preventDefault();moveYou(d[0],d[1]);
});
resetBtn.addEventListener("click",resetGame);
undoBtn.addEventListener("click",undo);
levelBtn.addEventListener("click",()=>{currentLevel=(currentLevel+1)%LEVELS.length;resetGame();});
playAgainBtn.addEventListener("click",resetGame);
nextBtn.addEventListener("click",()=>{if(currentLevel<LEVELS.length-1){currentLevel++;resetGame();}});
resetGame();
