# Code Quality Improvement Plan

## Goal

Create a reliable, testable, and maintainable baseline for BikeFit AI by reconciling plan/documentation drift, closing architecture gaps, and enforcing quality gates in CI.

## Review Date

2026-02-15

## Ownership

- Owner: `@ortwinverreck`
- Target completion: `2026-02-28`
- Last updated: `2026-02-15`

## Current Findings (from repository review)

1. Baseline test framework and CI quality gates are in place (Step 02 complete).
2. Recommendation mapping integrity gaps (core/flex independence, femur passthrough, questionnaire typing) are closed (Step 03 complete).
3. Planning/documentation drift remains and is addressed in Step 04.
4. Governance and release controls are still pending (Step 05).

## Scope

- Stabilize lint/typecheck/build quality gates
- Implement and operationalize test strategy (unit -> integration -> e2e)
- Fix high-impact data integrity gaps in recommendation pipeline
- Align planning artifacts with actual build status
- Directory hygiene and generated-file handling

## Out Of Scope

- Major UI redesign
- New premium feature development unrelated to quality/reliability
- Performance/load benchmarking

## Approach

1. Baseline + cleanup
2. Test foundation + CI enforcement
3. Recommendation pipeline correctness hardening
4. Product/documentation gap closure
5. Governance and release controls

## Status

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-baseline-and-cleanup.md` | P0 | Done |
| 02 | `02-quality-gates-and-test-foundation.md` | P0 | Done |
| 03 | `03-recommendation-integrity.md` | P1 | Done |
| 04 | `04-feature-gap-and-plan-alignment.md` | P2 | Done |
| 05 | `05-governance-and-release.md` | P2 | Done |

## Acceptance Criteria

- `npm run lint` returns zero warnings on maintained source paths
- `npx tsc --noEmit` passes in CI
- `npm test` exists and runs unit tests for algorithm mapping and core recommendation flow
- Regression coverage exists for flexibility/core score independence
- `docs/DEVELOPMENT_PLAN.md` and `plans/next-steps/README.md` reflect actual status
- No transient workspace artifacts (`.DS_Store`) remain in tracked directories
