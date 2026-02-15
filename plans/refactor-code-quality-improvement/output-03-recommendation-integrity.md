# Output 03: Recommendation Integrity

## Date

2026-02-15

## Implemented

1. Introduced dedicated recommendation mapping module:
   - `convex/recommendations/inputMapping.ts`
   - Centralizes bike/goal mapping, score normalization, profile/session -> `FitInputs`, and ETT approximation.
2. Updated recommendation generation to use mapping helpers:
   - `convex/recommendations/mutations.ts`
3. Added femur support through data pipeline:
   - Added `femurLengthCm` to profile schema and mutation args
   - Added `femurLengthCm` input in wizard/profile flow
   - Passed to algorithm as `femurMm`
4. Documented ETT v1 approximation behind explicit helper:
   - `estimateEffectiveTopTubeMm()` with rationale and tracked constant offset.
5. Reduced questionnaire response typing risk:
   - Replaced `v.any()` with constrained union validator (`string | number | string[]`)
   - Added per-question runtime response validation in `saveResponse`
   - Added safer type guards in questionnaire completion flow.
6. Fixed adjacent integrity bug discovered during review:
   - `profiles.updateAssessment` now persists `coreStabilityScore`.

## Tests Added

1. Recommendation mapping/regression tests:
   - `convex/recommendations/__tests__/inputMapping.test.ts`
   - Covers core/flex independence, femur mapping, category/goal mapping, and ETT estimate.
2. Questionnaire response validation tests:
   - `convex/questionnaire/__tests__/responseValidation.test.ts`

## Verification

1. `npm test` -> pass (`4` files, `17` tests)
2. `npm run lint` -> pass
3. `npm run typecheck` -> pass
4. `npm run build -- --webpack` -> pass

## Notes

- `npx convex codegen` requires a running Convex dev backend and did not run in this sandbox session. Current TypeScript checks still pass.
