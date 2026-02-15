# Step 02: Quality Gates And Test Foundation

## Objective

Implement the missing test foundation and enforce minimum quality gates in local workflow and CI.

## Inputs

- `plans/test-strategy/01-unit-tests-setup.md`
- `plans/test-strategy/02-algorithm-unit-tests.md`
- `package.json`
- CI configuration (create if missing)

## Tasks

1. Add test tooling (Vitest) and scripts: `test`, `test:watch`, `test:coverage`.
2. Implement first test set for score mapping and input validation (`mapFlexibilityScore`, `mapCoreScore`, validation edges).
3. Add crank-length lookup tests based on docx formula table.
4. Add CI workflow to run lint + typecheck + test on push/PR.
5. Add build strategy for offline-safe CI (pin/self-host fonts or avoid runtime Google fetch in CI context).

## Deliverable

- Working test runner and initial unit coverage
- CI quality gate for lint/typecheck/test

## Completion Checklist

- [x] `npm test` succeeds locally
- [x] Core mapping and crank-length tests are green
- [x] CI fails on lint/typecheck/test regressions
- [x] Build is deterministic in CI environments
