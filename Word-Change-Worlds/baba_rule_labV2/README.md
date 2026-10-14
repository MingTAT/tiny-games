# Words Change Worlds — TypeScript Engine v1.3

独立制作的规则解谜游戏，使用 TypeScript + Canvas。它以文字作为可移动、可组合的规则物件，受《Baba Is You》的设计启发；**不是官方版本，也不复用原作关卡、美术或音乐。**

## 立即游玩

- 双击根目录 `play.html`（离线、无需安装）。
- 根目录 `index.html` 同样是独立单文件，适合 GitHub Pages。
- 默认从 **14 关** 开始，新关卡专注于多步规则链。右侧的选择器可进入之前的全部关卡。
- 方向键 / WASD 移动，Z 撤销，Y 重做，R 重开，空格等待。
- 成功后会出现清晰的 **下一关 →** 按钮；Enter 也可以继续。最后一关会变成 **返回关卡列表**。
- 手机支持屏幕方向按钮和滑动。完成标记在浏览器允许时保存，并兼容读取 v1.2 的本地进度记录。

## v1.3 核心变化

新增 `EAT` 动词和 `SAFE`、`STILL` 属性，改进了进入目标格时的碰撞处理，包括：

- `BABA EAT ROCK`：移动进入岩石所在位置时可先销毁 ROCK，再完成移动；同格接触也会触发。`EAT` 对应目标名词，不是物体属性。
- `ROCK IS SAFE`：免疫 `EAT`、`SINK`、`HOT/MELT`、`DEFEAT` 等销毁效果；**不**阻止 `IS NOT` 造成的消失。
- `ROCK HAS KEY`：若岩石实际被销毁，则在岩石原来的位置生成 KEY；只是转化成别的名词不触发 HAS。
- `KEY IS OPEN` 与 `DOOR IS SHUT`：在移动进入位置时解锁，不必先在原位重叠；可越过门的 STOP/PUSH 阻挡。
- `ROCK IS STILL`：移动与推动时将其当作不可移动对象（基础支持，不是完整原作优先级）。
- 这些机制支持 `NOT`、条件前缀和 `FLOAT` 层间过滤的基本结合。

## 新关卡（不是机械教学）

| 关卡 | 真正需要完成的规则链 | 验证过的操作序列 |
|---|---|---|
| **14 锁与遗产** | 先打断 `ROCK IS SAFE` → 用 `BABA EAT ROCK` 解除石墙 → `ROCK HAS KEY` 生成钥匙 → 利用 `KEY IS PUSH AND OPEN` 与 `DOOR IS SHUT AND STOP` 解锁第二道门 | 16 步 |
| **15 吃掉一条规则** | 先拼出 `BABA EAT ROCK` → `ROCK HAS TEXT` 留下可推动的 ROCK 字块 → 将字块移动组出 `ROCK IS YOU` → 从另一侧控制实体岩石到达胜利格 | 13 步 |

新关卡不是用“走到旗帜”为唯一任务；两关都使用了真正的封闭障碍和相继生效的语义规则。**已验证一条通关轨迹，并未证明最短解或不存在其他解。**

## 核心结构

- `src/core.ts`：纯逻辑规则解析、移动尝试、碰撞、变化、销毁和回合事件。
- `src/levels.ts`：15 个关卡数据。
- `src/ui.ts`：Canvas 渲染、历史记录、胜利面板、关卡切换与保存。
- `web/`：样式和构建后的网页。
- `scripts/build.cjs`：把页面打包为单个离线 HTML。
- `scripts/record-local.cjs`：重新生成自有引擎的逐步棋盘回放。
- `replays/`：15 个本地回放轨迹；每步记录实体位置、方向与状态。
- `tests/`：规则测试、碰撞测试、完整回放测试和关键阶段断言。
- `spec/`：行为笔记与对照原作的测试模板。

## 开发

需要 Node.js 18+ 和 `tsc`（`npm install -g typescript`）。

```bash
npm run build
npm test
npm run record:local
```

浏览器 UI 的真实运行检查需要安装 Python Playwright 和 Chromium：

```bash
python scripts/browser-smoke.py
```

v1.3 自动化测试 **92 项通过**，包括全部 15 关的完整本地状态回放；桌面与手机浏览器实际检查通过。

## 仍然存在的关键差距

1. 没有原版实机的棋盘与输入记录，因此**原作实机一致性测试仍为 0 项**；本地成功不代表对原作完全一致。
2. 复杂并行移动与移动优先级、`SHIFT` 多重叠加、递归 `GROUP`、`EMPTY`、文字拼词和丰富的条件语法仍未完整实现。
3. `OPEN/SHUT`、`EAT` 与多个堆叠物体的交互仅覆盖了测试内的明确情形，并非原作所有极端边界。
4. 全部 15 关均为本项目原创，暂时不具有原作正式关卡的视觉艺术或完整难度曲线。

## GitHub 更新

把压缩包解压到此前 **Words Change Worlds / typescript-engine** 分支，覆盖同名文件并一起加入新增测试及回放。不要与早期 v0.x 的 JS 文件混用；也不要覆盖独立的 Rule Is World 仓库。

Commit：`feat: add EAT SAFE and collision-phase HAS puzzles with next-level flow`
