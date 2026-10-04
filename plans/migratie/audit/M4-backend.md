# M4 backend removal

Status: complete. Backend scope only; parent/A own combined gates.

## Immediate external-reference handoff

The integration directory is exclusively Strava and will be removed, including M1's Strava-only origin test. Other agents must remove these callers:

- `src/app/(dashboard)/settings/page.tsx`: getStravaStatus, initiateStravaConnect, disconnectStravaAction.
- `src/components/settings/StravaBikeImportSection.tsx`: getStravaBikeOverview, importBikesFromStrava, syncStravaActivities.
- `src/components/integrations/StravaAutoImportTrigger.tsx`: getStravaStatus, syncMissingStravaBikes.
- Visual runtime fixtures under `tests/visual/{account-batch1,account-batch2,account-batch4,account-dark-c,final-sweep}` contain integration query keys.
- `convex/_generated/api.d.ts` initially imported the deleted modules; parent owns the offline minimal registration update preserving the M3 migration registration. This worker did not edit generated files.

Schema, stored data, admin/messages/profiles/users/auth and credential cleanup mutation are outside this worker's scope.

## Implementation

- Deleted all six Strava integration modules and all four exclusively Strava tests, including A's new origin test (untracked before removal).
- Removed both Strava scheduled jobs; retained all five email jobs with identical names, schedules, handlers and arguments.
- Removed the Convex Strava callback and its exclusive imports; retained auth registration, both unsubscribe methods and the Stripe webhook unchanged.
- Removed the unused bike source validator and Strava creation/import-only input fields and writes from `createBikeWithProfiles`. Ordinary bike updates still accept legacy `strava_frame_type` provenance; no source-based edit restriction or data rewrite was introduced.
- Added a registration/removal contract and a legacy imported-bike read/edit regression case. The router test mocks auth registration to avoid loading providers; it proves delegation to auth remains, not provider login behavior.

## Verification

- `./node_modules/.bin/vitest run convex/__tests__/stravaRemoval.contract.test.ts convex/bikes/__tests__`: 9 files, 52 tests passed.
- Contracts assert absence of integration TypeScript modules, no integration reference in HTTP/crons, no callback route, exact remaining HTTP registration, and all five exact email schedules.
- Legacy imported bikes remain readable/editable, preserve source/gear/sync metadata, and can confirm their bike type normally. All existing bike contract/unit tests pass.
- `git -C /Users/ortwinverreck/Developer/bestbikefit4u-migratie diff --exit-code -- convex/schema.ts`: unchanged.
- Final external-reference scan found no remaining integration runtime calls outside generated files; concurrent UI agents had removed the initial callers. The initial list above is retained as handoff evidence.
- No build, full gate, commit, deploy, production access, environment change, mail send or data mutation performed.

Parent retains credential cleanup, generated API registration, Next callback/proxy and documentation/template edits; parent also owns removal of activity summary inputs in bike actions/description. Existing account-deletion cleanup and schema/auth provenance compatibility remain intentional.
