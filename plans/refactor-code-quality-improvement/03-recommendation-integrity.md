# Step 03: Recommendation Integrity

## Objective

Eliminate high-impact data-flow risks in recommendation generation and protect them with regression tests.

## Inputs

- `convex/recommendations/mutations.ts`
- `convex/lib/fitAlgorithm/types.ts`
- `convex/lib/fitAlgorithm/index.ts`
- `plans/test-strategy/03-integration-tests.md`

## Tasks

1. Pass `femurLengthCm` through to algorithm input as `femurMm` when present.
2. Add integration tests for profile -> session -> recommendation mapping correctness.
3. Add explicit regression test asserting core score uses `profile.coreStabilityScore` independently from flexibility.
4. Replace or document the `effectiveTopTubeMm` approximation strategy (currently `reach + 50`) with explicit v1 rationale.
5. Validate questionnaire response typing strategy (`v.any`) and narrow schema where possible.

## Deliverable

- Corrected recommendation input mapping
- Regression coverage for recommendation correctness

## Completion Checklist

- [x] Femur measurement is used by recommendation pipeline
- [x] Core/flex independence regression test exists and passes
- [x] ETT approximation decision is documented and tracked
- [x] Questionnaire response validation risk is reduced or explicitly accepted
