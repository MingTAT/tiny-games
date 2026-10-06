# Rule Is World

An original rule-rewriting puzzle game for the `tiny-games` collection.

The premise is simple:

> **The rules are physical objects inside the room.**

If the board says:

```text
WALL IS STOP
```

then walls block movement. Move `STOP` away and the sentence stops being true. The wall immediately stops behaving like a wall.

The campaign is designed around a strict level-design rule:

> **Every room must require changing the text.**

This is not meant to be Sokoban with sentences drawn on top of it.

## Campaign

The current build contains **24 rooms across four worlds**.

### World 1 — PLEASE DO NOT TOUCH THE GRAMMAR

Learn that rules can be broken, created, extended with `AND`, and reassigned.

### World 2 — YOU ARE NOT WHO HR SAID YOU ARE

Control is no longer tied to one avatar. Create new `YOU` rules and transform one noun into another.

### World 3 — WINNING IS A TEMPORARY CONDITION

The goal itself becomes editable. Transfer `WIN`, make obstacles into goals, and create `OPEN / SHUT` interactions.

### World 4 — OBJECTS HAVE FILED A COMPLAINT

Rules become conditional and active:

```text
PLAYER ON WATER IS WIN
PLAYER NEAR FLAG IS WIN
PLAYER FACING WALL IS WIN
```

This world also introduces `HAS`, `MAKE`, and `MOVE`.

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
```

### Conditional subjects

```text
ROCK ON WATER IS WIN
PLAYER NEAR FLAG IS WIN
PLAYER FACING WALL IS WIN
```

### Consequences

```text
CRATE HAS KEY
PLAYER MAKE ROCK
```

## Controls

```text
Arrow keys / WASD  move
Z                  undo
R                  reset
Esc                level select
```

Touch arrows are shown on narrow screens.

## Run

No dependencies, package manager, or server are required.

Open:

```text
index.html
```

in a modern browser.

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

`engine.js` contains the rule system.

`levels.js` contains the campaign as data.

`game.js` contains rendering, menus, progress, controls, and the deliberately unhelpful bureaucracy.

## Validation

With Node installed:

```bash
node tests/validate.js
```

runs a known-good route through all 24 rooms. These routes are for regression testing only and are not surfaced in the game.

## What comes next

The fifth world is intentionally not implemented yet. Its planned theme is:

> **THE RULEBOOK HAS ESCAPED**

That is where `TEXT`, `EMPTY`, and eventually the level itself can become subjects of rules.
