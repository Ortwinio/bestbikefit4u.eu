# Test Strategy Plan

## Goal

Establish a comprehensive test suite for BikeFit AI covering unit tests for the calculation engine, integration tests for backend flows, and E2E tests for critical user paths.

## Background

The application now has initial unit tests and CI quality gates, but full algorithm, backend integration, and E2E coverage are still missing. The calculation engine remains the highest-risk component — incorrect output leads to bad fit recommendations.

## Ownership

- Owner: `@ortwinverreck`
- Target completion: `2026-03-08`
- Last updated: `2026-02-15`

## Scope

- Unit tests for `convex/lib/fitAlgorithm/` (all 10 calculation steps)
- Integration tests for Convex mutations/queries (profile → session → recommendation pipeline)
- E2E tests for critical user flows (profile creation, fit session, results)
- Validation test cases derived from documentation (docx spec)

## Out of Scope

- Performance/load testing
- Visual regression testing
- Accessibility audits (separate effort)

## Dependencies

- Core score bug fix is complete; keep regression coverage in place
- Use docx specification as formula authority for expected values

## Status: IN PROGRESS

| Step | File | Status |
|------|------|--------|
| 01 | `01-unit-tests-setup.md` | Done |
| 02 | `02-algorithm-unit-tests.md` | In Progress |
| 03 | `03-integration-tests.md` | Pending |
| 04 | `04-e2e-tests.md` | Pending |

## Acceptance Criteria

- All 10 algorithm steps have dedicated test cases
- Crank length lookup matches docx spec table exactly
- Saddle height calculation matches docx formula within ±1mm
- Core score and flexibility score mapping are independently tested
- Critical user flow (profile → session → recommendation) passes E2E
- CI pipeline runs tests on every push
