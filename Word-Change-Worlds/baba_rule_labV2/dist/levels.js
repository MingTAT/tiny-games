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
