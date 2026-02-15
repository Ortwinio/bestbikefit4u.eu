# Step 02: Test Suite

## Objective

Implement the test strategy from `plans/test-strategy/` and continue from the initial baseline already in place.

## Inputs

- `plans/test-strategy/01-unit-tests-setup.md`
- `plans/test-strategy/02-algorithm-unit-tests.md`

## Tasks

1. Keep `vitest` setup and CI quality gates maintained
2. Expand algorithm unit tests from baseline coverage to all calculation steps
3. Keep regression test coverage for core/flex independence
4. Add backend integration tests for profile -> session -> recommendation pipeline

## Deliverable

- Passing unit test suite
- CI integration

## Completion Checklist

- [x] `npm test` passes
- [ ] All 10 calculation steps have test coverage
- [x] Core score regression test exists
- [x] CI runs tests on push
