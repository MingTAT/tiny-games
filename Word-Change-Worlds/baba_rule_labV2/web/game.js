(function(){
const modules=Object.create(null);
const cache=Object.create(null);
function require(name){const key=name.replace(/^\.\//, "");if(cache[key])return cache[key].exports;if(!modules[key])throw new Error("Unknown module: "+key);const m={exports:{}};cache[key]=m;modules[key](m,m.exports,require);return m.exports;}
modules["core"]=function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opposite = exports.properties = exports.nouns = void 0;
exports.clone = clone;
exports.create = create;
exports.inBounds = inBounds;
exports.parse = parse;
exports.rulesFor = rulesFor;
exports.props = props;
exports.has = has;
exports.step = step;
exports.replay = replay;
exports.fingerprint = fingerprint;
exports.nouns = new Set(['BABA', 'KEKE', 'ROCK', 'FLAG', 'WALL', 'WATER', 'SKULL', 'KEY', 'DOOR', 'GRASS', 'LOVE', 'TEXT']);
exports.properties = new Set(['YOU', 'WIN', 'STOP', 'PUSH', 'PULL', 'SINK', 'DEFEAT', 'HOT', 'MELT', 'OPEN', 'SHUT', 'WEAK', 'FLOAT', 'MOVE', 'SHIFT', 'SWAP', 'WORD']);
const ops = new Set(['IS', 'HAS', 'MAKE']);
const connectors = new Set(['AND', 'NOT', 'ON', 'NEAR', 'LONELY']);
const lexical = new Set([...exports.nouns, ...exports.properties, ...ops, ...connectors]);
const vectors = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
exports.opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
const directions = ['up', 'right', 'down', 'left'];
function clone(v) { return JSON.parse(JSON.stringify(v)); }
function create(width, height, entities) {
    let i = 0;
    return { width, height, entities: entities.map(e => ({ ...e, id: 'id' in e ? e.id : ++i, dir: 'dir' in e ? e.dir : 'right' })), turn: 0, status: 'playing' };
}
function inBounds(s, x, y) { return x >= 0 && y >= 0 && x < s.width && y < s.height; }
function at(s, x, y) { return s.entities.filter(e => e.x === x && e.y === y); }
function isWord(e) { return e.kind === 'TEXT' && !!e.word; }
function matchSequence(tokens, ids) {
    // Small but strict grammar: [LONELY] [NOT] NOUN (AND [NOT] NOUN)* [ON/NEAR [NOT] NOUN] VERB [NOT] (NOUN|PROPERTY) (AND ...)*
    const result = [];
    for (let operator = 1; operator < tokens.length - 1; operator++) {
        const verb = tokens[operator];
        if (!ops.has(verb))
            continue;
        let i = 0;
        let conditions = [];
        if (tokens[i] === 'LONELY') {
            conditions.push({ kind: 'LONELY' });
            i++;
        }
        const subjects = [];
        while (i < operator) {
            const negative = tokens[i] === 'NOT';
            if (negative)
                i++;
            if (!exports.nouns.has(tokens[i]))
                break;
            subjects.push({ name: tokens[i++], negative });
            if (tokens[i] === 'AND' && i + 1 < operator) {
                i++;
                continue;
            }
            break;
        }
        if (!subjects.length)
            continue;
        if (i < operator && (tokens[i] === 'ON' || tokens[i] === 'NEAR')) {
            const kind = tokens[i++];
            const negative = tokens[i] === 'NOT';
            if (negative)
                i++;
            if (!exports.nouns.has(tokens[i]))
                continue;
            conditions.push({ kind, target: tokens[i++], negated: negative });
        }
        if (i !== operator)
            continue;
        const preds = [];
        i = operator + 1;
        while (i < tokens.length) {
            const negative = tokens[i] === 'NOT';
            if (negative)
                i++;
            const p = tokens[i];
            if (verb === 'IS' ? !exports.properties.has(p) && !exports.nouns.has(p) : !exports.nouns.has(p))
                break;
            preds.push({ name: p, negative });
            i++;
            if (i === tokens.length)
                break;
            if (tokens[i] !== 'AND' || i + 1 === tokens.length)
                break;
            i++;
        }
        if (i !== tokens.length || !preds.length)
            continue;
        for (const sub of subjects)
            for (const pred of preds) {
                result.push({ subject: sub.name, subjectNegated: sub.negative, verb: verb, predicate: pred.name, predicateNegated: pred.negative, conditions: clone(conditions), wordIds: ids });
            }
    }
    return result;
}
/** Parse a board with a chosen set of object IDs acting as noun words. */
function parseWithWordObjects(state, wordObjects) {
    const tiles = new Map();
    for (const e of state.entities)
        if (isWord(e) || (wordObjects.has(e.id) && e.kind !== 'TEXT' && exports.nouns.has(e.kind))) {
            const k = `${e.x},${e.y}`;
            const group = tiles.get(k) || [];
            group.push(e);
            tiles.set(k, group);
        }
    const found = [];
    const seen = new Set();
    const get = (x, y) => tiles.get(`${x},${y}`) || [];
    const token = (e) => e.kind === 'TEXT' ? e.word : e.kind;
    for (const [dx, dy] of [[1, 0], [0, 1]])
        for (let y = 0; y < state.height; y++)
            for (let x = 0; x < state.width; x++) {
                if (!get(x, y).length)
                    continue;
                const prev = get(x - dx, y - dy);
                if (prev.length && prev.every(e => ['NOT', 'LONELY', 'ON', 'NEAR', 'AND'].includes(token(e) || '')))
                    continue;
                const cells = [];
                for (let k = 0; k < 18; k++) {
                    const xx = x + k * dx, yy = y + k * dy;
                    if (!inBounds(state, xx, yy) || !get(xx, yy).length)
                        break;
                    cells.push(get(xx, yy));
                }
                if (cells.length < 3)
                    continue;
                function visit(index, words, ids) {
                    if (index >= cells.length)
                        return;
                    for (const e of cells[index]) {
                        const word = token(e);
                        if (!word || !lexical.has(word))
                            continue;
                        const next = [...words, word], nextIds = [...ids, e.id];
                        if (next.length >= 3)
                            for (const r of matchSequence(next, nextIds)) {
                                const fingerprint = `${r.subject}/${r.subjectNegated}/${r.verb}/${r.predicate}/${r.predicateNegated}/${JSON.stringify(r.conditions)}/${r.wordIds.join(',')}`;
                                if (!seen.has(fingerprint)) {
                                    seen.add(fingerprint);
                                    found.push(r);
                                }
                            }
                        visit(index + 1, next, nextIds);
                    }
                }
                visit(0, [], []);
            }
    return found;
}
/**
 * Resolve WORD starting from rules made of literal text.  Added word-capable
 * objects can expose more rules. A fixed bound guards self-referential puzzles;
 * full original infinite-loop semantics are not claimed.
 */
function parse(state) {
    let eligible = new Set();
    let rules = parseWithWordObjects(state, eligible);
    for (let attempt = 0; attempt < 16; attempt++) {
        const next = new Set();
        for (const e of state.entities) {
            if (e.kind !== 'TEXT' && exports.nouns.has(e.kind) && has(state, e, 'WORD', rules))
                next.add(e.id);
        }
        if (next.size === eligible.size && [...next].every(id => eligible.has(id)))
            return rules;
        eligible = next;
        rules = parseWithWordObjects(state, eligible);
    }
    return rules;
}
function matchesSubject(e, r) {
    const match = e.kind === r.subject;
    return r.subjectNegated ? !match : match;
}
function conditionMatches(s, e, r) {
    return r.conditions.every(c => {
        if (c.kind === 'LONELY')
            return !at(s, e.x, e.y).some(other => other.id !== e.id);
        const neighbors = c.kind === 'ON' ? at(s, e.x, e.y).filter(other => other.id !== e.id) : s.entities.filter(other => other.id !== e.id && Math.abs(other.x - e.x) <= 1 && Math.abs(other.y - e.y) <= 1);
        const valid = neighbors.some(other => other.kind === c.target);
        return c.negated ? !valid : valid;
    });
}
function rulesFor(s, e, rules) {
    return rules.filter(r => matchesSubject(e, r) && conditionMatches(s, e, r));
}
function props(s, e, rules) {
    const rr = rulesFor(s, e, rules).filter(r => r.verb === 'IS' && exports.properties.has(r.predicate));
    const positives = new Set(rr.filter(r => !r.predicateNegated).map(r => r.predicate));
    if (e.kind === 'TEXT')
        positives.add('PUSH');
    for (const neg of rr.filter(r => r.predicateNegated))
        positives.delete(neg.predicate);
    return positives;
}
function has(s, e, prop, rules) { return props(s, e, rules).has(prop); }
function sameLayer(s, a, b, rules) { return has(s, a, 'FLOAT', rules) === has(s, b, 'FLOAT', rules); }
function nextId(s) { return Math.max(0, ...s.entities.map(e => e.id)) + 1; }
function commitMovement(s, root, dir, rules, events, moved) {
    if (moved.has(root.id))
        return false;
    const [dx, dy] = vectors[dir];
    const plan = new Map();
    const visiting = new Set();
    function traverse(e) {
        if (plan.has(e.id))
            return true;
        if (visiting.has(e.id))
            return false;
        const x = e.x + dx, y = e.y + dy;
        if (!inBounds(s, x, y))
            return false;
        visiting.add(e.id);
        for (const other of at(s, x, y)) {
            if (other.id === e.id)
                continue;
            // Movement blockers do not require matching FLOAT layers; FLOAT separates interactions, not PUSH/STOP collision.
            if (has(s, other, 'SWAP', rules))
                continue;
            if (has(s, other, 'PUSH', rules)) {
                if (!traverse(other)) {
                    visiting.delete(e.id);
                    return false;
                }
            }
            else if (has(s, other, 'STOP', rules)) {
                visiting.delete(e.id);
                return false;
            }
        }
        visiting.delete(e.id);
        plan.set(e.id, [x, y]);
        return true;
    }
    if (!traverse(root))
        return false;
    const original = new Map(s.entities.map(e => [e.id, [e.x, e.y]]));
    // SWAP can exchange places with objects occupying the destination; no duplicate movement in a transaction.
    const swapped = [];
    for (const id of plan.keys()) {
        const moving = s.entities.find(e => e.id === id);
        const [x, y] = plan.get(id);
        for (const other of at(s, x, y))
            if (!plan.has(other.id) && has(s, other, 'SWAP', rules) && !swapped.some(e => e.id === other.id)) {
                const [ox, oy] = original.get(id);
                other.x = ox;
                other.y = oy;
                swapped.push(other);
                moved.add(other.id);
            }
    }
    for (const [id, [x, y]] of plan) {
        const obj = s.entities.find(e => e.id === id);
        obj.x = x;
        obj.y = y;
        obj.dir = dir;
        moved.add(id);
    }
    for (const obj of swapped)
        events.push({ phase: 'movement', type: 'swap', ids: [root.id, obj.id] });
    events.push({ phase: 'movement', type: 'move', ids: [...plan.keys()], detail: dir });
    // PULL behind each moved object. If pulling fails, the leading movement remains committed.
    const pulled = new Set();
    function pull(oldX, oldY, depth) {
        if (depth > s.entities.length)
            return;
        for (const follower of at(s, oldX - dx, oldY - dy)) {
            if (!has(s, follower, 'PULL', rules) || plan.has(follower.id) || pulled.has(follower.id) || moved.has(follower.id))
                continue;
            const blocking = at(s, oldX, oldY).some(e => e.id !== follower.id && (has(s, e, 'PUSH', rules) || has(s, e, 'STOP', rules)));
            if (blocking)
                continue;
            pulled.add(follower.id);
            moved.add(follower.id);
            const fx = follower.x, fy = follower.y;
            follower.x = oldX;
            follower.y = oldY;
            events.push({ phase: 'movement', type: 'pull', ids: [follower.id] });
            pull(fx, fy, depth + 1);
        }
    }
    for (const id of plan.keys()) {
        const [x, y] = original.get(id);
        pull(x, y, 0);
    }
    return true;
}
function moveStage(s, dir, kind, events) {
    const rules = parse(s), moved = new Set();
    if (kind === 'SHIFT') {
        const conveyors = s.entities.filter(e => has(s, e, 'SHIFT', rules)).sort((a, b) => a.id - b.id);
        // Baseline SHIFT behavior only: grouped/multi-SHIFT stacking is not yet original-parity.
        for (const conveyor of conveyors) {
            for (const target of at(s, conveyor.x, conveyor.y)) {
                if (target.id === conveyor.id || moved.has(target.id))
                    continue;
                commitMovement(s, target, conveyor.dir, rules, events, moved);
            }
        }
        return;
    }
    let movers = s.entities.filter(e => has(s, e, kind, rules));
    if (kind === 'YOU' && dir) {
        const [dx, dy] = vectors[dir];
        movers.sort((a, b) => (b.x * dx + b.y * dy) - (a.x * dx + a.y * dy) || a.id - b.id);
    }
    if (kind === 'MOVE')
        movers.sort((a, b) => a.id - b.id);
    for (const e of movers) {
        if (moved.has(e.id))
            continue;
        const d = kind === 'YOU' ? dir : e.dir;
        if (!commitMovement(s, e, d, rules, events, moved) && kind === 'MOVE')
            e.dir = exports.opposite[e.dir];
    }
}
function nounUnit(source, target, id) {
    // X IS TEXT produces the text tile spelling X, not a non-parsable TEXT icon.
    // Likewise TEXT IS X creates an object of type X.
    return { ...source, id, kind: target, word: target === 'TEXT' ? (source.kind === 'TEXT' ? (source.word || 'TEXT') : source.kind) : undefined };
}
function transform(s, events) {
    const rules = parse(s), output = [];
    let id = nextId(s);
    for (const e of s.entities) {
        const matches = rulesFor(s, e, rules).filter(r => r.verb === 'IS' && exports.nouns.has(r.predicate));
        const denied = new Set(matches.filter(r => r.predicateNegated).map(r => r.predicate));
        // X IS X protects X against every IS-to-noun conversion.
        const protectedSelf = matches.some(r => !r.predicateNegated && r.predicate === e.kind);
        if (denied.has(e.kind) && !protectedSelf) {
            events.push({ phase: 'transform', type: 'vanish', ids: [e.id], detail: `${e.kind} IS NOT ${e.kind}` });
            continue;
        }
        const positive = protectedSelf ? [] : [...new Set(matches.filter(r => !r.predicateNegated && r.predicate !== e.kind && !denied.has(r.predicate)).map(r => r.predicate))];
        if (!positive.length) {
            output.push(e);
            continue;
        }
        for (const kind of positive) {
            const unit = nounUnit(e, kind, id++);
            output.push(unit);
            events.push({ phase: 'transform', type: 'transform', ids: [e.id, unit.id], detail: `${e.kind} -> ${kind === 'TEXT' ? 'text ' + e.kind : kind}` });
        }
    }
    s.entities = output;
}
function spawnOnDeleteWithOldState(s, beforeDeletion, deleted, rules, events) {
    let id = nextId(s);
    let spawned = 0;
    for (const e of deleted) {
        const rr = rulesFor(beforeDeletion, e, rules).filter(r => r.verb === 'HAS' && !r.predicateNegated && !rulesFor(beforeDeletion, e, rules).some(other => other.verb === 'HAS' && other.predicateNegated && other.predicate === r.predicate));
        for (const kind of new Set(rr.map(r => r.predicate))) {
            if (spawned++ > 128)
                break;
            s.entities.push(nounUnit(e, kind, id++));
            events.push({ phase: 'interaction', type: 'has', ids: [e.id, id - 1], detail: kind });
        }
    }
}
function interact(s, events) {
    const rules = parse(s), removed = new Set();
    for (let i = 0; i < s.entities.length; i++)
        for (let j = i + 1; j < s.entities.length; j++) {
            const a = s.entities[i], b = s.entities[j];
            if (a.x !== b.x || a.y !== b.y || !sameLayer(s, a, b, rules))
                continue;
            const aHas = (p) => has(s, a, p, rules), bHas = (p) => has(s, b, p, rules);
            if (aHas('SINK') || bHas('SINK')) {
                removed.add(a.id);
                removed.add(b.id);
            }
            if (aHas('DEFEAT') && bHas('YOU'))
                removed.add(b.id);
            if (bHas('DEFEAT') && aHas('YOU'))
                removed.add(a.id);
            if (aHas('HOT') && bHas('MELT'))
                removed.add(b.id);
            if (bHas('HOT') && aHas('MELT'))
                removed.add(a.id);
            if ((aHas('OPEN') && bHas('SHUT')) || (aHas('SHUT') && bHas('OPEN'))) {
                removed.add(a.id);
                removed.add(b.id);
            }
            if (aHas('WEAK'))
                removed.add(a.id);
            if (bHas('WEAK'))
                removed.add(b.id);
        }
    if (removed.size) {
        const beforeDeletion = clone(s);
        const dead = s.entities.filter(e => removed.has(e.id));
        s.entities = s.entities.filter(e => !removed.has(e.id));
        events.push({ phase: 'interaction', type: 'destroy', ids: [...removed] });
        spawnOnDeleteWithOldState(s, beforeDeletion, dead, rules, events);
    }
}
function makeEntities(s, events) {
    const rules = parse(s);
    let id = nextId(s);
    const created = [];
    for (const e of s.entities) {
        const rr = rulesFor(s, e, rules).filter(r => r.verb === 'MAKE' && !r.predicateNegated);
        for (const kind of new Set(rr.map(r => r.predicate))) {
            if (rulesFor(s, e, rules).some(r => r.verb === 'MAKE' && r.predicateNegated && r.predicate === kind))
                continue;
            if ([...s.entities, ...created].some(other => other.x === e.x && other.y === e.y && other.kind === kind))
                continue;
            if (created.length >= 128)
                break;
            const newEntity = nounUnit(e, kind, id++);
            created.push(newEntity);
            events.push({ phase: 'make', type: 'create', ids: [e.id, newEntity.id], detail: kind });
        }
    }
    s.entities.push(...created);
}
function winCheck(s, events) {
    const rules = parse(s);
    for (const e of s.entities) {
        if (!has(s, e, 'YOU', rules))
            continue;
        if (has(s, e, 'WIN', rules) || s.entities.some(other => other.id !== e.id && other.x === e.x && other.y === e.y && sameLayer(s, e, other, rules) && has(s, other, 'WIN', rules))) {
            s.status = 'won';
            events.push({ phase: 'victory', type: 'win', ids: [e.id] });
            break;
        }
    }
}
function step(previous, input) {
    const s = clone(previous), events = [];
    if (s.status === 'won')
        return { state: s, events, rules: parse(s) };
    if (input !== 'wait' && !directions.includes(input))
        throw new Error('Invalid input');
    if (input !== 'wait')
        moveStage(s, input, 'YOU', events);
    events.push({ phase: 'rules', type: 'reparse', detail: 'post YOU' });
    moveStage(s, undefined, 'MOVE', events);
    events.push({ phase: 'rules', type: 'reparse', detail: 'post MOVE' });
    moveStage(s, undefined, 'SHIFT', events);
    events.push({ phase: 'rules', type: 'reparse', detail: 'post SHIFT' });
    transform(s, events);
    events.push({ phase: 'rules', type: 'reparse', detail: 'post transform' });
    makeEntities(s, events);
    interact(s, events);
    winCheck(s, events);
    s.turn++;
    return { state: s, events, rules: parse(s) };
}
function replay(initial, moves) {
    const states = [clone(initial)], turns = [];
    for (const move of moves) {
        const turn = step(states[states.length - 1], move);
        turns.push(turn);
        states.push(clone(turn.state));
    }
    return { states, turns };
}
function fingerprint(s) { return JSON.stringify({ w: s.width, h: s.height, entities: s.entities.map(e => ({ ...e })).sort((a, b) => a.id - b.id), turn: s.turn, status: s.status }); }

};
modules["levels"]=function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.puzzles = void 0;
const core_1 = require("./core");
const objects = { '#': 'WALL', 'b': 'BABA', 'r': 'ROCK', 'f': 'FLAG', 'w': 'WATER', 's': 'SKULL', 'k': 'KEKE', 'd': 'DOOR', 'g': 'GRASS' };
function level(title, hint, concept, map, phrases, extras = [], stacked = []) {
    const list = [];
    const w = Math.max(...map.map(x => x.length));
    for (let y = 0; y < map.length; y++)
        for (let x = 0; x < w; x++)
            if (objects[map[y]?.[x]])
                list.push({ kind: objects[map[y][x]], x, y });
    for (const [phrase, x, y, axis = 'h'] of phrases)
        for (const [i, word] of phrase.split(' ').entries())
            list.push({ kind: 'TEXT', word, x: x + (axis === 'h' ? i : 0), y: y + (axis === 'v' ? i : 0) });
    for (const [word, x, y] of extras)
        list.push({ kind: 'TEXT', word, x, y });
    list.push(...stacked);
    return { title, hint, concept, state: (0, core_1.create)(w, map.length, list) };
}
const BABA = ['BABA IS YOU', 0, 0];
const FLAG = ['FLAG IS WIN', 9, 0];
const WALL = ['WALL IS STOP', 0, 8];
exports.puzzles = [
    level('01 — 打断法律', '不是墙消失，而是“墙必须阻挡你”这条法律失效。', '规则失效', [
        '......#.....', '..b...#..f..', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....'
    ], [BABA, FLAG, ['WALL IS STOP', 1, 5]]),
    level('02 — 改写目标', '墙另一侧的旗帜不一定是唯一的 WIN。', '重定义胜利', [
        '......#.....', '..b.r.#...f.', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....'
    ], [BABA, FLAG, WALL, ['ROCK IS', 1, 5]], [['WIN', 3, 6]]),
    level('03 — 远方的你', '你不必越过墙，只需要让墙另一侧的生物也成为 YOU。', '转移控制权', [
        '......#.....', '..b...#..f..', '......#.....', '......#..k..', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....'
    ], [BABA, FLAG, WALL, ['KEKE IS', 1, 5]], [['YOU', 3, 6]]),
    level('04 — 对抗旧规则', 'WALL IS STOP 保留，同时建立 WALL IS NOT STOP。', '规则冲突', [
        '......#.....', '..b...#..f..', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....'
    ], [BABA, FLAG, WALL, ['WALL IS NOT', 1, 4]], [['STOP', 4, 5]]),
    level('05 — 身份与胜利', '两条规则需要同时成立：谁被控制，以及什么算胜利？', '连锁改写', [
        '......#.....', '..b...#.....', '......#..f..', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....', '......#.....'
    ], [BABA, WALL, ['ROCK IS WIN', 4, 0], ['FLAG IS', 1, 5], ['ROCK IS', 3, 3]], [['ROCK', 3, 6], ['YOU', 5, 4]]),
    level('06 — 石头就是单词', 'ROCK IS WORD 使岩石本身可以当作 ROCK 文字。先完成岩石旁边的句子。', '物体参与组句', [
        '............', '............', '............', '............', '...r...b....', '............', '.........r..', '............', '............'
    ], [['ROCK IS WORD', 0, 0], ['BABA IS YOU', 7, 0]], [['IS', 4, 4], ['WIN', 6, 4]]),
    level('07 — 岩石变成文字', '先完成 ROCK ON WATER IS TEXT。只有站在水上的岩石变成文字，再读取新的横向规则。', '条件文字变形', [
        '............', '............', '............', '....b.......', '............', '...r........', '........r...', '............', '............'
    ], [['BABA IS YOU', 6, 0], ['ROCK ON WATER IS', 0, 1]], [['TEXT', 4, 2], ['IS', 4, 5], ['WIN', 5, 5]], [{ kind: 'WATER', x: 3, y: 5 }])
];

};
modules["ui"]=function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
const levels_1 = require("./levels");
const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
const shell = document.querySelector('#game-area');
const rulesEl = document.querySelector('#rules');
const turnEl = document.querySelector('#turn');
const statusEl = document.querySelector('#status');
const titleEl = document.querySelector('#level-title');
const levelEl = document.querySelector('#levels');
const hintEl = document.querySelector('#hint');
const traceEl = document.querySelector('#trace');
let level = 0;
let state = (0, core_1.clone)(levels_1.puzzles[0].state);
let past = [];
let future = [];
let lastEvents = [];
const C = { background: '#101d28', board: '#172937', floor: '#203746', stroke: '#334b57', word: '#f1e0ae', wordBorder: '#ccac64', ink: '#293041', baba: '#f1f0dc', keke: '#d9b2ef', rock: '#aaa4a0', wall: '#65858f', flag: '#f3c16c', water: '#4ba4c3', skull: '#e0ded8', key: '#f6d47f', door: '#ba8b68' };
function choose(i) { level = i; state = (0, core_1.clone)(levels_1.puzzles[i].state); past = []; future = []; lastEvents = []; hintEl.textContent = ''; draw(); }
function apply(dir) {
    if (state.status === 'won')
        return;
    past.push((0, core_1.clone)(state));
    if (past.length > 500)
        past.shift();
    future = [];
    const result = (0, core_1.step)(state, dir);
    state = result.state;
    lastEvents = result.events.filter(e => e.type !== 'reparse').map(e => `${e.phase} · ${e.type} ${e.detail || ''}`).slice(-7);
    draw();
}
function undo() { if (!past.length)
    return; future.push((0, core_1.clone)(state)); state = past.pop(); lastEvents = ['undo']; draw(); }
function redo() { if (!future.length)
    return; past.push((0, core_1.clone)(state)); state = future.pop(); lastEvents = ['redo']; draw(); }
function restart() { choose(level); }
function roundRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
function tileShape(e, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    const col = C[e.kind.toLowerCase()] || '#b8d1a3';
    ctx.fillStyle = col;
    ctx.strokeStyle = '#182936';
    ctx.lineWidth = 2;
    const t = size * .30;
    switch (e.kind) {
        case 'BABA':
        case 'KEKE':
            ctx.beginPath();
            ctx.ellipse(0, 2, t * .8, t * .77, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            for (const dx of [-t * .45, t * .45]) {
                ctx.beginPath();
                ctx.ellipse(dx, -t * .75, t * .29, t * .52, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
            ctx.fillStyle = '#26353b';
            ctx.fillRect(-t * .34, -2, 3, 4);
            ctx.fillRect(t * .24, -2, 3, 4);
            break;
        case 'FLAG':
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#f8e8c1';
            ctx.beginPath();
            ctx.moveTo(-t * .4, t);
            ctx.lineTo(-t * .4, -t);
            ctx.stroke();
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(-t * .37, -t);
            ctx.lineTo(t * .95, -t * .6);
            ctx.lineTo(-t * .37, -t * .05);
            ctx.closePath();
            ctx.fill();
            break;
        case 'WALL':
            roundRect(-t, -t, t * 2, t * 2, 3, col, '#385a65');
            ctx.strokeStyle = '#365866';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(-t, 0);
            ctx.lineTo(t, 0);
            ctx.moveTo(0, -t);
            ctx.lineTo(0, 0);
            ctx.moveTo(-t * .55, 0);
            ctx.lineTo(-t * .55, t);
            ctx.stroke();
            break;
        case 'ROCK':
            ctx.beginPath();
            ctx.moveTo(-t, -t * .1);
            ctx.lineTo(-t * .42, -t * .88);
            ctx.lineTo(t * .50, -t * .7);
            ctx.lineTo(t, t * .23);
            ctx.lineTo(t * .25, t * .83);
            ctx.lineTo(-t * .74, t * .68);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'WATER':
            ctx.beginPath();
            ctx.ellipse(0, 4, t, t * .65, 0, 0, 2 * Math.PI);
            ctx.fill();
            break;
        default:
            ctx.beginPath();
            ctx.arc(0, 0, t, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#182936';
            ctx.font = `bold ${Math.floor(size * .25)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(e.kind.slice(0, 1), 0, 0);
    }
    ctx.restore();
}
function render() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.background;
    ctx.fillRect(0, 0, w, h);
    const size = Math.min((w - 30) / state.width, (h - 26) / state.height);
    const ox = (w - size * state.width) / 2, oy = (h - size * state.height) / 2;
    roundRect(ox - 7, oy - 7, state.width * size + 14, state.height * size + 14, 13, C.board);
    for (let y = 0; y < state.height; y++)
        for (let x = 0; x < state.width; x++) {
            roundRect(ox + x * size + 1.3, oy + y * size + 1.3, size - 2.6, size - 2.6, Math.max(2, size * .1), C.floor);
        }
    const rs = (0, core_1.parse)(state);
    const used = new Set(rs.flatMap(r => r.wordIds));
    for (const e of state.entities.filter(e => e.kind !== 'TEXT')) {
        const x = ox + e.x * size, y = oy + e.y * size;
        if (used.has(e.id)) {
            roundRect(x + size * .08, y + size * .08, size * .84, size * .84, Math.max(4, size * .14), '#b58a4e', '#f1ce81');
        }
        tileShape(e, x, y, size);
    }
    for (const e of state.entities.filter(e => e.kind === 'TEXT')) {
        const x = ox + e.x * size, y = oy + e.y * size;
        const active = used.has(e.id);
        roundRect(x + size * .065, y + size * .075, size * .87, size * .85, Math.max(4, size * .11), active ? '#f5dc99' : C.word, active ? '#d5a250' : C.wordBorder);
        const word = e.word || '';
        const n = word.length;
        const f = Math.min(size * .25, (size * .77) / (Math.max(2, n) * .62));
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 ${Math.max(8, Math.floor(f))}px system-ui, sans-serif`;
        ctx.fillStyle = C.ink;
        ctx.fillText(word, x + size * .5, y + size * .52, size * .8);
    }
    if (state.status === 'won') {
        roundRect(ox + size * .7, oy + state.height * size * .43, state.width * size - size * 1.4, size * 1.3, 14, 'rgba(11,33,43,.92)', '#b0d8c6');
        ctx.font = `bold ${Math.min(38, size * .7)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#bfe7c8';
        ctx.fillText('规则已改写 · WIN', w / 2, oy + state.height * size * .43 + size * .65);
    }
}
function draw() {
    titleEl.textContent = levels_1.puzzles[level].title;
    turnEl.textContent = String(state.turn);
    statusEl.textContent = state.status === 'won' ? '已通关' : '进行中';
    const active = (0, core_1.parse)(state);
    const list = [...new Set(active.map(r => `${r.subjectNegated ? 'NOT ' : ''}${r.subject}${r.conditions.map(c => c.kind === 'LONELY' ? ' LONELY' : ` ${c.kind} ${c.negated ? 'NOT ' : ''}${c.target}`).join('')} ${r.verb} ${r.predicateNegated ? 'NOT ' : ''}${r.predicate}`))];
    rulesEl.replaceChildren();
    for (const str of list) {
        const tag = document.createElement('span');
        tag.className = 'rule-tag';
        tag.textContent = str;
        rulesEl.appendChild(tag);
    }
    if (!list.length)
        rulesEl.textContent = '暂无生效规则';
    traceEl.textContent = lastEvents.join('\n') || '每次行动的事件轨迹会在这里显示。';
    levelEl.replaceChildren();
    levels_1.puzzles.forEach((l, i) => {
        const b = document.createElement('button');
        b.className = `level-btn ${i === level ? 'selected' : ''}`;
        b.textContent = String(i + 1).padStart(2, '0');
        b.title = l.concept;
        b.onclick = () => choose(i);
        levelEl.appendChild(b);
    });
    render();
}
window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    const map = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
    if (map[key]) {
        e.preventDefault();
        apply(map[key]);
    }
    else if (key === 'z') {
        e.preventDefault();
        undo();
    }
    else if (key === 'y') {
        e.preventDefault();
        redo();
    }
    else if (key === 'r') {
        e.preventDefault();
        restart();
    }
    else if (key === ' ') {
        e.preventDefault();
        apply('wait');
    }
});
document.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => {
    const action = b.dataset.action;
    if (action === 'undo')
        undo();
    else if (action === 'redo')
        redo();
    else if (action === 'restart')
        restart();
    else if (action === 'wait')
        apply('wait');
    else if (action === 'hint') {
        hintEl.textContent = levels_1.puzzles[level].hint;
    }
    else
        apply(action);
}));
let touch = null;
canvas.addEventListener('touchstart', e => { if (e.touches.length)
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
canvas.addEventListener('touchend', e => { if (!touch)
    return; const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y; touch = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 25)
    return; apply(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); }, { passive: true });
canvas.width = 960;
canvas.height = 690;
draw();
// Debug hooks used only in smoke tests; no mutation of game internals.
window.WCW_DEBUG = { getState: () => (0, core_1.clone)(state), getFingerprint: () => (0, core_1.fingerprint)(state), choose, apply, undo, redo };

};
require("ui");
})();