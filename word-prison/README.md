# Word Prison / 字狱

A multilingual word-puzzle escape game.

The central idea is simple:

> language is not the clue — language is the room.

Each language route uses mechanisms that belong to that language rather than translating the same puzzles word-for-word.

## Languages

- 中文
- 日本語
- English
- Deutsch
- Français
- Español

Each route currently contains three short rooms.

## How the routes differ

### 中文
Uses character structure and semantic composition.

- taking `木` out of `困`
- combining `日 + 月 → 明`
- building `出口`

### 日本語
Uses kanji composition and Japanese compound vocabulary.

- `人 + 木 → 休`
- `日 + 月 → 明`
- changing `入口` into `出口`

### English
Uses spacing and anagrams.

- `NOWHERE → NOW HERE`
- `SILENT → LISTEN`

### Deutsch
Uses compounds, separable verbs, and suffixes.

- `NOT + AUSGANG → NOTAUSGANG`
- `AUF + MACHEN → AUFMACHEN`
- `FREI + HEIT → FREIHEIT`

### Français
Uses negation, accents, and elision.

- `TU NE SORS PAS → TU SORS`
- `OU → OÙ`
- `L’ + ISSUE → L’ISSUE`

### Español
Uses negation, anagrams, and verb formation.

- `SIN SALIDA → SALIDA`
- `NADA → ANDA`
- `SAL + IR → SALIR`

## Run

No server, build system, or dependency is required.

Open:

```text
index.html
```

in a modern browser.

## Files

```text
word-prison/
├── index.html
├── style.css
├── game.js
└── README.md
```

## Design direction

Future language routes should not be added just to increase the language count.

A route is worth adding only when the language itself offers a mechanic: writing system, morphology, word order, homophones, compounds, punctuation, inflection, spacing, script direction, or ambiguity.

The long-term goal is not one game translated many times.

It is one world with several different linguistic physics.
