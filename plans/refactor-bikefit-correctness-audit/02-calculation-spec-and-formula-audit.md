# Step 02: Calculation Spec And Formula Audit

## Objective

Validate that implemented equations, constants, offsets, and clamps match the canonical bikefit specification.

## Inputs

- `docs/Bikefit Calculation Engine.docx`
- `docs/BikeFit_Engine_Validation.xlsx`
- `convex/lib/fitAlgorithm/*`
- `convex/recommendations/mutations.ts`
- `plans/refactor-bikefit-correctness-audit/output-01-input-traceability-matrix.md`

## Tasks

1. Define a canonical specification baseline (and explicitly record any spec conflicts).
2. Extract implemented formulas and constants from code.
3. Compare formula-by-formula:
   - saddle height
   - setback
   - bar drop
   - reach
   - crank length
   - handlebar width
   - cleat offset
   - frame targets and stem solution
4. Validate clamping behavior, fallback paths, and default assumptions.
5. Document any discrepancies between spec, implementation, and validation spreadsheet.

## Deliverable

- `plans/refactor-bikefit-correctness-audit/output-02-formula-audit.md`

The output must include:

- side-by-side formula comparison table
- discrepancy list with impact
- decision log for canonical source-of-truth

## Completion Checklist

- [ ] Canonical spec is clearly declared
- [ ] All major equations are compared
- [ ] Clamp/fallback behavior is audited
- [ ] Discrepancies include impact and recommended action
