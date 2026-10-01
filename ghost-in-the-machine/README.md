# Ghost in the Machine

A tiny terminal game about finding something that refuses to stay still.

You have seven rooms, ten units of battery, and a scanner that is **useful but not trustworthy**.  
Every scan gives `HOT`, `WARM`, or `COLD`. The ghost may then move to a connected room.

The game keeps a probability distribution over all rooms and updates it after every piece of evidence.

That is basically Bayesian filtering, disguised as a haunted-building game.

## Run

Python 3.10+ is enough. No packages.

```bash
python game.py
```

For a repeatable run:

```bash
python game.py --seed 42
```

## Commands

```text
scan A
scan lab
trap F
belief
map
help
quit
```

`scan` costs 1 energy.  
`trap` costs 2.

A failed trap is not useless: it is also evidence.

## Why I made this

I wanted a game where the “AI” is not a chatbot and not a decoration.

The interesting part is the belief state:

1. start with equal probability in every room;
2. update the probabilities from a noisy sensor reading;
3. predict where the target may move next;
4. decide when the uncertainty is low enough to act.

The target is real. The scanner can be wrong. The probability bars are only an estimate.

That tension is the whole game.

## Files

```text
game.py       the entire game
README.md     this file
.gitignore
```

Small on purpose.
