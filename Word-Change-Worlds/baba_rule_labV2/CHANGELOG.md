# Core Rebuild — 2026-10-13

不继承 v0.6 的关卡累计数字。这是一次从规则核心、关卡、界面重新设计的 breaking replacement。

- 重建文本规则解析、名词变形、属性/否定、事务式推动与接触判定。
- 设计 8 个原创关卡，用明确解法证明规则变更的必要性。
- 重做全套布局和棋盘绘制，加入本地进度、提示、关卡选择、撤销和重做。
- 28 个自动化回归测试通过；浏览器实测受工具环境限制，尚未完成。
- 明确列出未实现的原作高级机制，不再把测试数量当作还原完成度。

Commit: `refactor: rebuild the rule puzzle core with verified original levels`
