# BikeFit Correctness Audit Plan

## Goal

Systematically verify that the bikefitting application is biomechanically and technically correct:

- every input field is used as intended
- calculations match the source-of-truth specification
- outputs are internally consistent and clinically plausible
- improvement opportunities are prioritized for implementation

## Background

The application has strong coverage for the happy path, but correctness depends on multiple layers:

1. Input capture and validation
2. Data mapping and unit conversions
3. Algorithm formulas and clamp logic
4. Output rendering and communication (results, PDF, email)

A focused audit is needed to prove end-to-end integrity and define the next wave of quality improvements.

## Ownership

- Owner: `@ortwinverreck`
- Plan type: `refactor`
- Target completion: `2026-03-08`
- Last updated: `2026-02-19` (Step 05 complete + Phase 0 implementation started)

## Scope

- Input-field inventory and lineage validation (UI -> backend -> algorithm -> output)
- Formula-level validation versus canonical spec
- Black-box and edge-case scenario validation
- Risk-ranked improvement roadmap (engineering + bikefit quality)

## Out Of Scope

- Full UI redesign
- Marketing/SEO copy updates not related to fit correctness
- New paid-tier feature development unrelated to correctness

## Approach

1. Build an input traceability matrix
2. Reconcile spec and formulas into a canonical test oracle
3. Run deterministic and boundary validation across algorithm outputs
4. Validate full user journey behavior and failure paths
5. Produce prioritized recommendations with implementation slices

## Status

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-input-field-traceability-audit.md` | P0 | Done |
| 02 | `02-calculation-spec-and-formula-audit.md` | P0 | Done |
| 03 | `03-algorithm-validation-test-matrix.md` | P1 | Done |
| 04 | `04-end-to-end-flow-and-output-audit.md` | P1 | Done |
| 05 | `05-improvement-roadmap-and-cutover-plan.md` | P2 | Done |

## Implementation Follow-Through

- Phase 0 status (`2026-02-19`):
  - [x] B01 auth backdoor removal
  - [x] B02 durable auth/email rate limiting (Convex-backed)
  - [x] B03 server-side required questionnaire validation before completion
  - [x] B04 recommendation dedup guard hardening

## Acceptance Criteria

- Every input field has explicit status: used correctly, transformed, ignored, or misused
- Formula audit confirms implemented math against a canonical specification
- Boundary and regression scenarios are documented with pass/fail evidence
- Any correctness gaps have reproducible cases and concrete remediation tasks
- Final recommendations include impact, effort, risk, and rollout order
