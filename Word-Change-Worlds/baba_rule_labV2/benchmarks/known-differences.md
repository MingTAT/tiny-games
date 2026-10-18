# Known differences vs original gameplay (v1.6)

**Do not present any of these as original-game-verified.** We have observed the original in the environment **0** times. The automated tests use source-derived expectations, plus old internal-engine trajectories.

| Subsystem | New v1.6 behavior | Still missing / uncertain |
|---|---|---|
| GROUP / GROUP2 / GROUP3 recursion | Transitive memberships, stable positive cycles, negation exclusions; detect repeated membership-state oscillation and stop the turn with a reversible `loop` UI state | Full original group rules, conditional nonmonotonic fixed points and all infinite-loop categories; original error limits and exact precedence |
| `EMPTY IS YOU` | Vacant positions attempt directional movement, push real PUSH objects on contact; never persist as map entities | Exact original scheduling of all vacancy movers when several directions/forces interact, virtual PULL/MOVE and other collisions |
| `EMPTY IS PUSH` | Can push through chains of vacancies into physical PUSH objects; transactional rollback on STOP / edge | Original full handling of PULL, SWAP, open/shut, multiple layers and simultaneous movement into rearranging vacancy regions |
| Re-parsing stages | Reparse actually runs after relevant phases; records rule changes and detects group paradoxes after text movement | Original full phase ordering (special verbs/effects, random destinations, many missing properties) |
| TELE | Deterministic routing by object type (replay-friendly) | Original 3+ destinations are random rather than our seeded deterministic mapping |
| FLOAT / various interactions | Partial existing engine behavior | Full collision phases and layer interaction details |
| Level complexity | 18 original project levels retained and regression-tested | Cannot claim puzzle-design parity with commercial original |
| Direct empirical comparison with original game | Comparator rejects unverified or missing fixture provenance | **0 recorded original-game traces available**. Real footage/inputs/board state needed for genuine A/B results |

Relevant public sources: [GROUP](https://babaiswiki.fandom.com/wiki/GROUP), [Infinite Loop](https://babaiswiki.fandom.com/wiki/Infinite_Loop), [EMPTY](https://babaiswiki.fandom.com/wiki/EMPTY), [Order of Operations](https://babaiswiki.fandom.com/wiki/Order_of_Operations), [original creator comment](https://steamcommunity.com/app/736260/discussions/0/3454730619128231627/).
