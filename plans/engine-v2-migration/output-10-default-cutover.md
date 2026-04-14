# Output 10 — Default V2 Cutover

## Purpose

Complete the Engine v2 migration by making the default engine version configurable, keeping v2 as the default, and documenting the rollback and monitoring path.

## What Landed

- new-session default engine selection now reads `ENGINE_VERSION_DEFAULT`
- the default remains `v2` when the env var is absent or invalid
- setting `ENGINE_VERSION_DEFAULT=v1` rolls new fit-session creation back to the legacy path without a code change
- recommendation storage now derives `engineVersion` and `sourceType` from the persisted session version instead of assuming `v2`
- shadow comparisons now record the actual baseline engine version used by the session
- `.env.example` documents the new cutover switch

## Rollback Procedure

1. Set `ENGINE_VERSION_DEFAULT=v1` in the active environment.
2. Deploy the updated environment to Convex.
3. Verify a newly created `fitSessions` record stores `engineVersion: "v1"`.
4. Keep historical `v2` sessions and recommendations in place; existing reads remain backward compatible.

## Monitoring Surface

- admin fit-run queries already expose `engineVersionId`, recommendation snapshots, confidence, and warnings
- recommendation shadow comparisons remain queryable per session
- legacy recommendations remain readable because reads are not filtered to `v2` only

## Validation

- `npm run typecheck` passed
- targeted contract and integration tests passed:
  - default session creation on `v2`
  - rollback to `v1` via `ENGINE_VERSION_DEFAULT`
  - propagation of the active baseline engine version into shadow comparison scheduling

Manual dashboard validation was not rerun in this output file and should still be handled as part of release QA when needed.
