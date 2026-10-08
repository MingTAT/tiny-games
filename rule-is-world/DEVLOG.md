# Development Log

## Prototype

The first build proved movable word blocks and four properties:

```text
YOU / STOP / PUSH / WIN
```

The early level design was too close to ordinary box-pushing: the rules existed, but players often did not need to rewrite them.

## Redesign

The campaign was rebuilt around one test:

> freeze every word block; the room should become unsolvable.

This led to the first eight genuine rule-rewriting rooms.

## Campaign A–E

The engine was then rebuilt around entity-specific rule evaluation rather than global noun flags.

Added:

- subject and predicate `AND`
- noun transformations
- multiple `YOU` objects
- `OPEN / SHUT`
- `SINK / DEFEAT`
- `HOT / MELT`
- `WEAK`
- `HAS`
- `MAKE`
- autonomous `MOVE`
- conditional subjects using `ON`, `NEAR`, and `FACING`
- facing direction even on blocked movement
- undo snapshots
- persistent solved-room markers
- a 24-room campaign
- regression routes for every room

The next major engine milestone is meta-grammar: `TEXT`, `EMPTY`, and `LEVEL`.


## Campaign v2 — World 5

Added six meta rooms, bringing the campaign to 30 rooms.

Engine changes:

- `TEXT` can be targeted by rules and conditions.
- text blocks can receive `YOU`, `WIN`, `MOVE`, `STOP`, and other ordinary properties.
- `TEXT IS <noun>` can turn word blocks into ordinary objects.
- `EMPTY` is supported as a meta subject for tile-level properties such as `WIN` and `STOP`.
- `LEVEL IS WIN` is supported as a global room-level condition.
- conditional relations can target text (`NEAR TEXT`, `ON TEXT`, `FACING TEXT`).
- autonomous movement now works for word blocks as well as ordinary objects.

The final room combines `TEXT IS YOU` with `LEVEL IS WIN` so the player finishes the campaign by controlling the rulebook rather than the avatar.

## Polish pass — reading, feedback, and reliable movement

The campaign remains 30 rooms. Instead of creating more rooms, this pass focuses on the game already there.

- Word blocks belonging to an active sentence are visibly marked.
- Conditional rules show whether they currently apply to at least one object.
- Newly filed or revoked sentences get an in-room notice.
- Hints are revealed in two optional stages rather than printed in the header.
- Personal best steps are recorded in browser storage.
- Undo from a completed room correctly closes the victory overlay.
- A failed push chain now rolls back every object's position; no partially moved chain.
- Multiple `YOU` entities are processed front-to-back to avoid a pushable `YOU` moving twice.
- Undo restores the exact snapshot rather than replaying destructive world effects.
- Cyclic noun changes stop at a repeated world identity rather than an arbitrary extra transformation.
- Narrow screens can scroll across oversized rooms.
- Engine edge-case tests have been added alongside the 30-room campaign regression suite.
