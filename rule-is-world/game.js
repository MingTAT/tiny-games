const board = document.getElementById("board");
const rulesEl = document.getElementById("rules");
const menuView = document.getElementById("menuView");
const gameView = document.getElementById("gameView");
const levelGrid = document.getElementById("levelGrid");
const chapterLabel = document.getElementById("chapterLabel");
const levelTitle = document.getElementById("levelTitle");
const levelHint = document.getElementById("levelHint");
const stepCount = document.getElementById("stepCount");
const undoBtn = document.getElementById("undoBtn");
const resetBtn = document.getElementById("resetBtn");
const menuBtn = document.getElementById("menuBtn");
const soundBtn = document.getElementById("soundBtn");
const winOverlay = document.getElementById("winOverlay");
const endOverlay = document.getElementById("endOverlay");
const winTitle = document.getElementById("winTitle");
const winText = document.getElementById("winText");
const nextBtn = document.getElementById("nextBtn");
const replayBtn = document.getElementById("replayBtn");
const levelsBtn = document.getElementById("levelsBtn");
const endLevelsBtn = document.getElementById("endLevelsBtn");

const DIRS = {
  ArrowUp:[0,-1], KeyW:[0,-1],
  ArrowDown:[0,1], KeyS:[0,1],
  ArrowLeft:[-1,0], KeyA:[-1,0],
  ArrowRight:[1,0], KeyD:[1,0]
};

let currentIndex = 0;
let engine = null;
let solved = new Set();
let soundOn = false;
let audioCtx = null;

function beep(freq=240,dur=.05) {
  if (!soundOn) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(.028,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime+dur);
}

function showMenu() {
  menuView.hidden = false;
  gameView.hidden = true;
  winOverlay.hidden = true;
  endOverlay.hidden = true;
  renderLevelGrid();
}

function startLevel(index) {
  currentIndex = index;
  engine = new RuleWorldEngine(LEVELS[index]);
  menuView.hidden = true;
  gameView.hidden = false;
  winOverlay.hidden = true;
  endOverlay.hidden = true;
  render();
  beep(180,.06);
}

function renderLevelGrid() {
  levelGrid.innerHTML = "";
  LEVELS.forEach((lvl,idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "level-card" + (solved.has(idx) ? " solved" : "");
    btn.innerHTML = `
      <span class="num">${String(lvl.id).padStart(2,"0")} · ${lvl.chapter}</span>
      <strong>${lvl.title}</strong>
      <span class="mechanic">${lvl.mechanic}</span>
      ${solved.has(idx) ? '<span class="solved-mark">SOLVED ✓</span>' : ''}
    `;
    btn.addEventListener("click", () => startLevel(idx));
    levelGrid.appendChild(btn);
  });
}

function glyph(noun) {
  const map = {
    PLAYER:"●", ROCK:"◆", WALL:"■", FLAG:"⚑",
    WATER:"≈", SKULL:"☠", KEY:"⌘", DOOR:"▣",
    LAVA:"▲", ICE:"◇", GHOST:"◌", CRATE:"▦"
  };
  return map[noun] || "●";
}

function render() {
  if (!engine) return;

  const lvl = LEVELS[currentIndex];
  chapterLabel.textContent = lvl.chapter;
  levelTitle.textContent = `${String(lvl.id).padStart(2,"0")} · ${lvl.title}`;
  levelHint.textContent = lvl.hint;
  stepCount.textContent = engine.steps;

  board.style.gridTemplateColumns = `repeat(${lvl.width}, var(--tile))`;
  board.innerHTML = "";

  for (let y=0; y<lvl.height; y++) {
    for (let x=0; x<lvl.width; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      for (const e of engine.at(x,y)) {
        const el = document.createElement("div");
        el.className = "entity";

        if (e.type === "word") {
          el.classList.add("word",e.kind);
          el.textContent = e.word;
        } else {
          el.classList.add("object",e.noun.toLowerCase());
          el.textContent = glyph(e.noun);
          el.title = e.noun;
        }
        cell.appendChild(el);
      }
      board.appendChild(cell);
    }
  }

  renderRules();
  undoBtn.disabled = engine.history.length === 0;

  if (engine.won) showWin();
}

function renderRules() {
  rulesEl.innerHTML = "";
  if (!engine.rules.length) {
    rulesEl.innerHTML = '<p>No active rules.</p>';
    return;
  }

  for (const r of engine.rules) {
    const div = document.createElement("div");
    div.className = "rule-pill";
    if (r.type === "property") div.textContent = `${r.subject} IS ${r.property}`;
    if (r.type === "transform") {
      div.classList.add("transform");
      div.textContent = `${r.subject} IS ${r.target}`;
    }
    if (r.type === "has") {
      div.classList.add("has");
      div.textContent = `${r.subject} HAS ${r.target}`;
    }
    rulesEl.appendChild(div);
  }
}

function move(dx,dy) {
  if (!engine) return;
  const beforeWon = engine.won;
  const moved = engine.movePlayer(dx,dy);
  if (moved) {
    beep(150,.025);
    render();
    if (!beforeWon && engine.won) beep(420,.18);
  }
}

function showWin() {
  solved.add(currentIndex);
  winTitle.textContent = LEVELS[currentIndex].title;
  winText.textContent = `Solved in ${engine.steps} step${engine.steps === 1 ? "" : "s"}.`;
  nextBtn.hidden = currentIndex >= LEVELS.length - 1;
  winOverlay.hidden = false;
}

function nextLevel() {
  winOverlay.hidden = true;
  if (currentIndex >= LEVELS.length - 1) {
    endOverlay.hidden = false;
    return;
  }
  startLevel(currentIndex+1);
}

document.addEventListener("keydown", e => {
  if (!gameView.hidden) {
    if (e.code === "KeyZ") {
      e.preventDefault();
      if (engine.undo()) { render(); beep(110,.04); }
      return;
    }
    if (e.code === "KeyR") {
      e.preventDefault();
      engine.reset();
      render();
      return;
    }
    if (e.code === "Escape") {
      e.preventDefault();
      showMenu();
      return;
    }
    const d = DIRS[e.code] || DIRS[e.key];
    if (d) {
      e.preventDefault();
      move(d[0],d[1]);
    }
  }
});

document.querySelectorAll("[data-move]").forEach(btn => {
  btn.addEventListener("click", () => {
    const map = {
      up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]
    };
    const d = map[btn.dataset.move];
    move(d[0],d[1]);
  });
});

undoBtn.addEventListener("click", () => {
  if (engine && engine.undo()) { render(); beep(110,.04); }
});

resetBtn.addEventListener("click", () => {
  if (!engine) return;
  engine.reset();
  render();
});

menuBtn.addEventListener("click", showMenu);

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "Sound on" : "Sound off";
  if (soundOn) beep(260,.05);
});

nextBtn.addEventListener("click", nextLevel);
replayBtn.addEventListener("click", () => startLevel(currentIndex));
levelsBtn.addEventListener("click", showMenu);
endLevelsBtn.addEventListener("click", showMenu);

renderLevelGrid();
showMenu();
