# Words Change Worlds

这是一款正在对照《Baba Is You》机制的独立规则解谜游戏。它**不是《Baba Is You》本体或完整兼容版本**，不含原作美术、音效或关卡资源。

## 试玩

直接双击 `play.html`，或者把仓库根目录放到 GitHub Pages 上，打开 `index.html`。这两个文件都是可离线运行的单文件版本。

- 方向键或 WASD 移动
- Z 撤销，Y 重做，R 重开，空格等待
- 手机端有方向按钮和滑动控制
- 第 6 关：让实体岩石借助 `ROCK IS WORD` 参与组句；第 7 关：先让水上的岩石变成文字，再让另一块岩石获得 WIN

## 开发

Node.js 18+ 和 TypeScript (`npm i -g typescript`)。项目只依赖 TypeScript 编译器，不使用外部运行时 UI 库。

```bash
npm run build        # 编译 TS 并生成 index.html、play.html
npm test             # 运行代码及回放测试
npm run record:local # 重新生成本地引擎回放基准；修改现有行为时须核对差异
```

`src/core.ts` 是与视图无关的规则引擎。`step(state,input)` 不修改传入状态，输出新状态、事件与解析后的规则。`src/levels.ts` 存地图，`src/ui.ts` 管 Canvas 画面和操作。

`tests/` 下的行为测试检查规则和数据不变量，`replays/` 包含**本项目引擎生成的**逐步回放快照。`spec/` 包含 Wiki 文献行为与原作录制轨迹的说明/模板。

## v1.1 核心变化

- `WORD` 使实际名词对象参与语法解析，且支持否定和打断句子时的撤销。
- `X IS TEXT` 把 X 变成写有 **X** 的可推动文字；`TEXT IS X` 让文字变成 X 实物。
- `X IS X` 阻止名词变形；`X IS NOT X` 令对象消失；`X HAS TEXT` 会生成源对象名词文字。
- 7 个关卡、54 个测试，其中两关专门演示真实物体组句和条件变形。

## 验证等级（不要混淆）

1. **本地自动化测试**：54 项通过，包含规则预期和 7 个关卡的每步状态比对。这些数据只验证我们自己的工程实现。
2. **文献行为对照**：本次修正的 `WORD`、`TEXT`、`IS` 关键效果有 Wiki 文档支持，测试依据见 `spec/wiki-behavior-notes.md`。
3. **原版实机回放一致性**：**目前 0 项**。没有录制原版棋盘、输入序列与完整状态，因此不能宣称 1:1 行为一致。

## 未完成/已知简化

- 多方向同时移动、PUSH/PULL/SWAP 优先级、复杂 SHIFT、TELE、多 FLOAT 层结算。
- 复杂语法、动态 WORD 的自引用循环、字母拼词、EMPTY、GROUP、LEVEL、ALL 等。
- 名词转化、HAS 和其他删除规则之间全部连锁顺序；当前仅校准了最小案例。
- 原作关卡设计的深度与整体地图/关卡系统、美术、音效和完整操作体验。

## 从 v1.0 更新 GitHub

如果上一版已经在 `typescript-engine` 分支，本次直接覆盖**该分支的同名文件**（新加入第 6/7 关的回放 JSON 和 Wiki 说明也要上传），然后提交即可。旧版 v0.6 或其他游戏 Rule Is World 不要混用/覆盖。
