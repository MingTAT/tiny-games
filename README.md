# tiny-games

Small games, visual experiments, and interactive ideas.

This repository is a collection of compact projects that are small enough to finish, understand, and change, but still have enough character to be worth keeping.

The projects do not need to share the same language, framework, genre, or visual style.

Some are games.  
Some are simulations.  
Some are visual experiments.  
Some are closer to small interactive works.

## Projects

### 01. Ghost in the Machine

A terminal game about tracking a moving target through noisy information.

You scan rooms, receive imperfect signals, and decide when the probability is high enough to act.

Behind the game is a simple Bayesian belief system that continuously updates where the ghost is most likely to be.

```bash
cd ghost-in-the-machine
python game.py
```

---

### 02. Number Atlas

A desktop visualization experiment for integers.

Enter a number and see several different structures hidden inside it:

- prime factor constellation
- binary representation
- digital root
- Collatz trajectory

The goal is not only to calculate a number, but to give it a visual form.

```bash
cd number-atlas
python number_atlas.py
```

---

### 03. The Last Check-In

An atmospheric investigation game set at the night desk of an old hotel.

Four guests appear in the register.

One of them never arrived.

The player inspects objects on the desk, collects physical evidence, and decides which name does not belong.

This project focuses less on difficult algorithms and more on:

- spatial composition
- atmosphere
- typography
- object placement
- narrative pacing
- evidence presentation
- interaction design

The game currently supports:

```text
EN   中文   日本語
```

Language can be switched during the game without resetting progress.

The three versions are not intended to be mechanically identical translations.

English keeps a more direct detective tone.

Chinese is slightly more concise and reads more like a case file.

Japanese uses vocabulary and phrasing that better fit the atmosphere of an old hotel, including words such as `宿直`, `帳場`, `宿帳`, and `投宿`.

Open:

```text
the-last-check-in/index.html
```

No installation or server is required.

## Repository structure

```text
tiny-games/
├── README.md
├── ghost-in-the-machine/
│   ├── game.py
│   └── README.md
├── number-atlas/
│   ├── number_atlas.py
│   └── README.md
└── the-last-check-in/
    ├── index.html
    ├── style.css
    ├── game.js
    └── README.md
```

## A note on language

Multilingual support in this repository does not have to mean simple translation.

Different languages have different rhythms, levels of formality, cultural associations, visual textures, and ways of hiding or revealing information.

A future project may use those differences deliberately.

The same scene may feel different in English, Chinese, and Japanese.

A clue may be phrased differently.

A joke may need to become a different joke.

A piece of dialogue may become more distant, more intimate, more ambiguous, or more formal depending on the language.

In some games, language itself may even become part of the mechanic.

The goal is not:

> translate everything into as many languages as possible

but rather:

> let each language contribute something of its own.

## About this repository

I do not want `tiny-games` to become a collection of the same program rewritten with different names.

Each project should try something different.

A project may begin with probability, numbers, language, history, visual design, storytelling, simulation, or something harder to classify.

Different programming languages and tools are also welcome when they make sense for the idea.

The only real rule is:

**small enough to make, interesting enough to keep.**