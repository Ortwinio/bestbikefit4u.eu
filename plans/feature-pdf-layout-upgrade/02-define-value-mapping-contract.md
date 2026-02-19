# Step 02: Define Value Mapping Contract

## Objective

Guarantee measurement/output values in the new PDF are accurate, unit-safe, and mapped from canonical backend fields.

## Inputs

- `plans/feature-pdf-layout-upgrade/output-01-gap-analysis.md`
- `convex/recommendations/*`
- `convex/sessions/*`
- `src/lib/reports/recommendationPdf.ts`
- `scripts/generate-example-report.mjs`

## Tasks

1. Define canonical source fields for each displayed report metric:
   - saddle height, setback, drop, reach
   - stem length/angle
   - crank length
   - handlebar width
   - frame guidance values
2. Define unit and formatting rules for every metric:
   - mm, degree, percentage, date formatting
   - integer vs decimal precision
3. Document derived ranges and fallback behavior when optional fields are absent.
4. Produce a value mapping matrix (field source -> display label -> format -> validation rule).
5. Define test assertions for value correctness and mis-mapping prevention.
6. Save to `plans/feature-pdf-layout-upgrade/output-02-value-mapping-matrix.md`.
7. Update plan status in `plans/feature-pdf-layout-upgrade/README.md`.

## Deliverable

- A strict mapping contract that engineering and tests can enforce.

## Completion Checklist

- [ ] Every displayed value has a canonical source.
- [ ] Units/precision/fallback rules are explicit.
- [ ] Test assertions for mapping correctness are defined.
- [ ] Output file created and linked in plan progress.
