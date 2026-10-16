# Known gaps vs original behavior (v1.5)

These are **not passing parity cases** and must not be counted as verified original-game tests.

| Feature | Present engine behavior | Original / outstanding verification |
|---|---|---|
| `GROUP IS NOT GROUP` and self-negating recursive definitions | Bounded membership iteration and return of a finite approximation | Wiki describes oscillations/infinite loops and additional special behavior. Need original capture and explicit event model. |
| `EMPTY IS YOU` movement | Virtual vacancies emit movement-attempt events; they do not persist as independent actors | Original recalculates every single-space step, and special interaction effects can occur while vacancy moves. More collision logic needed. |
| `EMPTY IS OPEN`, `EMPTY IS SINK` | Not all special contact behaviors implemented | Some movement-stage interactions differ from ordinary overlapping collision checks. |
| Simultaneous competing SHIFT directions | First conveyor direction selected; overlapping conveyors contribute multiple steps | Exact original priority depends on queued object processing and update order. |
| Three or more matching TELE sources | Deterministic destination function, for replay repeatability | Original routes randomly; real-game randomized output cannot be compared as a single deterministic path. |
| FOLLOW, BACK, FALL, directional forces, other special stages | Not implemented | Original's full interleaved event pipeline has many additional movement and destruction stages. |
| Mixed-group conditions with complex infix predicates | Partial all-member condition matching, limited to ON/NEAR/LONELY grammar | Full original group/infix parsing and bugs not represented. |
| Real original-game replay | No direct original-game observation supplied | 0 original empirical comparisons; `scripts/compare-original.cjs` requires genuinely observed fixtures. |

The presence of a working reference-derived unit test does not close a row above. A gap is closed only when the mechanics work and the direct gameplay reference has been recorded and matched (where possible).
