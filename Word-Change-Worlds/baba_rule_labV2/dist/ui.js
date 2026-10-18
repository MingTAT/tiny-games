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
