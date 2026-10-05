const board=document.getElementById("board"),rulesEl=document.getElementById("rules"),menuView=document.getElementById("menuView"),gameView=document.getElementById("gameView"),levelGrid=document.getElementById("levelGrid"),chapterLabel=document.getElementById("chapterLabel"),levelTitle=document.getElementById("levelTitle"),levelHint=document.getElementById("levelHint"),stepCount=document.getElementById("stepCount"),statusEl=document.getElementById("status"),winOverlay=document.getElementById("winOverlay"),winTitle=document.getElementById("winTitle"),winText=document.getElementById("winText"),winNonsense=document.getElementById("winNonsense");
let engine=null,current=0;
const DIR={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};
const NONSENSE=[
  "The wall has resigned from wall duties.",
  "Grammar has left the building through a newly invented exit.",
  "A committee has confirmed that this probably counts as physics.",
  "The sentence objected. You ignored it. Excellent.",
  "Reality has been updated without reading the terms and conditions.",
  "Somewhere, a dictionary just made a very small noise.",
  "The room would like to speak to a manager. There is no manager.",
  "Meaning successfully relocated. Please mind the wet paint."
];
const STATUS_ORIGINAL=[
  "Everything is still annoyingly grammatical.",
  "The room is behaving itself. Suspicious.",
  "No laws of language have been harmed yet.",
  "Reality remains factory-sealed."
];
const STATUS_CHANGED=[
  "The sentence has been tampered with. Good.",
  "Meaning is now leaking onto the floor.",
  "The grammar police have been notified and ignored.",
  "Reality has become negotiable."
];
function pick(arr,seed=0){return arr[Math.abs(seed)%arr.length]}
function glyph(n){return{PLAYER:"☻",ROCK:"◆",WALL:"▦",FLAG:"⚑",WATER:"≈",KEY:"⚿",DOOR:"▣"}[n]||"●"}
function menu(){menuView.hidden=false;gameView.hidden=true;winOverlay.hidden=true;renderGrid()}
function start(i){current=i;engine=new RuleWorldEngine(LEVELS[i]);menuView.hidden=true;gameView.hidden=false;winOverlay.hidden=true;render()}
function renderGrid(){levelGrid.innerHTML="";LEVELS.forEach((l,i)=>{const b=document.createElement("button");b.className="level-card";b.innerHTML=`<span class="num">problem ${String(l.id).padStart(2,"0")} · ${l.chapter}</span><strong>${l.title}</strong><span class="mechanic">requires: ${l.mechanic}</span>`;b.onclick=()=>start(i);levelGrid.appendChild(b)})}
function render(){
 const l=LEVELS[current];chapterLabel.textContent=`${l.chapter} / paperwork missing`;levelTitle.textContent=`${String(l.id).padStart(2,"0")} · ${l.title}`;levelHint.textContent=l.hint;stepCount.textContent=engine.steps;
 board.style.gridTemplateColumns=`repeat(${l.width},var(--tile))`;board.innerHTML="";
 for(let y=0;y<l.height;y++)for(let x=0;x<l.width;x++){const c=document.createElement("div");c.className="cell";for(const e of engine.at(x,y)){const d=document.createElement("div");d.className="entity";if(e.type==="word"){d.classList.add("word",e.kind);d.textContent=e.word}else{d.classList.add("object",e.noun.toLowerCase());d.textContent=glyph(e.noun)}c.appendChild(d)}board.appendChild(c)}
 rulesEl.innerHTML="";for(const r of engine.rules){const d=document.createElement("div");d.className="rule-pill"+(r.type==="transform"?" transform":"");d.textContent=r.type==="transform"?`${r.subject} IS ${r.target}`:`${r.subject} IS ${r.property}`;rulesEl.appendChild(d)}
 if(engine.lost) statusEl.textContent="Nobody is YOU anymore. Congratulations on abolishing yourself. Undo?";
 else if(engine.ruleChanged) statusEl.textContent=pick(STATUS_CHANGED,engine.steps+current);
 else statusEl.textContent=pick(STATUS_ORIGINAL,engine.steps+current);
 if(engine.won){winTitle.textContent=l.title;winText.textContent=`Solved in ${engine.steps} bad decision${engine.steps===1?"":"s"}.`;winNonsense.textContent=pick(NONSENSE,current+engine.steps);winOverlay.hidden=false}
}
function move(dx,dy){if(engine&&engine.move(dx,dy))render()}
document.addEventListener("keydown",e=>{if(gameView.hidden)return;if(e.code==="KeyZ"){e.preventDefault();if(engine.undo())render();return}if(e.code==="KeyR"){e.preventDefault();start(current);return}if(e.code==="Escape"){e.preventDefault();menu();return}const d=DIR[e.code];if(d){e.preventDefault();move(...d)}})
document.getElementById("undoBtn").onclick=()=>{if(engine&&engine.undo())render()};
document.getElementById("resetBtn").onclick=()=>engine&&start(current);
document.getElementById("menuBtn").onclick=menu;
document.getElementById("replayBtn").onclick=()=>start(current);
document.getElementById("levelsBtn").onclick=menu;
document.getElementById("nextBtn").onclick=()=>current<LEVELS.length-1?start(current+1):menu();
renderGrid();menu();
