# Change Log

## v0.4 · 2026-10-11

- 新增 EAT 动词（移动碰撞与重叠结算），支持 SAFE 防护、HAS 后续生成，以及因其他 STOP 对象仍在时的事务回滚。
- 修复 PULL 作为实体阻挡、连续拖拽和跨 FLOAT 层的基础行为。
- 新增 PHANTOM 绕过 STOP / PUSH、但仍触发重叠效果。
- 修复 TELE 不同对象类型相互错误串线的问题。保留确定性轮询目的地（与原作 3+ TELE 随机性不完全一致）。
- 新增关卡 32–37：EAT WALL、TEXT PULL + STILL、PHANTOM、SAFE+NOT+EAT、独立 TELE 网络、EAT + HAS + WIN。
- 更新界面规则列表，支持 EAT；保持单文件和 GitHub Pages 两种交付形式。
- 扩展至 87 项 Node 自动测试，包括 6 关逐步通关验证、68 项旧测试及新增引擎行为测试。

## v0.3 · 2026-10-10

- GROUP、字母拼词和 EMPTY 部分机制；31 个关卡和 68 项自动测试。

## v0.2

- WORD、NOT、SWAP、WEAK、多控制对象移动。25 个关卡。

## v0.1

- 初版规则引擎、20 个原创关卡及浏览器界面。
