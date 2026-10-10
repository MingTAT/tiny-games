# Words Change Worlds · v0.3

独立开发的浏览器文字规则解谜游戏，基于「推词改写世界」这一机制进行原创实现。**不是原作《Baba Is You》的官方版本、原版关卡或完整 1:1 复刻。** 之前的 Rule Is World 是另一个仓库，**不要覆盖它**。

## 运行 / 更新

- **双击 `play.html` 即可运行**：独立单文件，不需要联网、安装或构建。
- 上传到 GitHub Pages：使用同目录的 `index.html`、`engine.js`、`levels.js`、`app.js`。
- 从 v0.2 更新：将 **本项目仓库中的** `index.html`、`play.html`、`engine.js`、`levels.js`、`app.js`、`tests.js`、`README.md`、`CHANGELOG.md` 替换为同名新文件；不要使用 v0.2 旧版脚本混搭。
- 本地测试：`node tests.js`（需要 Node.js 18 或以上）。
- 操作：方向键 / WASD 移动，Z 撤销，Y 重做，R 重开，空格等待；支持触摸按键和画布滑动。

## v0.3 的真正变化

**6 个新关卡（26–31）**，累计 **31 关、68 项自动化测试**。除新增规则，还覆盖旧版关卡回归。

1. **GROUP 基础成员语义**：`ROCK IS GROUP` 将岩石加入组；`GROUP IS PUSH`、`GROUP IS WIN`、`GROUP IS ROCK` 可以作用于组成员；支持多类成员、撤销与组句失效；`GROUP` 不生成普通实体。GROUP MAKE/HAS 的常见非递归目标也能展开。
2. **字母拼词**：`type:'letter', word:'W'` 等字母对象可横向或纵向拼成词。例如 `FLAG IS W I N`、`R O C K IS PUSH`；多个字母都成为活跃词块；字母像其他文字一样能推动，`TEXT` 属性可作用到字母。
3. **EMPTY 作为空格**：`EMPTY IS ROCK` 在真实空格生成岩石；`ROCK IS EMPTY` 移除岩石；`EMPTY IS NOT ROCK` 可否决生成；`EMPTY IS STOP` 会阻挡进入空格；单独 `EMPTY IS WIN` 不会让普通 Baba 自动获胜，`EMPTY IS YOU` 与 `EMPTY IS WIN` 同时有效则可获胜。空格不是普通实体，不会叠放到非空格。
4. **GROUP 与 WORD 的组合**能让组成员以名词参与组句（非循环基础用例）。
5. **UI**：字母砖块独立绘制、GROUP 成员虚线高亮、31 关关卡列表。

## 规则边界：不声称 1:1

目前已有多种文字规则/条件/碰撞机制，但以下仍是**未实现或未严格校准**：

- `EMPTY IS YOU` 的**移动行为**、`EMPTY IS PUSH`、`EMPTY` 的完整复杂交互/条件/自指结算；目前仅实现上面列出的明确子集。
- GROUP 的递归成员关系、多个嵌套条件、完整 GROUP 条件展开与循环消歧。
- 字母的关卡 Object Palette、部分重叠多字母歧义、特殊 `AB`/`BA` 多字母拼写限制。
- `LEVEL`、`ALL` 的完整动态成员语义、`REVERT`、`MIMIC`、`WRITE` 等大量高级规则与原作精确的结算次序。
- 更高难度且人工验证的中后期逻辑关卡、地图与编辑器、音效及无障碍。

本项目不包含商业原作的地图、美术、音乐或音效，也没有使用官方代码。

## 文件结构

| 文件 | 用途 |
| --- | --- |
| `play.html` | 单文件可玩版本 |
| `index.html` | GitHub Pages 网页入口 |
| `engine.js` | 规则引擎（包含 EMPTY、GROUP、letters） |
| `levels.js` | 31 个原创关卡 |
| `app.js` | UI / Canvas 绘制 / 控制 |
| `tests.js` | Node 回归测试 |
| `CHANGELOG.md` | 更新记录 |

## 建议 Commit

`feat: add EMPTY, GROUP and letter spelling mechanics with 6 new levels`
