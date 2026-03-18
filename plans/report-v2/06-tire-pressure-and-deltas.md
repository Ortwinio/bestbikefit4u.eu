# Step 06 — Tire Pressure Integration and Current-vs-Target Deltas

## Objective

Wire the tire pressure module into the report (in-app and PDF) and add current-vs-target delta display. This step finishes the remaining rider-facing report content before final QA and release.

## Background

Read:
- `plans/feature-tire-pressure/` — the tire pressure module plan and implementation
- `convex/pressureCalculations/` — Convex queries for pressure results
- `convex/pressureProfiles/` — user pressure profiles
- `plans/report-v2/bestbikefit4u_v2_report_and_migration_plan (1).docx.md` — Part A section 5 (tire pressure) and Part B §2 (data model additions)

## Tire Pressure in the Report

### When inputs are complete
Show in the `TirePressureSection` component:
- Front pressure (psi and bar)
- Rear pressure (psi and bar)
- Confidence level
- Inputs used: tire width, type, surface, rider weight
- "These values are starting points. Always respect your tire and rim manufacturer's maximum pressure."

### When inputs are incomplete
Show a "Pending required data" banner:
- List the specific missing fields (from `pendingFields` in the payload)
- Link to the bike setup page where the user can add tire/weight data
- Show the quick-start lookup table from the spec as a fallback:
  - Table: rider weight × tire size → psi range (static, from the spec's road-paved chart)
  - Label it clearly: "Quick-start estimate — not personalized"

## Current-vs-Target Delta Display

If the session has `currentBike` measurements (`current_saddle_height_mm`, `current_setback_mm`, `current_drop_mm`):
- Show a "+/- X mm" delta chip next to each applicable target in the detailed fit table
- Positive delta = increase, negative = decrease
- Format: "↑ 12 mm from current" / "↓ 5 mm from current" / "On target"

If no current measurements exist, omit the delta column entirely (do not show empty cells).

## Validation for this step

- Run mapper/component tests covering complete and pending tire-pressure states
- Verify delta formatting for increase, decrease, and on-target cases
- Run `npm run typecheck`
- Run `npm run test:i18n` if this step adds or changes translation keys

## Output

Write `output-06-tire-pressure-and-deltas.md`:
- Tire pressure integration approach
- Current-vs-target delta implementation
- Validation results for complete, pending, and no-current-bike scenarios
