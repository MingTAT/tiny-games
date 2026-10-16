# Changelog

## v1.5 — GROUP / EMPTY / Stage-based reference tests

- Adds `GROUP2` / `GROUP3` as independent transitive group memberships, conditional propagation, NOT exclusion, and bounded fixed-point cycles.
- Introduces synthetic per-tile EMPTY coordinates, temporary properties/conditions, EMPTY transformations and MAKE, vacancy STOP/PUSH mechanics, EMPTY win semantics, and inheritance via `EMPTY IS GROUP`.
- Preserves layered physical collision behavior for the original puzzle set, strengthens SHIFT stacking to permit more than one displacement, and adds kind-separated TELE with deterministic routing.
- Adds structured rule-reparse event checkpoints at stage boundaries. Does **not** claim original full movement order.
- Adds **15** new board-state tests. Baseline **108** local tests still pass; all **123** pass.
- Retains 18 project levels, their existing replays, all victory navigation and progress UI.
- Adds observation-based comparison harness and deliberately unverified fixture template; original-game observed comparisons: **0**, because original gameplay wasn't executed in this environment.
- Tested via headless Chromium at desktop and phone widths: levels 16–18, victory, next level, undo/redo; no JavaScript errors.

### Unfinished original-game parity

Original's paradoxical group semantics, conditional edge cases, full EMPTY movement and collision responses, randomness, high-order syntax and full order of operations still require separate implementations and empirical checking. Reference-derived tests **are not** original-game recordings.

## Earlier development

v1.4 and earlier files and test histories are preserved through git history when committing this replacement onto the existing branch. The v1.4 project ZIP should also be retained as a separate backup if needed.
