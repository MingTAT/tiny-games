# Words Change Worlds · Puzzle Edition v1.7

An independent TypeScript+Canvas puzzle game inspired by movable-rule puzzles. **Not an official or pixel-perfect copy of Baba Is You**. The graphics in this repository are procedurally drawn and do not contain original commercial game art or maps.

## Play

Open `play.html` (single-file, works offline). Arrow keys/WASD move, Z undo, Y redo, R restart. Click `关卡地图` to switch levels. Mobile has onscreen arrows and swipe controls. A victory overlay has **Next Level**, replay and map actions; Enter also advances.

The build opens on level 19. Levels 01–18 are preserved for backwards compatibility but considered instructional prototypes. Level **19** has been completely replaced in v1.8. The visually approved v1.7 Canvas direction is retained unchanged. Level 20 remains the prior v1.7 puzzle and is NOT claimed to have been redesigned this time.

- **19 · 无人之门 (The Unattended Doors)**: an original spatial/rule puzzle with an intentionally non-instructional hint. No solutions are exposed in the interface. There is a verified winning replay, a wall/door geometry check, and counterfactual tests for required wording. These checks do NOT establish puzzle difficulty or uniqueness; human blind playtesting is still needed.
- **20 · 你不再是你**: retained legacy puzzle, pending a separate difficulty redesign.

### Spoilers for developers — level 19 design

The intended discovery is that destruction can continue player control through HAS and that the same movable subject word must be recycled *after* it has served a different, vital rule. The first OPEN rule is BABA IS OPEN; after BABA dies at the first SHUT door, KEKE becomes controllable through BABA HAS KEKE. Move the old BABA noun off the OPEN statement, and use the KEKE noun previously forming the HAS statement to make KEKE IS OPEN. KEKE opens the second door, and KEKE HAS BABA leaves a controllable BABA to reach the flag. The complete local-engine witness is **40 moves**; this is not a proven minimum.

Without the first inheritance rule, the death ends control; without the second, control ends at the second door. The tests also verify that both door positions cut the only corridor and that the recorded winning route fails when critical text is removed. These are stronger checks than mere completion but not an exhaustive anti-shortcut proof.

## UI redesign

v1.7 replaced the previous web app layout with one centered Canvas, a compact HUD and modal level selector, darker dungeon palette, color-coded word blocks, procedurally connected walls, tiny deterministic environment details and subtly animated words/characters. Mobile supports touch controls. It reuses the independent engine; no original-game assets have been copied.

## Build & tests

Requires Node.js and the TypeScript compiler `tsc`.

```sh
npm run build
npm test
python scripts/browser-v17.py
```

The automated suite includes 20 locally recorded complete level replays, rule-engine regression tests, and v1.7 assertions on the exact important semantic moments of the two new puzzles. **148 automated tests pass in v1.8.** Browser smoke tests in v1.8 use Chromium on the generated standalone HTML and check actual keyboard playthrough of both new levels, Next Level navigation, menu, restart, undo, mobile layout and JavaScript errors.

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

Suggested commit: `feat: replace level 19 with inheritance-and-rule-recycling puzzle`
