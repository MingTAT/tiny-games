# Changelog — v1.7 (Puzzle Edition)

- Redesigned the playable UI as a minimalist, board-centered Canvas game, instead of a dashboard with cards and a sidebar.
- New independent procedural tile artwork: connected stone environments, subtle animation, color-coded word tiles, new sprite shapes; no original commercial assets.
- New modal level map, compact heads-up display, phone arrows / swipe, and Next Level / Replay / Level Map victory actions.
- Added two original discovery puzzles that each require conceptual re-interpretation rather than a sequence of ordinary locks: permanent noun transformation with IS reuse (19), and replacing YOU with WIN after transferring control (20).
- Added complete 19/20 local replay fixtures and explicit counterfactual tests. Rechecked all 18 earlier puzzle fixtures unchanged.
- Verified 147/147 Node.js tests and completed both new levels in Chromium via real keyboard input. Mobile viewport controls checked.
- **Still unresolved:** no human playtesting of difficulty, incomplete shortcut proof, no actual Baba Is You empirical conformance fixtures, and remaining engine differences documented in `benchmarks/`.
