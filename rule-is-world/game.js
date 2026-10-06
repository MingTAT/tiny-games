const UI = {
  board: document.getElementById('board'),
  rules: document.getElementById('rules'),
  menuView: document.getElementById('menuView'),
  gameView: document.getElementById('gameView'),
  worldList: document.getElementById('worldList'),
  chapter: document.getElementById('chapterLabel'),
  title: document.getElementById('levelTitle'),
  hint: document.getElementById('levelHint'),
  steps: document.getElementById('stepCount'),
  status: document.getElementById('status'),
  menuBtn: document.getElementById('menuBtn'),
  undoBtn: document.getElementById('undoBtn'),
  resetBtn: document.getElementById('resetBtn'),
  soundBtn: document.getElementById('soundBtn'),
  winOverlay: document.getElementById('winOverlay'),
  winTitle: document.getElementById('winTitle'),
  winText: document.getElementById('winText'),
  winJoke: document.getElementById('winJoke'),
  nextBtn: document.getElementById('nextBtn'),
  replayBtn: document.getElementById('replayBtn'),
  levelsBtn: document.getElementById('levelsBtn')
};

const WORLD_META = {
  1:{title:'PLEASE DO NOT TOUCH THE GRAMMAR', note:'Rules can be broken. This has somehow surprised management.'},
  2:{title:'YOU ARE NOT WHO HR SAID YOU ARE', note:'Identity is now considered a temporary administrative field.'},
  3:{title:'WINNING IS A TEMPORARY CONDITION', note:'Victory has been outsourced. No fixed endpoint is guaranteed.'},
  4:{title:'OBJECTS HAVE FILED A COMPLAINT', note:'Rules may now depend on where things are, what they face, and who is standing too close.'}
};

const DIRS = {
  ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],
  ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]
};

const GLYPHS = {
  PLAYER:'●', ROCK:'◆', WALL:'▦', FLAG:'⚑', WATER:'≈', KEY:'⌘', DOOR:'▣',
  CRATE:'▤', SKULL:'☠', LAVA:'▲', ICE:'◇', GHOST:'◌'
};

const JOKES = [
  'The wall has resigned from wall duties.',
  'Grammar police were notified and chose not to attend.',
  'Reality has been updated without reading the terms and conditions.',
  'Somewhere, a dictionary made a very small noise.',
  'The room requests that you never do that again.',
  'Your solution has been forwarded to Legal. Legal has left the building.',
  'Physics would like to clarify that it was not consulted.',
  'This outcome is technically compliant, which is worse.',
  'Please return all stolen meanings before leaving.',
  'The sentence has been promoted to infrastructure.'
];

const STATUS = {
  original:[
    'Everything is still annoyingly grammatical.',
    'No semantic vandalism detected yet.',
    'The room continues to believe in nouns.'
  ],
  changed:[
    'Meaning is now leaking onto the floor.',
    'An unauthorized rule change has been recorded.',
    'The syntax department has stopped answering calls.',
    'Reality appears to be taking the sentence literally.'
  ],
  lost:[
    'Nobody is YOU. Responsibility has been successfully eliminated.',
    'No controllable employee found. Undo the restructuring.',
    'The room is operating without management.'
  ]
};

let currentIndex = 0;
let engine = null;
let soundEnabled = false;
let audioCtx = null;
let solved = loadSolved();

function loadSolved(){
  try { return new Set(JSON.parse(localStorage.getItem('rule-is-world-solved') || '[]')); }
  catch { return new Set(); }
}
function saveSolved(){
  try { localStorage.setItem('rule-is-world-solved', JSON.stringify([...solved])); } catch {}
}
function pick(arr, salt=0){ return arr[Math.abs((salt*17 + currentIndex*7)) % arr.length]; }

function beep(freq=220,dur=.045){
  if(!soundEnabled) return;
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
  osc.type='triangle'; osc.frequency.value=freq;
  gain.gain.setValueAtTime(.025,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);
  osc.connect(gain).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime+dur);
}

function showMenu(){
  UI.menuView.hidden=false; UI.gameView.hidden=true; UI.winOverlay.hidden=true;
  renderMenu();
}

function renderMenu(){
  UI.worldList.innerHTML='';
  for(const world of [1,2,3,4]){
    const meta=WORLD_META[world];
    const section=document.createElement('section'); section.className='world-section';
    const head=document.createElement('div'); head.className='world-head';
    head.innerHTML=`<div><p class="stamp">WORLD ${world}</p><h3>${meta.title}</h3></div><p>${meta.note}</p>`;
    const grid=document.createElement('div'); grid.className='level-grid';
    LEVELS.filter(l=>l.world===world).forEach(level=>{
      const idx=LEVELS.indexOf(level);
      const btn=document.createElement('button'); btn.type='button';
      btn.className='level-card'+(solved.has(level.id)?' solved':'');
      btn.innerHTML=`<span class="num">FORM ${String(level.id).padStart(2,'0')}</span><strong>${level.title}</strong><span class="mechanic">${level.mechanic}</span>`;
      btn.addEventListener('click',()=>startLevel(idx)); grid.appendChild(btn);
    });
    section.append(head,grid); UI.worldList.appendChild(section);
  }
}

