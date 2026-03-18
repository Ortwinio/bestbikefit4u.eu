# Step 01 — Engine V2 Default Cutover

## Objective

Complete phase 10 of `plans/engine-v2-migration/` — make Engine v2 the default recommendation path for all new fit sessions. This is the prerequisite for the report upgrade because the new report depends on v2 outputs (confidence ranges, rationale, adjustment order, feasibility flags).

## Background

Read `plans/engine-v2-migration/10-default-cutover.md` and `plans/engine-v2-migration/output-09-feedback-loop-beta.md` for context.

Shadow mode ran in phases 06. The v2 envelope (confidence, rationale, feasibility) was implemented in phase 05. Phases 01–09 are complete.

## Preconditions to verify before flipping the default

1. **Shadow mode results** — Read `plans/engine-v2-migration/output-06-shadow-mode-and-calibration.md`. Confirm shadow deltas are within acceptable tolerances for saddle height, setback, and reach.
2. **Backfill status** — Confirm existing sessions/recommendations are readable under both v1 and v2 shapes.
3. **Rollback switch** — Identify where the feature flag / engine version selector is. Confirm it can be reverted without a code deploy (env var or Convex field).

## Tasks

1. Read `convex/lib/fitAlgorithm/` and `convex/recommendations/` to understand the current engine version selector.
2. Flip the default engine version to v2 — this may be a feature flag in code, an environment variable, or a Convex config field.
3. Confirm legacy sessions remain readable — run existing tests.
4. Add or verify a rollback mechanism (document the exact step to revert in `output-01-engine-v2-cutover.md`).
5. Confirm the current dashboard results route and current PDF route still work against legacy recommendation data after the cutover change.
6. Run targeted validation first: `npm run typecheck`, `npm run lint`, and the recommendation/session contract tests most affected by the cutover.
7. Run `npm test` only if the cutover touched shared generation flow broadly enough to justify the full suite.

## Exit Criteria

- New fit sessions use v2 recommendation engine by default
- Legacy session data is still readable and the legacy path is accessible via rollback flag
- All quality gates pass

## Output

Write `output-01-engine-v2-cutover.md`:
- Engine version selector location and what was changed
- Shadow mode delta summary (from phase 06 output)
- Rollback procedure
- Validation run summary, including which checks were targeted vs. full-suite
