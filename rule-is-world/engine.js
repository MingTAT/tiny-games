class RuleWorldEngine {
  constructor(level) {
    this.load(level);
  }

  load(level) {
    this.level = JSON.parse(JSON.stringify(level));
    this.nextId = 1;
    this.entities = this.level.entities.map(e => ({
      dir: 'right',
      ...e,
      id: e.id || `e${this.nextId++}`
    }));
    this.history = [];
    this.rules = [];
    this.steps = 0;
    this.won = false;
    this.lost = false;
    this.changedRules = false;
    this._initialRuleSignature = null;
    this.settle(false, {allowMake:false});
    this._initialRuleSignature = this.ruleSignature();
  }

  cloneEntities(list = this.entities) {
    return list.map(e => ({...e}));
  }

  snapshot() {
    return {
      entities: this.cloneEntities(),
      steps: this.steps,
      won: this.won,
      lost: this.lost,
      changedRules: this.changedRules,
      nextId: this.nextId
    };
  }

  restore(snap) {
    this.entities = this.cloneEntities(snap.entities);
    this.steps = snap.steps;
    this.won = snap.won;
    this.lost = snap.lost;
    this.changedRules = snap.changedRules;
    this.nextId = snap.nextId || this.nextId;
    this.settle(false, {allowMake:false});
  }

  saveHistory() {
    this.history.push(this.snapshot());
    if (this.history.length > 400) this.history.shift();
  }

  undo() {
    if (!this.history.length) return false;
    this.restore(this.history.pop());
    return true;
  }

  inBounds(x,y) {
    return x >= 0 && y >= 0 && x < this.level.width && y < this.level.height;
  }

  at(x,y) {
    return this.entities.filter(e => e.x === x && e.y === y);
  }

  objectsAt(x,y) {
    return this.entities.filter(e => e.type === 'object' && e.x === x && e.y === y);
  }

  wordsAt(x,y) {
    return this.entities.filter(e => e.type === 'word' && e.x === x && e.y === y);
  }

  wordAt(x,y) {
    return this.entities.find(e => e.type === 'word' && e.x === x && e.y === y);
  }

  ruleSignature() {
    return JSON.stringify(this.rules.map(r => {
      if (r.type === 'property') return ['p', r.subjects, r.condition || null, r.property];
      if (r.type === 'transform') return ['t', r.subjects, r.condition || null, r.target];
      if (r.type === 'has') return ['h', r.subjects, r.condition || null, r.target];
      if (r.type === 'make') return ['m', r.subjects, r.condition || null, r.target];
      return r;
    }));
  }

  parseRules() {
    const lines = [];
    const seenCells = new Map();
    for (const e of this.entities) {
      if (e.type === 'word' && !seenCells.has(`${e.x},${e.y}`)) seenCells.set(`${e.x},${e.y}`, e);
    }

    for (let y=0; y<this.level.height; y++) {
      let seg = [];
      for (let x=0; x<=this.level.width; x++) {
        const w = seenCells.get(`${x},${y}`);
        if (w) seg.push(w);
        else if (seg.length) { lines.push(seg); seg = []; }
      }
    }

    for (let x=0; x<this.level.width; x++) {
      let seg = [];
      for (let y=0; y<=this.level.height; y++) {
        const w = seenCells.get(`${x},${y}`);
        if (w) seg.push(w);
        else if (seg.length) { lines.push(seg); seg = []; }
      }
    }

    let found = [];
    for (const line of lines) found.push(...this.parseLine(line));
    this.rules = this.dedupeRules(found);

    if (this._initialRuleSignature !== null && this.ruleSignature() !== this._initialRuleSignature) {
      this.changedRules = true;
    }
  }

  parseLine(tokens) {
    const out = [];
    if (tokens.length < 3) return out;

    const opIndex = tokens.findIndex(t => t.kind === 'op' && ['IS','HAS','MAKE'].includes(t.word));
    if (opIndex <= 0 || opIndex >= tokens.length - 1) return out;

    const op = tokens[opIndex].word;
    const subject = this.parseSubject(tokens.slice(0, opIndex));
    if (!subject) return out;

    if (op === 'IS') {
      const rhs = this.parseMixedGroup(tokens.slice(opIndex + 1));
      if (!rhs) return out;
      for (const item of rhs) {
        if (item.kind === 'prop') {
          out.push({type:'property', subjects:subject.subjects, condition:subject.condition, property:item.word});
        } else if (item.kind === 'noun') {
          out.push({type:'transform', subjects:subject.subjects, condition:subject.condition, target:item.word});
        }
      }
      return out;
    }

    const rhs = this.parseNounGroup(tokens.slice(opIndex + 1));
    if (!rhs) return out;
    for (const target of rhs) {
      out.push({
        type: op === 'HAS' ? 'has' : 'make',
        subjects: subject.subjects,
        condition: subject.condition,
        target
      });
    }
    return out;
  }

  parseSubject(tokens) {
    const relIndex = tokens.findIndex(t => t.kind === 'rel' && ['ON','NEAR','FACING'].includes(t.word));
    if (relIndex < 0) {
      const subjects = this.parseNounGroup(tokens);
      return subjects ? {subjects, condition:null} : null;
    }

    const left = tokens.slice(0, relIndex);
    const right = tokens.slice(relIndex + 1);
    const subjects = this.parseNounGroup(left);
    const targets = this.parseNounGroup(right);
    if (!subjects || !targets) return null;

    return {
      subjects,
      condition: {
        relation: tokens[relIndex].word,
        targets
      }
    };
  }

  parseNounGroup(tokens) {
    if (!tokens.length) return null;
    const values = [];
    for (let i=0; i<tokens.length; i++) {
      const t = tokens[i];
      if (i % 2 === 0) {
        if (t.kind !== 'noun') return null;
        values.push(t.word);
      } else {
        if (t.kind !== 'and' || t.word !== 'AND') return null;
      }
    }
    return values;
  }

  parseMixedGroup(tokens) {
    if (!tokens.length) return null;
    const values = [];
    for (let i=0; i<tokens.length; i++) {
      const t = tokens[i];
      if (i % 2 === 0) {
        if (!['noun','prop'].includes(t.kind)) return null;
        values.push({kind:t.kind, word:t.word});
      } else {
        if (t.kind !== 'and' || t.word !== 'AND') return null;
      }
    }
    return values;
  }

  dedupeRules(rules) {
    const seen = new Set();
    return rules.filter(r => {
      const key = JSON.stringify(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  matchesCondition(entity, condition) {
    if (!condition) return true;
    if (entity.type !== 'object') return false;
    const targets = new Set(condition.targets);

    const matchesTarget = o => targets.has(this.entityRuleNoun(o));

    if (condition.relation === 'ON') {
      return this.at(entity.x, entity.y).some(o => o.id !== entity.id && matchesTarget(o));
    }

    if (condition.relation === 'NEAR') {
      return this.entities.some(o => {
        if (o.id === entity.id || !matchesTarget(o)) return false;
        const dx = Math.abs(o.x - entity.x);
        const dy = Math.abs(o.y - entity.y);
        return Math.max(dx,dy) === 1;
      });
    }

    if (condition.relation === 'FACING') {
      const dirs = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
      const [dx,dy] = dirs[entity.dir || 'right'];
      return this.at(entity.x + dx, entity.y + dy).some(matchesTarget);
    }

    return false;
  }

  entityRuleNoun(entity) {
    if (entity.type === 'word') return 'TEXT';
    if (entity.type === 'object') return entity.noun;
    return null;
  }

  ruleMatchesEntity(rule, entity) {
    const noun = this.entityRuleNoun(entity);
    return !!noun && rule.subjects.includes(noun) && this.matchesCondition(entity, rule.condition);
  }

  metaHasProperty(noun, prop) {
    return this.rules.some(r => r.type === 'property' && !r.condition && r.property === prop && r.subjects.includes(noun));
  }

  entityHasProperty(entity, prop) {
    return this.rules.some(r => r.type === 'property' && r.property === prop && this.ruleMatchesEntity(r, entity));
  }

  nounHasUnconditionalProperty(noun, prop) {
    return this.rules.some(r => r.type === 'property' && !r.condition && r.property === prop && r.subjects.includes(noun));
  }

  isPushable(entity) {
    // Text remains physically pushable by default, but can also receive rule properties.
    return entity.type === 'word' || this.entityHasProperty(entity, 'PUSH');
  }

  isStop(entity) {
    return this.entityHasProperty(entity, 'STOP');
  }

  isYou(entity) {
    return this.entityHasProperty(entity, 'YOU');
  }

  isWin(entity) {
    return this.entityHasProperty(entity, 'WIN');
  }

  cellIsEmptyExcept(x,y,ignoreIds=[]) {
    const ignored = new Set(Array.isArray(ignoreIds) ? ignoreIds : [ignoreIds]);
    return !this.entities.some(e => e.x === x && e.y === y && !ignored.has(e.id));
  }

  spawn(noun, x, y, dir='right') {
    const entity = {id:`e${this.nextId++}`, type:'object', noun, x, y, dir};
    this.entities.push(entity);
    return entity;
  }

  applyTransformations() {
    const transforms = this.rules.filter(r => r.type === 'transform');
    if (!transforms.length) return false;

    let changed = false;
    const original = this.cloneEntities();
    const nounById = new Map();

    for (const e of original) {
      const matches = transforms.filter(r => this.ruleMatchesEntity(r, e));
      if (matches.length) nounById.set(e.id, matches[0].target);
    }

    for (const e of this.entities) {
      const target = nounById.get(e.id);
      if (!target) continue;
      if (e.type === 'word') {
        // A meta rule such as TEXT IS ROCK turns rule blocks into ordinary objects.
        delete e.word; delete e.kind;
        e.type = 'object'; e.noun = target;
        changed = true;
      } else if (target !== e.noun) {
        e.noun = target;
        changed = true;
      }
    }
    return changed;
  }

  settle(checkWin=true, opts={allowMake:true}) {
    for (let pass=0; pass<8; pass++) {
      this.parseRules();
      if (!this.applyTransformations()) break;
    }
    this.parseRules();
    this.resolveInteractions();
    this.parseRules();
    if (opts.allowMake) this.applyMakeRules();
    this.parseRules();
    if (checkWin) {
      this.checkWin();
      this.checkLoss();
    }
  }

  hasTargetsFor(entity) {
    return this.rules
      .filter(r => r.type === 'has' && this.ruleMatchesEntity(r, entity))
      .map(r => r.target);
  }

  destroyEntities(ids) {
    const idSet = new Set(ids);
    const doomed = this.entities.filter(e => idSet.has(e.id));
    const survivors = this.entities.filter(e => !idSet.has(e.id));
    const spawns = [];

    for (const e of doomed) {
      if (e.type !== 'object') continue;
      for (const target of this.hasTargetsFor(e)) {
        spawns.push({noun:target,x:e.x,y:e.y,dir:e.dir || 'right'});
      }
    }

    this.entities = survivors;
    for (const s of spawns) this.spawn(s.noun,s.x,s.y,s.dir);
  }

  resolveInteractions() {
    let changed = true;
    let guard = 0;

    while (changed && guard++ < 10) {
      changed = false;
      const kill = new Set();
      const cells = new Map();

      for (const e of this.entities) {
        const key = `${e.x},${e.y}`;
        if (!cells.has(key)) cells.set(key,[]);
        cells.get(key).push(e);
      }

      for (const group of cells.values()) {
        const objects = group.filter(e => e.type === 'object');
        if (!objects.length) continue;

        const opens = objects.filter(e => this.entityHasProperty(e,'OPEN'));
        const shuts = objects.filter(e => this.entityHasProperty(e,'SHUT'));
        if (opens.length && shuts.length) {
          opens.forEach(e => kill.add(e.id));
          shuts.forEach(e => kill.add(e.id));
        }

        const sinks = objects.filter(e => this.entityHasProperty(e,'SINK'));
        if (sinks.length && objects.length > sinks.length) {
          objects.forEach(e => kill.add(e.id));
        }

        const hots = objects.filter(e => this.entityHasProperty(e,'HOT'));
        if (hots.length) {
          objects.filter(e => this.entityHasProperty(e,'MELT')).forEach(e => kill.add(e.id));
        }

        const defeats = objects.filter(e => this.entityHasProperty(e,'DEFEAT'));
        if (defeats.length) {
          objects.filter(e => this.entityHasProperty(e,'YOU')).forEach(e => kill.add(e.id));
        }

        if (objects.length > 1) {
          objects.filter(e => this.entityHasProperty(e,'WEAK')).forEach(e => kill.add(e.id));
        }
      }

      if (kill.size) {
        this.destroyEntities([...kill]);
        this.parseRules();
        changed = true;
      }
    }
  }

  applyMakeRules() {
    const makeRules = this.rules.filter(r => r.type === 'make');
    if (!makeRules.length) return;

    const pending = [];
    const sources = this.entities.slice();
    for (const source of sources) {
      for (const rule of makeRules) {
        if (!this.ruleMatchesEntity(rule, source)) continue;
        const alreadyThere = this.objectsAt(source.x, source.y).some(o => o.noun === rule.target);
        if (!alreadyThere) pending.push({noun:rule.target,x:source.x,y:source.y,dir:source.dir || 'right'});
      }
    }
    for (const s of pending) this.spawn(s.noun,s.x,s.y,s.dir);
  }

  compatibleOpenShut(mover, other) {
    if (mover.type !== 'object' || other.type !== 'object') return false;
    return (
      (this.entityHasProperty(mover,'OPEN') && this.entityHasProperty(other,'SHUT')) ||
      (this.entityHasProperty(mover,'SHUT') && this.entityHasProperty(other,'OPEN'))
    );
  }

  canEnter(entity, nx, ny, dx, dy, trail) {
    if (!this.inBounds(nx,ny)) return false;
    const occupants = this.at(nx,ny).filter(o => o.id !== entity.id);

    if (!occupants.length && this.metaHasProperty('EMPTY','STOP')) return false;

    for (const other of occupants) {
      if (this.compatibleOpenShut(entity, other)) continue;
      if (this.isPushable(other)) {
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

    const dirName = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
    entity.dir = dirName;

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
    for (const mover of movers) this.tryMove(mover,dx,dy,new Set());

    this.steps += 1;
    this.settle(false,{allowMake:true});
    this.moveAutonomous();
    this.settle(true,{allowMake:true});
    return true;
  }

  moveAutonomous() {
    const dirs = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
    const reverse = {up:'down',down:'up',left:'right',right:'left'};
    const movers = this.entities.filter(e => this.entityHasProperty(e,'MOVE'));

    for (const mover of movers) {
      let dir = mover.dir || 'right';
      let [dx,dy] = dirs[dir];
      if (!this.tryMove(mover,dx,dy,new Set())) {
        dir = reverse[dir];
        mover.dir = dir;
        [dx,dy] = dirs[dir];
        this.tryMove(mover,dx,dy,new Set());
      }
    }
  }

  checkWin() {
    const yous = this.entities.filter(e => this.isYou(e));
    const wins = this.entities.filter(e => this.isWin(e));

    // LEVEL is a meta-subject. If LEVEL IS WIN, any surviving YOU satisfies the room.
    if (yous.length && this.metaHasProperty('LEVEL','WIN')) {
      this.won = true;
      return true;
    }

    // EMPTY means a tile containing nothing except the YOU entity currently standing there.
    if (this.metaHasProperty('EMPTY','WIN')) {
      for (const y of yous) {
        if (this.cellIsEmptyExcept(y.x,y.y,[y.id])) {
          this.won = true;
          return true;
        }
      }
    }

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
    this.lost = !this.won && !this.entities.some(e => this.isYou(e));
    return this.lost;
  }

  stateKey() {
    const ents = this.entities
      .map(e => [e.type, e.type === 'word' ? e.word : e.noun, e.kind || '', e.x,e.y,e.dir || ''])
      .sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return JSON.stringify(ents);
  }
}

if (typeof module !== 'undefined') module.exports = {RuleWorldEngine};
