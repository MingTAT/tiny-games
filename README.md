# tiny-games

Small games, visual experiments, and interactive ideas.

This repository is a collection of compact projects that are small enough to finish, understand, and change, but still have enough character to be worth keeping.

The projects do not need to share the same language, framework, genre, or visual style.

Some are games.  
Some are simulations.  
Some are visual experiments.  
Some are closer to small interactive works.

**Small enough to make, interesting enough to keep.**

## Projects

### 01. Ghost in the Machine

A terminal game about tracking a moving target through noisy information.

You scan rooms, receive imperfect signals, and decide when the probability is high enough to act.

Behind the game is a Bayesian belief system that continuously updates where the ghost is most likely to be.

**Entry:** `ghost-in-the-machine/game.py`

```bash
cd ghost-in-the-machine
python game.py
```

### 02. Number Atlas

A desktop visualization experiment for integers.

Enter a number and see several different structures hidden inside it:

- Prime factor constellation
- Binary representation
- Digital root
- Collatz trajectory

The goal is not only to calculate a number, but to give it a visual form.

**Entry:** `number-atlas/number_atlas.py`

Requires Python with Tkinter support.

```bash
cd number-atlas
python number_atlas.py
```

### 03. The Last Check-In

An atmospheric investigation game set at the night desk of an old hotel.

Four guests appear in the register. One of them never arrived.

The player inspects objects on the desk, collects physical evidence, and decides which name does not belong.

The project emphasizes atmosphere, typography, spatial composition, narrative pacing, evidence presentation, and interaction design.

The game supports three languages:

- English
- 中文
- 日本語

Language can be switched during the game without resetting progress.

These versions are not intended to be mechanically identical translations. Each language has its own tone and narrative texture.

**Entry:** `the-last-check-in/index.html`

Open the HTML file in a browser. No installation or server is required according to the existing project documentation.

### 04. Rule Is World

An original rule-rewriting puzzle game in which **rules are physical objects inside the room**.

For example:

```text
WALL IS STOP
```

When the sentence exists, walls block movement. Move `STOP` away, and the rule no longer applies.

The central design principle is that each room should require changing the grammar rather than merely moving objects around it.

The project README documents:

- 30 rooms across five worlds
- Movable rules and changing object properties
- Rule composition and object transformation
- Conditional rules involving `ON`, `NEAR`, and `FACING`
- Meta-rule subjects including `TEXT`, `EMPTY`, and `LEVEL`
- Undo, reset, hints, and locally saved progress

**Entry:** `rule-is-world/index.html`

Open the HTML file directly in a modern browser. The project README states that no dependency installation or server is required.

**Controls:**

```text
Arrow keys / WASD    Move
Z                    Undo
R                    Reset
Esc                  Level select
```

**Validation commands:**

Run from the `rule-is-world` directory with Node.js installed:

```bash
cd rule-is-world
node tests/validate.js
node tests/engine.spec.js
```

These commands are documented by the project. Their results have not been independently verified as part of this root README update.

For campaign design, engine documentation, and outstanding design questions, see [rule-is-world/README.md](rule-is-world/README.md).

### 05. Word Prison / 字狱

A multilingual word-puzzle escape game.

Its central idea:

> Language is not the clue — language is the room.

Rather than simply translating identical puzzles, each language route uses mechanisms belonging to that language.

The project README documents six language routes:

- 中文
- 日本語
- English
- Deutsch
- Français
- Español

Each route is documented as containing three short rooms.

The puzzles use language-specific operations such as character composition, word formation, spacing, negation, compounds, and rearrangement.

**Entry:** `word-prison/index.html`

Open the HTML file directly in a modern browser. The project README states that no build system, dependency installation, or server is required.

For route descriptions and examples, see [word-prison/README.md](word-prison/README.md).

### 06. Words Change Worlds

An independent movable-rule puzzle project, with multiple development versions under `Word-Change-Worlds/`.

**This project is separate from `rule-is-world`.** The directories should not be treated as interchangeable builds.

Two version directories and their entry files have been verified.

#### A. baba_rule_lab

Directory:

```text
Word-Change-Worlds/baba_rule_lab/
```

Confirmed entry files:

- `index.html` — web entry
- `play.html` — offline single-file entry

**To play locally:** Open `play.html` directly in a browser.

For the web version, serve the directory and open its `index.html`. The project documentation also describes deploying this web entry through GitHub Pages.

The project README describes its rule-engine scope and known limitations.

See [baba_rule_lab/README.md](Word-Change-Worlds/baba_rule_lab/README.md).

#### B. baba_rule_labV2

Directory:

```text
Word-Change-Worlds/baba_rule_labV2/
```

Confirmed entry files:

- `play.html` — offline single-file entry
- `index.html` — additional HTML entry

**To play locally:** Open `play.html` directly in a browser.

This version's README documents a TypeScript-and-Canvas implementation, including a redesign of level 19. It explicitly distinguishes automated checks from human difficulty testing.

