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
exports.groupDiagnostic = groupDiagnostic;
exports.rulesFor = rulesFor;
exports.groupMembers = groupMembers;
exports.props = props;
exports.has = has;
exports.step = step;
exports.replay = replay;
exports.fingerprint = fingerprint;
exports.nouns = new Set(['BABA', 'KEKE', 'ROCK', 'FLAG', 'WALL', 'WATER', 'SKULL', 'KEY', 'DOOR', 'GRASS', 'LOVE', 'TEXT', 'GROUP', 'GROUP2', 'GROUP3', 'EMPTY']);
exports.properties = new Set(['YOU', 'WIN', 'STOP', 'PUSH', 'PULL', 'SINK', 'DEFEAT', 'HOT', 'MELT', 'OPEN', 'SHUT', 'WEAK', 'FLOAT', 'MOVE', 'SHIFT', 'TELE', 'SWAP', 'WORD', 'SAFE', 'STILL', 'GROUP', 'GROUP2', 'GROUP3']);
const ops = new Set(['IS', 'HAS', 'MAKE', 'EAT']);
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
/** Derived GROUP-family memberships. Positive cycles converge by fixed-point;
 * self-negative loops can oscillate and must NOT be silently approximated.
 * We detect repeated configurations and report a reversible loop state. */
