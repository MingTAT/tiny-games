# 文献行为校准说明 · v1.1

这些是**按文献规则编写的独立测试**，不是原版运行录像的实测结果。没有通过与原版逐步棋盘比对，不能称为原作一致性通过。

参考资料：

- 原版 Wiki — `WORD` 是让实物按自己的名字作为名词进入规则的属性：<https://babaiswiki.fandom.com/wiki/Category:Properties>
- 原版 Wiki — `X IS X` / `X IS NOT X` 对转换的影响：<https://babaiswiki.fandom.com/wiki/IS>
- 原版 Wiki — `TEXT` 是特殊名词；源物体 `IS TEXT` 会产生其对应名词文字：<https://babaiswiki.fandom.com/wiki/TEXT>
- 原版 Wiki — 横竖文字解析及重叠文字分支：<https://babaiswiki.fandom.com/wiki/Rule>

已锁定的最小案例：

1. `ROCK IS WORD` + [真实岩石] `IS WIN`：真实岩石参与句子，另一块岩石获得 WIN。
2. 再加入 `ROCK IS NOT WORD`：实体名词句失效，但屏幕上的 ROCK IS WORD 文字规则仍存在。
3. 打断 `ROCK IS WORD`：因为不再是 WORD，原有实物句子立即失效。
4. `ROCK IS TEXT`：岩石变成写有 `ROCK` 的文字，能继续构成新规则。
5. `TEXT IS ROCK`：文字变成 ROCK 实体。
6. `BABA IS BABA` + `BABA IS ROCK`：BABA 自身保护优先。
7. `BABA IS NOT BABA`：BABA 消失。
8. `ROCK HAS TEXT`：ROCK 被删除后生成写有 ROCK 的文字。

仍需人工录制原版输入与输出的部分：语法解析极限、WORD 自引用、复杂的 NOT 和条件、跨阶段 HAS/MAKE 等。测试模板在 `original-conformance-template.json`。
