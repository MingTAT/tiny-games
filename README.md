# tiny-games

Small games, visual experiments, and interactive ideas.

This repository is where I keep compact projects that are small enough to finish, understand, and change without turning into large software products.

The projects do not have to follow the same language, framework, or format. Some are terminal games, some are visual experiments, and some are closer to small interactive works.

## Projects

### 01. Ghost in the Machine

A terminal game about tracking a moving target through noisy information.

You scan rooms, receive imperfect signals, and decide when the probability is high enough to make a move.

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

The idea is not just to calculate a number, but to give it a visual form.

```bash
cd number-atlas
python number_atlas.py
```

---

### 03. The Last Check-In

An atmospheric investigation game set at the night desk of an old hotel.

Four guests appear in the register. One of them never arrived.

Instead of relying on complicated game logic, this project focuses more on:

- visual composition
- object placement
- atmosphere
- evidence presentation
- narrative pacing
- interaction design

The player investigates objects on the desk, collects evidence, and makes a final conclusion.

The game supports both English and Chinese, with language switching directly inside the interface.

Open:

```text
the-last-check-in/index.html
```

No server or installation is required.

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

## About this repository

The projects here are intentionally different from one another.

I do not want this repository to become a collection of the same idea rewritten with different names.

A project may begin with probability, numbers, language, history, visual design, storytelling, simulation, or something harder to classify.

The common requirement is simple:

**it should be small enough to make, but interesting enough to keep.**