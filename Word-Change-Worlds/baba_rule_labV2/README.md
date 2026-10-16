# Words Change Worlds — Engine v1.5

An original, browser-playable rule-puzzle prototype. The gameplay concept is inspired by *Baba Is You*, but this is **not** the official game, its levels, or a complete 1:1 reproduction.

## Play

Open **`play.html`** directly (offline). Use arrow keys or WASD, Z to undo, Y to redo, R to restart, Space to wait, and Enter to advance after winning. The 18 pre-existing original test/puzzle levels are retained; the current project opens at level 16. The victory dialog and next-level button remain functional.

## v1.5 changes

- **GROUP recursion**: `GROUP`, `GROUP2`, and `GROUP3` behave as independent, derived member sets. Membership supports transitive rules, `NOT` exclusions, conditions, cycles reaching a finite fixed point, and basic `EMPTY IS GROUP` inheritance. Cycles with changing negation are bounded approximations rather than faithful infinite-loop behavior.
- **EMPTY virtual occupancy**: Each vacant cell is re-derived from entity positions. Supported subcases: `EMPTY IS ROCK/TEXT`, `ROCK IS EMPTY`, `EMPTY IS STOP`, `EMPTY IS PUSH` into a non-blocking occupied square, `EMPTY MAKE ROCK`, `EMPTY IS YOU`, `EMPTY IS WIN`, and `NEAR EMPTY`; EMPTY members may inherit group properties. An EMPTY tile is never persisted as a normal object. Higher-order movement/interaction and original randomness are still **partial**.
- **Movement/phase ordering**: retaining the staged YOU → MOVE → SHIFT → noun transformation → TELE → MAKE → collision/overlap interactions → WIN pipeline, with reparse points and event traces. Stacked SHIFT conveys 2+ movements. TELE separates transporter networks by noun type, acts once per passenger per turn, and uses deterministic destination selection to support replay; this selection is **not** the original game's randomized behavior. This is **not** complete original priority ordering (FOLLOW/BACK/FALL, mixed-direction movement, concurrent update-order edge cases, etc. remain missing).
- **No regressions**: all 18 earlier replay fixtures still pass without replacement. No new simple levels were added as a substitute for underlying mechanics.

## Run tests

Requires Node.js and a local `tsc` executable:

```sh
npm run build
npm test
node scripts/compare-original.cjs
```

`npm test` checks our engine and stored local replay trajectories (**123 passed at delivery**: 108 existing + 15 new behavior tests). The 15 new tests are **reference-derived**, informed by the mechanics references listed in `benchmarks/source-derived-specs.md`, not recorded from the original game. They exercise precise board states, expected properties, occupancy, movement and events.

`node scripts/compare-original.cjs` is a separate comparison harness. Without input it correctly reports **0 original-game observations**. Populate fixtures based on *direct observations of an original game copy* using `benchmarks/original-trace-template.json`; the harness rejects fixtures without observation metadata. Entity output tuples are `[kind, word|null, x, y, direction]` and must be captured after each control input. A recreated board alone is not evidence of observed original behavior.

```sh
node scripts/compare-original.cjs benchmarks/original-observations/*.json
```

No original game executable/save data or directly observed turn-by-turn recordings were supplied, and we did not operate an original copy in this environment: **empirical original-game comparisons = 0**. Wiki-derived behavioral assertions do not substitute for those comparisons.

## Files

- `src/core.ts` — pure TypeScript engine; no Canvas dependencies
- `src/levels.ts` — 18 original project puzzles
- `src/ui.ts` — Canvas rendering, controls and victory navigation
- `tests/conformance-v15.test.cjs` — 15 new reference-derived checks
- `tests/*.test.cjs`, `replays/*.json` — older local-engine tests/fixtures
- `scripts/compare-original.cjs`, `benchmarks/` — independent original-game observation adapter
- `scripts/browser-v15.py` — Chromium desktop/mobile smoke test
- `play.html`/`index.html` — identical self-contained offline HTML

## Known nonconformance

The engine still does **not** replicate the original's complete GROUP oscillation/infinite-loop handling, full EMPTY movement/interaction semantics, original random TELE routing, exact inter-stage priorities, complete syntax/verbs, or all simultaneous push/pull/swap cases. The original implementation contains many more stages and rules. This version is a tested **partial** rules expansion, not 1:1 certification.

Source: *Baba Is You* Wiki entries for [GROUP](https://babaiswiki.fandom.com/wiki/GROUP), [EMPTY](https://babaiswiki.fandom.com/wiki/EMPTY), [TELE](https://babaiswiki.fandom.com/wiki/TELE), [Order of Operations](https://babaiswiki.fandom.com/wiki/Order_of_Operations), and a [Steam discussion involving the original developer](https://steamcommunity.com/app/736260/discussions/0/1768133742959216941/).

## GitHub

Update the existing `typescript-engine` branch, overwriting files that match the names from this package. Keep the separate **Rule Is World** repository intact.

Suggested commit: `feat: extend GROUP recursion and EMPTY mechanics with staged regression checks`
