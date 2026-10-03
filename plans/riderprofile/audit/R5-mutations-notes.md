# R5 mutation-side handoff

Status: DONE R5-mutations. Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-rider`.

## Exact source ownership

The source-only manifest is `files-R5-mutations.txt` in this directory:

- `convex/profiles/mutations.ts` — integrates provenance into existing saves and re-exports `saveObservation`.
- `convex/profiles/preferences.test.ts` — adapts the existing fake database for provenance queries/inserts.
- `convex/profiles/mutations.provenance.test.ts` — new mutation integration/regression tests using the real parent-owned helper.

Only these three source/test files belong to this sidecar. The mutations file already contained the parent's shared range import and handoff re-export; those pre-existing changes were preserved. This note and the manifest are the two handoff artifacts authored for this sidecar.

## Delivered behavior

- All six existing save paths (`upsert`, `updateMeasurements`, `updateAssessment`, `updateRiderProfile`, `updatePreferences`, `updateComfort`) use `requireUserId` and await `recordProfileObservations` before the profile write in the same Convex mutation transaction.
- Only defined, actually changed values are passed to the helper. Ordinary multi-field saves do not restamp unchanged legacy values or relabel old defaults as new measurements. The parent's helper now independently skips unchanged values even without an existing observation; caller filtering remains compatible.
- Changed supported values receive the helper's default kind: body/weight measurements measured, assessments estimated, choices declared. Existing current observations are superseded through the helper.
- Upsert no longer invents arm length, torso length, or shoulder width. Omitted optional values preserve existing fields and are absent on new profiles. No calculated dimensions can silently replace measured dimensions.
- Omitted optional rider/comfort details are preserved instead of deleting a current value while leaving its observation current. Omitted values also do not trigger false rider-profile staleness updates.
- Existing mutation argument validators and return shapes remain intact. `saveObservation` is re-exported from `./provenance`; its implementation and tests remain parent-owned.

## Verification evidence

Sidecar verification completed before this final documentation request:

```sh
npm test -- convex/profiles/mutations.provenance.test.ts convex/profiles/preferences.test.ts
```

Result: **37 tests passed across two files** (35 new mutation provenance tests, two existing preference tests). Tests use fake `ctx` and registered mutations' `_handler`, with the real provenance helper. Coverage includes each save path, superseding stale observations, correct kinds, repeated unchanged saves, unchanged legacy values without observations, mixed changed/unchanged upserts, absent and preserved measurements, optional pain details, validation before writes, authentication, cross-user isolation, and propagation of observation-write failure before the profile patch.

```sh
npx eslint convex/profiles/mutations.ts convex/profiles/mutations.provenance.test.ts convex/profiles/preferences.test.ts
git diff --check -- convex/profiles/mutations.ts convex/profiles/preferences.test.ts
```

Both passed. The earlier sidecar `npm run typecheck` and `npm run lint` attempts reported only concurrent R1 public-calculator/import/layout issues, with no owned-file diagnostics. Those were integration gates, not mutation-side failures.

Latest parent-reported integration status: **583 tests pass; all backend checks have no errors**. This is the parent's result, not a new full-suite execution by this sidecar. The parent fixed six integration test failures caused by missing `filter.and` in the `tests/e2e/convex-communication` fake context. That harness was not edited by this sidecar. No checks were rerun solely for this documentation update.

## Fake-context requirements

Tests importing profile mutations now need observation-table support in addition to profiles:

- `query(...).withIndex(...)` with chainable index `eq` calls.
- `filter(...)` with expression `field`, `eq`, and `and`, followed by `collect()`; profile queries also need `unique()`.
- `insert` for observations and `patch` for superseding observations and updating profiles.
- Profile snapshots when reading, so mutating stored rows does not mutate the helper's previous-value snapshot.

The new integration fixture supports these operations; the existing preference fixture uses an empty observation collection sufficient for its scope. Parent-owned helper unit tests, schema, UI, shared score, migration, and communication harness remain outside this manifest.

No commits, deployment, dependency changes, or additional product-code changes during final documentation.
