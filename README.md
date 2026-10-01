# tiny-games

A small collection of games, visual experiments, and strange little programs.

Each project lives in its own folder and is meant to stay small enough to understand, run, modify, and slowly grow over time.

## Projects

### 01. Ghost in the Machine

A terminal game about tracking a moving target with noisy information.

You scan rooms, receive imperfect signals, and decide when the probability is high enough to make a move.

Under the hood, the game maintains a Bayesian belief state and updates the probability of the ghost being in each room after every new piece of evidence.

```bash
cd ghost-in-the-machine
python game.py
```

---

### 02. Number Atlas

A desktop visualization experiment for integers.

Enter a number and the program turns it into four different visual structures:

- prime factor constellation
- binary strip
- digital root orbit
- Collatz trajectory

It is less about calculating a number than seeing the hidden structures inside it.

```bash
cd number-atlas
python number_atlas.py
```

## Structure

```text
tiny-games/
├── README.md
├── ghost-in-the-machine/
│   ├── game.py
│   └── README.md
└── number-atlas/
    ├── number_atlas.py
    └── README.md
```

## Idea

This repository is not limited to traditional games.

Some projects may be games.  
Some may be simulations.  
Some may visualize mathematics, probability, language, history, or other systems.

The only rule is that each project should begin as something small enough to build and understand in a short amount of time.

Then the collection can slowly become something larger.