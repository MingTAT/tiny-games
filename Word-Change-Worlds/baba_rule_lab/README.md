# Words Change Worlds · v0.5

独立制作的浏览器文字规则解谜游戏。以《Baba Is You》的规则行为作为参考，持续完善逻辑引擎，但**不是官方版本，也不是原作的完整 1:1 复刻**。本项目不使用原作的代码、地图、音频或美术素材。

**Rule Is World 是另一个项目。本压缩包只用于 Words Change Worlds 仓库。**

## 直接游玩

- 双击 `play.html`：完全离线的独立浏览器版。
- GitHub Pages：仓库根目录放置 `index.html`、`engine.js`、`levels.js`、`app.js`，即可使用 `index.html` 在线运行。
- 键盘：方向键 / WASD 移动；Z 撤销，Y 重做，R 重开，空格等待。
- 手机：触屏方向键，也支持棋盘上滑动。
- 测试：Node.js 18+ 执行 `node tests.js`。

## 从 v0.4 升级

将 ZIP 中 **8 个同名文件**全部解压覆盖至 **Words Change Worlds** 仓库根目录，提交后即可。不要把不同版本的 `engine.js`、`levels.js` 和页面混在一起；不要覆盖原来的 Rule Is World 仓库。

浏览器关卡完成记录的本地存储键名不变，因此正常情况下不会清空此前的进度。第 31 关加了对固定文字的锚定，避免 `EMPTY IS YOU` 生效后自动把关键句子推走。

## v0.5 实现范围

- **复杂同步移动**：确认多个 `YOU` 同向行动不会重复计步；SHIFT 阶段一个物体最多被位移一次，避免重叠传送带连续搬运。
- **PUSH × FLOAT**：`PUSH` 可跨 FLOAT 层推动，`STOP` / `PULL` 等实体阻挡仍要求匹配浮层。跨层的 PUSH 链如果失败，会整体回滚。
- **EMPTY 交互（部分）**：`EMPTY IS PUSH` 用连续空格链的尽头是否存在实体决定能否推动；`EMPTY IS PULL` 阻止普通进入；`EMPTY IS YOU` 可作为临时控制源推动可推动的对象/文字，但不会生成常驻的 EMPTY 对象。`EMPTY IS STOP` 等保留。
- **结算顺序**：YOU 输入阶段和 MOVE / SHIFT 运动阶段先于名词变形、MAKE 生产；TELE 与重叠效果在变形之后处理。
- **语法修正**：`TEXT ON WALL IS STILL` 不再偷偷派生 `WALL IS STILL`；类似 `NEAR` 条件语句也不能绕过条件生效。
- 7 个新关卡，编号 38–44，每关均有可重复的操作解法。共 44 关；**109 项 Node.js 自动化测试通过**（包括全部 87 项旧测试）。

## 仍然没有完成的部分

- 复杂同时移动的全部冲突优先级、多个不同方向 SHIFT/移动阶段争夺同一物体、`PULL` 与 `EAT` / `SWAP` 的竞争，尚不能保证逐帧匹配原作。
- EMPTY 的全部可移动性质（例如更复杂的 MOVE/SHIFT、与自身碰撞）、语法嵌套和自指 GROUP/WORD 仍是部分实现。
- 3 个以上的 TELE 目的地仍用确定性顺序，而非原作的随机机制。
- 44 个关卡均为独立原创测试关，不是原作的官方关卡。

项目文件：`index.html` 网页入口，`play.html` 完全离线单文件，`engine.js` 规则引擎，`levels.js` 原创关卡，`app.js` 画面与交互，`tests.js` 回归测试，`README.md` 使用说明，`CHANGELOG.md` 更新日志。

**Commit message**：`feat: refine movement order, cross-layer PUSH and EMPTY interactions; add 7 levels`
