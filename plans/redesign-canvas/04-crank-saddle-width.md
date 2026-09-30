# 04 — New configurators: crank length + saddle width (Codex B)

Read `README.md`, `BOARD-RULES.md`, `reference/design-language.md` (section "Configurators: de interactieregels") and `audit/engine-alignment.md` → "Phase 2 input ranges" first. Use `canvas/SaddleHeight.dc.html` as the example for structure, header, slider and result panel.

## `drafts/CrankLength.dc.html` (1440 × ~1240)

- Eyebrow "Cranklengte · 1 minuut", heading as a question: "Welke cranklengte past bij jou?"
- Inputs (left): 1 inseam (slider 55–105 cm, step 0.5; the engine allows 0.1, but 0.5 is a usable slider step. Mention this in your changes list). 2 bike type (segments: Race / Gravel / MTB / Stad). Optional behind "Verfijn": your current crank length (discrete choice: 165 / 170 / 172.5 / 175 / 177.5 mm as segments).
- Result (right): the recommended crank length from the **discrete** table (`convex/lib/fitAlgorithm/constants.ts:157` and the MTB rule at `calculations.ts:65`). Show a **scale with the 5 lengths** on which the recommendation lights up and a borderline length gets a border. Add a live drawing of a crank arm whose length follows the choice. Illustration 07 (`/_blob/5ca5e299825bc7b252e018a0c491ede6`) may be used as an image.
- "Nu vs. advies": when the current length is chosen, show a status chip (same / 2.5 mm longer / …) with honest advice, e.g. "Geen reden om te wisselen bij geen klachten".
- A "Pas in deze volgorde aan" block and a CTA: "Bewaar in je account" → `Login.dc.html`.

## `drafts/SaddleWidth.dc.html` (1440 × ~1300)

- Eyebrow "Zadelbreedte · 2 minuten", heading "Hoe breed moet je zadel zijn?"
- Step 1: a **Gemeten / Geschat** toggle (segments). Gemeten → a sit-bone-width slider 60–200 mm, step 1, with a short 3-step measuring guide (cardboard / foil method). Geschat → sliders for height 140–220 cm, weight 40–150 kg and hip circumference 70–160 cm.
- Step 2: riding type as **option cards** (tt_triathlon, road_race, endurance_road, gravel, mtb, commuter_leisure, indoor_only, each with a Dutch label and a one-line description; default endurance_road).
- Step 3: posture (segments: Aggressief / Gebalanceerd / Rechtop).
- Result: the recommended saddle width in DM Mono with a margin. Add a **top view of the saddle** whose width follows the result, with the sit bones as two dots at the measured or estimated distance. Show a size scale over the output bins 125–190 mm (`src/lib/saddle-width-engine/config.ts:27`).
- Trust: in "Geschat" mode, show a lower confidence and say that measuring gives a sharper result.
- CTA: "Bewaar in je account".

## Done when

- `node plans/redesign-canvas/check-board.mjs` passes for both drafts.
- Every range, enum and discrete value follows the audit, with `// VOORLOPIGE REKENREGEL — echte engine: <file:line>` above every formula.
- `audit/04-notes.md`: for each board, the sources used (file:line) and the conscious choices you made (e.g. the slider step).
- No app code changed, no commit.

Print `DONE 04` as your last line.
