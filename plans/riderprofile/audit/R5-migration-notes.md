# R5 legacy observation migration sidecar

Implementation complete; no database migration was executed. No commit, deploy, production access or profile/bike mutations. Parent owns schema, provenance query, current mutation plumbing and release gates.

Final review: parent accepted implementation and integrated legacyRiderObservations into getMyProvenance. Parent reports full Convex validation passing: 77 files / 582 tests. Type-only Doc import moved to the helper header; stale numeric-array proposal removed from the handoff. Manifest: files-R5-migration.txt.

## API

- `internal.profiles.migrateObservations.migrateProfiles`
- `internal.profiles.migrateObservations.migrateBikes`
- Both are internalMutation exports with `{ paginationOpts: paginationOptsValidator, dryRun?: boolean }`. Omitted dryRun means true. Each invocation processes one page only; no self-scheduling.
- Return `{ counts: { documents, candidates, planned, preservedCurrent, invalidValues }, continueCursor, isDone }`. No raw field values, document/user identifiers or log calls. Cursor is the opaque Convex pagination cursor.
- Page size must be a positive integer and is capped at 10, with maximumRowsRead 10 / maximumBytesRead 1,000,000. Each configured candidate uses by_user_field_bike_status with equality on userId, field, bikeId (undefined for rider), and status current, followed by take(1). At most one current observation is read per candidate, regardless of history size or unrelated bikes. Bike geometry may require one direct record lookup per bike. No unbounded collect/filter scan. Existing by_user_field remains unchanged for compatibility.
- Any current observation in the exact user+field+bike scope wins, even when its value differs from the legacy document. Nothing is patched, superseded, deleted or upgraded to measured. Rider observations and distinct bikes cannot shadow each other.
- History saturation cannot skip migration: the exact current index excludes superseded observations and unrelated rider/bike scopes. The former skippedHistoryLimit counter is removed. `isDone` means source pagination finished; review invalidValues before claiming all source values were migrated.
- Planning finishes before any inserts; duplicate scopes within the same page are deduplicated. A dry run and real run against the same initial snapshot produce identical counts/cursors regardless of history size. Concurrent changes between separate invocations can naturally change counts. Reruns preserve existing current observations and insert nothing for completed scopes.

## Pure export for parent provenance query

`legacyRiderObservations(profile: Doc<"profiles">)` from `shared/profileObservationMigration.ts` returns drafts with field/value/unit/kind/method/source (`legacy_migration`)/recordedAt/status (`current`). No ID or userId. Same planner as persisted migration; no IO, writes, clock reads or mutation of input. Parent should prefer persisted provenance and only append appropriate missing-value drafts.

## Evidence and mapping

- Existing scalar rider keys plus painAreas/ridingDisciplines string arrays; canonical dotted currentGeometry/currentSetup/gearing/tires bike fields. Numeric gearing arrays remain numeric arrays. Missing future bike/rider fields create nothing. Age uses unit none to match the parent's registry; standalone ftpMethod is declared.
- Unknown physical measurements are estimated/legacy_unknown. Historical arm = height × .44 and torso = height × .32 are derived/legacy_height_formula (floating-point tolerance 0.000001); shoulder 42 is estimated/legacy_default. This is a conservative classification of possible defaults, not proof of how an old value was entered.
- Preferences and identity values are declared. FTP method is retained; twentyMinute/20-minute/ramp/derived are derived, explicit measured/fitter/video/60-minute/one-hour evidence is measured, unknown methods estimated. Existing current observations always override these guesses.
- Saddle height uses measured only with its explicit BB-center-to-saddle-top point and a valid measuredAt timestamp. Point is retained as method. No measure-point evidence is fabricated.
- Geometry database method requires a linked active manufacturer/admin record with an exactly matching value. Imported geometry stays declared (database) or estimated (other imports), never measured. Source remains legacy_migration; original import quality evidence lives in method, which score/UI consumers can interpret.
- Gearing presets remain estimated and derived gearing remains derived. Inferred bike type and matching activity-inferred goal/style/discipline remain derived.
- Dates prefer field evidence: weightUpdatedAt, ftpMeasuredAt, riderProfileUpdatedAt for riding/comfort, gearing.updatedAt, explicit saddle measuredAt, or activitySummary.syncedAt for matching inferences. Otherwise use document _creationTime. Generic updatedAt and migration time are never substituted for old measurements. UI should label legacy source/save dates honestly, not imply a fresh measurement. A document missing all valid timestamp evidence aborts before writes.
- Nonfinite/invalid-shaped values are counted and skipped; values are never repaired, converted to zero, or inferred into empty fields. Excludes IDs, URLs/photos, free-form notes/injury descriptions, administrative metadata, activity metrics and calculated recommendations. Separate wheelset/tireSetup tables are outside this two-table migration.

## Validation

- 21 migration contract cases cover internal-only access, default dry-run zero writes, count parity, idempotency, existing observation kinds, exact indexed bike/user/current scope, timestamps, formula/default evidence, pure virtual export parity, arrays, signed values, imports, explicit measurement points, inference, pagination, extensive superseded/unrelated current history, duplicates, invalid values and count-only responses. All 21 pass after the exact-index change; scoped ESLint passes.
- `npx vitest run convex/profiles shared/profileScore`: 188 tests passed in 6 files.
- Scoped ESLint for migration, helper and contract tests passed. `git diff --check` passed.
- Full typecheck and lint attempted: no errors reference owned migration files. Typecheck is blocked by concurrent public calculator imports/layout changes; lint stops on 5 public-calculator effect errors. Evidence: R5-migration-types.log / R5-migration-lint.log in this audit directory. Parent retains combined integration gates.

Field proposal/export handoff: ../messages/R5-migration-field-proposal.md.
