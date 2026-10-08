# Puzzle Audit — Campaign v2 Polish

This release keeps the existing **30 rooms** and focuses on making their rules readable, their controls dependable, and their solutions easier to inspect without immediately spoiling them.

## What the tests establish

- Every room still has a known working solution in the current engine (`node tests/validate.js`).
- A bounded movement-only search with frozen words does not find a win along the checked horizons.
- Atomic movement, multiple YOU, undo, sentence changes, blocked-turn orientation and cyclic transformations have targeted tests (`node tests/engine.spec.js`).
- A headless browser smoke test confirmed menu rendering, two-stage hints, keyboard victory, undo after victory, best-step display and narrow-screen touch controls.

## What the tests do NOT establish

- That a standard solution is the shortest or the most elegant.
- That every possible alternate solution requires rewriting rules; the frozen-text search has a finite depth.
- That every room delivers a satisfying discovery. This needs deliberate playtesting with people who do not know the intended solution.
- That the engine implements every edge case from Baba Is You or can be treated as a clone.

## Review list for the next level-design pass

| Priority | Rooms | Why these deserve deliberate playtesting |
|---|---|---|
| Revised v4 | 07, 09 | 07 now needs two rule edits; 09 builds two rules from a single chain push. Human playtest still pending. |
| Partially revised v4 | 26–30 | 26, 29, 30 redesigned; 27–28 intentionally remain short conceptual introductions. Human playtest pending. |
| High | 17, 22 | The longer input sequences may contain unnecessary walking or object shuffling. |
| Medium | 03, 06, 12, 18 | Check whether players actually combine insights or merely follow the visual arrangement. |
| Medium | 19–21 | Observe whether players understand that a conditional rule can be written but not yet in effect. |
| Medium | 23–24 | `MAKE` and `MOVE` deserve a second puzzle that subverts their first use. |

## Accept/reject criteria for a future level revision

1. Keep at least one verified solution that involves meaningfully altering a sentence.
2. Check direct-walk solutions with words frozen.
3. Test undo before and after the key rule change.
4. Have an unfamiliar player describe the **idea** of the solution, not just the movement sequence.
5. Remove pointless travel before increasing the map's size.

The aim is not longer levels. It is better surprises per move.


## v4 evidence and limitations

The redesigned rooms now have intermediate assertions in the regression test, so it is harder for a future code change to silently turn them back into trivial wins. The v4 regression records both a functioning solution and the intended change-of-rule sequence.

Still open: 27–28 could use a richer second use of TEXT MOVE / EMPTY, and new players must independently test whether hints disclose too much. This release does not claim the engine has complete commercial-game rule semantics.
