# 06 — Gearing, power ↔ speed, climb planner

Draft handoff from Codex B. No app code or published canvas changed; no commit or publication.

## Deliverables

- `../drafts/Gearing.dc.html` — 1440 × 1400; drivetrain, cassette endpoints/presets, climb band, cadence, expandable wheel controls, live gear ladder and conditional example-rider verdict.
- `../drafts/PowerSpeed.dc.html` — 1440 × 1240; both calculation directions, independent surface choice, adjustable rider/bike mass, live power-component bar and gauge.
- `../drafts/ClimbPlanner.dc.html` — 1440 × 1300; length-derived pacing band, live schematic profile, target power, speed, elevation and time.

## Sources and decisions

Shared physics is byte-identical in all three `renderVals()` implementations between the first `ENGINE-FORMULE` marker for `src/lib/gearing-engine/math.ts:175` and `EINDE GEDEELDE FYSICA`. Power follows that function; bisection follows `math.ts:197`, including 0.1–15 m/s bounds, 50 iterations and 0.5 W tolerance. Constants and type/surface defaults come from `src/lib/gearing-engine/config.ts:4`, `:12`, `:23`, `:34`. Power components include the same drivetrain-loss factor as total pedal power.

### Gearing

- Ranges, defaults and enums: `../audit/engine-alignment.md`, section “Gearing: public numeric sliders / choices”. Cassette endpoint presets: `src/app/(public)/calculators/gearing/GearingCalculatorForm.tsx:59`; wheel presets: `src/app/(public)/calculators/gearing/gearing-engine.ts:59`.
- Ratios/development and cadence/speed conversion: `src/lib/gearing-engine/math.ts:75`, `:157`, `:164`. Climb intensity: `config.ts:61`; comfort reference: `config.ts:68`.
- The public presets provide smallest/largest sprockets, not complete cassette tooth lists. The ladder therefore shows every supplied chainring × endpoint combination, sorted by ratio, with explicit copy explaining that intermediate gears are unavailable. No intermediate teeth invented. Full-cassette ladders require an approved tooth-list source.
- Because task 06 supplies no rider-mass/FTP inputs, the physics verdict uses a prominently labeled example rider: 75 kg, FTP 200 W, multiplied by the selected duration band. This is not a personalized feasibility result. Bike mass/CdA/surface follow type; public commuter maps to city. Wheel circumference remains independently adjustable.
- Proposed verdict interpretation: achievable cadence in easiest gear below 75 rpm → too heavy; 75–95 inclusive → tight/no additional low-gear reserve; above 95 → fits/room to shift heavier. Thresholds are engine constants, but this classification is a draft design decision, not the public engine’s ratio-based verdict. It does not prove an available intermediate gear reaches a particular cadence.
- Alternative advice uses the next larger endpoint in the existing presets and compares cadence at the same modeled speed; compatibility is explicitly not promised. Invalid chainring/cassette ordering hides results and preserves inputs. Choosing custom visibly selects custom; moving either endpoint does too.

### Power ↔ speed

- Inputs and step sizes follow `../05-new-tool-contracts.md`; proposed ranges carry the required contract annotation. Bike-mass range also traces to `src/lib/pressure-engine.ts:367`.
- Switching bike type resets bike mass to its engine default, while surface stays independently selected. Time-trial mass is 8 kg from the engine config.
- The stacked bar shows climbing, rolling and air resistance; its components sum to pedal power. Output is not artificially clipped to the input slider range. Solver-bound speeds and out-of-gauge power are disclosed rather than represented as unconstrained exact estimates.
- Test margin is sensitivity to one input-slider step, not a confidence interval. No wind is modeled.

### Climb planner

- Ranges/pacing contract: `../05-new-tool-contracts.md`. Length bands `<3`, `<8`, `<20`, otherwise alpine: `src/lib/gearing-engine/suitability.ts:39`; FTP multipliers 1.1/1.0/0.9/0.82: `config.ts:61`.
- Example defaults chosen for this draft: 5 km, 7%, FTP 200 W, 75 kg, road. Rider-mass step is 0.5 kg, consistent with PowerSpeed; these are draft choices where contract 05 leaves defaults/step unspecified.
- Distance means distance along the road. Time = distance / solved speed; elevation = distance × sin(atan(gradient / 100)). Profile length and slope both change; vertical scale is deliberately exaggerated and labeled schematic.
- Sensitivity changes FTP by one allowed step with the same pacing band. Constant power, no wind/stops, inferred surface and bike mass are disclosed. Links go to the draft gearing board and account login.

## Requested sanity check

All boards use rider 75 kg + road bike 8.5 kg = 83.5 kg, CdA 0.32, road Crr 0.0045, density 1.225, efficiency 0.97 and target 200 W.

| Gradient | Shared solver, every board | Rounded display | Power recomputed at solved speed |
| --- | --- | --- | --- |
| 0% | 33.6230859375 km/h | 33,6 km/h | 200.1025842657 W |
| 7% | 11.1508593750 km/h | 11,2 km/h | 200.3331694595 W |

These agree exactly with the repository’s TypeScript speed solver. Residuals are within its 0.5 W stopping tolerance. Gearing uses medium band for this comparison. ClimbPlanner uses 5 km/medium and FTP 200 W; its 0% case was evaluated directly in the shared calculation, not exposed as a UI choice (the contract slider starts at 2%). Gearing’s cadence-speed tile is a separate kinematic result, not the power-limited solver speed.

## Validation and renders

From `plans/redesign-canvas`, for each of Gearing, PowerSpeed and ClimbPlanner:

```sh
node check-board.mjs drafts/<Name>.dc.html
node check-runtime.mjs drafts/<Name>.dc.html
```

Both checkers pass. Runtime exploration: Gearing 127 states, PowerSpeed 79, ClimbPlanner 52 (258 total). Additional in-memory assertions verified shared-block equality, both sanity cases across every board, custom/preset cassette interaction, and 144 combinations against the actual TypeScript engine (mass, gradient, power, Crr and CdA), including component sums and solver saturation.

PNG previews are in `../drafts/_renders/`: `Gearing.png`, `Gearing-expanded.png`, `Gearing-one-by.png`, `Gearing-invalid.png`, `PowerSpeed.png`, `PowerSpeed-speed.png`, `ClimbPlanner.png`, `ClimbPlanner-alpine.png`. Local Playwright rendering evaluates DC values and expands loops/conditions into static HTML before screenshotting; this is not native design-canvas support.js verification. Checked representative images visually, horizontal overflow and 44 px minimum target heights. Lead still needs native-canvas review before publishing.
