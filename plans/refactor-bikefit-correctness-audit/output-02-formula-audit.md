# Output 02: Formula Audit

Date: 2026-02-19  
Scope: canonical spec reconciliation and formula-by-formula comparison across:
- `docs/Bikefit Calculation Engine.docx` (spec text)
- `convex/lib/fitAlgorithm/*` and `convex/recommendations/*` (implementation)
- `docs/BikeFit_Engine_Validation.xlsx` (spreadsheet model)

## Canonical Specification Decision Log

1. Canonical source for production formulas is `docs/Bikefit Calculation Engine.docx`.
   - Reason: it defines the v1 algorithm step-by-step, with explicit equations, clamps, and category tables.
2. `docs/BikeFit_Engine_Validation.xlsx` is a secondary model, not formula authority.
   - Reason: it uses a different style-coefficient engine and different equation family (see discrepancy table below).
3. Implementation conformance should be measured against docx formulas first; spreadsheet parity should be treated as optional compatibility work.
4. Where docx is internally ambiguous (for example city handlebar width text), prefer the explicit equation statement over summary table text and document the decision.

## Formula-by-Formula Comparison (Docx vs Code)

| Component | Docx Canonical | Code Implementation | Status | Evidence |
|---|---|---|---|---|
| Crank length bands | Inseam bands: `<740=165`, `740-819=170`, `820-879=172.5`, `880-939=175`, `>=940=177.5`; MTB tweak `-2.5` where available | Matches band table and MTB preference logic | `match` | `convex/lib/fitAlgorithm/constants.ts:157`, `convex/lib/fitAlgorithm/calculations.ts:65`, `docs/Bikefit Calculation Engine.docx` |
| Saddle height base | `SH0 = inseam * Msh(category)` | Same | `match` | `convex/lib/fitAlgorithm/constants.ts:16`, `convex/lib/fitAlgorithm/calculations.ts:97`, `docs/Bikefit Calculation Engine.docx` |
| Saddle height modifiers | `ΔSH_flex clamp(-8,+4,1.5*(FS-5))`; `ΔSH_core clamp(-4,+2,0.8*(CS-5))`; ambition offsets `-4/0/+3/+6` | Same | `match` | `convex/lib/fitAlgorithm/calculations.ts:101`, `convex/lib/fitAlgorithm/constants.ts:169`, `docs/Bikefit Calculation Engine.docx` |
| Saddle height guardrail clamp | Docx guardrail: `inseam*0.865 .. inseam*0.890` | Code clamp: `inseam*0.86 .. inseam*0.91` | `mismatch` | `convex/lib/fitAlgorithm/calculations.ts:119`, `docs/Bikefit Calculation Engine.docx` |
| Saddle setback base + offsets | `SS0=0.070*inseam-5` plus category and ambition offsets | Same | `match` | `convex/lib/fitAlgorithm/calculations.ts:136`, `convex/lib/fitAlgorithm/constants.ts:67`, `docs/Bikefit Calculation Engine.docx` |
| Saddle setback refinements | Optional refinements: femur ratio term + flex/core modifiers + category clamps | Not implemented (only base + offsets) | `mismatch` | `convex/lib/fitAlgorithm/calculations.ts:132`, `docs/Bikefit Calculation Engine.docx` |
| Bar drop base/modifiers | `BD0 = SH*Rbd`, plus flex/core modifiers and optional experience modifier | Same equation family and same clamps/ranges | `match` | `convex/lib/fitAlgorithm/calculations.ts:157`, `convex/lib/fitAlgorithm/constants.ts:35`, `docs/Bikefit Calculation Engine.docx` |
| Reach formula | `SR0=0.47*torso + 0.33*arm + 25`; fallback `0.33*height`; category+ambition+flex+core offsets with clamp ranges | Same | `match` | `convex/lib/fitAlgorithm/calculations.ts:210`, `convex/lib/fitAlgorithm/constants.ts:24`, `docs/Bikefit Calculation Engine.docx` |
| Saddle tilt | Base by category + drop modifiers, clamp `[-3,+1]` | Same | `match` | `convex/lib/fitAlgorithm/calculations.ts:251`, `convex/lib/fitAlgorithm/constants.ts:86`, `docs/Bikefit Calculation Engine.docx` |
| Cleat offset table | Category x ambition lookup table | Same | `match` | `convex/lib/fitAlgorithm/constants.ts:97`, `convex/lib/fitAlgorithm/calculations.ts:274`, `docs/Bikefit Calculation Engine.docx` |
| Handlebar width | Road/gravel width via shoulder rounding + additions; MTB/city multiplier + clamp | Mostly aligned; city text in doc has conflicting statements (table add vs explicit formula) | `partial` | `convex/lib/fitAlgorithm/calculations.ts:289`, `convex/lib/fitAlgorithm/constants.ts:146`, `docs/Bikefit Calculation Engine.docx` |
| Frame target coordinates | `saddleY=0.96*SH` if no seat tube angle, then bar target from setback/reach/drop | Same helper function, but seat-tube-angle path is effectively unused in main pipeline | `partial` | `convex/lib/fitAlgorithm/calculations.ts:329`, `convex/lib/fitAlgorithm/index.ts:104`, `docs/Bikefit Calculation Engine.docx` |
| Stem/spacer solve | Search candidate stems/angles/spacers minimizing coordinate error with category constraints | Same strategy; road/gravel spacer limit is soft penalty, not hard constraint | `partial` | `convex/lib/fitAlgorithm/calculations.ts:375`, `convex/lib/fitAlgorithm/calculations.ts:391`, `docs/Bikefit Calculation Engine.docx` |

