# Words Change Worlds

这是一款使用 TypeScript + Canvas 制作的独立规则解谜游戏。规则词块本身可以推动。游戏参考《Baba Is You》的规则交互思路，但**不是原作游戏，也尚未达到原作的机制完整性与关卡难度**。项目不包含原作美术、音效或关卡。

## 开始玩

直接双击 `play.html`；如果放到 GitHub Pages，则打开 `index.html`。两个文件都是离线单文件，无需构建。

打开后默认进入第 **08 关**。01–07 是保留的短教学关；08–13 是需要重组多条规则的进阶关。通关后出现**下一关**、**重玩本关**、**选择关卡**按钮；按 Enter 也能继续。最后一关胜利后可以返回关卡列表。✓ 代表已通过的关卡，浏览器允许时自动保存此标记。

方向键或 WASD 移动；Z 撤销、Y 重做、R 重开、空格等待。手机可按方向键按钮或在棋盘上滑动。

## 进阶关卡

| 关 | 设计目标 | 验证过的一条解法 |
|---|---|---|
| 08 法律冲突 | `WALL IS NOT STOP` 与 `WALL IS STOP` 并存，越墙后仍须重建 `FLAG IS WIN` | 22 步 |
| 09 远端施工 | 让 KEKE 获得 YOU，利用双角色同步控制拼出 FLAG IS WIN | 18 步 |
| 10 石头宣言 | 实物 ROCK 参与拼出 WIN，解除 PUSH 后才能触碰它 | 30 步 |
| 11 两次重写 | 通过 `ON WATER` 让 ROCK 变成文字，再组成 ROCK IS WIN | 23 步 |
| 12 远端变身 | ROCK IS TEXT → ROCK IS BABA，让另一侧的岩石获得控制权 | 19 步 |
| 13 继承者 | 条件变形 → 远端身份转移 → 在另一侧重新建立 FLAG IS WIN | 27 步 |

这些数字是**已验证操作序列**的长度，**不是最短解步数的证明，也不是难度评分**。游戏默认从 08 开始，前七关仍可在右侧选关。

## 代码结构与测试

需要 Node.js 18+ 以及 TypeScript (`npm i -g typescript`)：

```bash
npm run build
npm test
npm run record:local
```

`src/core.ts` 为与画面无关的规则引擎；`step(state,input)` 输出新状态、事件和规则表。`src/levels.ts` 维护地图，`src/ui.ts` 负责 Canvas、胜利弹窗、按键以及关卡进度。

`replays/` 存放 **13 关由本地引擎生成的逐步状态回放**；`tests/advanced.test.cjs` 检查进阶关卡的胜利轨迹与关键规则出现，`tests/replay.test.cjs` 对比每一回合的实体状态。`scripts/browser-smoke.py` 使用 Playwright 检查浏览器 UI（需要自行安装 Playwright 和 Chromium）。

当前 **72 项 Node 自动化测试通过**，桌面和手机浏览器实际交互检查通过。

## 验证边界

1. 本地回放只能证明本项目按自己的规则运行，并有已知的通关序列。
2. 某些行为参考了原作 Wiki，但这不意味着完整符合原作细节。
3. 与《Baba Is You》原作的**实机回放一致性对比仍为 0 项**。未实现其全部属性、全部语法与完整结算次序，也没有复刻原作关卡难度。

后续优先事项：精密的多物体移动冲突；复杂条件语法；针对原作可观察棋盘的行为回归；关卡多解、误解法与最短解分析，而不是盲目增加关卡数量。

## GitHub 更新

如果之前使用 `typescript-engine` 分支，可用此包**覆盖 Words Change Worlds 该分支的同名文件**（包括新回放与测试）。不要覆盖独立项目 Rule Is World；不要把它和旧版 v0.x 的文件混在一起。