function startLevel(index){
  currentIndex=index; engine=new RuleWorldEngine(LEVELS[index]);
  UI.menuView.hidden=true; UI.gameView.hidden=false; UI.winOverlay.hidden=true;
  render(); beep(155,.06);
}

function ruleText(r){
  const subject=r.subjects.join(' AND ');
  const condition=r.condition ? ` ${r.condition.relation} ${r.condition.targets.join(' AND ')}` : '';
  if(r.type==='property') return `${subject}${condition} IS ${r.property}`;
  if(r.type==='transform') return `${subject}${condition} IS ${r.target}`;
  if(r.type==='has') return `${subject}${condition} HAS ${r.target}`;
  if(r.type==='make') return `${subject}${condition} MAKE ${r.target}`;
  return 'UNFILED RULE';
}

function renderRules(){
  UI.rules.innerHTML='';
  if(!engine.rules.length){
    const p=document.createElement('div'); p.className='rule-pill'; p.textContent='NO RULES. THIS SEEMS BAD.'; UI.rules.appendChild(p); return;
  }
  engine.rules.forEach((r,i)=>{
    const div=document.createElement('div'); div.className='rule-pill'; div.textContent=ruleText(r);
    div.style.transform=`rotate(${i%2?-.6:.35}deg)`; UI.rules.appendChild(div);
  });
}

function renderBoard(){
  const lvl=LEVELS[currentIndex]; UI.board.innerHTML=''; UI.board.style.gridTemplateColumns=`repeat(${lvl.width},var(--cell))`;
  for(let y=0;y<lvl.height;y++) for(let x=0;x<lvl.width;x++){
    const cell=document.createElement('div'); cell.className='cell';
    engine.at(x,y).forEach((e,i)=>{
      const el=document.createElement('div'); el.className='entity';
      if(e.type==='word'){
        el.classList.add('word',e.kind); el.textContent=e.word;
      } else {
        el.classList.add('object',e.noun.toLowerCase()); el.textContent=GLYPHS[e.noun]||'●'; el.title=e.noun;
      }
      if(i>0) el.style.transform=`translate(${i*2}px,${-i*2}px) rotate(${i%2?2:-2}deg)`;
      cell.appendChild(el);
    });
    UI.board.appendChild(cell);
  }
}

function renderStatus(){
  if(engine.lost) UI.status.textContent=pick(STATUS.lost,engine.steps);
  else if(engine.changedRules) UI.status.textContent=pick(STATUS.changed,engine.steps);
  else UI.status.textContent=pick(STATUS.original,engine.steps);
}

function render(){
  if(!engine) return;
  const lvl=LEVELS[currentIndex];
  UI.chapter.textContent=`WORLD ${lvl.world} // ${lvl.chapter}`;
  UI.title.textContent=`${String(lvl.id).padStart(2,'0')} · ${lvl.title}`;
  UI.hint.textContent=lvl.hint; UI.steps.textContent=engine.steps;
  UI.undoBtn.disabled=!engine.history.length;
  renderBoard(); renderRules(); renderStatus();
  if(engine.won) showWin();
}

function move(dx,dy){
  if(!engine) return;
  const beforeWon=engine.won;
  if(engine.movePlayer(dx,dy)){
    beep(145,.025); render();
    if(!beforeWon && engine.won) beep(410,.16);
  }
}

function showWin(){
  const lvl=LEVELS[currentIndex]; solved.add(lvl.id); saveSolved();
  UI.winTitle.textContent=lvl.title;
  UI.winText.textContent=`Resolved in ${engine.steps} bad decision${engine.steps===1?'':'s'}.`;
  UI.winJoke.textContent=pick(JOKES,engine.steps+lvl.id);
  UI.nextBtn.hidden=currentIndex>=LEVELS.length-1;
  UI.winOverlay.hidden=false;
}

UI.menuBtn.addEventListener('click',showMenu);
UI.undoBtn.addEventListener('click',()=>{if(engine&&engine.undo()){beep(95,.045);render();}});
UI.resetBtn.addEventListener('click',()=>engine&&startLevel(currentIndex));
UI.soundBtn.addEventListener('click',()=>{
  soundEnabled=!soundEnabled; UI.soundBtn.textContent=`tiny noises: ${soundEnabled?'on':'off'}`;
  if(soundEnabled) beep(260,.05);
});
UI.nextBtn.addEventListener('click',()=>{UI.winOverlay.hidden=true;if(currentIndex<LEVELS.length-1)startLevel(currentIndex+1);else showMenu();});
UI.replayBtn.addEventListener('click',()=>startLevel(currentIndex));
UI.levelsBtn.addEventListener('click',showMenu);

document.addEventListener('keydown',e=>{
  if(UI.gameView.hidden) return;
  if(e.code==='KeyZ'){e.preventDefault();if(engine.undo()){beep(95,.045);render();}return;}
  if(e.code==='KeyR'){e.preventDefault();startLevel(currentIndex);return;}
  if(e.code==='Escape'){e.preventDefault();showMenu();return;}
  const d=DIRS[e.code]||DIRS[e.key]; if(d){e.preventDefault();move(d[0],d[1]);}
});

document.querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('click',()=>{
  const map={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}; move(...map[btn.dataset.move]);
}));

renderMenu(); showMenu();
