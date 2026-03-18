# 02 — Schema Foundation and Compatibility

## Objective

Introduce additive schema support for Engine v2 without breaking existing reads, writes, or recommendation rendering.

## In Scope

- add first-class bike profile storage
- add engine version markers on fit sessions and recommendations
- add optional recommendation envelope fields for ranges, confidence, feasibility, rationale, and change order
- add migration marker fields for legacy imports and backfills
- define indexes needed for bike profile and session lookups

## Compatibility Rules

- existing `fitSessions -> recommendations` lookups must continue to work
- current dashboard pages must not require bike profiles on day one
- legacy records must remain readable without backfill completion
- schema changes should be additive first, destructive never in this phase

## Expected Repo Touchpoints

- `convex/schema.ts`
- `convex/recommendations/queries.ts`
- `convex/sessions/queries.ts`
- any generated Convex types affected by schema changes

## Deliverables

- additive schema update
- compatibility query strategy
- migration notes for legacy rows

## Exit Criteria

- schema deploys cleanly
- existing session and recommendation queries still succeed
- new fields are optional where required for backwards compatibility
- indexes exist for the new access patterns
