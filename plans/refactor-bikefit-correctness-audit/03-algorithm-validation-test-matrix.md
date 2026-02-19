# Step 03: Algorithm Validation Test Matrix

## Objective

Prove calculation correctness with deterministic and boundary test scenarios, including biomechanical plausibility checks.

## Inputs

- `plans/refactor-bikefit-correctness-audit/output-02-formula-audit.md`
- `convex/lib/fitAlgorithm/*`
- Existing tests in `convex/**/__tests__` and `src/**/__tests__`
- `docs/BikeFit_Engine_Validation.xlsx`

## Tasks

1. Define a validation matrix that covers:
   - nominal rider profiles
   - boundary values (min/max)
   - inconsistent anthropometrics
   - missing optional measurements
   - category/goal combinations
2. Add or update unit tests for each formula component.
3. Add integration tests for recommendation generation end-to-end mapping.
4. Add invariant checks (for example monotonic behavior where expected):
   - larger inseam should not reduce baseline saddle height
   - higher aggression should trend toward larger drop/reach where spec requires
5. Record expected vs actual outputs for each scenario.

## Deliverable

- `plans/refactor-bikefit-correctness-audit/output-03-validation-matrix-results.md`

The output must include:

- test matrix table
- coverage gaps
- failures with root-cause hypotheses

## Completion Checklist

- [ ] Boundary and nominal scenarios are covered
- [ ] Deterministic expected values are documented
- [ ] Invariants are tested
- [ ] Failures are actionable and reproducible
