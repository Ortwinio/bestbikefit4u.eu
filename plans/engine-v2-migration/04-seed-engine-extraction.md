# 04 — Seed Engine Extraction

## Objective

Refactor the current recommendation math into a reusable seed-engine module that both legacy and v2 generation paths can call.

## In Scope

- isolate the deterministic calculation entrypoint
- isolate input mapping from persistence concerns
- return a stable intermediate seed result before v2 overlays
- keep existing outputs unchanged for the legacy path

## Why This Matters

Engine v2 should wrap the current engine, not replace it blindly. This phase reduces migration risk and makes shadow runs credible.

## Expected Repo Touchpoints

- `convex/lib/fitAlgorithm/`
- `convex/recommendations/inputMapping.ts`
- `convex/recommendations/actions.ts`
- `convex/recommendations/internalMutations.ts`

## Deliverables

- explicit seed-engine module
- legacy generation path migrated to the extracted seed-engine
- tests proving output parity with the pre-refactor implementation

## Exit Criteria

- the legacy recommendation path still produces equivalent outputs
- the new seed-engine can be called independently from the full mutation flow
- parity tests exist for representative rider and bike cases
