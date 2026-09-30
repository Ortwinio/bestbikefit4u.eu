# 05 — Contracts for the new tools

**Decision 2026-09-29 (Ortwin):** FTP W/kg, power↔speed, climb planner and fuel & hydration become **real interactive tools**. None of them has a calculator yet. This file is the design contract; phase 6 turns it into engine code (card "Engine contracts for the 4 new tools").

Reading key: **[ENGINE]** = the value comes from existing code (file:line). **[VOORSTEL]** = a proposal by the lead, to be approved by Ortwin. On a board, show [VOORSTEL] values normally, but put the comment `// VOORSTEL-CONTRACT (05) — nog geen engine` above the formula.

**Approval 2026-09-30 (Ortwin):** all proposed tool ranges and FTP conversion factors below are approved.
The original `[VOORSTEL]` labels and source-selection placeholders are retained as design history,
not outstanding approval requirements. [30-tool-sources.md](30-tool-sources.md) supersedes the old
FTP-level-table prohibition and fuel placeholders with the selected sources and exact output bands.
Production names are `TOOL_RANGES` and `FTP_TEST_FACTORS`; the bottle slider is 500–750 ml, default 500 ml.
The 0.95 twenty-minute factor is the Allen & Coggan convention; 0.75 of final-minute ramp power is
the common ramp-test convention. Neither factor is an individual physiological measurement.

## Shared physics [ENGINE]

`src/lib/gearing-engine/math.ts:175` `calculateClimbPowerWatts` and `:197` `solveSpeedForPowerWatts`:
power = (m·g·v·sin θ + m·g·v·Crr·cos θ + ½·ρ·CdA·v³) / η, with g 9.80665, ρ 1.225, η 0.97 (`config.ts:4-6`). The speed solver is a bisection over 0.1–15 m/s.
- CdA per bike type (`config.ts` `DEFAULT_CDA_BY_BIKE_TYPE`): road 0.32 · gravel 0.38 · mountain 0.5 · hybrid 0.42 · tt 0.24 · city 0.48.
- Crr per surface (`DEFAULT_CRR_BY_SURFACE`): road 0.0045 · gravel 0.0065 · mtb 0.0105 · commuter 0.0055.
- Bike mass per type (`DEFAULT_BIKE_MASS_KG_BY_TYPE`): road 8.5 · gravel 10 · mountain 12.5 · city 14.
Boards may copy these formulas into `renderVals()`, with the comment `// ENGINE-FORMULE — src/lib/gearing-engine/math.ts:175`.

## Gearing (`Gearing.dc.html`) [ENGINE]
Ranges, defaults and choices exactly as in `audit/engine-alignment.md` → "Gearing: public numeric sliders / choices".

## Power ↔ speed (`PowerSpeed.dc.html`)
- Mode toggle: **Vermogen → snelheid** / **Snelheid → vermogen**.
- Power 50–600 W, step 5, default 200 [VOORSTEL]; target speed 10–50 km/h, step 0.5, default 30 [VOORSTEL] (within the solver domain 0.36–54 km/h [ENGINE]).
- Rider mass 40–150 kg, step 0.5, default 75 [VOORSTEL]; bike mass 3–20 kg, step 0.5 (range as in the pressure engine, `src/lib/pressure-engine.ts:367`), default per bike type [ENGINE].
- Gradient 0–15 %, step 0.5, default 0 [VOORSTEL] (the engine clamps 0–40 %).
- Bike type → CdA (cards: Race, Gravel, MTB, Stad, Tijdrit) [ENGINE]; surface → Crr (segments) [ENGINE].
- Result: speed or power in DM Mono, plus a stacked bar showing the power split (climbing / rolling resistance / air resistance), which follows from the formula. Honest note: there's no wind in the model (the engine has no wind input).

## Climb planner (`ClimbPlanner.dc.html`)
- Climb length 1–30 km, step 0.5 [VOORSTEL]; average gradient 2–15 %, step 0.5 [VOORSTEL]. The band derives from the length <3 / <8 / <20 / else (short/medium/long/alpine) [ENGINE `suitability.ts:39`].
- FTP 80–500 W, step 5 [VOORSTEL]; rider mass 40–150 kg [VOORSTEL]; bike type → mass/CdA/Crr [ENGINE].
- Pacing: the intensity as a share of FTP uses the engine duration multipliers short 1.1 · medium 1.0 · long 0.9 · alpine 0.82 [ENGINE `config.ts` `DEFAULT_DURATION_MULTIPLIER_BY_BAND`]. Target power = FTP × multiplier, capped at 1.1 × FTP.
- Result: estimated climbing time (via the speed solver), target power, a profile visual (the slope follows the gradient) and a link to the gearing board for "past je verzet?".
- Honesty: an estimate that holds at constant power and without wind.

## FTP W/kg (`FtpWkg.dc.html`)
- Step 1, how you know your FTP (segments): **Ik ken mijn FTP** (slider 80–500 W, step 5) · **20-min test** (slider 100–550 W, step 5; FTP = 0.95 × 20-min power) · **Ramp test** (slider for the last minute, 150–700 W, step 5; FTP = 0.75 × that). All ranges and factors are [VOORSTEL]; the 0.95 and 0.75 factors are common test conventions.
- Step 2: body weight 40–150 kg, step 0.5 [VOORSTEL].
- Result: W/kg to 2 decimals in DM Mono, plus a **translation to practice** using the shared physics: estimated time up `[REFERENTIEKLIM]` (default 5 km at 7 %) and speed on the flat at FTP. **Do not** add a level table ("Cat 3", "pro") — there's no agreed source for it; use the placeholder `[NIVEAUTABEL — bron nog kiezen]`.

## Fuel & hydration (`FuelHydration.dc.html`)
- Duration 0.5–8 h, step 0.25 [VOORSTEL]; intensity (segments: Rustig / Duur / Tempo / Wedstrijd); temperature 0–40 °C, step 1 [VOORSTEL]; sweat (segments: Weinig / Gemiddeld / Veel).
- Carbohydrates in g/h and fluid in ml/h: **no numbers from general knowledge.** First take the ranges that `src/app/(public)/calculators/fuel-hydration/page.tsx` itself names in its copy (file:line). If a value isn't there: `[G/UUR — bron nog kiezen]`.
- Result: carbohydrates per hour and total, fluid per hour and number of bottles `[BIDONINHOUD, bv. 500 ml]`, and a timeline strip for the ride with eat/drink moments. Honesty: "startpunt, test het op training".
