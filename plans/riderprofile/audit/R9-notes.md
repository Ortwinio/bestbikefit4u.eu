# R9 — observation-backed advice and recalculation

Only bestbikefit4u-rider; no commit, deploy, migration or Convex dev command.
Three disjoint A subagents implemented query/staleness, outcome provenance and recalculation.
A integrated schema extensions, existing test fixtures, ownership checks and final gates.

## Contract and behaviour

- Shared `isStale` compares actual consumed values and observation IDs in exact rider/bike/record scope.
  Legacy outcomes without snapshots are explicitly unknown, never falsely verified current.
  Unrelated inputs do not invalidate advice; changed values, replaced observations and deleted inputs do.
- Optional inputProvenance on the five outcome sources and fitSessions preserves existing documents.
  New writers capture matching canonical values only: calculation-only overrides are not attributed
  to a rider measurement. No invented observation IDs or measured evidence. Snapshot passes unchanged
  through the scheduled fit engine and result storage; deleted sessions cannot recreate advice.
- R4 session snapshots remain immutable. Fit generation preserves their original observation IDs;
  recalculation creates a fresh session rather than rewriting the historical report.
- Pressure dependencies include linked tire/wheel identity, with ownership checked through the bike.
  Only actual used widths, rim/tube/casing and limits are tracked, not unrelated wheel data.
- Authenticated listAdviceGroups returns seven stable groups from recommendations, saddleWidthSessions,
  gearingSessions, pressureCalculations and calculatorStates. Foreign/orphan bikes and anonymous public
  sessions are excluded. Optional bike filtering enforces ownership before reading results.
- Numeric differences/ranges are honest and nullable. Frame sizes retain the exact engine string.
  Saved calculator inputs are not fabricated outcomes: without adviceOutput they need calculation.
  Engine confidence is labelled separately from measured-input quality; unknown remains unknown.
  Max three improvement suggestions per group. Applied/waiting states are not invented without records.
- recalculateAll uses existing engines and current owned rider/bike values with saved scenario settings.
  Returns per-record updated/pending/skipped/failed and stable reason codes. Missing required inputs
  preserve old results. Fit clones retain valid bike-profile context and questionnaire answers; failure
  cleans up the replacement. Existing processing fits are skipped; old reports remain available.
  Bulk regeneration suppresses recap emails, normal report generation is unchanged.
- No new user-facing text or visual changes. B owns R8 UI, localized reason copy and RP7 renders.
  API contracts and integration handoff are in messages/A-to-B-R9-query-contract.md and
  messages/A-to-BC-R9-final-integration.md.

## Validation

- Focused Vitest: 156 tests across 20 files pass (/tmp/R9-owned-tests.log).
  Covers scope/ownership, exact observation identity, legacy handling, immutable session provenance,
  absent/added/deleted linked tire limits, all eight saved-state engines, pending fits, cleanup,
  bike-profile context, deleted-session guards and suppressed bulk email.
- Full npm run typecheck passes on final rerun (/tmp/R9-types-final.log). Earlier C chain errors resolved.
- Full npm run lint passes: ESLint, runtime boundaries, tooltips, contrast, CSS tokens and image weight
  (/tmp/R9-lint-final.log).
- Broader convex/shared run: 897 pass, six fail in tests/e2e/convex-communication.e2e.test.ts
  (/tmp/R9-tests-final.log). All six fixtures omit source timestamps now required by C's R4
  captureSessionProfile. Owner notified; do not weaken production provenance to accommodate mocks.
  No failing R9-owned tests. Shared E2E fix remains for the combined integration gate.
- No R9 renders: backend-only task; R6 render coverage is in R6-notes.md and B owns R8/RP7 rendering.
- Worktree-wide diff check reports a pre-existing concurrent blank EOF in C's sessions/calculatorInputs.ts;
  no R9-owned whitespace diagnostic. No edits to that production file.

## Ownership boundary

files-R9.txt lists A's exact touched paths, not the worktree-wide diff. Shared schema edits attributed
to R9 are only optional inputProvenance on six tables and calculatorStates.adviceOutput. C owns session
snapshot production files and calculator-chain changes; B owns dashboard and profile/advice UI.
No PNG files in the manifest. No additional scoring freshness policy or guessed demographic estimates.
