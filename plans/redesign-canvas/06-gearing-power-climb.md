# 06 — Gearing, power↔speed, climb planner

Read `README.md`, `BOARD-RULES.md`, `05-new-tool-contracts.md` and `audit/engine-alignment.md` first. Use the approved boards in `drafts/` (e.g. `CrankLength.dc.html`) or `canvas/SaddleHeight.dc.html` as the example for structure.

These three boards share the physics from `05` → "Shared physics". Use the same formula in all three (identical code in `renderVals()`, with the comment `// ENGINE-FORMULE — src/lib/gearing-engine/math.ts:175`). Implement the speed solver as a bisection over 0.1–15 m/s, like the engine.

## `drafts/Gearing.dc.html` (1440 × ~1400)
- Eyebrow "Verzet · 3 minuten", heading "Kom jij die klim op?"
- Inputs: 1 drivetrain (1x/2x segments; hide the inner ring at 1x), chainrings and smallest/largest cog as sliders, cassette presets as cards. 2 the climb (gradient slider, climb-length band short/medium/long/alpine as cards). 3 you (cadence slider). Wheel circumference behind "Verfijn", with wheel presets as cards.
- Result: a **gear ladder** (all ratios as bars, the lowest gear highlighted), the speed at your cadence in the lightest gear, and a verdict chip (fits / tight / too heavy). Base the verdict on a cadence comparison with the engine's comfort cadence 75–95 rpm (`config.ts` `DEFAULT_COMFORT_CADENCE_MIN_RPM/MAX`). Add advice such as "Een 34-tands grootste tandwiel geeft je X rpm meer".

## `drafts/PowerSpeed.dc.html` (1440 × ~1240)
Per contract 05. The visual is a **stacked horizontal bar** (climbing / rolling / air) whose proportions follow the formula, plus a small speed or power gauge.

## `drafts/ClimbPlanner.dc.html` (1440 × ~1300)
Per contract 05. The visual is a **climb profile** (an SVG triangle or polygon whose slope follows the gradient and whose length scales), with the target power and estimated time on it. Add a link to `Gearing.dc.html` ("Past je verzet?").

## Done when
- `check-board.mjs` passes for all three.
- The physics code is identical in all three boards (the lead diffs it).
- `audit/06-notes.md`: sources per board, and a sanity check. With 75 kg rider + 8.5 kg bike (road), 200 W, 0 % gradient on road surface, what speed do your boards calculate? And what do they give at 7 %? Show the numbers.
- No app code changed, no commit.

Print `DONE 06` as your last line.
