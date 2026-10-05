# Development Log

## Prototype stage

The first prototypes proved three things:

1. text blocks can be pushed as physical objects;
2. rules can be parsed from their current positions;
3. moving text can immediately change object behavior.

The early prototype supported only:

```text
YOU
STOP
PUSH
WIN
```

A second prototype added noun transformation and undo.

## Complete Edition

The project was then rebuilt as a complete small game rather than continuing one mechanic per day.

### Engine

Added:

- horizontal and vertical sentence parsing
- `AND` on both subject and predicate sides
- property rules
- noun transformation
- `HAS`
- multiple `YOU` objects
- stacked entities
- autonomous movement
- interaction resolution
- destruction/spawning pipeline
- undo snapshots

### Interactions

Added:

- `SINK`
- `DEFEAT`
- `OPEN / SHUT`
- `HOT / MELT`
- `WEAK`
- `MOVE`

### Game layer

Added:

- 12-room progression
- level selection
- rule inspector
- step counter
- touch controls
- reset / undo
- ending screen
- responsive UI
- minimal optional sound

### Code organization

The project is now split into:

```text
levels.js
engine.js
game.js
```

so engine complexity and level design can evolve separately.
