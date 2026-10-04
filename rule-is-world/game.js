const TILE_TYPES = {
  OBJECT: "object",
  WORD: "word"
};

const WORD_KIND = {
  NOUN: "noun",
  OP: "op",
  PROP: "prop"
};

const DIRECTIONS = {
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0]
};

const LEVEL = {
  width: 12,
  height: 10,
  entities: [
    {id:"p1", type:"object", noun:"PLAYER", x:2, y:6},
    {id:"r1", type:"object", noun:"ROCK", x:5, y:6},
    {id:"f1", type:"object", noun:"FLAG", x:9, y:2},

    {id:"w1", type:"object", noun:"WALL", x:7, y:4},
    {id:"w2", type:"object", noun:"WALL", x:7, y:5},
    {id:"w3", type:"object", noun:"WALL", x:7, y:6},
    {id:"w4", type:"object", noun:"WALL", x:7, y:7},
    {id:"w5", type:"object", noun:"WALL", x:7, y:8},

    {id:"t1", type:"word", word:"PLAYER", kind:"noun", x:1, y:1},
    {id:"t2", type:"word", word:"IS", kind:"op", x:2, y:1},
    {id:"t3", type:"word", word:"YOU", kind:"prop", x:3, y:1},

    {id:"t4", type:"word", word:"WALL", kind:"noun", x:1, y:3},
    {id:"t5", type:"word", word:"IS", kind:"op", x:2, y:3},
    {id:"t6", type:"word", word:"STOP", kind:"prop", x:3, y:3},

    {id:"t7", type:"word", word:"ROCK", kind:"noun", x:1, y:8},
    {id:"t8", type:"word", word:"IS", kind:"op", x:2, y:8},
    {id:"t9", type:"word", word:"PUSH", kind:"prop", x:3, y:8},

    {id:"t10", type:"word", word:"FLAG", kind:"noun", x:8, y:1},
    {id:"t11", type:"word", word:"IS", kind:"op", x:9, y:1},
    {id:"t12", type:"word", word:"WIN", kind:"prop", x:10, y:1}
  ]
};

let entities = [];
let rules = [];
let won = false;

const board = document.getElementById("board");
const rulesEl = document.getElementById("rules");
const resetBtn = document.getElementById("resetBtn");
const winOverlay = document.getElementById("winOverlay");
const playAgainBtn = document.getElementById("playAgainBtn");

function cloneLevel() {
  return LEVEL.entities.map(e => ({...e}));
}

function resetGame() {
  entities = cloneLevel();
  won = false;
  winOverlay.hidden = true;
  parseRules();
  render();
}

function cellKey(x,y) {
  return `${x},${y}`;
}

function getEntitiesAt(x,y) {
  return entities.filter(e => e.x === x && e.y === y);
}

function inBounds(x,y) {
  return x >= 0 && y >= 0 && x < LEVEL.width && y < LEVEL.height;
}

function hasRule(noun, prop) {
  return rules.some(r => r.subject === noun && r.property === prop);
}

function isPushable(entity) {
  if (entity.type === TILE_TYPES.WORD) return true;
  return hasRule(entity.noun, "PUSH");
}

function isStop(entity) {
  return entity.type === TILE_TYPES.OBJECT && hasRule(entity.noun, "STOP");
}

function isYou(entity) {
  return entity.type === TILE_TYPES.OBJECT && hasRule(entity.noun, "YOU");
}

function isWin(entity) {
  return entity.type === TILE_TYPES.OBJECT && hasRule(entity.noun, "WIN");
}

function tryMoveEntity(entity, dx, dy, trail = new Set()) {
  const marker = entity.id;
  if (trail.has(marker)) return false;
  trail.add(marker);

  const nx = entity.x + dx;
  const ny = entity.y + dy;

  if (!inBounds(nx, ny)) return false;

  const occupants = getEntitiesAt(nx, ny);

  for (const other of occupants) {
    if (isPushable(other)) {
      if (!tryMoveEntity(other, dx, dy, trail)) return false;
    } else if (isStop(other)) {
      return false;
    }
  }

  entity.x = nx;
  entity.y = ny;
  return true;
}

function moveYou(dx,dy) {
  if (won) return;

  const movers = entities.filter(isYou);
  const snapshots = new Map(movers.map(e => [e.id, {x:e.x, y:e.y}]));

  for (const mover of movers) {
    tryMoveEntity(mover, dx, dy, new Set());
  }

  parseRules();
  checkWin();
  render();
}

function parseRules() {
  const found = [];

  function wordAt(x,y) {
    return entities.find(e => e.type === "word" && e.x === x && e.y === y);
  }

  for (const e of entities) {
    if (e.type !== "word" || e.kind !== "op" || e.word !== "IS") continue;

    const left = wordAt(e.x - 1, e.y);
    const right = wordAt(e.x + 1, e.y);

    if (left?.kind === "noun" && right?.kind === "prop") {
      found.push({subject:left.word, property:right.word});
    }

    const up = wordAt(e.x, e.y - 1);
    const down = wordAt(e.x, e.y + 1);

    if (up?.kind === "noun" && down?.kind === "prop") {
      found.push({subject:up.word, property:down.word});
    }
  }

  rules = found;
  renderRules();
}

function checkWin() {
  const yous = entities.filter(isYou);
  const wins = entities.filter(isWin);

  for (const y of yous) {
    for (const w of wins) {
      if (y.x === w.x && y.y === w.y) {
        won = true;
        winOverlay.hidden = false;
        return;
      }
    }
  }
}

function renderRules() {
  rulesEl.innerHTML = "";

  if (rules.length === 0) {
    rulesEl.innerHTML = `<p class="muted">No active rules.</p>`;
    return;
  }

  for (const r of rules) {
    const div = document.createElement("div");
    div.className = "rule-pill";
    div.textContent = `${r.subject} IS ${r.property}`;
    rulesEl.appendChild(div);
  }
}

function render() {
  board.style.gridTemplateColumns = `repeat(${LEVEL.width}, var(--tile))`;
  board.innerHTML = "";

  for (let y = 0; y < LEVEL.height; y++) {
    for (let x = 0; x < LEVEL.width; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.x = x;
      cell.dataset.y = y;

      const contents = getEntitiesAt(x,y);

      for (const entity of contents) {
        const el = document.createElement("div");
        el.className = "entity";

        if (entity.type === "word") {
          el.classList.add("word");
          el.textContent = entity.word;
        } else {
          el.classList.add("object", entity.noun.toLowerCase());

          if (entity.noun === "PLAYER") el.textContent = "●";
          if (entity.noun === "ROCK") el.textContent = "◆";
          if (entity.noun === "WALL") el.textContent = "■";
          if (entity.noun === "FLAG") el.textContent = "⚑";
        }

        cell.appendChild(el);
      }

      board.appendChild(cell);
    }
  }
}

document.addEventListener("keydown", e => {
  const dir = DIRECTIONS[e.code] || DIRECTIONS[e.key];
  if (!dir) return;
  e.preventDefault();
  moveYou(dir[0], dir[1]);
});

resetBtn.addEventListener("click", resetGame);
playAgainBtn.addEventListener("click", resetGame);

resetGame();
