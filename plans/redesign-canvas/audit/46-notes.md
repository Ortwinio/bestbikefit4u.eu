# 46 — Retire the listing import

## Changes

- Garage and new-bike chooser offer manual entry and passport import only. The old import route calls Next's real `permanentRedirect` with `/nl/bikes/new` or `/en/bikes/new`; regression tests assert the actual 308 redirect digest for both locales.
- Removed the listing import flow, UI helpers, parser/normalizer, fixtures, image proxy, external fetch helper and dedicated Convex modules. All `convex/bikeImports` functions were exclusive to this retired flow; the passport flow lives separately in `convex/bikes` and remains.
- Removed the backend import-writing path and its now-unused function arguments. Existing legacy source enum values still validate, so older imported bikes remain editable/displayable and copyable via passport.
- Schema tables/fields and data are retained unchanged, apart from four requested legacy comments. Concurrent calculator-state/gearing schema additions belong to their owners and must not be attributed to this task.
- Frozen `messages/en.ts` and `nl.ts` contain deletions only (127 and 135 lines respectively). Passport description strings now live in `src/i18n/account/bikePassport.ts`; its field keeps a localized accessible name.
- Removed the old flow from sweep/dark fixtures and tooltip coverage. The inventory test validates 69 active original routes plus the concurrently added account tools, with no duplicates. Historical language-audit notes remain honest about retired-flow snapshots without retaining a live route.
- Task 45 deletion changes and all other agents' changes are preserved.

## Validation

- `rg -n -i marktplaats src convex tests scripts`: only six lines of legacy schema comments/literals. The redirect remains at its old pathname; its source has no import-flow dependency.
- Frontend focused tests: **10 PASS** (NL/EN real permanent redirect, two-option chooser, passport preview/edit/import and existing passport helpers).
- Convex contracts: **115 tests / 30 files PASS**. Bike tests: **28 tests / 6 files PASS**, including passport copying/reusing a bike with the legacy imported source without altering that source.
- Sweep inventory tests: **2 PASS**.
- `npm run lint`, `npm run typecheck` and `npm run build:vercel`: **PASS**.
- Full unit suite: **1,549 passed, 20 skipped, 2 failed**; 255 files passed, 1 skipped, 2 failed. Concurrent-owner failures: D's in-progress `BikeForm.tsx:299` autosave cast caused a parse error in its test suite; B's two sidebar tests use an incomplete messages mock for the updated AccountPlan. Owners notified; not changed by this removal task.
- Filtered sweep: `--filter=/bikes,/bikes/new,/bikes/import --output=plans/redesign-canvas/final-sweep/46 --port=4346 --workers=2`. First isolated build lacked sandbox font access; the approved retry reached D's concurrent BikeForm syntax error and stopped before browser capture. Evidence: `final-sweep/46/build.log`. **Blocked, not passed.** Lead explicitly accepted deferring the combined sweep until D finishes 41c; no source rollback or fixture-only repair was made.

## Handoff

Exact manifest: `audit/files-46.txt`, including deleted files and no PNGs. No commit, push, deployment or database-data deletion. Several files overlap task 45 or other owners' pending work (`schema.ts`, generated API, bike routes, passport flow, README and sweep tooling); integrate only the relevant hunks or their coordinated prerequisite changes.
