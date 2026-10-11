# Words Change Worlds · v0.4

独立制作的浏览器文字规则解谜游戏。基于《Baba Is You》的核心互动思路逐步对齐规则表现，但**不是原作、不是原版关卡，也不是完整 1:1 复刻**。没有使用原作的游戏代码、美术、关卡或音频素材。

原先的 **Rule Is World** 是另一个项目，千万不要将本包上传到那个仓库。

## 运行

- 直接双击 `play.html`：离线可玩，桌面浏览器和手机浏览器都可使用。
- GitHub Pages：上传 `index.html`、`engine.js`、`levels.js`、`app.js`（其他文件可同时上传）。
- 验证：在项目目录运行 `node tests.js`，需要 Node.js 18+。
- 方向键 / WASD 移动，Z 撤销，Y 重做，R 重来，空格等待。手机有触屏方向键，也支持在棋盘上滑动。

## 从 v0.3 更新

将此包**全部文件**解压到 **Words Change Worlds 的 GitHub 仓库根目录**，覆盖同名文件后提交。`play.html` 是打包好的独立文件，不需要手工粘贴或拆分。不要把旧的 `engine.js` 与新的页面脚本混用。关卡完成记录使用原本的浏览器本地保存标识，不会因为这次版本号变化而清空。

## v0.4

- **EAT 动词**：`BABA EAT WALL` 在移动碰撞时可吃掉墙，即使墙是 STOP / PUSH；如果墙是 SAFE 则无法消灭。站在同一格的单位也会在回合效果结算时相互 EAT。被吃掉的物体可以通过 `HAS` 生成新物体。
- **PULL**：独立构成阻挡，从旁边离开可拖动身后的 PULL 物体；支持一串 PULL 物体连续拖动，且拖动不要求相同 FLOAT 层。`TEXT IS PULL` 会同时影响 WALL、IS、STOP 等所有字块。
- **PHANTOM**：物体能穿过 STOP / PUSH，仍正常结算危险、胜利等叠放效果。
- **TELE**：不同实体类型的传送网络不会串线（STAR TELE 只去另一颗 STAR、ROCK TELE 只去另一块 ROCK）；一个类型只有一个传送点时不会借用别的类型的传送点。目的地可以是不同 FLOAT 层。
- 新增 **32–37 关**，总计 **37 关**。新增关卡有自动化通关步骤验证。
- 原有 31 关和规则行为纳入回归测试，累计 **87 项自动测试**。

## 已知与原作不同的部分

- 3 个及以上 TELE 传送点：原作选择目的地有随机性，这版按对象 ID 顺序确定性跳转，以保持可复现。
- 复杂同时移动、PULL 阻挡与被拉动、EAT 和 SWAP 的竞争优先级、GROUP 递归与 WORD 自指不保证与原作逐帧一致。
- EMPTY 的完整移动 / 交互、部分特殊名词、规则词法所有嵌套情况、更多动词和高级属性尚未实现。
- 关卡是独立原创教学与练习关，**并非原作关卡**。目前仍然以行为一致性为开发目标。

## 结构

`index.html` (网页入口)、`play.html` (单文件)、`engine.js` (规则引擎)、`levels.js` (地图)、`app.js` (界面)、`tests.js` (测试)、`CHANGELOG.md`。

**Commit：** `feat: add EAT, PHANTOM, PULL chains and TELE fixes with 6 levels`
