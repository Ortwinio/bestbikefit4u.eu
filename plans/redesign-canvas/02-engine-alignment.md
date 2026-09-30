# 02 — Engine alignment (Codex B)

Read `plans/redesign-canvas/README.md` first.

## Task

Produce `plans/redesign-canvas/audit/engine-alignment.md`. It checks the 4 existing configurator boards against the real calculation code:

| Board (in `plans/redesign-canvas/canvas/`) | Live route(s) |
|---|---|
| `BikeFit.dc.html` | `/calculators/bike-fit`, `/fit/*` |
| `SaddleHeight.dc.html` | `/calculators/saddle-height` |
| `FrameSize.dc.html` | `/calculators/frame-size` |
| `TirePressure.dc.html` | `/tire-pressure-calculator`, `/bandenspanning-calculator`, `/pressure-calculator` |

Starting points for the engine code: `convex/lib/fitAlgorithm/`, `src/lib/pressure-engine.ts`, `convex/lib/pressureFitInteraction.ts`, and the page components behind the routes. Background specs: `docs/Bikefit Calculation Engine.docx`, `docs/required input fields.docx` (convert them with `textutil -convert txt -stdout <file>`).

The formulas in the boards live in the `<script type="text/x-dc">` block, in `renderVals()`.

## Output format

Per board, three tables:

1. **Inputs**: canvas input (label, unit, min–max, step, default) | real input (name, unit, allowed range/enum, default, file:line) | verdict.
2. **Outputs**: canvas output | real output (file:line) | verdict.
3. **Inputs the real engine uses that are missing from the board**: name, why it matters, and a suggested control (slider, segment or card).

Verdicts: `match` · `design-only` (fine in the mockup; the real engine will replace it) · `must-fix` (the design shows something wrong or impossible, or a wrong range or unit). Explain each `must-fix` in one line.

Then, per board, give a one-line statement on whether the canvas formula is the real rule or a temporary approximation.

End with a **Summary**: all `must-fix` items as a checklist, and a list of the input ranges the phase 2 configurators should use (crank length, saddle width, gearing, power↔speed, FTP W/kg, climb planner, fuel & hydration), taken from `src/lib/*-engine`, `convex/saddleWidth`, `convex/gearing` and the calculator pages, each with file:line.

## Done when

- Every claim has a file:line reference.
- No app code is changed. Only the output file is written.

When finished, print exactly `DONE 02` as your last line.
