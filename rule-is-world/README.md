# Rule Is World

A rule-rewriting puzzle game where words on the board define the physics of the board.

This project grows one day at a time.

## Day 01

- grid movement
- pushable word blocks
- horizontal and vertical rule parsing
- `YOU`
- `STOP`
- `PUSH`
- `WIN`
- one playable level
- live active-rule display

## Day 02

New today:

- noun-to-noun transformation rules
- simple chained transformations
- undo history
- `Z` to undo
- `R` to reset
- second playable level
- active rules distinguish properties from transformations

A rule like:

```text
ROCK IS PLAYER
```

now changes every `ROCK` object into a `PLAYER`.

If:

```text
PLAYER IS YOU
```

is also active, the transformed objects become controllable immediately.

## Run

Open `index.html` in a modern browser.

No install or server required.

## Direction

Later systems can include `AND`, multi-target transformation, `MOVE`, `SINK`,
`DEFEAT`, `OPEN / SHUT`, `HAS`, `MAKE`, richer level packs, and an editor.

Small changes, deep combinations.
