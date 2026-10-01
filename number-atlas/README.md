# Number Atlas

A small desktop visualization experiment for integers.

Type in a number and the program turns it into four different visual forms:

- **Factor constellation** — prime factors arranged as a radial structure
- **Binary strip** — the number expressed as bits
- **Digital root orbit** — repeated digit-sum reduced to one digit
- **Collatz landscape** — the number's Collatz trajectory plotted on a log scale

No packages. No browser. Just Python + Tkinter.

## Run

```bash
python number_atlas.py
```

Python 3.10+ recommended.

## Why this exists

A number is usually shown as text:

```text
360
```

But the same number also has structure:

```text
360 = 2 × 2 × 2 × 3 × 3 × 5
binary = 101101000
digital root = 9
Collatz steps = ...
```

Number Atlas is a tiny attempt to make that structure visible.

## Project structure

```text
number-atlas/
├── number_atlas.py
├── README.md
└── .gitignore
```
