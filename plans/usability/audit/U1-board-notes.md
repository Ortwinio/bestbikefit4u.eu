# U1 round-3 board execution

Executed the authoritative scripts in `plans/usability/canvas/project/Main.dc.html` and `m/Home.dc.html` with a DCLogic VM shim adapted from the existing reliability reference approach. The old harness is unchanged. No app changes or build were made for this verification.

## Results

- `node --test scripts/usability/board-reference.test.mjs`: 5 passed. Tests cover both actual homepage height handlers, prop defaults/bindings, nested loop/conditional import scopes, and explicit rejection of unsupported browser globals.
- `node scripts/usability/board-reference.mjs`: all 108 supplied `.dc.html` board scripts execute at default state; 34 active imported instances execute with resolved props, 4 imported instances are inactive under default conditions. No unsupported scripts or imports remain in these sampled states.
- `npx eslint scripts/usability/board-reference.mjs scripts/usability/board-reference.test.mjs`: passed.
- Ignored evidence: `plans/usability/renders/U1-board-reference.json` (confirmed with `git check-ignore`). Includes values, imports, missing external scripts, and homepage interaction snapshots.

Both homepage boards produce the same sampled advice values:

| State | Height | Saddle | Half-width | Example label |
| --- | --- | --- | --- | --- |
| Untouched default | 175 cm | 726 mm | 45 mm | Yes |
| Handler input 150 | 150 cm | 623 mm | 39 mm | No |
| Handler input 190 | 190 cm | 789 mm | 49 mm | No |
| Handler input 205 | 205 cm | 851 mm | 53 mm | No |

Main imports Bereikbalk and its props/defaults execute successfully. Mobile Home has no imports. Neither imports a shared Header; `Header.dc.html` is not supplied, so header behavior was not inferred or fabricated.

## Limits and source discrepancies

- The README says 115 boards; the supplied directory contains 108 `.dc.html` files. All 108 were traversed recursively, including mobile, checkout and mail directories. This is a source inventory discrepancy, not coverage of seven imaginary boards.
- All 108 pages reference an unavailable external `support.js`. The VM supplies only DCLogic constructor/state behavior. It executes board logic and expression bindings, not the absent canvas runtime, DOM bindings or external scripts.
- Homepage slider handlers were invoked with synthetic event objects at 150, 190 and 205 cm. Other boards and imported instances were evaluated only at default state. This does not establish all interactive states.
- No pixel render, browser click, focus behavior, layout, target-size or contrast claim follows from this report. The production usability guard and visual review remain separate gates.
- Direct imports resolve local board files first, then matching basename; loop and condition bindings are evaluated from default parent values. This is not a full recursive canvas renderer.
- Board calculations are reference examples; production remains tied to the shared reliability engine and data provenance tests.

## Files

- `scripts/usability/board-reference.mjs`
- `scripts/usability/board-reference.test.mjs`
- `plans/usability/audit/U1-board-notes.md`
