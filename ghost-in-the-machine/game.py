#!/usr/bin/env python3
"""
Ghost in the Machine
A tiny terminal game about tracking a moving target with noisy evidence.
Standard library only.
"""

from __future__ import annotations

import argparse
import random
from collections import deque

ROOMS = {
    "A": "Atrium",
    "B": "Archive",
    "C": "Server Room",
    "D": "Gallery",
    "E": "Laboratory",
    "F": "Roof",
    "G": "Tunnel",
}

GRAPH = {
    "A": ["B", "D"],
    "B": ["A", "C", "E"],
    "C": ["B", "F"],
    "D": ["A", "E", "G"],
    "E": ["B", "D", "F"],
    "F": ["C", "E", "G"],
    "G": ["D", "F"],
}

SENSOR = {
    0: {"HOT": 0.76, "WARM": 0.19, "COLD": 0.05},
    1: {"HOT": 0.18, "WARM": 0.64, "COLD": 0.18},
    2: {"HOT": 0.05, "WARM": 0.24, "COLD": 0.71},  # distance >= 2
}

MAX_ENERGY = 10


def shortest_distance(start: str, goal: str) -> int:
    if start == goal:
        return 0
    queue = deque([(start, 0)])
    seen = {start}
    while queue:
        room, dist = queue.popleft()
        for nxt in GRAPH[room]:
            if nxt == goal:
                return dist + 1
            if nxt not in seen:
                seen.add(nxt)
                queue.append((nxt, dist + 1))
    raise RuntimeError("Disconnected map")


def distance_bucket(distance: int) -> int:
    return 2 if distance >= 2 else distance


def weighted_choice(rng: random.Random, weights: dict[str, float]) -> str:
    x = rng.random()
    total = 0.0
    for key, weight in weights.items():
        total += weight
        if x <= total:
            return key
    return next(reversed(weights))


def sensor_reading(rng: random.Random, scan_room: str, ghost_room: str) -> str:
    d = distance_bucket(shortest_distance(scan_room, ghost_room))
    return weighted_choice(rng, SENSOR[d])


def bayes_update(belief: dict[str, float], scan_room: str, reading: str) -> dict[str, float]:
    posterior = {}
    for room, prior in belief.items():
        d = distance_bucket(shortest_distance(scan_room, room))
        posterior[room] = prior * SENSOR[d][reading]

    z = sum(posterior.values())
    if z == 0:
        return belief.copy()
    return {room: p / z for room, p in posterior.items()}


def predict_after_move(belief: dict[str, float]) -> dict[str, float]:
    predicted = {room: 0.0 for room in ROOMS}
    for room, p in belief.items():
        options = [room] + GRAPH[room]  # the ghost may also stay put
        share = p / len(options)
        for nxt in options:
            predicted[nxt] += share
    return predicted


def move_ghost(rng: random.Random, room: str) -> str:
    return rng.choice([room] + GRAPH[room])


def print_map() -> None:
    print(
        r"""
                 [F] Roof
                /   |   \
     [C] Server     |    [G] Tunnel
        |           |      |
     [B] Archive--[E] Lab--[D] Gallery
        \                    /
                 [A] Atrium
"""
    )
    print("Connections:")
    for key, name in ROOMS.items():
        exits = ", ".join(GRAPH[key])
        print(f"  {key}  {name:<12} -> {exits}")


def bar(p: float, width: int = 18) -> str:
    filled = round(p * width)
    return "█" * filled + "·" * (width - filled)


def print_belief(belief: dict[str, float]) -> None:
    print("\nAI belief:")
    ranked = sorted(belief.items(), key=lambda kv: kv[1], reverse=True)
    for room, p in ranked:
        print(f"  {room} {ROOMS[room]:<12} {bar(p)} {p:5.1%}")


def normalize_room(token: str) -> str | None:
    t = token.strip().upper()
    if t in ROOMS:
        return t

    lowered = token.strip().lower()
    matches = [
        key for key, name in ROOMS.items()
        if name.lower().startswith(lowered) and lowered
    ]
    return matches[0] if len(matches) == 1 else None


