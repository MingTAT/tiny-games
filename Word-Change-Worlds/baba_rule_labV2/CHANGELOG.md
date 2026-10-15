# Changelog

## v1.4 — Mechanics and puzzle-design correction (2026-10-15)

- Implemented bounded `GROUP` behavior: conditional group membership, shared properties, inherited transformations, and explicit negative membership. `GROUP` is not a physical entity. Recursive/complex group semantics are not claimed.
- Added three independent challenge maps (16–18), retaining earlier levels for comparison:
  - 16: choose the GROUP member that should trigger an OPEN/SHUT collision without losing the only controllable character.
  - 17: move the target onto WATER before negating PUSH; the target remains winning through conditional GROUP membership.
  - 18: construct `ROCK MAKE WATER` and `GROUP IS YOU`, sustain remote control via a trail of water, then navigate an irregular corridor without disturbing the rule text.
- Added explicit counterfactual regression tests. They caught and led to fixes for two real bypasses in puzzle 16 (a door without STOP; an accidental top route around the door).
- Added a bounded exhaustive shortcut audit: no winning paths in <= 11 inputs for challenges 16 and 17; <= 8 inputs for challenge 18. This is NOT an exhaustive proof that no unintended route exists beyond these limits.
- 108 tests pass, including exact full-state replays for all 18 levels; 16–18 have 21/19/19-move authored solutions. These paths were recorded from *this implementation*, not original Baba Is You gameplay.
- Defaults to level 16, hides rules/events debugging behind disclosures to avoid spoiling puzzles, and retains next-level navigation, undo/redo, keyboard controls, and responsive layout.
- Screenshot-based desktop and mobile smoke checks exercised full solutions, victory overlays, undo/redo, and next-level buttons.

## Remaining gaps

- The full commercial game's rule grammar, object priorities, multiplayer/multi-directional movement conflicts, GROUP recursion, EMPTY, advanced properties, and other behaviors remain incomplete. This is an independent mechanics-based prototype, not an exact commercial reproduction.
- A bounded shortcut audit is not evidence of human-perceived difficulty or uniqueness of solution. Player testing is still needed.
