# Rule Is World

A complete small rule-rewriting puzzle game.

The central idea:

> the rules of the world exist as movable objects inside the world.

If the board says:

```text
WALL IS STOP
```

walls block movement.

Push `STOP` away and the sentence breaks. The wall immediately loses that property.

This project is inspired by the general rule-rewriting puzzle-game idea, but uses its own title, visual design, code, level layouts, progression, and presentation.

## Complete Edition

This version contains:

- 12 playable rooms
- level-select screen
- active-rule display
- keyboard and touch controls
- undo
- reset
- multiple simultaneous `YOU` objects
- noun transformations
- chained rule evaluation
- horizontal and vertical rule parsing
- `AND`
- `HAS`
- autonomous `MOVE`
- interaction resolution
- win screen and final ending
- responsive layout
- optional minimal sound

## Rules implemented

### Core

```text
X IS YOU
X IS STOP
X IS PUSH
X IS WIN
```

### Rule composition

```text
X AND Y IS YOU
X IS PUSH AND WEAK
```

### Identity

```text
ROCK IS PLAYER
```

Objects can change noun identity, which means other rules may immediately begin applying to them.

### Destruction and hazards

```text
X IS SINK
X IS DEFEAT
X IS WEAK
X IS HOT
X IS MELT
```

### Pairs

```text
KEY IS OPEN
DOOR IS SHUT
```

`OPEN` and `SHUT` destroy each other on contact.

### Motion

```text
GHOST IS MOVE
```

`MOVE` objects move after the player's turn and reverse direction when blocked.

### Consequence

```text
CRATE HAS KEY
```

When the crate is destroyed, it leaves a key behind.

## Controls

```text
Arrow keys / WASD   Move
Z                   Undo
R                   Reset room
Esc                 Level select
```

Touch controls appear on smaller screens.

## Run

Open:

```text
index.html
```

No install, server, build step, or package manager is required.

## Files

```text
rule-is-world/
├── index.html
├── style.css
├── levels.js
├── engine.js
├── game.js
├── README.md
└── DEVLOG.md
```

## Architecture

`engine.js`
: world state, movement, rule parsing, transformations, interactions, undo state.

`levels.js`
: all room definitions. Level design is data rather than engine code.

`game.js`
: rendering, menus, input, level progression, sound.

`style.css`
: presentation and responsive layout.

This separation is intentional: new rooms should usually require editing `levels.js`, not the engine.

## Scope

This is a complete small game, not a feature-for-feature clone of any commercial title.

The engine is designed so that more advanced grammar can be added later without rewriting the project from scratch.
