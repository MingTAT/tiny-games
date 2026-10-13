# Change Log

## v0.6 · 2026-10-13

- 修正 SHIFT 的旧版假设：多个叠加 SHIFT 可以让一个物体在同一回合按一格一格的波次多次移动；第一来源优先决定方向，不再强行限制为一格。
- 修正 FLOAT 的旧版假设：STOP、PUSH、PULL、SWAP 的移动碰撞不受浮层隔离；WIN、DEFEAT 等同格效果仍依赖浮层相同。
- MOVE 阶段现在共享已移动对象集合，避免同一个 MOVE 对象既被推走又自主额外移动的某些重复执行。
- 更新第 43 关的目标位置，配合真正的 SHIFT 叠加行为。
- 新增 45–50 关：条件 SWAP、FLOAT/STOP、跨层 PULL、PUSH+SWAP 优先级、MOVE 自动拼句、三重 SHIFT。
- 逐条验证所有新增关卡的解法；从 109 项增加到 **134 项 Node.js 测试**；其余旧测试保留，修正与原作机制不符的旧断言。

**不保证的部分：** 复杂同时移动精确结算、SHIFT 多方向冲突细节、所有 EMPTY/GROUP 特殊行为、3 个以上 TELE 的随机目标及原作全部规则/关卡。原作者的代码、素材、音效、官方关卡均未包含。

# Change Log

## v0.5 · 2026-10-12

- 修复跨 FLOAT 层的 PUSH 推动、阻挡链与失败回滚；不同 FLOAT 层的普通 STOP 不产生实体阻挡。
- 实现 EMPTY IS PUSH 的连续空格推送判定，并扩展 EMPTY IS PULL、EMPTY IS YOU 推动文字/物体的基础行为；保持 EMPTY 虚拟、不生成永久 EMPTY 实体。
- 将 MOVE/SHIFT 运动结算调整为在名词变形与 MAKE 之前；变形后处理 TELE 与重叠效果。
- 同一 SHIFT 阶段避免对一个对象重复移动；保持多个 YOU 同向运动时每个实体只移动一次。
- 修复规则解析器在 ON/NEAR/FACING/WITHOUT 条件句中间启动子句导致无条件规则泄漏的问题。
- 调整第 31 关使完整 EMPTY YOU 动态玩法生效后仍可按原解法完成。
- 新增 38–44 关：跨层 PUSH、先 MOVE 再变形、双 YOU、EMPTY PUSH、EMPTY YOU 拼词、重叠 SHIFT、PUSH+PULL。
- 自动化测试由 87 增至 109，并为 38–44 每一关验证可通关操作序列。

## v0.4 · 2026-10-11

- EAT 动词（碰撞及重叠）、SAFE 和 HAS 联动、PULL 连锁拖拽、PHANTOM、分类 TELE 修复。
- 原创关卡 32–37，总计 37 关，87 项测试。

## v0.3 · 2026-10-10

- GROUP、字母拼词、EMPTY 部分机制；31 个关卡和 68 项自动测试。

## v0.2

- WORD、NOT、SWAP、WEAK、多控制对象移动。25 个关卡。

## v0.1

- 初版规则引擎、20 个原创关卡及浏览器界面。
