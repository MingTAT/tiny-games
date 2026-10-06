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