The project also contains a `package.json` with build and test scripts.

For development, run from the version directory:

```bash
cd Word-Change-Worlds/baba_rule_labV2
npm run build
npm test
```

These are defined project commands. This root README does not claim they have been executed successfully in the current environment.

For implementation details, known limitations, and development notes, see [baba_rule_labV2/README.md](Word-Change-Worlds/baba_rule_labV2/README.md).

---

## Quick start

Clone the repository:

```bash
git clone https://github.com/MingTAT/tiny-games.git
cd tiny-games
```

### Python games

| Project | Command |
|---|---|
| Ghost in the Machine | `cd ghost-in-the-machine && python game.py` |
| Number Atlas | `cd number-atlas && python number_atlas.py` |

### Browser games

After cloning or downloading the repository, open the following files locally:

| Project | Local entry |
|---|---|
| The Last Check-In | `the-last-check-in/index.html` |
| Rule Is World | `rule-is-world/index.html` |
| Word Prison | `word-prison/index.html` |
| Words Change Worlds — Lab | `Word-Change-Worlds/baba_rule_lab/play.html` |
| Words Change Worlds — Lab V2 | `Word-Change-Worlds/baba_rule_labV2/play.html` |

The two Words Change Worlds versions also contain confirmed `index.html` entry files.

For the original lab's web entry, a local HTTP server can be started from the repository root:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/Word-Change-Worlds/baba_rule_lab/index.html
```

This is an optional local-serving method, not a claim of an existing public deployment.

### Validation

Rule Is World provides two documented Node.js validation commands:

```bash
cd rule-is-world
node tests/validate.js
node tests/engine.spec.js
```

Words Change Worlds Lab V2 defines build and test commands in its own `package.json`:

```bash
cd Word-Change-Worlds/baba_rule_labV2
npm run build
npm test
```

**Note:** Documented commands and reported test coverage should not be confused with independently executed verification. Current execution results remain to be confirmed.

---

## Repository structure

The following tree lists verified project paths and selected files. It is not intended to be an exhaustive inventory of every file or subdirectory.

```text
tiny-games/
├── README.md
│
├── ghost-in-the-machine/
│   ├── game.py
│   └── README.md
│
├── number-atlas/
│   ├── number_atlas.py
│   └── README.md
│
├── the-last-check-in/
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   └── README.md
│
├── rule-is-world/
│   ├── index.html
│   ├── style.css
│   ├── engine.js
│   ├── levels.js
│   ├── game.js
│   ├── README.md
│   ├── LEVEL_DESIGN.md
│   ├── PUZZLE_AUDIT.md
│   ├── DEVLOG.md
│   └── tests/
│       ├── validate.js
│       └── engine.spec.js
│
├── word-prison/
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   └── README.md
│
└── Word-Change-Worlds/
    ├── baba_rule_lab/
    │   ├── index.html
    │   ├── play.html
    │   ├── engine.js
    │   ├── levels.js
    │   ├── app.js
    │   ├── tests.js
    │   └── README.md
    │
    └── baba_rule_labV2/
        ├── index.html
        ├── play.html
        ├── package.json
        └── README.md
```

For complete implementation details, consult each project's own README and source files.

---

## Development and verification notes

This repository contains projects at different stages of development.

A documented feature, an existing source file, an automated regression check, and a successful human playtest are different kinds of evidence.

The following distinctions are important:

- **Confirmed:** The listed project directories and entry files exist.
- **Documented:** Rule Is World's README describes 30 rooms across five worlds, browser-based launching, and two Node.js validation commands.
- **Documented:** Word Prison's README describes six language routes and three short rooms per route.
- **Documented:** Words Change Worlds contains independently documented lab versions with browser and offline entry files.
- **To confirm:** Current execution results of the documented automated tests.
- **To confirm:** Browser compatibility and manual playtesting outcomes beyond those explicitly covered in project documentation.
- **To confirm:** Any additional files, project variants, public deployments, or directories not included in the verified structure above.

The absence of further documentation in this README should not be interpreted as proof that other files or features do not exist.

---

## A note on language

Multilingual support in this repository does not have to mean simple translation.

Different languages have different rhythms, levels of formality, cultural associations, visual textures, and ways of hiding or revealing information.

A project may use those differences deliberately.

The same scene may feel different in English, Chinese, and Japanese.

A clue may be phrased differently.

A joke may need to become a different joke.

A piece of dialogue may become more distant, more intimate, more ambiguous, or more formal depending on the language.

In some games, language itself becomes part of the mechanic.

The goal is not:

> Translate everything into as many languages as possible.

But rather:

> Let each language contribute something of its own.

---

## About this repository

I do not want `tiny-games` to become a collection of the same program rewritten with different names.

Each project should try something different.

A project may begin with probability, numbers, language, history, visual design, storytelling, simulation, or something harder to classify.

Different programming languages and tools are welcome when they make sense for the idea.

The only real rule is:

**Small enough to make, interesting enough to keep.**
