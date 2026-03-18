# 01 — Baseline and Engine Contract

## Objective

Freeze the current engine behavior into an explicit contract so Engine v2 can be built and compared without breaking today’s fit flow.

## Why This Step Exists

The repo already has a deterministic engine and recommendation pipeline. Before introducing new schema or UX, the current behavior must be made explicit:

- source inputs
- mapping rules
- output shape
- invariants
- known bugs and accepted limitations

Without this contract, shadow-mode comparison becomes subjective and regressions are hard to detect.

## In Scope

- document current inputs from `profiles`, `fitSessions`, and `bikes`
- document current output fields in `recommendations`
- define a versioned seed-engine interface
- enumerate current invariants already covered by tests
- list known intentional limitations that v2 will address later

## Out of Scope

- schema changes
- UI changes
- dynamic validation
- feedback learning

## Expected Repo Touchpoints

- `convex/lib/fitAlgorithm/`
- `convex/recommendations/inputMapping.ts`
- `convex/recommendations/mutations.ts`
- `convex/recommendations/actions.ts`
- `convex/recommendations/__tests__/`

## Deliverables

- a written engine contract document in this plan folder or docs
- an explicit internal seed-engine input/output TypeScript contract
- a short list of invariants and comparison fields for shadow mode

## Exit Criteria

- current recommendation generation behavior is documented and versioned
- comparison fields for v1 vs v2 are defined concretely
- contract tests cover the agreed seed-engine interface
- the current known limitation list is recorded instead of being implicit
