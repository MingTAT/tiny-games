# Words Change Worlds · v0.2

独立开发的浏览器文字规则游戏。目标是在**不使用《Baba Is You》商业美术、音乐与关卡数据**的前提下，逐步验证其规则系统的行为一致性。用户之前的 **Rule Is World** 是另一个独立项目，未被修改或覆盖。

## 直接开始

- **`play.html`**：双击即可玩。完整 HTML 包含源代码，无需联网、安装或构建。
- `index.html`：模块化入口（与 `engine.js`、`levels.js`、`app.js` 放在同一目录即可）；适合 GitHub Pages。
- `tests.js`：Node.js 规则测试。运行 `node tests.js`。

## 操作

- 方向键或 `W/A/S/D`：移动当前所有 `YOU`/`YOU2` 对象。
- `Z` 撤销、`Y` 重做、`R` 重开、`空格` 原地等待。
- 左侧选择关卡，右侧显示当前生效的规则。手机屏幕有方向按钮，也支持在画布上滑动。
- 游玩进度存放在当前浏览器本地。

## v0.2 更新内容

本轮重点不是堆砌关卡，而是修复会导致解题逻辑失真的规则缺口。

1. **WORD 正式工作**：具有 `WORD` 属性的实物可以代替对应名词词块参与组句；打断来源规则后，`WORD` 状态不会仅靠自身维持。
2. **NOT 语义扩展**：`X IS NOT Y` 否决 `X IS Y` 的效果；`X IS NOT X` 导致 X 消失；连续两个 `NOT` 可抵消。修复 `NOT ROCK IS WIN` 被错误解析出 `ROCK IS WIN` 的问题。
3. **碰撞规则修复**：`SWAP` 可与普通 `STOP` 交换位置；`WEAK` 物体在合适的接触或碰撞情况下被销毁；`YOU2` 参与 `WIN` 与 `DEFEAT` 结算。
4. **移动正确性**：同一移动阶段跟踪已移动对象，避免同一个受控物体被重复处理；失败的推动链回滚状态；增加 `UP/RIGHT/DOWN/LEFT` 朝向属性。
5. **5 个新关卡**：21 WORD、22 IS NOT STOP、23 IS NOT WALL、24 SWAP + NEAR 条件取消、25 WEAK。新增关卡均有可执行的通关序列测试。
6. **47 项自动化测试**通过，并在 Chromium 中实测页面交互；移动端 390px 无横向溢出，触屏方向按钮可操作。

## 当前支持的主要语法

- 基础：`NOUN IS PROPERTY`、`NOUN IS NOUN`、`NOUN HAS NOUN`、`NOUN MAKE NOUN`。
- 连接：`AND`、`NOT`（含简单双重否定）、`NOT NOUN` 主语。
- 条件：`LONELY`、`ON`、`NEAR`、`FACING`、`WITHOUT`。
- 机制：`YOU`、`YOU2`、`WIN`、`PUSH`、`STOP`、`PULL`、`MOVE`、`SINK`、`HOT`、`MELT`、`DEFEAT`、`OPEN`、`SHUT`、`SWAP`、`WEAK`、`WORD`、`FLOAT`、`TELE`、`SHIFT`、`SAFE`、`STILL`、朝向等。

## 尚未实现或尚未与原作精确校准

这**不是《Baba Is You》1:1 的完成品**。主要剩余问题：

- `EMPTY`、`LEVEL`、`GROUP`、字母拼词系统，及复杂递归语法、极端 WORD 循环。
- `REVERT`、`FEAR`、`FOLLOW`、`MORE`、`MIMIC`、`WRITE` 等高阶性质/运算符。
- 某些堆叠、推拉、自动移动、传送、条件计算和销毁规则的原作精确结算顺序。
- 更全面的行为一致性测试、真正复杂且经过人工解题验证的关卡、关卡编辑器、进度地图、无障碍支持、音效。
- 本项目**不包含原作关卡、原声和原始美术资产**。

## 文件

| 文件 | 作用 |
| --- | --- |
| `play.html` | 完全自包含的单文件网页版 |
| `index.html` | 模块化网页入口 |
| `engine.js` | 规则解析与世界结算 |
| `levels.js` | 25 个原创机制关卡 |
| `app.js` | UI、Canvas 画面和控制 |
| `tests.js` | 47 项可运行回归测试 |
| `CHANGELOG.md` | 版本记录与已知限制 |

## 下一阶段

v0.3 不应只是增加更多简单关卡，应优先实现并检验完整的 **EMPTY 与 GROUP 语义**、增强句法解析和交叉文字测试，建立规则行为差异清单；之后逐步完善高阶移动与递归机制。只有规则引擎可信，才能把关卡难度推进到原作中后期的复杂程度。
