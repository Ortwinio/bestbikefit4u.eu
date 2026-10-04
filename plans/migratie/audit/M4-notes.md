# M4 — complete Strava retirement

## Scope and safety

Work exclusively in `/Users/ortwinverreck/Developer/bestbikefit4u-migratie`, branch `migratie/bikefitboost`.
All Git commands used that explicit `git -C` path. Lead's M4 decision supersedes earlier Strava portions
of M1/M2. A was notified before edits to `src/proxy.ts`, `convex/crons.ts` and `convex/http.ts`.
Three disjoint workers removed backend integration, settings/layout/i18n, and admin/messages UI/runtime.
Parent owns credential cleanup, proxy/Next callback retirement, generated API types, docs and integration.

No commits, deployments, production reads/writes, provider calls, real environment changes, mails or
dependency changes. `.env.example` is a documentation template only. Cleanup has NEVER been invoked
against a deployment. Tests invoke `_handler` with fake ctx/db and mocked identity, not Convex services.

## Removed

- All six integration modules, their token/refresh/import/sync/action/query/mutation APIs and exclusively
  integration tests (including M1's not-yet-committed origin test).
- Next `/api/strava/callback` route/test, Convex `/strava/callback` handler, its middleware exception,
  and both Strava cron jobs. Google OAuth, localhost-dev and ordinary Convex auth remain unchanged.
  The five email cron definitions retain their exact original handlers/schedules/arguments.
- Settings connection/photo/import/sync UI, all associated state/API calls, disconnect dialog, shell
  auto-import trigger/storage logic, dictionaries and visual fixtures. No replacement placeholder.
- Admin overview/user connection metrics and data reads, demo connection data, audience options,
  release-action and feedback feature copy. Legacy bike-source display is neutral Imported/Geïmporteerd.
- Bike creation/import-only provider fields. Existing legacy bikes remain readable and editable, tested
  with source/gear/sync metadata intact, including ordinary type confirmation and autosave.
- Activity-summary inference in new bike descriptions: no old ride-summary input enters the fallback
  text or AI prompt. Ordinary declared bike facts remain.
- STRAVA_* template entries and obsolete PRODUCT/Google rollout instructions. Historical M2 audits have
  explicit supersession notices rather than falsified prior evidence.

## Intentional legacy compatibility

`convex/schema.ts` is byte-unchanged. Existing integration, activity, user/photo-source, bike provenance
fields and union literals remain valid. The minimal offline `_generated/api.d.ts` update removes deleted
module registrations and adds the internal cleanup export while preserving C's migration registration;
no Convex codegen/deploy/network command ran.

Remaining provider-name literals are narrowly bounded:

- Stored-schema/auth/bike-source compatibility and neutral translation-map keys, not live connectivity.
- Shared legacy observation migration and reliability classification retain `strava_import` provenance.
  These do not fetch connections/rides or introduce new measurements: they prevent old imported/derived
  values from being promoted to measured confidence. Existing score/advice tests pass without integration
  modules. No live integration or activity-table input exists in profile scoring/advice queries.
- Account deletion still removes a user's legacy connection rows: retaining this prevents orphaned
  credentials while the optional cleanup has not yet been authorized.
- Persisted `strava_connected` message targets make the **whole** message inactive, including mixed
  `all` targeting. Estimated reach is zero, receipts reject, composer shows a neutral inactive rule;
  no conversion to a broad audience and no stored message rewrite occurs.
- Removal tests, cleanup/runbook and historical audit evidence.

No source-authored user-facing Strava copy remains in the scanned src dictionaries/components. Privacy
content contains no such line; no new legal text was invented. Arbitrary historical/user-authored database
content was not inspected or rewritten. Existing generated low-use reminders are historical records;
their producer is removed, not reimplemented under another label.

## Dry-run-first cleanup

`convex/migrations/retireStrava.ts:clearConnections` is internal and additionally requires a current
authenticated `super_admin` identity. Defaults count-only, bounds pages1–100 and read caps, preserves
cursors and emits aggregate counts only. Writes require `dryRun:false` plus explicit
`CLEAR_STRAVA_CONNECTIONS` confirmation. It deletes only matching integration connection documents,
not bikes/activities/profiles/observations/auth/users/messages/audits. Existing activity integration IDs
remain historical references; no remaining runtime dereferences them.

`M4-cleanup-runbook.md` specifies owner backup, all-page count/review, separately authorized write pass,
verification, queued-job review and deletion of the provider API app afterwards. Local token deletion
does not itself revoke provider credentials. No cleanup or provider action was executed.

## Validation

| Gate | Result |
| --- | --- |
| Backend worker removal/bikes contracts | 52 tests / 9 files PASS |
| Settings/layout/dictionary focused tests | 25 PASS; scoped lint PASS |
| Admin/messages/i18n and language tests | 35 Vitest + 7 Node tests PASS; scoped lint PASS |
| Parent cleanup/Google auth/description/profile-score/legacy migration focus | 176 tests / 8 files PASS |
| Full unit suite | 3,079 tests PASS; 20 existing skips; 385 passing files + 1 skipped; 51.51s |
| Full contracts | 556 tests / 50 files PASS |
| Full lint | PASS, including brand guard, contrast, CSS tokens and image checks |
| Standalone Convex tsc | PASS after two test-only type corrections |
| Frontend typecheck | PASS on A's final regenerated build; stale pre-M4 types superseded |
| Production build | PASS on final M1–M4 sources, build `-9rVbWuZgW5CDu7Uy3-cW` |
| Local crawl | PASS on final shared build: 875 checks, zero findings |
| M3 migration checker | PASS on final shared build: 228 distinct paths, 684 single-301 redirects, 170 HTML pages, all 48 guide JPEGs; zero findings |

The test-only corrections were typed fake connection rows and a cast for the cron export inspection
method (runtime method exists but is not in the public interface). No checks disabled or exclusions
changed. Logs: `/private/tmp/m4-{unit,contracts,lint,convex-final,typecheck-final,parent-tests}.log`.
Schema unchanged verified with scoped Git diff; remaining references reviewed and categorized above.

A confirmed the complete post-M4 source gates and build in `messages/A-final-build-ready.md`.
Build process used the apex origin and loopback-only Convex endpoints. Evidence:
`/tmp/M1-final-{build,typecheck,unit,contracts,lint,convex-tsc}.log`. No competing `.next` writes by B.

Final post-M4 runtime evidence: `plans/seo-crawl-fixes/audit/crawl-m1-final-apex.md` and `.json`,
`audit/domain-migration-local.md` and `.json`, and `messages/C-final-checker-pass.md`.
The crawl reports `passed:true`, 875 pages and no findings; the migration checker verifies canonical,
OG, hreflang, robots, sitemap, mixed resources and guide images. Both use the same final build.
M4 is complete for owner review. Cleanup, provider app deletion, deployment and production acceptance
remain owner-only release actions; none was performed here.

Evidence by worker: `M4-backend.md`, `M4-settings-ui.md`, `M4-admin-messages.md`; exact union of
M4-owned changed/deleted paths: `files-M4.txt`. Generated renders/build caches are not source changes.