const groupNames = ['GROUP', 'GROUP2', 'GROUP3'];
const isGroup = (name) => groupNames.some(g => g === name);
function empties(s) {
    const occupied = new Set(s.entities.map(e => `${e.x},${e.y}`));
    const out = [];
    for (let y = 0; y < s.height; y++)
        for (let x = 0; x < s.width; x++)
            if (!occupied.has(`${x},${y}`)) {
                out.push({ id: -1 - (y * s.width + x), kind: 'EMPTY', x, y, dir: 'right' });
            }
    return out;
}
function groupCondition(s, e, target, kind, members) {
    const near = (other) => other.id !== e.id && (kind === 'ON' ? (other.x === e.x && other.y === e.y) : (Math.abs(other.x - e.x) <= 1 && Math.abs(other.y - e.y) <= 1));
    if (isGroup(target)) {
        // GROUP in a condition means all represented member kinds, not any member.
        const universe = members?.[target] && [...members[target]].some(id => id < 0) ? [...s.entities, ...empties(s)] : s.entities;
        const all = universe.filter(o => members?.[target]?.has(o.id));
        const kinds = [...new Set(all.map(o => o.kind))];
        return kinds.length > 0 && kinds.every(name => all.some(other => other.kind === name && near(other)));
    }
    if (target === 'EMPTY')
        return empties(s).some(near);
    return s.entities.some(o => o.kind === target && near(o));
}
function conditionMatches(s, e, r, members) {
    return r.conditions.every(c => {
        if (c.kind === 'LONELY')
            return !at(s, e.x, e.y).some(other => other.id !== e.id);
        const valid = groupCondition(s, e, c.target, c.kind, members);
        return c.negated ? !valid : valid;
    });
}
function analyzeGroups(s, rules) {
    let groups = Object.fromEntries(groupNames.map(g => [g, new Set()]));
    const entities = rules.some(r => r.subject === 'EMPTY' && r.verb === 'IS' && isGroup(r.predicate))
        ? [...s.entities, ...empties(s)] : s.entities;
    if (!rules.some(r => r.verb === 'IS' && isGroup(r.predicate)))
        return { groups, loop: false, iterations: 0 };
    const cap = Math.max(16, entities.length * groupNames.length * 2 + 8);
    const signature = (state) => groupNames.map(g => `${g}:${[...state[g]].sort((a, b) => a - b).join(',')}`).join('|');
    const seen = new Set([signature(groups)]);
    for (let pass = 0; pass < cap; pass++) {
        const next = Object.fromEntries(groupNames.map(g => [g, new Set()]));
        for (const e of entities) {
            for (const group of groupNames) {
                let positive = false, negative = false;
                for (const r of rules) {
                    if (r.verb !== 'IS' || r.predicate !== group)
                        continue;
                    const hit = isGroup(r.subject) ? groups[r.subject].has(e.id) : r.subject === 'TEXT' ? e.kind === 'TEXT' : r.subject === e.kind;
                    if ((r.subjectNegated ? !hit : hit) && conditionMatches(s, e, r, groups)) {
                        if (r.predicateNegated)
                            negative = true;
                        else
                            positive = true;
                    }
                }
                if (positive && !negative)
                    next[group].add(e.id);
            }
        }
        if (groupNames.every(g => next[g].size === groups[g].size && [...next[g]].every(id => groups[g].has(id))))
            return { groups: next, loop: false, iterations: pass + 1 };
        const key = signature(next);
        if (seen.has(key))
            return { groups: next, loop: true, iterations: pass + 1 };
        seen.add(key);
        groups = next;
    }
    return { groups, loop: true, iterations: cap };
}
function resolveGroups(s, rules) { return analyzeGroups(s, rules).groups; }
function groupDiagnostic(s, rules) {
    const { groups, loop, iterations } = analyzeGroups(s, rules);
    return { members: Object.fromEntries(groupNames.map(g => [g, [...groups[g]].sort((a, b) => a - b)])), loop, iterations };
}
function matchesSubject(s, e, r, rules, groups) {
    const match = isGroup(r.subject) ? !!groups?.[r.subject]?.has(e.id) : e.kind === r.subject;
    return r.subjectNegated ? !match : match;
}
function rulesFor(s, e, rules) {
    const groups = resolveGroups(s, rules);
    return rules.filter(r => matchesSubject(s, e, r, rules, groups) && conditionMatches(s, e, r, groups));
}
/** Visible for tests and future condition-aware rule inspection. */
function groupMembers(s, rules) {
    const groups = resolveGroups(s, rules);
    return Object.fromEntries(groupNames.map(g => [g, [...groups[g]].sort((a, b) => a - b)]));
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
/**
 * Transactional movement: inspect every object that must move before changing
 * any coordinate. EAT and OPEN/SHUT resolve against destination objects as
 * part of the attempted move rather than waiting for a later overlap.
 */
function commitMovement(s, root, dir, rules, events, moved) {
    if (moved.has(root.id) || has(s, root, 'STILL', rules))
        return false;
    const [dx, dy] = vectors[dir];
    const plan = new Map(), visiting = new Set();
    const eaten = new Set(), unlocked = new Set(), unlockMovers = new Set();
    const vacancyPushes = [];
    // Negative synthetic IDs represent a transient vacancy, not a stored actor.
    const virtualRoot = root.kind === 'EMPTY' && root.id < 0;
    const edible = (a, b) => a.id !== b.id && sameLayer(s, a, b, rules) && !has(s, b, 'SAFE', rules) &&
        rulesFor(s, a, rules).some(r => r.verb === 'EAT' && !r.predicateNegated && r.predicate === b.kind) &&
        !rulesFor(s, a, rules).some(r => r.verb === 'EAT' && r.predicateNegated && r.predicate === b.kind);
    const unlocking = (a, b) => a.id !== b.id && sameLayer(s, a, b, rules) &&
        ((has(s, a, 'OPEN', rules) && has(s, b, 'SHUT', rules)) || (has(s, a, 'SHUT', rules) && has(s, b, 'OPEN', rules))) &&
        !(has(s, a, 'SAFE', rules) && has(s, b, 'SAFE', rules));
    function traverse(e) {
        if (plan.has(e.id))
            return true;
        if (visiting.has(e.id) || has(s, e, 'STILL', rules))
            return false;
        const x = e.x + dx, y = e.y + dy;
        if (!inBounds(s, x, y))
            return false;
        visiting.add(e.id);
        // EMPTY is a vacancy, not an actor with a persistent ID.  Its STOP/PUSH
        // affects entry only if the target tile is vacant in this movement phase.
        if (at(s, x, y).length === 0) {
            const vacancy = { id: -1 - (y * s.width + x), kind: 'EMPTY', x, y, dir };
            if (has(s, vacancy, 'PUSH', rules)) {
                // To push a vacancy, the chain must eventually reach an occupied tile
                // without a blocking property; otherwise the edge stops the chain.
                let nx = x, ny = y, found = false;
                while (inBounds(s, nx, ny)) {
                    const occupants = at(s, nx, ny);
                    if (occupants.length) {
                        // A line of PUSH empties may push a real PUSH object toward the
                        // first non-blocking resident. Resolve the whole plan atomically.
                        found = true;
                        for (const obj of occupants) {
                            if (has(s, obj, 'PUSH', rules)) {
                                if (!traverse(obj)) {
                                    found = false;
                                    break;
                                }
                            }
                            else if (has(s, obj, 'STOP', rules) || has(s, obj, 'STILL', rules) || has(s, obj, 'PULL', rules)) {
                                found = false;
                                break;
                            }
                        }
                        break;
                    }
                    nx += dx;
                    ny += dy;
                }
                if (!found) {
                    visiting.delete(e.id);
                    return false;
                }
                vacancyPushes.push(`${x},${y}`);
            }
            else if (has(s, vacancy, 'STOP', rules)) {
                visiting.delete(e.id);
                return false;
            }
        }
        for (const other of at(s, x, y)) {
            if (other.id === e.id || eaten.has(other.id) || unlocked.has(other.id))
                continue;
            if (unlocking(e, other)) {
                if (!has(s, e, 'SAFE', rules))
                    unlockMovers.add(e.id);
                if (!has(s, other, 'SAFE', rules))
                    unlocked.add(other.id);
                // OPEN/SHUT can overcome STOP and PUSH on the counterpart.
                continue;
            }
            if (edible(e, other)) {
                eaten.add(other.id);
                continue;
            }
            if (has(s, other, 'SWAP', rules))
                continue;
            if (has(s, other, 'PUSH', rules)) {
                if (!traverse(other)) {
                    visiting.delete(e.id);
                    return false;
                }
            }
            else if (has(s, other, 'STOP', rules) || has(s, other, 'PULL', rules) || has(s, other, 'STILL', rules)) {
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
    for (const tile of vacancyPushes)
        events.push({ phase: 'movement', type: 'empty-push', detail: tile });
    const beforeDeletion = clone(s);
    const original = new Map(s.entities.map(e => [e.id, [e.x, e.y]]));
    const doomed = new Set([...eaten, ...unlocked, ...unlockMovers]);
    // A moving OPEN or SHUT is destroyed on contact and does not enter the tile.
    for (const id of doomed)
        plan.delete(id);
    const swapped = [];
    for (const id of plan.keys()) {
        if (virtualRoot && id === root.id)
            continue; // EMPTY cannot swap positions persistently
        const [x, y] = plan.get(id);
        for (const other of at(s, x, y))
            if (!plan.has(other.id) && !doomed.has(other.id) && has(s, other, 'SWAP', rules) && !swapped.some(e => e.id === other.id)) {
                const [ox, oy] = original.get(id);
                other.x = ox;
                other.y = oy;
                swapped.push(other);
                moved.add(other.id);
            }
    }
    for (const [id, [x, y]] of plan) {
        if (virtualRoot && id === root.id)
            continue;
        const obj = s.entities.find(e => e.id === id);
        obj.x = x;
        obj.y = y;
        obj.dir = dir;
        moved.add(id);
    }
    for (const obj of swapped)
        events.push({ phase: 'movement', type: 'swap', ids: [root.id, obj.id] });
    const movedReal = [...plan.keys()].filter(id => !(virtualRoot && id === root.id));
    if (movedReal.length)
        events.push({ phase: 'movement', type: virtualRoot ? 'empty-push-object' : 'move', ids: movedReal, detail: dir });
    if (doomed.size) {
        const dead = s.entities.filter(e => doomed.has(e.id));
        s.entities = s.entities.filter(e => !doomed.has(e.id));
        for (const e of dead)
            moved.add(e.id);
        events.push({ phase: 'movement', type: 'collision-destroy', ids: [...doomed] });
        spawnOnDeleteWithOldState(s, beforeDeletion, dead, rules, events);
    }
    const pulled = new Set();
    function pull(oldX, oldY, depth) {
        if (depth > s.entities.length)
            return;
        for (const follower of at(s, oldX - dx, oldY - dy)) {
            if (!has(s, follower, 'PULL', rules) || has(s, follower, 'STILL', rules) || plan.has(follower.id) || pulled.has(follower.id) || moved.has(follower.id))
                continue;
            const blocking = at(s, oldX, oldY).some(e => e.id !== follower.id && (has(s, e, 'PUSH', rules) || has(s, e, 'STOP', rules) || has(s, e, 'STILL', rules)));
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
    for (const id of movedReal) {
        const [x, y] = original.get(id);
        pull(x, y, 0);
    }
    return true;
}
function moveStage(s, dir, kind, events) {
    const rules = parse(s), moved = new Set();
    if (kind === 'SHIFT') {
        const conveyors = s.entities.filter(e => has(s, e, 'SHIFT', rules)).sort((a, b) => a.id - b.id);
        // Each overlapping SHIFT contributes a movement to the same target.  A
        // target takes its direction from the earliest conveyor in object order.
        // Snapshot the queued actions first; no new shift is queued midway.
        const queue = new Map();
        for (const belt of conveyors)
            for (const target of at(s, belt.x, belt.y)) {
                if (target.id === belt.id)
                    continue;
                const entry = queue.get(target.id);
                if (entry)
                    entry.remaining++;
                else
                    queue.set(target.id, { id: target.id, direction: belt.dir, remaining: 1 });
            }
        let count = 0;
        while ([...queue.values()].some(item => item.remaining > 0) && count++ < 128) {
            const thisTick = new Set();
            for (const item of queue.values()) {
                if (item.remaining <= 0)
                    continue;
                item.remaining--;
                const target = s.entities.find(e => e.id === item.id);
                if (target)
                    commitMovement(s, target, item.direction, rules, events, thisTick);
            }
        }
        return;
    }
    if (kind === 'YOU' && dir) {
        // Each initially vacant cell has a transient chance to move; it never
        // occupies a tile. If its destination has PUSH, the object can be pushed.
        // Recompute membership against the live board before processing each cell.
        const [vx, vy] = vectors[dir];
        const vacant = empties(s).filter(e => has(s, e, 'YOU', rules));
        vacant.sort((a, b) => (b.x * vx + b.y * vy) - (a.x * vx + a.y * vy) || a.id - b.id);
        let attempts = 0;
        for (const origin of vacant) {
            if (at(s, origin.x, origin.y).length)
                continue;
            if (!inBounds(s, origin.x + vx, origin.y + vy))
                continue;
            const vacancy = { ...origin, dir };
            if (!has(s, vacancy, 'YOU', parse(s)))
                continue;
            attempts++;
            commitMovement(s, vacancy, dir, parse(s), events, moved);
        }
        if (attempts)
            events.push({ phase: 'movement', type: 'empty-move', detail: `${attempts} transient vacancy attempts; no persistent EMPTY objects` });
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
        // X IS EMPTY is deletion; there is no persistent EMPTY entity.
        if (matches.some(r => !r.predicateNegated && r.predicate === 'EMPTY') && !denied.has('EMPTY') && !protectedSelf) {
            events.push({ phase: 'transform', type: 'to-empty', ids: [e.id], detail: `${e.kind} IS EMPTY` });
            continue;
        }
        if (denied.has(e.kind) && !protectedSelf) {
            events.push({ phase: 'transform', type: 'vanish', ids: [e.id], detail: `${e.kind} IS NOT ${e.kind}` });
            continue;
        }
        const positive = protectedSelf ? [] : [...new Set(matches.filter(r => !r.predicateNegated && !isGroup(r.predicate) && r.predicate !== 'EMPTY' && r.predicate !== e.kind && !denied.has(r.predicate)).map(r => r.predicate))];
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
    // EMPTY transformations act on vacancies present at the start of this phase.
    // They are virtual, unique per tile, and never stored as EMPTY objects.
    const after = parse(s);
    if (!after.some(r => r.subject === 'EMPTY' && r.verb === 'IS' && exports.nouns.has(r.predicate) && !isGroup(r.predicate)))
        return;
    const vacancies = empties(s);
    const formed = [];
    for (const empty of vacancies) {
        const candidates = rulesFor(s, empty, after).filter(r => r.verb === 'IS' && exports.nouns.has(r.predicate));
        const neg = new Set(candidates.filter(r => r.predicateNegated).map(r => r.predicate));
        if (candidates.some(r => !r.predicateNegated && r.predicate === 'EMPTY'))
            continue;
        for (const name of new Set(candidates.filter(r => !r.predicateNegated && !isGroup(r.predicate) && r.predicate !== 'EMPTY' && !neg.has(r.predicate)).map(r => r.predicate))) {
            if (formed.length >= 512)
                break;
            const made = nounUnit(empty, name, id++);
            formed.push(made);
            events.push({ phase: 'transform', type: 'empty-transform', ids: [made.id], detail: `EMPTY -> ${name} at ${empty.x},${empty.y}` });
        }
    }
    s.entities.push(...formed);
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
    const canEat = (a, b) => rulesFor(s, a, rules).some(r => r.verb === 'EAT' && !r.predicateNegated && r.predicate === b.kind) &&
        !rulesFor(s, a, rules).some(r => r.verb === 'EAT' && r.predicateNegated && r.predicate === b.kind);
    for (let i = 0; i < s.entities.length; i++)
        for (let j = i + 1; j < s.entities.length; j++) {
            const a = s.entities[i], b = s.entities[j];
            if (a.x !== b.x || a.y !== b.y || !sameLayer(s, a, b, rules))
                continue;
            const aHas = (p) => has(s, a, p, rules), bHas = (p) => has(s, b, p, rules);
            const mark = (e) => { if (!has(s, e, 'SAFE', rules))
                removed.add(e.id); };
            if (aHas('SINK') || bHas('SINK')) {
                mark(a);
                mark(b);
            }
            if (aHas('DEFEAT') && bHas('YOU'))
                mark(b);
            if (bHas('DEFEAT') && aHas('YOU'))
                mark(a);
            if (aHas('HOT') && bHas('MELT'))
                mark(b);
            if (bHas('HOT') && aHas('MELT'))
                mark(a);
            if ((aHas('OPEN') && bHas('SHUT')) || (aHas('SHUT') && bHas('OPEN'))) {
                mark(a);
                mark(b);
            }
            if (aHas('WEAK'))
                mark(a);
            if (bHas('WEAK'))
                mark(b);
            if (canEat(a, b))
                mark(b);
            if (canEat(b, a))
                mark(a);
        }
    if (removed.size) {
        const beforeDeletion = clone(s);
        const dead = s.entities.filter(e => removed.has(e.id));
        s.entities = s.entities.filter(e => !removed.has(e.id));
        events.push({ phase: 'interaction', type: 'destroy', ids: [...removed] });
        spawnOnDeleteWithOldState(s, beforeDeletion, dead, rules, events);
    }
}
/** Deterministic TELE subset: source must share FLOAT layer with passenger;
 * destination has same noun type, but may occupy a different FLOAT layer.
 * Original 3+ destination randomization is intentionally not claimed. */
function teleport(s, events) {
    const rules = parse(s);
    const sources = s.entities.filter(e => has(s, e, 'TELE', rules)).sort((a, b) => a.id - b.id);
    const moved = new Set();
    const nextPosition = new Map();
    for (const source of sources) {
        const destinations = sources.filter(target => target.kind === source.kind && target.id !== source.id);
        if (!destinations.length)
            continue;
        const residents = at(s, source.x, source.y).filter(e => e.id !== source.id && !moved.has(e.id) && sameLayer(s, e, source, rules));
        for (const resident of residents) {
            // Stacked TELE objects of the same type do not teleport one another.
            if (resident.kind === source.kind && has(s, resident, 'TELE', rules))
                continue;
            const index = (Math.imul(resident.id + 3, 2654435761) + (s.turn + 1) * 1013904223) >>> 0;
            const target = destinations[index % destinations.length];
            moved.add(resident.id);
            nextPosition.set(resident.id, [target.x, target.y]);
            events.push({ phase: 'teleport', type: 'tele', ids: [source.id, resident.id, target.id], detail: `${source.kind} -> ${target.x},${target.y}` });
        }
    }
    for (const [id, [x, y]] of nextPosition) {
        const entity = s.entities.find(e => e.id === id);
        if (entity) {
            entity.x = x;
            entity.y = y;
        }
    }
}
function makeEntities(s, events) {
    const rules = parse(s);
    let id = nextId(s);
    const created = [];
    const makers = rules.some(r => r.subject === 'EMPTY' && r.verb === 'MAKE') ? [...s.entities, ...empties(s)] : s.entities;
    for (const e of makers) {
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
    if (rules.some(r => r.subject === 'EMPTY' && r.verb === 'IS' && r.predicate === 'YOU' && !r.predicateNegated) &&
        rules.some(r => r.subject === 'EMPTY' && r.verb === 'IS' && r.predicate === 'WIN' && !r.predicateNegated) &&
        empties(s).some(e => has(s, e, 'YOU', rules) && has(s, e, 'WIN', rules))) {
        s.status = 'won';
        events.push({ phase: 'victory', type: 'win', detail: 'EMPTY IS YOU and EMPTY IS WIN' });
        return;
    }
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
    if (s.status !== 'playing')
        return { state: s, events, rules: parse(s) };
    if (input !== 'wait' && !directions.includes(input))
        throw new Error('Invalid input');
    let previousSignature = '';
    function checkpoint(label) {
        const active = parse(s);
        events.push({ phase: 'rules', type: 'reparse', detail: label });
        const signature = JSON.stringify(active.map(r => [r.subject, r.subjectNegated, r.verb, r.predicate, r.predicateNegated, r.conditions]));
        if (previousSignature && signature !== previousSignature)
            events.push({ phase: 'rules', type: 'rule-change', detail: label });
        previousSignature = signature;
        const diagnostics = analyzeGroups(s, active);
        if (diagnostics.loop) {
            s.status = 'loop';
            events.push({ phase: 'rules', type: 'infinite-loop', detail: `GROUP membership failed to converge after ${diagnostics.iterations} iterations (${label})` });
            return false;
        }
        return true;
    }
    const finish = () => { s.turn++; return { state: s, events, rules: parse(s) }; };
    if (!checkpoint('pre YOU'))
        return finish();
    if (input !== 'wait')
        moveStage(s, input, 'YOU', events);
    if (!checkpoint('post YOU'))
        return finish();
    moveStage(s, undefined, 'MOVE', events);
    if (!checkpoint('post MOVE'))
        return finish();
    moveStage(s, undefined, 'SHIFT', events);
    if (!checkpoint('post SHIFT'))
        return finish();
    if (!checkpoint('pre transform'))
        return finish();
    transform(s, events);
    if (!checkpoint('post transform'))
        return finish();
    teleport(s, events);
    if (!checkpoint('post TELE'))
        return finish();
    makeEntities(s, events);
    if (!checkpoint('post make'))
        return finish();
    interact(s, events);
    if (!checkpoint('post interactions'))
        return finish();
    winCheck(s, events);
    return finish();
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
// The original seven puzzles remain available as short lessons. The advanced
// collection is deliberately separate: victory requires interacting with more
// than one rule, and the state-replay fixtures test the full move sequence.
function board(w, h, objects, wallColumns = []) {
    const a = Array.from({ length: h }, () => Array(w).fill('.'));
    for (const x of wallColumns)
        for (let y = 0; y < h; y++)
            a[y][x] = '#';
    for (const [token, x, y] of objects) {
        if (a[y]?.[x] === undefined)
            throw new Error('Bad puzzle coordinate');
        a[y][x] = token;
    }
    return a.map(row => row.join(''));
}
exports.puzzles.push(level('08 — 法律冲突', '墙的 STOP 仍然存在。仅仅推开几块墙无济于事；试着补全另一句相反的规则。', '进阶 · 否定优先级', board(14, 11, [['b', 2, 8], ['f', 12, 8]], [7]), [['BABA IS YOU', 1, 0], ['WALL IS STOP', 9, 1], ['FLAG IS', 9, 3], ['WALL IS NOT', 2, 4]], [['STOP', 5, 7], ['WIN', 11, 6]]), level('09 — 远端施工', '左边建立第二个 YOU，右边再为旗帜建立 WIN。两个身体会一起响应方向键。', '进阶 · 控制权与同步移动', board(14, 11, [['b', 2, 8], ['k', 9, 8], ['f', 12, 8]], [7]), [['BABA IS YOU', 1, 0], ['WALL IS STOP', 9, 0], ['KEKE IS', 2, 4], ['FLAG IS', 9, 2]], [['YOU', 4, 7], ['WIN', 11, 5]]), level('10 — 石头宣言', '岩石可以充当规则文字。先让它成为 WIN，但 PUSH 也意味着你暂时不能踩上去。', '进阶 · WORD × PUSH × WIN', board(14, 11, [['b', 2, 7], ['r', 7, 4]]), [['ROCK IS WORD', 1, 0], ['BABA IS YOU', 7, 0], ['ROCK IS PUSH', 1, 9]], [['IS', 8, 4], ['WIN', 9, 6]]), level('11 — 两次重写', '把水上的石头变成一个可推的 ROCK 文字，让这块文字参与第二条胜利规则；真正的胜利目标是另一块岩石。', '进阶 · 条件变形与规则链', board(14, 11, [['b', 3, 7], ['r', 5, 6], ['r', 11, 8]]), [['BABA IS YOU', 8, 0], ['ROCK ON WATER IS', 1, 2]], [['TEXT', 5, 4], ['IS', 6, 6], ['WIN', 7, 8]], [{ kind: 'WATER', x: 5, y: 6 }]), level('12 — 远端变身', '石头在水中会变成文字。用这块文字组出 ROCK IS BABA，然后想一想谁能够隔墙行动。', '进阶 · 条件变形 × 控制权转移', board(14, 11, [['b', 3, 7], ['r', 5, 6], ['r', 11, 8], ['f', 12, 8]], [8]), [['BABA IS YOU', 9, 0], ['ROCK ON WATER IS', 1, 2], ['WALL IS STOP', 9, 2], ['FLAG IS WIN', 9, 3]], [['TEXT', 5, 4], ['IS', 6, 6], ['BABA', 7, 8]], [{ kind: 'WATER', x: 5, y: 6 }]), level('13 — 继承者', '先用条件规则把水中的岩石变成文字，再把另一侧的岩石变成可控制的 BABA。最后别忘了：旗帜目前并不是 WIN。', '大师练习 · 三段规则链', board(14, 11, [['b', 3, 7], ['r', 5, 6], ['r', 11, 8], ['f', 12, 8]], [8]), [['BABA IS YOU', 9, 0], ['ROCK ON WATER IS', 1, 2], ['WALL IS STOP', 9, 2], ['FLAG IS', 9, 3]], [['TEXT', 5, 4], ['IS', 6, 6], ['BABA', 7, 8], ['WIN', 11, 5]], [{ kind: 'WATER', x: 5, y: 6 }]));
// v1.3: two multi-stage locked-room puzzles. The walls form two actual
// barriers; solutions must change protection, create objects, and unlock them.
exports.puzzles.push(level('14 — 锁与遗产', '岩石挡住唯一入口，但 SAFE 保护它。解除保护后，消灭岩石会留下钥匙。钥匙和门还会发生什么？', '进阶 · SAFE → EAT/HAS → PUSH/OPEN/SHUT', board(16, 13, [['b', 3, 7], ['r', 6, 7], ['d', 11, 7], ['f', 13, 7]], [6, 11]), [
    ['BABA IS YOU', 5, 1, 'v'],
    ['BABA EAT ROCK', 1, 1, 'v'],
    ['ROCK HAS KEY', 2, 1, 'v'],
    ['ROCK IS STOP', 4, 1, 'v'],
    ['ROCK IS SAFE', 1, 5],
    ['KEY IS PUSH AND OPEN', 8, 1, 'v'],
    ['DOOR IS SHUT AND STOP', 9, 1, 'v'],
    ['WALL IS STOP', 13, 1, 'v'],
    ['FLAG IS WIN', 12, 10]
]), level('15 — 吃掉一条规则', '先拼成 BABA EAT ROCK；岩石被吃掉会留下什么？把留下的词放到正确位置，你就无需亲自越墙。', '进阶 · 造句 → EAT/HAS TEXT → 远端 YOU', board(14, 11, [['b', 3, 7], ['r', 5, 7], ['r', 11, 6], ['f', 12, 6]], [9]), [
    ['ROCK HAS TEXT', 1, 0],
    ['BABA IS YOU', 5, 0],
    ['BABA EAT', 1, 2],
    ['ROCK IS STOP', 1, 10],
    ['WALL IS STOP', 13, 8, 'v'],
    ['FLAG IS WIN', 10, 2]
], [['ROCK', 3, 3], ['IS', 6, 8], ['YOU', 7, 8]]));
// A chamber is separated by an actual locked threshold. GROUP is not a pickup:
// the puzzle asks which objects should be members *at the moment* of unlocking.
exports.puzzles.push(level('16 — 谁来开门', '想一想：GROUP 是一种身份，还是一个物体？所有成员都会付出相同的代价吗？', '实验关 · GROUP 的共享属性与物理空间', [
    '............',
    '############',
    '#.....#....#',
    '#..b..#....#',
    '#.....d..f.#',
    '#...r.#....#',
    '#.....#....#',
    '#.....#....#',
    '#.....#....#',
    '############',
    '............'
], [
    ['BABA IS YOU', 0, 0], ['GROUP IS OPEN', 4, 0], ['WALL IS STOP', 8, 0],
    ['ROCK IS PUSH', 0, 10], ['DOOR IS SHUT', 4, 10], ['FLAG IS WIN', 8, 10],
    ['DOOR IS STOP', 10, 5, 'v'],
    ['BABA IS GROUP', 1, 2], ['ROCK IS', 1, 6]
], [['GROUP', 3, 7]]));
// The order is the puzzle: the winning object must first be pushed ON WATER,
// then the same PUSH property must be negated without cancelling the win.
exports.puzzles.push(level('17 — 太早的答案', '完成一条规则不等于应该立即完成。观察石头必须先到达哪里。', '实验关 · 条件 GROUP 与时序反转', [
    '................',
    '################',
    '#..............#',
    '#..b...........#',
    '#..r....###....#',
    '#..........#...#',
    '#....#.........#',
    '#..............#',
    '#..w...........#',
    '#..............#',
    '################',
    '................'
], [
    ['BABA IS YOU', 0, 0], ['WALL IS STOP', 4, 0], ['ROCK IS PUSH', 9, 0],
    ['ROCK ON WATER IS GROUP', 0, 11], ['GROUP IS WIN', 7, 11],
    ['ROCK IS NOT', 6, 7]
], [['PUSH', 9, 8]]));
// A moving object remains in GROUP only while standing ON WATER. It can create
// its own WATER underneath with MAKE, thus carrying its control condition.
// The two phrases can be assembled in either order; neither alone wins.
exports.puzzles.push(level('18 — 脚下的河', '你能为它创造脚下的路。但你自己的移动，也可能破坏远处的控制权。', '核心谜题 · 条件成员身份 × MAKE × 持续控制', [
    '................',
    '################',
    '#......#########',
    '#......######f##',
    '#......####.#.##',
    '#......####...##',
    '#......####.####',
    '#......###r.####',
    '#..b...#########',
    '################',
    '................'
], [
    ['BABA IS YOU', 0, 0], ['ROCK ON WATER IS GROUP', 8, 0],
    ['FLAG IS WIN', 0, 10], ['WALL IS STOP', 4, 10],
    ['GROUP IS', 4, 3], ['ROCK MAKE', 1, 5]
], [['YOU', 6, 4], ['WATER', 3, 6]], [{ kind: 'WATER', x: 10, y: 7 }]));
// 19 — The player must treat their own destruction as a controlled handoff.
// The *same* OPEN word opens the first door as BABA, then the second as KEKE.
// HAS makes death produce the only surviving controllable body. No unguarded
// route leads to the goal, and neither door can be bypassed or pushed.
exports.puzzles.push(level('19 — 无人之门', '两扇门看起来没有区别。', '正式谜题', [
    '.................',
    'ggggggggggggggggg',
    'g...............g',
    'g...............g',
    'g...............g',
    'g......#########g',
    'g.......d..d..f.g',
    'g......#########g',
    'g...............g',
    'g....b..........g',
    'g...............g',
    'ggggggggggggggggg',
    '.................'
], [
    ['KEKE HAS BABA', 0, 0],
    ['BABA IS YOU', 4, 0], ['KEKE IS YOU', 8, 0],
    ['WALL IS STOP', 0, 12], ['DOOR IS SHUT AND STOP', 4, 12],
    ['FLAG IS WIN', 10, 12], ['GRASS IS STOP', 14, 12],
    ['BABA IS', 3, 6], ['BABA HAS', 1, 8]
], [['OPEN', 5, 7], ['KEKE', 3, 9]]));
// 20 — A single word slot is both a lifeline and the finish condition.
// Replacing YOU with WIN deliberately removes control of BABA; only a newly
// controlled ROCK can then reach BABA. If attempted too early, control is lost.
exports.puzzles.push(level('20 — 你不再是你', '终点不一定是旗帜，也不一定需要你亲自抵达。', '正式谜题 · 交接控制权 / 用 WIN 取代 YOU', [
    'ggggggggggggg',
    'g...g.......g',
    'ggggggggggggg',
    'g...........g',
    'g...........g',
    'g...........g',
    'g...........g',
    'g...........g',
    'g...........g',
    'g..b.....r..g',
    'ggggggggggggg'
], [
    ['GRASS IS STOP', 1, 1],
    ['BABA IS YOU', 2, 4],
    ['ROCK IS', 2, 7]
], [['WIN', 4, 5], ['YOU', 4, 8]]));

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
let level = 18; // Open the authored puzzle, not the obsolete demos.
let state = (0, core_1.clone)(levels_1.puzzles[level].state);
const overlay = document.querySelector('#win-overlay');
const nextButton = document.querySelector('#next-level');
const victoryTitle = document.querySelector('#victory-title');
const victoryDetail = document.querySelector('#victory-detail');
const victoryTip = document.querySelector('.key-tip');
const winStar = document.querySelector('.win-star');
const completed = new Set();
try {
    for (const key of ['wcw-engine-1.2-completed', 'wcw-engine-1.3-completed', 'wcw-engine-1.4-completed', 'wcw-engine-1.5-completed', 'wcw-engine-1.6-completed', 'wcw-engine-1.7-completed'])
        for (const n of JSON.parse(localStorage.getItem(key) || '[]'))
            if (Number.isInteger(n))
                completed.add(n);
}
catch { /* Browsers may block file:// storage. */ }
function rememberWin() { completed.add(level); try {
    localStorage.setItem('wcw-engine-1.7-completed', JSON.stringify([...completed]));
}
catch { } }
let past = [];
let future = [];
let lastEvents = [];
const P = { bg: '#0b142c', ink: '#121b31', sand: '#f6dfaa', rose: '#dc7baf', blue: '#7497c8', teal: '#76bca7', yellow: '#ead277', white: '#e7e4e0' };
function choose(i) { level = i; state = (0, core_1.clone)(levels_1.puzzles[i].state); past = []; future = []; lastEvents = []; hintEl.textContent = ''; closeMenu(); draw(); }
function apply(dir) {
    if (state.status !== 'playing')
        return;
    past.push((0, core_1.clone)(state));
    if (past.length > 500)
        past.shift();
    future = [];
    const result = (0, core_1.step)(state, dir);
    state = result.state;
    lastEvents = result.events.filter(e => e.type !== 'reparse').map(e => `${e.phase} · ${e.type} ${e.detail || ''}`).slice(-7);
    if (state.status === 'won')
        rememberWin();
    draw();
}
function undo() { if (!past.length)
    return; future.push((0, core_1.clone)(state)); state = past.pop(); lastEvents = ['undo']; draw(); }
function redo() { if (!future.length)
    return; past.push((0, core_1.clone)(state)); state = future.pop(); lastEvents = ['redo']; draw(); }
function restart() { choose(level); }
function hash(x, y, n = 0) { let k = (x * 951274213 + y * 438289 + n * 17569) >>> 0; k ^= k << 13; k ^= k >>> 17; k ^= k << 5; return (k >>> 0) / 4294967295; }
function poly(coords, fill, stroke) { ctx.beginPath(); ctx.moveTo(coords[0], coords[1]); for (let i = 2; i < coords.length; i += 2)
    ctx.lineTo(coords[i], coords[i + 1]); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
} }
const colors = { BABA: '#ed9bd0', KEKE: '#db8cb8', ROCK: '#bd9a75', WALL: '#6485a4', GRASS: '#477d66', FLAG: '#e9cd76', WATER: '#5d9acb', SKULL: '#ba809c', KEY: '#e4bc65', DOOR: '#c28d6b', WIN: '#e1d37c', YOU: '#d77eb1', IS: '#d5e0df', STOP: '#789ba0', PUSH: '#a2a777', PULL: '#c9977c', NOT: '#c3bde2', WORD: '#c2a5da', GROUP: '#bd9e8b', TEXT: '#caaccb', OPEN: '#e9c178', SHUT: '#8396ae', EMPTY: '#92a7a9' };
function brushStone(e, x, y, size, now) {
    const grass = e.kind === 'GRASS', main = grass ? '#304d49' : '#41536c', light = grass ? '#54735d' : '#658098', dark = grass ? '#1a3638' : '#283b54';
    const wobble = Math.floor(Math.sin(now * 3 + hash(e.x, e.y) * 9) * 1.5);
    ctx.fillStyle = dark;
    ctx.fillRect(x, y, size + 1, size + 1);
    for (let i = 0; i < 3; i++) {
        const ox = (i % 2) * size * .14, yy = y + i * size / 3;
        ctx.fillStyle = i % 2 ? main : light;
        const step = size / 3;
        ctx.fillRect(Math.floor(x + ox), Math.floor(yy + wobble), Math.ceil(size - ox), Math.ceil(step - 2));
        ctx.fillStyle = dark;
        ctx.fillRect(x + size * .55 + ((i % 2) ? -size * .3 : 0), yy, 2, step);
    }
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = hash(e.x, e.y, i) < .5 ? '#12283d' : '#8193a1';
        ctx.globalAlpha = .18;
        ctx.fillRect(x + hash(e.x + i, e.y) * size, y + hash(e.x, e.y + i) * size, 3, 2);
        ctx.globalAlpha = 1;
    }
}
function drawEntity(e, x, y, size, now) {
    const col = colors[e.kind] || '#b9b7a5', cx = x + size * .5, cy = y + size * .54;
    if (e.kind === 'WALL' || e.kind === 'GRASS') {
        brushStone(e, x, y, size, now);
        return;
    }
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(now * 4 + e.id) * .025);
    ctx.fillStyle = '#03091877';
    ctx.beginPath();
    ctx.ellipse(1, size * .25, size * .28, size * .1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = col;
    ctx.strokeStyle = '#14223b';
    ctx.lineWidth = Math.max(2, size * .048);
    const t = size * .29;
    if (e.kind === 'BABA' || e.kind === 'KEKE') {
        const ear = e.kind === 'KEKE' ? .75 : 1;
        for (const dx of [-t * .48, t * .48]) {
            poly([-t * .5 + dx, -t * .3 * ear, -t * .42 + dx, -t * 1.12 * ear, -t * .06 + dx, -t * .92 * ear, t * .04 + dx, -t * .2 * ear], col, '#15243a');
        }
        ctx.beginPath();
        ctx.ellipse(0, t * .12, t * .98, t * .76, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#17253b';
        ctx.fillRect(-t * .4, -t * .04, Math.max(2, t * .13), t * .25);
        ctx.fillRect(t * .23, -t * .04, Math.max(2, t * .13), t * .25);
    }
    else if (e.kind === 'ROCK') {
        poly([-t * 1.1, t * .56, -t * .92, -t * .43, -t * .4, -t * .97, t * .35, -t * .85, t * .95, -t * .26, t * .84, t * .72, -t * .12, t * .96], col, '#203047');
        poly([-t * .71, -t * .45, -t * .26, -t * .71, t * .2, -t * .48, -t * .15, -t * .12], '#e0bc8d');
    }
    else if (e.kind === 'FLAG') {
        ctx.strokeStyle = '#e7d5ab';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-t * .5, t);
        ctx.lineTo(-t * .5, -t);
        ctx.stroke();
        poly([-t * .48, -t, t, -t * .7, t * .38, -t * .16, -t * .48, -t * .28], col, '#786b41');
    }
    else if (e.kind === 'WATER') {
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i === 0 ? '#2b547b' : i === 1 ? '#63a6c9' : '#89c2d5';
            ctx.fillRect(-t * 1.15 + i * 3, -t * .7 + i * 4, t * 2.1, t * .43);
        }
        ctx.fillStyle = '#acd8e6';
        ctx.fillRect(-t * .45, -t * .45, t * .5, 2);
    }
    else if (e.kind === 'DOOR') {
        poly([-t, -t, -t * .4, -t * 1.2, t * .55, -t * 1.2, t, -t * .7, t, t, -t, t], col, '#412f40');
        ctx.fillStyle = '#543a38';
        ctx.fillRect(-t * .73, -t * .6, t * 1.45, t * 1.38);
        ctx.fillStyle = '#f8d59b';
        ctx.fillRect(t * .3, t * .12, Math.max(2, t * .13), Math.max(2, t * .13));
    }
    else {
        ctx.beginPath();
        ctx.arc(0, 0, t * .9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#263045';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.round(size * .27)}px monospace`;
        ctx.fillText(e.kind[0], 0, 0);
    }
    ctx.restore();
}
function drawWord(e, x, y, size, active, now) {
    const word = e.word || '';
    const col = colors[word] || '#c2a985';
    const shift = Math.sin(now * 4.8 + e.id * .8) * size * .015;
    const m = size * .11;
    ctx.globalAlpha = .35;
    ctx.fillStyle = col;
    ctx.fillRect(x + size * .08, y + size * .12, size * .84, size * .82);
    ctx.globalAlpha = 1;
    poly([x + m, y + m + shift, x + size * .86, y + m - 1, x + size * .92, y + size * .84, x + m * .78, y + size * .88], active ? '#26334c' : '#1b253d', active ? col : '#35445c');
    const arr = word.length > 3 ? word.length === 4 ? [word.slice(0, 2), word.slice(2)] : word.length === 5 ? [word.slice(0, 2), word.slice(2)] : [word.slice(0, 3), word.slice(3)] : [word];
    const fontSize = arr.length > 1 ? size * (Math.max(...arr.map(v => v.length)) >= 3 ? .245 : .30) : size * (word.length <= 2 ? .39 : .28);
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.floor(fontSize)}px ui-monospace,monospace`;
    const offset = arr.length === 1 ? 0 : size * .145;
    arr.forEach((line, i) => { const tx = x + size * .5, ty = y + size * .5 + (i === 0 ? -offset : offset) + shift; ctx.fillText(line, tx, ty, size * .82); });
    if (active) {
        ctx.strokeStyle = col;
        ctx.globalAlpha = .65;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(x + size * .10, y + size * .12, size * .80, size * .77);
        ctx.globalAlpha = 1;
    }
}
function render() {
    const w = canvas.width, h = canvas.height, now = performance.now() / 1000;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 75; i++) {
        const x = hash(i, 1) * w, y = hash(i, 8) * h;
        ctx.fillStyle = i % 4 === 0 ? '#314b6c' : '#223753';
        ctx.globalAlpha = .3 + hash(i, 5) * .35;
        ctx.fillRect(x, y, 1.5 + (i % 3 === 0 ? 1 : 0), 1.5);
        ctx.globalAlpha = 1;
    }
    const size = Math.min((w - 44) / state.width, (h - 35) / state.height, 64);
    const ox = Math.floor((w - size * state.width) / 2), oy = Math.floor((h - size * state.height) / 2);
    ctx.fillStyle = '#111b33';
    ctx.globalAlpha = .7;
    ctx.fillRect(ox - 9, oy - 9, state.width * size + 18, state.height * size + 18);
    ctx.globalAlpha = 1;
    for (let y = 0; y < state.height; y++)
        for (let x = 0; x < state.width; x++) {
            const xx = ox + x * size, yy = oy + y * size;
            const hue = hash(x, y), alpha = hue > .82 ? .26 : .08;
            ctx.fillStyle = hue > .82 ? '#2c3e54' : '#18243d';
            ctx.globalAlpha = alpha;
            ctx.fillRect(xx, yy, size, size);
            ctx.globalAlpha = 1;
            if (hue > .91) {
                ctx.fillStyle = '#5b7891';
                ctx.globalAlpha = .32;
                ctx.fillRect(xx + size * .33, yy + size * .54, 2, 2);
                ctx.globalAlpha = 1;
            }
        }
    const rules = (0, core_1.parse)(state), active = new Set(rules.flatMap(r => r.wordIds));
    for (const e of state.entities.filter(e => e.kind !== 'TEXT'))
        drawEntity(e, ox + e.x * size, oy + e.y * size, size, now);
    for (const e of state.entities.filter(e => e.kind === 'TEXT'))
        drawWord(e, ox + e.x * size, oy + e.y * size, size, active.has(e.id), now);
}
function draw() {
    const won = state.status === 'won', loop = state.status === 'loop';
    overlay.hidden = !won && !loop;
    nextButton.hidden = loop;
    if (loop) {
        victoryTitle.textContent = 'INFINITE LOOP · 规则循环';
        victoryDetail.textContent = 'GROUP 成员关系无法稳定确定。按 Z 撤销本步，或选择重玩本关。';
        victoryTip.textContent = '按 Z 撤销后，改变造成矛盾的规则';
        winStar.textContent = '∞';
    }
    if (won) {
        victoryTip.textContent = '按 Enter 也可以进入下一关';
        winStar.textContent = '✦ ✦ ✦';
        victoryTitle.textContent = level === levels_1.puzzles.length - 1 ? 'WORLD COMPLETE' : 'PUZZLE CLEARED';
        victoryDetail.textContent = `${levels_1.puzzles[level].title} · ${state.turn} 步 · ${levels_1.puzzles[level].concept}`;
        nextButton.textContent = level < levels_1.puzzles.length - 1 ? '下一关 →' : '返回关卡列表';
    }
    titleEl.textContent = levels_1.puzzles[level].title;
    turnEl.textContent = String(state.turn);
    statusEl.textContent = won ? '已通关' : loop ? '规则循环 · 可撤销' : '进行中';
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
        b.className = `level-btn ${i === level ? 'selected' : ''} ${i >= 7 ? 'advanced' : ''} ${i >= 15 ? 'challenge' : ''} ${completed.has(i) ? 'cleared' : ''}`;
        b.textContent = `${completed.has(i) ? '✦ ' : ''}${String(i + 1).padStart(2, '0')}`;
        b.title = l.concept;
        b.onclick = () => choose(i);
        levelEl.appendChild(b);
    });
    render();
}
const menu = document.querySelector('#menu-overlay');
function closeMenu() { menu.hidden = true; }
function openMenu() { menu.hidden = false; }
document.querySelector('#menu-toggle').addEventListener('click', openMenu);
document.querySelector('#menu-close').addEventListener('click', closeMenu);
document.querySelector('#menu-return').addEventListener('click', closeMenu);
menu.addEventListener('click', e => { if (e.target === menu)
    closeMenu(); });
window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (key === 'escape') {
        closeMenu();
        return;
    }
    if (!menu.hidden)
        return;
    const map = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
    if (key === 'enter' && state.status === 'won') {
        e.preventDefault();
        goNext();
    }
    else if (map[key]) {
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
function goNext() { if (level < levels_1.puzzles.length - 1)
    choose(level + 1);
else {
    overlay.hidden = true;
    openMenu();
} }
nextButton.addEventListener('click', goNext);
document.querySelector('#replay-level').addEventListener('click', restart);
document.querySelector('#view-levels').addEventListener('click', () => { overlay.hidden = true; openMenu(); });
let touch = null;
canvas.addEventListener('touchstart', e => { if (e.touches.length)
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
canvas.addEventListener('touchend', e => { if (!touch)
    return; const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y; touch = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 25)
    return; apply(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); }, { passive: true });
canvas.width = 960;
canvas.height = 690;
draw();
let previous = 0;
function animate(t) { if (t - previous > 160) {
    render();
    previous = t;
} requestAnimationFrame(animate); }
requestAnimationFrame(animate);
// Debug hooks used only in smoke tests; no mutation of game internals.
window.WCW_DEBUG = { getState: () => (0, core_1.clone)(state), getFingerprint: () => (0, core_1.fingerprint)(state), choose, apply, undo, redo };

};
require("ui");
})();