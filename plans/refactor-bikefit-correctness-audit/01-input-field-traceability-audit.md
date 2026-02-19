# Step 01: Input Field Traceability Audit

## Objective

Determine whether all input fields are correctly collected, validated, stored, transformed, and consumed by the recommendation engine.

## Inputs

- `convex/schema.ts`
- `convex/profiles/*`
- `convex/sessions/*`
- `convex/questionnaire/*`
- `convex/recommendations/*`
- `src/components/measurements/*`
- `src/app/(dashboard)/fit/*`
- `docs/DEVELOPMENT_PLAN.md`

## Tasks

1. Build a complete inventory of required and optional inputs from UI and schema.
2. Map each field across the pipeline:
   UI capture -> validation -> storage -> algorithm input -> output usage.
3. Flag field-status categories:
   - correctly used
   - transformed with risk (for example unit/scale conversion)
   - stored but not used
   - used but not collected
4. Verify unit integrity (`cm`/`mm`) and enum-to-score mappings.
5. Identify duplicated, conflicting, or dead fields.

## Deliverable

- `plans/refactor-bikefit-correctness-audit/output-01-input-traceability-matrix.md`

The output must include:

- field-by-field matrix
- mismatch findings with file references
- severity labels (P0-P3)

## Completion Checklist

- [ ] All profile/session/questionnaire inputs are listed
- [ ] Every field has a traceability status
- [ ] Conversion and mapping risks are documented
- [ ] Findings are reproducible with file references
