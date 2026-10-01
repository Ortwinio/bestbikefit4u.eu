# 45 — Confirmed deletion of a bike and its data

## Implementation

- Garage rows, bike detail and edit use one NL/EN confirmation dialog. It lists the settings, photos, passport/public code, ride history/feedback and the exact number of fit sessions with advice/PDF reports. Session preview is paginated; confirmation remains disabled until every page has loaded and the typed name matches exactly.
- `bikes.remove` retains `requireBikeOwner` and requires an exact server-side `confirmName`. It atomically deletes the bike row and schedules cleanup. Lists/dashboard/public passport and fit-code lookups immediately lose the bike; no schema/deletedAt change is necessary.
- Internal cleanup progresses in bounded, scheduled transactions. Large indexed child collections use 25-row pages with a 1 MB read target; non-indexed relationships use cursor pagination. Photos are processed individually with shared-reference checks. A session is removed before its children, preventing ordinary session-owner mutations from creating new data during cleanup.
- Deleted records: bike settings/geometry/gearing/public snapshot on the bike itself; bike profiles; wheelsets/tire setups; pressure profiles/calculations; gearing and saddle-width sessions; bike-linked calculator states; bike activities; the bike's import record; photos and unreferenced storage; fit sessions; questionnaire responses; recommendations; shadow comparisons; validation captures; ride feedback; email reports; fit-pass purchase rows; per-session report rate limits; session-specific lifecycle email logs.
- Legacy sessions linked only through a bike profile are counted and cleaned too. Bike-linked advice/validation/feedback is cleaned even if its session is already absent.
- Shared feedback discussions remain, with their deleted bike/session links removed. Other imports' duplicate-bike links and other bike profiles' legacy-session links are cleared without deleting those records. Other bikes/users, rider profiles, integrations, shared catalog geometry and shared photos/profile images remain.
- Bike-dependent subscriptions pause before deletion. Detail/edit snapshots retain the dialog while nested pressure/history subscriptions unmount; errors restore subscriptions. The edit form only queries shared geometry and stays mounted to preserve unsaved fields after a failed deletion. Success keeps bike subscriptions paused until the localized garage redirect and toast.
- Lead approved the additional late-write guards in `storeShadowComparison` and `logEmailSent`. Missing or mismatched sessions cannot recreate deleted records. `storeResult` already rolls back atomically if its final session patch fails.
- Lead also approved `getDetail` returning null for an absent bike, retaining authentication/ownership checks. Its description-action consumer gets the required null guard; no other description behavior changes.

## Data boundaries

PDFs are generated from recommendation data; the schema has no stored PDF file references. Deleting recommendations/sessions removes future report access. Previously downloaded PDFs, already delivered email attachments and external payment-provider records cannot be recalled by this local database operation. External legacy image URLs are not sent to Convex storage deletion.

## Validation

- `npx vitest run convex/bikes/__tests__ src/components/bikes --maxWorkers=1 --testTimeout=15000`: **69 tests / 15 files PASS**. Earlier overlapping runs hit resource-contention timeouts in existing geometry/form tests; the serial final run completes in 6.53 seconds.
- Cascade coverage exercises every related table, more than one page, exact-name/owner rejection, legacy sessions, preserved other bikes/users/shared data, missing-bike detail, and late-write guards.
- UI tests cover NL/EN scope/count/name gate, loading pagination, zero sessions, localized errors, pending query/count behavior, callbacks, duplicate submissions, Escape and focus return.
- `npm run typecheck`: **PASS** after the approved missing-bike consumer guards.
- `npm run test:contracts`: **123 tests / 33 files PASS**, including the late-write regression tests.
- Browser captures/interaction checks: **8/8 PASS** (NL/EN × 1440/390 × light/dark), zero console/page errors. Proof: `audit/45-browser.json`; screenshots: `code-renders/45-{nl,en}-{light,dark}-{1440,390}.png`. Verified exact-name gate, count, Tab trap, Escape/focus return, 44px targets, no overflow, error/retry and localized garage redirect. Actual UI/shared primitives/current styles with an authenticated Convex fixture, not a live-account destructive test. Dark mobile and light desktop visually inspected.
- `npm run lint`: **PASS**, including tooltip coverage, 254 contrast pairs and 19 CSS Modules with zero raw colors. One unrelated unused-import warning in `tests/visual/guides-audit/audit.mjs` remains. Lead approved the one-line tooltip registration for the visibly labeled name-confirmation field.

## Handoff

Exact changed-file manifest: `audit/files-45.txt` (no PNG files). No commit, push, backend deploy or real bike deletion was performed. The shared README, generated API declaration and tooltip-check script have edits by other agents: stage only this task's additions there (or integrate the coordinated related changes together).

Integration dependency: another agent added `calculatorStates` to the working schema during this task. The cleanup includes that table, but this task does not own or list the schema/validator edits. Include that schema addition before deploying task 45; unbound user calculator states are preserved.
