"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opposite = exports.properties = exports.nouns = void 0;
exports.clone = clone;
exports.create = create;
exports.inBounds = inBounds;
exports.parse = parse;
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
/** Derived GROUP-family memberships.  A bounded least-fixed-point resolves
 * GROUP -> GROUP2 -> GROUP3 chains and cycles with finite, stable membership.
 * Negated memberships win over positive memberships at every iteration.
 * This deliberately does not emulate the original engine's infinite-loop quirks. */
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
function resolveGroups(s, rules) {
    let groups = Object.fromEntries(groupNames.map(g => [g, new Set()]));
    const entities = rules.some(r => r.subject === 'EMPTY' && r.verb === 'IS' && isGroup(r.predicate))
        ? [...s.entities, ...empties(s)] : s.entities;
    if (!rules.some(r => r.verb === 'IS' && isGroup(r.predicate)))
        return groups;
    const cap = Math.max(8, entities.length * groupNames.length + 4);
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
            return next;
        groups = next;
    }
    // A cyclic negated self-definition can oscillate. Prefer the last finite
    // approximation; original infinite-loop and parity behavior isn't claimed.
    return groups;
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
                    if (at(s, nx, ny).length) {
                        found = at(s, nx, ny).every(obj => !has(s, obj, 'STOP', rules) && !has(s, obj, 'PUSH', rules) && !has(s, obj, 'STILL', rules));
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
        const obj = s.entities.find(e => e.id === id);
        obj.x = x;
        obj.y = y;
        obj.dir = dir;
        moved.add(id);
    }
    for (const obj of swapped)
        events.push({ phase: 'movement', type: 'swap', ids: [root.id, obj.id] });
    if (plan.size)
        events.push({ phase: 'movement', type: 'move', ids: [...plan.keys()], detail: dir });
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
    if (kind === 'YOU' && dir && rules.some(r => r.subject === 'EMPTY' && r.verb === 'IS' && r.predicate === 'YOU')) {
        const vacant = empties(s).filter(e => has(s, e, 'YOU', rules));
        const [vx, vy] = vectors[dir];
        let attempts = 0;
        for (const e of vacant)
            if (inBounds(s, e.x + vx, e.y + vy))
                attempts++;
        if (attempts)
            events.push({ phase: 'movement', type: 'empty-move', detail: `${attempts} transient vacancy moves; recalculated immediately` });
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
    events.push({ phase: 'rules', type: 'reparse', detail: 'pre transform' });
    transform(s, events);
    events.push({ phase: 'rules', type: 'reparse', detail: 'post transform' });
    teleport(s, events);
    events.push({ phase: 'rules', type: 'reparse', detail: 'post TELE' });
    makeEntities(s, events);
    events.push({ phase: 'rules', type: 'reparse', detail: 'post make' });
    interact(s, events);
    events.push({ phase: 'rules', type: 'reparse', detail: 'post interactions' });
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
