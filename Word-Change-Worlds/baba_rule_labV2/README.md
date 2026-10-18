# Words Change Worlds · Puzzle Edition v1.7

An independent TypeScript+Canvas puzzle game inspired by movable-rule puzzles. **Not an official or pixel-perfect copy of Baba Is You**. The graphics in this repository are procedurally drawn and do not contain original commercial game art or maps.

## Play

Open `play.html` (single-file, works offline). Arrow keys/WASD move, Z undo, Y redo, R restart. Click `关卡地图` to switch levels. Mobile has onscreen arrows and swipe controls. A victory overlay has **Next Level**, replay and map actions; Enter also advances.

The build opens on level 19. Levels 01–18 are preserved for backwards compatibility but considered instructional prototypes. Levels **19–20** have been newly authored for this edition:

- **19 · 借来的动词 (The Borrowed IS)**. One IS tile has to transform the separating wall into rocks, then be removed and reused to complete FLAG IS WIN. Transformations persist after the rule is broken; both tasks need the same tile at different points.
- **20 · 你不再是你 (You Are No Longer You)**. A player must transfer control to a ROCK before physically replacing the original BABA IS YOU with BABA IS WIN. Completing the latter too early removes all control; after the switch the rock has to touch the now-static Baba.

These are puzzle design experiments with two distinct conceptual reversals, **not validated claims that they match the commercial game's difficulty**. Neither has been fully audited for all unintended solutions; the bounded breadth-first search was inconclusive within its time budget. Route and counterfactual tests do not prove uniqueness.

## UI redesign

v1.7 replaces the previous web app layout with one centered Canvas, a compact HUD and modal level selector, darker dungeon palette, color-coded word blocks, procedurally connected walls, tiny deterministic environment details and subtly animated words/characters. Mobile supports touch controls. It reuses the independent engine; no original-game assets have been copied.

## Build & tests

Requires Node.js and the TypeScript compiler `tsc`.

```sh
npm run build
npm test
python scripts/browser-v17.py
```

The automated suite includes 20 locally recorded complete level replays, rule-engine regression tests, and v1.7 assertions on the exact important semantic moments of the two new puzzles. **147 automated tests pass.** Browser smoke tests use Chromium on the generated standalone HTML and check actual keyboard playthrough of both new levels, Next Level navigation, menu, restart, undo, mobile layout and JavaScript errors.

`node scripts/shortcut-v17.cjs` provides a time-budgeted shortcut scan. **A scan ending due to budget is inconclusive**; it is not a proof that a shorter solution does not exist.

`benchmarks/` still states original-game discrepancies; **original commercial game empirical replay cases: 0**. External documentation and developer interviews do not establish bit-for-bit parity.

## Structure

- `src/core.ts` — renderer-independent state updates and rule parsing
- `src/levels.ts` — all 20 custom puzzles
- `src/ui.ts` + `web/` — Canvas renderer and controls
- `tests/puzzle-design-v17.test.cjs` — conceptual and negative-case tests for levels 19–20
- `scripts/browser-v17.py` — actual desktop/mobile interface walkthroughs
- `replays/` — local-engine replay snapshots, NOT observations from Baba Is You
- `play.html` / `index.html` — offline self-contained game

## GitHub

On the existing `typescript-engine` branch, back up v1.6 and replace matching project files with the v1.7 ZIP. Keep the other `Rule Is World` project independent.

Suggested commit: `feat: redesign puzzle UI and add two discovery-based rule levels`
