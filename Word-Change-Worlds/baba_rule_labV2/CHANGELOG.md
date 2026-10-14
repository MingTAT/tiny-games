# Changelog

## v1.3 — Collision and inheritance puzzles

- Added `EAT`, `SAFE`, and the base `STILL` property.
- Collision-before-overlap EAT and OPEN/SHUT resolution; correct HAS spawning location and SAFE protection for overlapping destruction.
- Transactional cancellation: a blocked PUSH/STOP chain cannot partially consume entities.
- New 14th and 15th puzzles with required multi-step rule changes (SAFE removal → EAT/HAS → OPEN/SHUT; and sentence construction → EAT/HAS TEXT → remote YOU).
- Preserved all 13 existing puzzles, replay fixtures, and level navigation.
- Improved small-screen victory modal clipping and migrated v1.2 completed-level progress.
- 92 Node tests passing; desktop/mobile browser smoke tests passing. Replays are from this engine, not the original game.

## v1.2

- Added six advanced puzzle levels (08–13), a success overlay, Next Level, Enter-to-advance, undo/redo synchronization, and per-level completion marks.

## v1.1

- Added object-as-word, TEXT transformations and negation/identity semantics.

## v1.0

- Isolated the TypeScript rule engine from Canvas rendering and added deterministic replay records.
