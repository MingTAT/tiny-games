class RuleWorldEngine {
  constructor(level) {
    this.load(level);
  }

  load(level) {
    this.level = JSON.parse(JSON.stringify(level));
    this.nextId = 1;
    this.entities = this.level.entities.map(e => ({...e, id:`e${this.nextId++}`}));
    this.rules = [];
    this.history = [];
    this.steps = 0;
    this.won = false;
    this.lost = false;
    this.settle(false);
  }

  snapshot() {
    return {
      entities: JSON.parse(JSON.stringify(this.entities)),
      steps: this.steps,
      won: this.won,
      lost: this.lost
    };
  }

  restore(s) {
    this.entities = JSON.parse(JSON.stringify(s.entities));
    this.steps = s.steps;
    this.won = s.won;
    this.lost = s.lost;
    this.settle(false);
  }

  saveHistory() {
    this.history.push(this.snapshot());
    if (this.history.length > 300) this.history.shift();
  }

  undo() {
    if (!this.history.length) return false;
    this.restore(this.history.pop());
    return true;
  }

  reset() {
    this.load(this.level);
  }

  inBounds(x,y) {
    return x >= 0 && y >= 0 && x < this.level.width && y < this.level.height;
  }

  at(x,y) {
    return this.entities.filter(e => e.x === x && e.y === y);
  }

  property(noun, prop) {
    return this.rules.some(r => r.type === "property" && r.subject === noun && r.property === prop);
  }

  hasRule(noun, target) {
    return this.rules.some(r => r.type === "has" && r.subject === noun && r.target === target);
  }

  isPush(e) {
    if (e.type === "word") return true;
    return this.property(e.noun,"PUSH");
  }

  isStop(e) {
    return e.type === "object" && this.property(e.noun,"STOP");
  }

  isYou(e) {
    return e.type === "object" && this.property(e.noun,"YOU");
  }

  isWin(e) {
    return e.type === "object" && this.property(e.noun,"WIN");
  }

  parseRules() {
    const rules = [];
    const wordMap = new Map();

    for (const e of this.entities) {
      if (e.type === "word" && !wordMap.has(`${e.x},${e.y}`)) {
        wordMap.set(`${e.x},${e.y}`, e);
      }
    }

    const lines = [];

    for (let y=0; y<this.level.height; y++) {
      let seg = [];
      for (let x=0; x<=this.level.width; x++) {
        const w = wordMap.get(`${x},${y}`);
        if (w) seg.push(w);
        else if (seg.length) { lines.push(seg); seg=[]; }
      }
    }

    for (let x=0; x<this.level.width; x++) {
      let seg = [];
      for (let y=0; y<=this.level.height; y++) {
        const w = wordMap.get(`${x},${y}`);
        if (w) seg.push(w);
        else if (seg.length) { lines.push(seg); seg=[]; }
      }
    }

    for (const line of lines) {
      rules.push(...this.parseLine(line));
    }

    this.rules = this.dedupe(rules);
  }

  parseLine(tokens) {
    const out = [];
    if (tokens.length < 3) return out;

    const opIndex = tokens.findIndex(t => t.kind === "op" && (t.word === "IS" || t.word === "HAS"));
    if (opIndex <= 0 || opIndex >= tokens.length-1) return out;

    const op = tokens[opIndex].word;
    const left = tokens.slice(0,opIndex);
    const right = tokens.slice(opIndex+1);

    const subjects = this.parseAndGroup(left, "noun");
    if (!subjects) return out;

    if (op === "HAS") {
      const targets = this.parseAndGroup(right, "noun");
      if (!targets) return out;
      for (const s of subjects) for (const t of targets) out.push({type:"has",subject:s,target:t});
      return out;
    }

    const rhs = this.parseMixedAndGroup(right);
    if (!rhs) return out;

    for (const s of subjects) {
      for (const item of rhs) {
        if (item.kind === "prop") out.push({type:"property",subject:s,property:item.word});
        if (item.kind === "noun") out.push({type:"transform",subject:s,target:item.word});
      }
    }

    return out;
  }

  parseAndGroup(tokens, requiredKind) {
    if (!tokens.length) return null;
    const values = [];
    for (let i=0;i<tokens.length;i++) {
      const t = tokens[i];
      if (i % 2 === 0) {
        if (t.kind !== requiredKind) return null;
        values.push(t.word);
      } else {
        if (t.kind !== "and" || t.word !== "AND") return null;
      }
    }
    return values;
  }

  parseMixedAndGroup(tokens) {
    if (!tokens.length) return null;
    const values = [];
    for (let i=0;i<tokens.length;i++) {
      const t = tokens[i];
      if (i % 2 === 0) {
        if (t.kind !== "noun" && t.kind !== "prop") return null;
        values.push({word:t.word,kind:t.kind});
      } else {
        if (t.kind !== "and" || t.word !== "AND") return null;
      }
    }
    return values;
  }

  dedupe(list) {
    const seen = new Set();
    return list.filter(r => {
      const k = JSON.stringify(r);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  applyTransforms() {
    const transforms = this.rules.filter(r => r.type === "transform" && r.subject !== r.target);
    if (!transforms.length) return false;

    const map = new Map();
    for (const r of transforms) if (!map.has(r.subject)) map.set(r.subject, r.target);

    let changed = false;
    for (const e of this.entities) {
      if (e.type !== "object") continue;
      const target = map.get(e.noun);
      if (target && target !== e.noun) {
        e.noun = target;
        changed = true;
      }
    }
    return changed;
  }

  settle(checkWin=true) {
    for (let i=0;i<6;i++) {
      this.parseRules();
      if (!this.applyTransforms()) break;
    }
    this.parseRules();
    this.resolveInteractions();
    this.parseRules();
    if (checkWin) this.checkWin();
  }

  destroy(ids) {
    const idSet = new Set(ids);
    const destroyed = this.entities.filter(e => idSet.has(e.id));
    const survivors = this.entities.filter(e => !idSet.has(e.id));

    const spawned = [];
    for (const d of destroyed) {
      if (d.type !== "object") continue;
      for (const r of this.rules) {
        if (r.type === "has" && r.subject === d.noun) {
          spawned.push({
            id:`e${this.nextId++}`, type:"object", noun:r.target,
            x:d.x, y:d.y, dir:d.dir || "right"
          });
        }
      }
    }

    this.entities = survivors.concat(spawned);
  }

  resolveInteractions() {
    let changed = true;
    let guard = 0;

    while (changed && guard++ < 8) {
      changed = false;
      const destroyIds = new Set();

      const cells = new Map();
      for (const e of this.entities) {
        const k = `${e.x},${e.y}`;
        if (!cells.has(k)) cells.set(k,[]);
        cells.get(k).push(e);
      }

      for (const group of cells.values()) {
        const objects = group.filter(e => e.type === "object");
        if (!objects.length) continue;

        const opens = objects.filter(e => this.property(e.noun,"OPEN"));
        const shuts = objects.filter(e => this.property(e.noun,"SHUT"));
        if (opens.length && shuts.length) {
          opens.forEach(e => destroyIds.add(e.id));
          shuts.forEach(e => destroyIds.add(e.id));
        }

        const sinks = objects.filter(e => this.property(e.noun,"SINK"));
        if (sinks.length && group.length > sinks.length) {
          group.forEach(e => destroyIds.add(e.id));
        }

        const hots = objects.filter(e => this.property(e.noun,"HOT"));
        if (hots.length) {
          objects.filter(e => this.property(e.noun,"MELT")).forEach(e => destroyIds.add(e.id));
        }

        if (group.length > 1) {
          objects.filter(e => this.property(e.noun,"WEAK")).forEach(e => destroyIds.add(e.id));
        }

        const defeats = objects.filter(e => this.property(e.noun,"DEFEAT"));
        if (defeats.length) {
          objects.filter(e => this.property(e.noun,"YOU")).forEach(e => destroyIds.add(e.id));
        }
      }

      if (destroyIds.size) {
        this.destroy([...destroyIds]);
        changed = true;
        this.parseRules();
      }
    }
  }

  canEnter(entity, nx, ny, dx, dy, trail) {
    if (!this.inBounds(nx,ny)) return false;

    const occupants = this.at(nx,ny).filter(o => o.id !== entity.id);

    for (const other of occupants) {
      if (this.isPush(other)) {
        if (!this.tryMove(other,dx,dy,trail)) return false;
      } else if (this.isStop(other)) {
        return false;
      }
    }
    return true;
  }

  tryMove(entity, dx, dy, trail=new Set()) {
    if (trail.has(entity.id)) return false;
    trail.add(entity.id);

    const nx = entity.x + dx;
    const ny = entity.y + dy;

    if (!this.canEnter(entity,nx,ny,dx,dy,trail)) return false;

    entity.x = nx;
    entity.y = ny;
    return true;
  }

  movePlayer(dx,dy) {
    if (this.won || this.lost) return false;
    const movers = this.entities.filter(e => this.isYou(e));
    if (!movers.length) return false;

    this.saveHistory();

    for (const e of movers) {
      this.tryMove(e,dx,dy,new Set());
    }

    this.steps++;
    this.settle(false);
    this.moveAutonomous();
    this.settle(true);
    this.checkLoss();
    return true;
  }

  moveAutonomous() {
    const dirs = {
      up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]
    };
    const opposite = {up:"down",down:"up",left:"right",right:"left"};

    const movers = this.entities.filter(e => e.type === "object" && this.property(e.noun,"MOVE"));

    for (const e of movers) {
      let dirName = e.dir || "right";
      let [dx,dy] = dirs[dirName];
      if (!this.tryMove(e,dx,dy,new Set())) {
        dirName = opposite[dirName];
        e.dir = dirName;
        [dx,dy] = dirs[dirName];
        this.tryMove(e,dx,dy,new Set());
      } else {
        e.dir = dirName;
      }
    }
  }

  checkWin() {
    const yous = this.entities.filter(e => this.isYou(e));
    const wins = this.entities.filter(e => this.isWin(e));
    for (const y of yous) {
      for (const w of wins) {
        if (y.x === w.x && y.y === w.y) {
          this.won = true;
          return true;
        }
      }
    }
    return false;
  }

  checkLoss() {
    if (!this.entities.some(e => this.isYou(e))) {
      this.lost = true;
    }
  }
}
