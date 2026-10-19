# Changelog

## v1.8 — Challenge 19 Rebuilt

- Replaced the old 19th puzzle from scratch. No change to the praised v1.7 pixel-art Canvas style.
- Introduced a double sealed-door corridor and destructible playable bodies, with two inheritance rules and one noun word that must change jobs at the right moment.
- The intended route requires four independent semantic transitions, not merely finishing a nearly complete sentence.
- Kept the hint deliberately vague and retained the victory overlay and Next Level navigation.
- Replaced the level-19 trace (40 moves), added counterfactual and geometry tests, and verified playthrough inside Chromium.
- 148/148 automated tests passed; desktop/mobile smoke tests passed.
- The route is not certified shortest and the puzzle has not been blind-playtested. Level 20 is unchanged from v1.7.
- Still 0 real-original-game empirical trace comparisons, so this is not a verified 1:1 Baba Is You re-creation.

---

# Changelog — v1.7 (Puzzle Edition)

- Redesigned the playable UI as a minimalist, board-centered Canvas game, instead of a dashboard with cards and a sidebar.
- New independent procedural tile artwork: connected stone environments, subtle animation, color-coded word tiles, new sprite shapes; no original commercial assets.
- New modal level map, compact heads-up display, phone arrows / swipe, and Next Level / Replay / Level Map victory actions.
- Added two original discovery puzzles that each require conceptual re-interpretation rather than a sequence of ordinary locks: permanent noun transformation with IS reuse (19), and replacing YOU with WIN after transferring control (20).
- Added complete 19/20 local replay fixtures and explicit counterfactual tests. Rechecked all 18 earlier puzzle fixtures unchanged.
- Verified 147/147 Node.js tests and completed both new levels in Chromium via real keyboard input. Mobile viewport controls checked.
- **Still unresolved:** no human playtesting of difficulty, incomplete shortcut proof, no actual Baba Is You empirical conformance fixtures, and remaining engine differences documented in `benchmarks/`.