## Spreadsheet Model Drift (XLSX vs Canonical Docx)

The spreadsheet uses a different modeling approach than the docx/code:

1. Style-coefficient model instead of category + ambition equations.
   - Example: `Style_col` lookup and style adjustments in engine sheet.
2. Saddle height simplified to `inseam * coeff` without docx flex/core/ambition additive model.
   - `Engine!B23 = B5 * B17`.
3. Setback formula differs materially:
   - XLSX: `femur*0.15 - crank*0.06 + style_adj` (`Engine!B27`).
   - Docx/code: `0.070*inseam - 5 + offsets` (+ optional refinements).
4. Reach formula differs:
   - XLSX: `(torso+arm)*0.47 + height*0.03 - 220 + style + flex_adj` (`Engine!B29`).
   - Docx/code: torso/arm formula with category/ambition/flex/core offsets.
5. Bar drop formula differs:
   - XLSX: `MIN(MAX(height*(e+f*flex_norm)+g+style_adj,0),180)` (`Engine!B30`).
   - Docx/code: `SH*Rbd` + flex/core/experience + category clamp.
6. Crank logic differs:
   - XLSX: ideal `inseam*0.216`, clamp 165..175, nearest option (`Engine!B24`, `B25`, `B26`).
   - Docx/code: inseam band table up to 177.5 + MTB tweak.

Evidence:
- `docs/BikeFit_Engine_Validation.xlsx` (sheet `Engine`, formulas in cells `B23`, `B27`, `B29`, `B30`, `B24:B26`)
- `docs/BikeFit_Engine_Validation.xlsx` (sheet `Assumptions`, rows with coefficients `B16:B37`)

## High-Impact Discrepancies (Severity)

### P0

1. Profile fallback strategy changes effective reach math versus docx fallback path.
   - Code auto-populates torso/arm when missing (`height*0.32`, `height*0.44`), so algorithm often uses torso+arm equation instead of docx fallback `0.33*height`.
   - Impact: riders without measured torso/arm can receive materially different reach outputs than canonical fallback intent.
   - Evidence: `convex/profiles/mutations.ts:76`, `convex/profiles/mutations.ts:77`, `convex/lib/fitAlgorithm/calculations.ts:210`, `docs/Bikefit Calculation Engine.docx`.

### P1

2. Saddle height guardrail clamp bounds differ from canonical.
   - Code: `0.86..0.91`; docx: `0.865..0.890`.
   - Impact: wider acceptance envelope may approve higher/lower values than intended safety band.
   - Evidence: `convex/lib/fitAlgorithm/calculations.ts:119`, `docs/Bikefit Calculation Engine.docx`.

3. Setback refinements (femur, flex, core, category-specific clamp bands) are missing.
   - Impact: reduced anthropometric personalization and weaker biomechanical intent for fore-aft positioning.
   - Evidence: `convex/lib/fitAlgorithm/calculations.ts:132`, `docs/Bikefit Calculation Engine.docx`.

4. Experience-level modifier exists in algorithm but is not fed from questionnaire/session mapping.
   - Impact: bar-drop personalization by rider capability is effectively inactive.
   - Evidence: `convex/lib/fitAlgorithm/calculations.ts:165`, `convex/recommendations/inputMapping.ts:89`, `convex/questionnaire/questions.ts:44`.

5. Geometry-aware solver path is not wired in recommendation input mapping.
   - Impact: solver uses default cockpit assumptions instead of known frame stack/reach data.
   - Evidence: `convex/lib/fitAlgorithm/index.ts:116`, `convex/recommendations/inputMapping.ts:89`, `convex/bikes/mutations.ts:18`.

### P2

6. Docx ambiguity in city handlebar width specification (table vs explicit formula text).
   - Impact: risk of inconsistent interpretations across future contributors/tests.
   - Evidence: `docs/Bikefit Calculation Engine.docx`, `convex/lib/fitAlgorithm/calculations.ts:314`.

7. XLSX model drift is substantial and cannot be used as numeric “golden expected output” for current implementation.
   - Impact: false failures in validation if spreadsheet expected values are treated as authoritative.
   - Evidence: `docs/BikeFit_Engine_Validation.xlsx` (sheet `Engine`), `convex/lib/fitAlgorithm/calculations.ts:90`.

## Recommended Step-02 Decisions

1. Keep docx as canonical and explicitly mark xlsx as a non-authoritative legacy/alternative model.
2. Update implementation to match docx on:
   - saddle-height guardrail clamp (`0.865..0.890`)
   - setback refinement terms and clamp bands.
3. Decide and document fallback policy for missing torso/arm:
   - either preserve docx fallback `0.33*height`,
   - or codify auto-estimation as an approved extension (with tests and UI disclosure).
4. Decide whether city handlebar ambition additions are valid; if not, keep explicit city formula and document that interpretation.
5. Add test oracle cases derived from docx formulas (not from xlsx values).

## Completion Checklist

- [x] Canonical spec is clearly declared
- [x] All major equations are compared
- [x] Clamp/fallback behavior is audited
- [x] Discrepancies include impact and recommended action
