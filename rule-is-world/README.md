# Rule Is World

An original rule-rewriting puzzle game for the `tiny-games` collection.

The premise is simple:

> **The rules are physical objects inside the room.**

If the board says:

```text
WALL IS STOP
```

walls block movement. Move `STOP` away and the sentence stops being true.

The campaign follows one strict design rule:

> **Every room must require interfering with the grammar.**

It is not meant to be Sokoban with sentences drawn on top of it.

## Campaign

The current build contains **30 rooms across five worlds**.

### World 1 — PLEASE DO NOT TOUCH THE GRAMMAR

Break rules, create rules, extend them with `AND`, and reassign properties.

### World 2 — YOU ARE NOT WHO HR SAID YOU ARE

Control is temporary. More than one object can be `YOU`, and nouns can become other nouns.

### World 3 — WINNING IS A TEMPORARY CONDITION

The goal itself becomes editable. `WIN` can move, disappear, or belong to something ridiculous.

### World 4 — OBJECTS HAVE FILED A COMPLAINT

Rules become conditional and active:

```text
PLAYER ON WATER IS WIN
PLAYER NEAR FLAG IS WIN
PLAYER FACING WALL IS WIN
```

This world also introduces `HAS`, `MAKE`, and `MOVE`.

### World 5 — THE RULEBOOK HAS ESCAPED

The grammar stops pretending to be outside the world.

```text
PLAYER NEAR TEXT IS WIN
TEXT IS YOU
TEXT IS MOVE
EMPTY IS WIN
LEVEL IS WIN
```

The final room requires giving control to the documentation itself so that the text can complete a rule about the level containing it.

## Implemented grammar

### Properties

```text
YOU
STOP
PUSH
WIN
SINK
DEFEAT
OPEN
SHUT
HOT
MELT
WEAK
MOVE
```

### Composition

```text
PLAYER IS YOU AND WIN
PLAYER AND ROCK IS YOU
```

### Identity

```text
ROCK IS PLAYER
TEXT IS ROCK
```

### Conditional subjects

```text
ROCK ON WATER IS WIN
PLAYER NEAR FLAG IS WIN
PLAYER FACING WALL IS WIN
PLAYER NEAR TEXT IS WIN
```

### Consequences

```text
CRATE HAS KEY
PLAYER MAKE ROCK
```

### Meta subjects

`TEXT` refers to every word block. Text is still physically pushable by default, but it can now also receive properties such as `YOU`, `WIN`, and `MOVE`.

`EMPTY` refers to an otherwise unoccupied tile. In the current campaign it is used as a meta victory condition.

`LEVEL` refers to the room as a whole. `LEVEL IS WIN` makes the existence of any surviving `YOU` sufficient to resolve the room.

## Controls

```text
Arrow keys / WASD  move
Z                  undo
R                  reset
Esc                level select
```

Touch arrows are shown on narrow screens.

## Run

No dependencies, package manager, or server are required. Open `index.html` in a modern browser.

## Project structure

```text
rule-is-world/
├── index.html
├── style.css
├── engine.js
├── levels.js
├── game.js
├── LEVEL_DESIGN.md
├── DEVLOG.md
├── README.md
└── tests/
    └── validate.js
```

## Validation

With Node installed:

```bash
node tests/validate.js
```

The regression suite runs a known-good solution through all 30 rooms and checks the meta-rule features introduced in World 5.
