# Words Change Worlds · v0.6

这是一款独立制作、可离线运行的文字规则解谜游戏，以《Baba Is You》的规则行为作为开发参考。**不是官方版本，也尚未实现原作完整的规则和关卡体系**。没有使用原作代码、地图、音乐或美术素材。

这是 **Words Change Worlds** 仓库；原来的 **Rule Is World** 是另外一个项目，请勿覆盖。

## 怎么运行

- 想直接玩：双击 `play.html`，无需安装软件，也不用联网。
- 想部署 GitHub Pages：将 `index.html`、`engine.js`、`levels.js`、`app.js` 放在仓库根目录，部署 `index.html`。
- 操作：方向键 / WASD 移动，`Z` 撤销、`Y` 重做、`R` 重开、空格等待一回合。手机可使用触屏方向键。
- 测试：Node.js 18+ 运行 `node tests.js`。当前 **134 项测试通过**，含 45–50 关实际通关操作序列。

## 从 v0.5 升级

解压 ZIP，把**八个同名文件**覆盖到 Words Change Worlds 仓库根目录，再 Commit & Push。单文件 `play.html` 也必须用新版替换，否则离线版会运行旧规则。旧关卡进度的本地存储键未改变。

## 这一版改了什么

- **SHIFT 叠加：** 两个同方向的 SHIFT 可推动两格；三个可推动三格。每一步分别检查前方障碍。多方向叠加时暂采用首个来源的方向作为可重复结果；复杂更新顺序尚非完全复现。
- **FLOAT 与物理碰撞：** FLOAT 不使 STOP、PUSH、PULL、SWAP 失效。它仍会分隔接触式胜利或伤害等效果。
- **MOVE 阶段：** 同一阶段内记录已经被 PUSH/SWAP 等位移过的单位，减少重复移动；YOU、MOVE、SHIFT 是三个不同阶段，同一回合仍可能各自移动。
- **六个新关卡（45–50）：** SWAP 条件句、FLOAT 和 STOP、PULL 拖拽、PUSH+SWAP、MOVE 自动组句及 SHIFT 叠加。第 43 关同步修正目标位置。

## 尚未实现或未验证

- 所有多方向同时移动和 PUSH/PULL/SWAP 的极端冲突结算，不保证与原作逐回合完全一致。
- EMPTY 和 GROUP 的高级特殊情况、完整语法及自指循环。
- 多个 TELE 目标的随机性；当前保持确定性目的地。
- 原作全部属性、原版关卡、美术和音乐。

项目文件：`engine.js` 为规则引擎；`levels.js` 为关卡；`app.js` 为界面；`index.html` 为联网部署版入口；`play.html` 为离线单文件；`tests.js` 为自动化测试；`README.md` 与 `CHANGELOG.md` 是说明和更新记录。

建议 Commit：`fix: align SHIFT stacking and FLOAT collisions; add 6 puzzle levels`
