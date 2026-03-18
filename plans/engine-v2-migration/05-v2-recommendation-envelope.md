# 05 — V2 Recommendation Envelope

## Objective

Add the richer v2 recommendation model around the seed result while preserving compatibility with the current result screen.

## In Scope

- define recommendation items with target, range, confidence, feasibility, method, why, risk flags, and change order
- map existing fit outputs into that envelope
- preserve legacy top-level fields until UI cutover is complete
- define how hardware-feasibility notes are represented

## Expected Repo Touchpoints

- `convex/recommendations/mutations.ts`
- `convex/recommendations/actions.ts`
- `convex/recommendations/queries.ts`
- result-page consumers under `src/app/(dashboard)/fit/[sessionId]/results/`

## Deliverables

- versioned recommendation schema
- server mapping from seed output to v2 envelope
- compatibility query layer for current UI consumers

## Exit Criteria

- recommendations expose both legacy and v2-compatible data during transition
- confidence and range semantics are documented
- no current results page breaks while new fields are introduced
