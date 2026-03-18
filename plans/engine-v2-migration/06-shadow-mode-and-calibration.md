# 06 — Shadow Mode and Calibration

## Objective

Run Engine v2 beside the current path, persist comparisons, and calibrate before any default cutover.

## In Scope

- define when shadow runs execute
- store v1 and v2 outputs for the same session
- compare core fields and record deltas
- define acceptable tolerance bands per parameter
- add operational visibility for failures and large deltas

## Suggested Comparison Fields

- saddle height
- saddle setback
- handlebar drop
- handlebar reach
- stem recommendation
- crank length
- handlebar width
- confidence score

## Calibration Gates

- no runtime failures in shadow mode for supported input shapes
- acceptable deltas for deterministic carry-over outputs
- intentional differences documented when v2 adds new constraints or envelope semantics
- no auth or data-leak regressions in shadow persistence

## Expected Repo Touchpoints

- `convex/recommendations/actions.ts`
- `convex/recommendations/internalMutations.ts`
- telemetry or analytics integration used for monitoring

## Deliverables

- shadow-run storage model
- comparison utility
- calibration dashboard or queryable report surface

## Exit Criteria

- shadow mode can be enabled without affecting user-visible recommendations
- comparison results are queryable
- tolerance thresholds are written down and enforced in tests where practical
