# R5 — provenance and Mijn profiel

Lead authorized R5 after accepting R2-owned completion with R1 integration gates deferred.
Only worktree `bestbikefit4u-rider`, branch `feature/riderprofile`; no commits/deploys/database calls.

## Backend

- `profiles.queries.getMyProvenance` returns owner-only current profile and matching evidence.
  Conservative virtual legacy observations fill gaps using the actual migration planner, so old
  height-derived arms/torso do not gain measured quality before migration runs.
- `profiles.mutations.saveObservation` validates field, bounds, enums, kind/method and expected
  current value. Concurrent differences return a conflict with zero writes. Explicit confirmation
  archives prior current evidence, dates new data and records source `profile_edit` atomically.
  One confirmation is never represented as three measurements or a professional measurement.
- Existing profile autosaves/wizard mutations record only changed fields; no fabricated arm,
  torso or shoulder defaults. Derived data cannot replace measured observations.
- Schema source adds `legacy_migration` and `profile_edit`; values support string/numeric arrays.
- Account deletion now removes the owner's current, superseded and bike-scoped observations.
  C has the bike-deletion cascade integration request (bike ownership remains C's).
- Internal paginated migration defaults to dry-run, never schedules itself. No migration was invoked
  against any deployment. Dry-run/write parity, scope isolation and idempotence use in-memory tests.

## Checks so far

- Full Convex suite: **77 files, 584 tests pass** (`/tmp/R5-convex-final.log`).
- Profile, measurements and profile route: **14 files, 121 tests pass** (`/tmp/R5-profile-final.log`).
- E2E fake database now supports compound filter expressions used by provenance; assertions retained.
- Parent-owned provenance/user cleanup/shared field registry/test harness ESLint passes.
- Runtime boundaries, token-only CSS Modules and brand contrast (254/254) pass independently.
- Tooltip coverage awaits C's shared registry updates; R5's ProfileProvenance has actual tooltips,
  and the new path was included in the existing coordinated registration request.
- Full typecheck attempted; remaining output currently belongs to C's paused/in-progress R1.
- Latest full attempts: `/tmp/R5-types-final.log`, `/tmp/R5-lint-full.log` (not green; no R5 type diagnostics).
- Migration current-evidence lookup uses the exact user/field/bike/status index, one row per field,
  so unrelated or long superseded history cannot suppress legitimate migration candidates.

## Profile UI and renders

RP5 now mounts real shared score rings, selectable per-group contributions, every supported field's
value/method/source/date, conservative legacy labels, the privacy/legend/improvement aside and actual
optimistic-concurrency conflicts. Keeping the stored value cancels the draft; accepting incoming
retries against the latest returned current value. Weight changes retain the pressure recalculation
prompt. Existing autosave details and measurement wizard remain accessible without duplicate forms
in the initial view. Unsupported legacy hip circumference is read-only, not given invented bounds.
NL/EN strings live in account/profileProvenance; numeric values use the mono token.

12 real route + account-shell fixture renders: NL/EN × 1440/390 × normal/body-filter/conflict,
`renders/R5-profile-*.png`. No real backend or network transport. All have 2 accessible meters,
no overflow and no browser errors. Parent inspected NL desktop normal and mobile body-filter.
Final regenerated fixture explicitly marks twenty-minute FTP as derived, never measured; parent
also inspected the NL desktop conflict render after this correction.
See R5-ui-notes.md for the test/render harness and intentional score-contract differences from the
board sketch (declared is 60%, not a fictitious 100%; no fake repeated-measurement bonus).
Parent scoped UI ESLint also passes.

## Remaining combined integration gates

Owned source/tests are complete. Full typecheck/lint remain blocked by C's pending R1 public
calculator imports/layout/hooks and shared tooltip registry; no R1-owned files were overwritten.
A's score type/equality follow-up for array values is coordinated. The RP5 adapter safely retains
metadata only after structural current-value matching, without masking incompatible types.
The lead must run the combined gates after R1 and coordinate bike-cascade/score consumers.
No production migration, deployment, commit, or dependency changes.

## Coordination

`messages/B-R5-contract.md` is the backend/UI contract. A owns score array equality and migrated
geometry-source interpretation; C owns shared public calculator components, guard registrations,
live calculator/bike writes. Cross-owner requests are in `messages/B-to-A-C-R5-integration.md`.
