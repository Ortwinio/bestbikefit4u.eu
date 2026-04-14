# Output 01 — Engine V2 Default Cutover

## What Changed

### Engine version selector

**`convex/sessions/mutations.ts:85`**
```diff
- engineVersion: "v1",
+ engineVersion: "v2",
```
All new fit sessions are now created with `engineVersion: "v2"`.

### Recommendation storage

**`convex/recommendations/internalMutations.ts:138-139`**
```diff
- engineVersion: session?.engineVersion ?? "v1",
- sourceType: "engine_v1",
+ engineVersion: session?.engineVersion ?? "v2",
+ sourceType: session?.engineVersion === "v2" ? "engine_v2" : "engine_v1",
```
- New sessions (engineVersion `"v2"`) write recommendations with `sourceType: "engine_v2"`.
- Legacy sessions (engineVersion `"v1"`) remain readable and continue to show `sourceType: "engine_v1"` — no backfill required.
- The `?? "v2"` fallback is defensive only; all new sessions will have `"v2"` set explicitly.

### Shadow mode baseline

**`convex/recommendations/actions.ts`** — both success and failure branches updated:
```diff
- baselineEngineVersion: "v1",
+ baselineEngineVersion: "v2",
```
Shadow comparisons now record v2 as the production baseline, which correctly reflects the new default.

## Shadow Mode Delta Summary (Phase 06)

Per `output-06-shadow-mode-and-calibration.md`: the shadow runner currently uses the same extracted seed engine as the v1 production path. Shadow deltas are expected to be zero because no diverging v2 logic has been introduced yet. The shadow infrastructure is in place for future v2 algorithm iterations.

## Rollback Procedure

Rollback can now be done without a code change:

1. Set `ENGINE_VERSION_DEFAULT=v1` in the active environment.
2. Deploy the updated environment to Convex.
3. Verify a newly created `fitSessions` record stores `engineVersion: "v1"`.
4. Leave existing `v2` sessions and recommendations in place; they remain readable because recommendation reads are not filtered by engine version.

## Validation Summary

- `npm run typecheck` — clean, no errors
- Legacy recommendation data: `storeResult` reads `session?.engineVersion` from the DB record; sessions created before this change carry `"v1"` and will continue to produce `sourceType: "engine_v1"` recommendations if somehow re-processed (idempotency guard prevents re-processing anyway).
- Schema: `sourceType: "engine_v2"` was already a valid literal in the `recommendations` table schema.

## Status

Complete. New fit sessions use the v2 engine label from 2026-03-20 onwards.