def intro(seed: int | None) -> None:
    print("=" * 62)
    print(" GHOST IN THE MACHINE")
    print("=" * 62)
    print(
        "02:13. A dead server wakes up by itself.\n"
        "Something is moving through the building network.\n"
        "Your scanner is noisy. Your energy is not.\n"
    )
    print("Find it before the battery reaches zero.")
    if seed is not None:
        print(f"Seed: {seed}")
    print("\nCommands: scan <room>, trap <room>, map, belief, help, quit")


def help_text() -> None:
    print(
        """
scan <room>   Spend 1 energy. The sensor returns HOT / WARM / COLD.
              HOT usually means close, but the scanner can lie.

trap <room>   Spend 2 energy. If the ghost is there, you win.
              If not, it moves again.

belief        Show the current Bayesian probability estimate.
map           Show the room graph.
help          Show this text.
quit          Leave the building.

Important: after every scan or failed trap, the ghost may stay put
or move to one connected room.
"""
    )


def play(seed: int | None = None) -> int:
    rng = random.Random(seed)
    ghost = rng.choice(list(ROOMS))
    belief = {room: 1 / len(ROOMS) for room in ROOMS}
    energy = MAX_ENERGY
    turns = 0

    intro(seed)
    print_map()
    print_belief(belief)

    while energy > 0:
        print(f"\nEnergy: {'●' * energy}{'○' * (MAX_ENERGY - energy)}  ({energy}/{MAX_ENERGY})")
        try:
            raw = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nSignal lost.")
            return 0

        if not raw:
            continue

        parts = raw.split(maxsplit=1)
        command = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""

        if command in {"q", "quit", "exit"}:
            print("You leave the building. The server keeps humming.")
            return 0

        if command in {"h", "help", "?"}:
            help_text()
            continue

        if command == "map":
            print_map()
            continue

        if command in {"belief", "b"}:
            print_belief(belief)
            continue

        if command in {"scan", "s"}:
            room = normalize_room(arg)
            if room is None:
                print("Unknown room. Try: scan A")
                continue

            energy -= 1
            turns += 1
            reading = sensor_reading(rng, room, ghost)
            belief = bayes_update(belief, room, reading)

            print(f"\nScanner aimed at [{room}] {ROOMS[room]}...")
            print(f"RESULT: {reading}")
            print_belief(belief)

            if energy <= 0:
                break

            ghost = move_ghost(rng, ghost)
            belief = predict_after_move(belief)
            continue

        if command in {"trap", "t"}:
            room = normalize_room(arg)
            if room is None:
                print("Unknown room. Try: trap E")
                continue
            if energy < 2:
                print("Not enough energy for a trap.")
                continue

            energy -= 2
            turns += 1

            if room == ghost:
                print(
                    f"\nTRAP CLOSED in [{room}] {ROOMS[room]}.\n"
                    f"The signal flatlines.\n\n"
                    f"You caught it in {turns} actions with {energy} energy left."
                )
                return 0

            print(f"\nNothing in [{room}] {ROOMS[room]}.")

            # A failed trap is exact evidence: the ghost was not in that room.
            belief[room] = 0.0
            z = sum(belief.values())
            belief = {r: p / z for r, p in belief.items()}

            # Now both the real ghost and our belief state advance one move.
            ghost = move_ghost(rng, ghost)
            belief = predict_after_move(belief)
            print("Something moves behind the walls.")
            print_belief(belief)
            continue

        print("Unknown command. Type 'help'.")

    print(
        f"\nBattery dead.\n"
        f"The last reliable trace points nowhere.\n"
        f"(For this run, the ghost ended in [{ghost}] {ROOMS[ghost]}.)"
    )
    return 1


def main() -> int:
    parser = argparse.ArgumentParser(description="A tiny Bayesian tracking game.")
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Replay a deterministic run, e.g. --seed 42",
    )
    args = parser.parse_args()
    return play(args.seed)


if __name__ == "__main__":
    raise SystemExit(main())
