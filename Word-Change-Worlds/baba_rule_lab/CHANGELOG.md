# Change Log

## v0.3 · 2026-10-10

- 加入 GROUP 成员及共享属性、简单组内变形；修复组名词被当作实体的错误。
- 加入字母 `letter` 方格与横/纵词语识别，可与普通文字交叉形成规则。
- 加入 EMPTY 的空格检测、变形、删除、STOP、WIN 与 YOU 的基础规则；修正了误把 `EMPTY IS WIN` 当成普通地面奖励的理解。
- 修复 WORD 与 GROUP 简单联动的规则刷新顺序。
- 新增关卡 26–31，覆盖 GROUP PUSH/多成员 WIN、字母拼 WIN/ROCK、EMPTY 填充及 EMPTY YOU+WIN。
- 增至 68 项 Node 自动化规则和关卡测试；保持 v0.2 的 25 个关卡与历史控制。
- 明确声明 EMPTY 移动、GROUP 复杂递归、字母 Object Palette 等仍未实现 1:1。

## v0.2

- 修复 WORD、IS NOT、SWAP、WEAK、多控制对象移动等规则。
- 增加原始 21–25 关与回归测试。

## v0.1

- 原创 20 关，文字规则引擎、浏览器 Canvas UI、移动/撤销/重开。
