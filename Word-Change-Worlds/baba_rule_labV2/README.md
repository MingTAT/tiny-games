# Words Change Worlds — TypeScript Engine v1.4

A browser-playable, original puzzle-engine experiment inspired by the *mechanics* of Baba Is You. It is **not** the original game, does not use the original game's audiovisual assets or levels, and is **not** a complete original-behavior implementation.

## Play

- Open `play.html` in a browser. It is a single self-contained offline HTML file.
- Arrow keys or WASD to move, Z to undo, Y to redo, R to restart, Space to wait, Enter on the victory panel to proceed.
- The first seven levels are legacy short lessons; levels 8–15 are old experimental puzzles. **16–18 are the new mechanics-focused challenge series**, selected by default.
- For a harder experience, leave the rules and event traces collapsed. You can open them to inspect rules without restarting.
- Victory opens a next-level button and other navigation options. Completed levels are saved when browser storage is available.

## Develop

Requires Node.js with TypeScript installed (`tsc`). In this runtime, no third-party runtime dependencies are needed.

```
npm run build
npm test
npm run record:local
node scripts/shortcut-audit.cjs
```

- `src/core.ts` — pure game state, horizontal/vertical rule parsing, GROUP membership, staged movement, transformations, interactions, MAKE, and win checks.
- `src/levels.ts` — board layout and puzzle definitions.
- `src/ui.ts` — Canvas and controls; no game logic belongs here.
- `tests/*` — local deterministic engine tests and replay assertions.
- `replays/*` — per-turn full-state fixtures produced from our implementation, **not original-game observations**.
- `scripts/shortcut-audit.cjs` — a *bounded* breadth-first search for very short bypass routes. It does not certify a globally shortest route.
- `scripts/browser-v14.py` — visual smoke test for desktop/mobile and end-of-level navigation using installed Playwright + Chromium; uses inline page content to remain offline.
- `web/` — compiled browser assets. `scripts/build.cjs` bundles them into `play.html` and `index.html`.

## What is new

The new challenge pack explores group inheritance, conditional membership, negation priority, and making an object continually recreate the terrain needed to remain controlled. The goal is to create interactions requiring a change of interpretation, not simply longer sequences of steps.

Tests caught an initially unintended 9-step victory path on level 16: the wall barrier had a gap. We fixed the actual board and added a shortcut check.

## Boundaries

- `GROUP` supports direct positive/negative/conditional membership with rule inheritance; recursive self-referential group rules and all other special-group edge cases are not implemented.
- `EMPTY`, various high-order syntaxes and authentic original priority ordering remain incomplete.
- Original-game empirical conformance tests: **0**. Source references and this project's own tests must not be presented as original-game replay certification.
- Bounded route checks do not establish the puzzle's subjective difficulty. Human playtesting is still needed.

## Updating GitHub

If you already have the TypeScript `typescript-engine` branch from v1.3, replace matching source/project files with this ZIP and commit. Keep Rule Is World separate. Do not mix files from the old v0.x JavaScript prototypes.

Suggested commit message:

`feat: add GROUP mechanics and audited multi-rule challenge puzzles`
