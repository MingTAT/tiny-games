# Reference-derived behavior vs original-game observation

The tests in `tests/conformance-v15.test.cjs` were created from publicly documented behavior; the source is the wiki or developer clarifications, **not a capture of our own original-game run**. Therefore they are useful for checking our interpreter's intended semantics but do not establish parity.

- **GROUP**: https://babaiswiki.fandom.com/wiki/GROUP — inherited group rules, three independently named groups, negated/conditional memberships, and the existence of infinite loops or unusual recursive behavior.
- **EMPTY**: https://babaiswiki.fandom.com/wiki/EMPTY — vacancy-only objects, disappearance of transformed entities, creation from empty cells, special movement and contact behavior.
- **Original developer discussion**: https://steamcommunity.com/app/736260/discussions/0/1768133742959216941/ — why `EMPTY IS WIN` alone doesn't work and the difference between movement-contact properties and overlapping properties.
- **Order of Operations**: https://babaiswiki.fandom.com/wiki/Order_of_Operations — rules re-evaluated between stages; movement, transform, interactions, and internal ordering are more sophisticated than this subset.
- **TELE**: https://babaiswiki.fandom.com/wiki/TELE — source/object float matching, noun-type networks, once per turn, original random routing for 3+.

## Direct observation protocol

1. Use an independently accessible, legally owned copy of the original game and note exact version/platform.
2. Create or select a specific level state and record all tile positions, facing directions and overlapping objects. Capture a screenshot or video with timestamp.
3. Record one move at a time, including WAIT, and transcribe every complete resulting board state without guessing.
4. Fill in `original-trace-template.json` and change `provenance.kind` to `original-game-direct-observation` only if the recorded observations actually came from that copy. The harness checks required metadata and compares all tuples after each turn.
5. If the engine differs, preserve the failure as a regression fixture rather than altering the observation to match our engine.

At this deliverable: **0 direct original-game observation traces**, so no claim of exact 1:1 conformance.
