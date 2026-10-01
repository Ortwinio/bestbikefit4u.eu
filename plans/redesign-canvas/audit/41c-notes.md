# 41c — Bike autosave audit and implementation

Initial audit: 2026-09-30. Lead subsequently confirmed DONE 41a and A’s completed task 45.
Implementation follows below; the inventory records the before state, so its old references are historical.

## Inventory and intended treatment

| Surface / source | Current behavior | Proposed contract application |
| --- | --- | --- |
| `src/app/(dashboard)/bikes/page.tsx:25`, `src/components/bikes/BikeGarageOverview.tsx:1` | Garage is an overview; passport-ID maintenance runs automatically. | No simple-value editor here to convert. Leave A's garage deletion work alone. |
| `src/app/(dashboard)/bikes/[bikeId]/page.tsx:174` | Header links to a separate edit page; geometry and setup are read-only summaries. | Expose existing-bike values directly in bike detail sections, using shared editor blocks; remove the edit-mode CTA. Preserve the old route as an accessible entry to those same editors rather than duplicate state. |
| `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx:38` | One update submits the entire bike and redirects to the garage at line 56. | Existing-bike saves must remain on the page. Send scoped block payloads, with bike identity captured for pending requests. Do not touch this file's delete path until A finishes task 45. |
| `src/components/bikes/BikeForm.tsx:147` | Local state for identity, geometry, setup, gearing and notes; global submit at line 217 and save button at line 697. | Always-editable blocks: identity/riding preferences, geometry, position, gearing, notes. Text waits 800 ms plus blur; sliders/options commit on release or 500 ms. Use one status and serial save queue per coherent block. Preserve untouched and missing values. |
| `src/components/bikes/BikeGeometryLibraryFields.tsx:1`, `src/components/bikes/bikeFormGeometry.ts:1` | Geometry-library selection updates local identity state; saved with the full form. | Keep brand/model/record/size changes atomic. Save selected geometry only once its related state is coherent; preserve manual fallback and linked-record behavior. |
| `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx:178` | Geometry action and superseded banner link to edit route. | Point to the always-editable geometry section; do not imply an edit mode. Read-only provenance and superseded-record warnings remain. |
| `src/app/(dashboard)/bikes/[bikeId]/BikeGearingCard.tsx:80` | Summary includes an explicit edit link. | Link to or expose the gearing editor directly. Keep calculator navigation; this is bike gearing, not C's account gearing-session upsert. |
| `src/components/bikes/BikeNotesEditor.tsx:19` | Edit mode, manual save at line 31, save/cancel buttons at lines 79/82; incoming props overwrite local state at line 25. | Always show the textarea; 800 ms/blur autosave and inline status/retry. Preserve the 500-character limit. Do not let query echoes overwrite dirty input. |
| `src/components/bikes/BikeDescriptionEditor.tsx:28` | Edit mode, manual save at line 54, generation action, buttons at lines 145/151; query sync at line 33. | Always show editable text; 800 ms/blur autosave, 420-character UI limit and manual-source semantics. Generation/regeneration stays an explicit decision. Sequence generation and pending manual saves to prevent old text overwriting a new result. |
| `src/components/bikes/BikeWheelsetManager.tsx:53` | Explicit new-wheelset creation; existing name/rim dimensions are read-only; activation writes immediately at line 84. | Make existing wheelset name/rim type/front and rear widths editable with scoped statuses. Activation is a committed selection with pending/error/retry feedback. Keep explicit creation and deletion decisions. |
| `src/components/bikes/BikeWheelsetManager.tsx:145` | Tire setup is a name/width summary only. | Add an existing-tire editor in D-owned bike components, preserving tire-record identity and wheelset relationship. Use existing owned queries/update mutation, not pressure-calculation state. |
| `src/components/features/pressure/BikePressureSection.tsx:68` | Manage-wheelsets link leads to edit page; active wheelset/tire and pressure results are read-only. | Coordinate link to the bike wheelset section with A's pressure work. Do not edit the pressure calculator or its shared feature files without coordination. |
| `src/components/features/bikes/CreateBikeForm.tsx:195` | New-bike/wheelset/tire multi-step creation; explicit buttons at lines 479 and 625. | Retain explicit creation/next/completion actions under contract item 6. Do not create records merely on typing. Draft persistence is optional and outside this initial conversion. |
| `src/components/features/bikes/BikePassportImportFlow.tsx:150` | Preview then deliberate import action. | Keep explicit import. Not a simple-value autosave block. |
| `src/components/bikes/BikePhotoGallery.tsx:157` | Upload creates a photo; delete at line 212 and primary selection at line 232 mutate immediately. | Upload/delete remain explicit. Primary selection already commits immediately; verify local pending/error handling and consider shared status for this selection. No editable captions are presently exposed. |
| `src/components/bikes/BikePublicFitControls.tsx:149` | Copy/enable/disable public preview are deliberate actions. | Keep explicit sharing/privacy decisions, including existing confirmation behavior. |
| `src/app/(dashboard)/bikes/compare-fit/page.tsx:1`, `src/components/bikes/BikeWithFitHistory.tsx:44` | Comparison/history presentation and explicit session removal. | No autosave of historical sessions or fit snapshots. Preserve history and explicit deletion. |

Marktplaats is retiring in task 46. It is excluded from this audit's implementation and validation route set.
Do not restore its routes or fixtures if A removes them while 41c is in progress.

## Prerequisites and integration risks

- C's early API is documented in `41a-primitives.md`: `useAutosave`, `AutosaveField`, `AutosaveStatus`,
  `autosaveMessages[locale]`. Wait for the lead's DONE 41a confirmation before integration.
- A owns `convex/bikes/mutations.ts` and garage deletion for task 45. Those files/sections stay untouched
  until DONE 45. Reading their update contract for this audit did not authorize editing it.
- Existing bike updates replace whole nested `currentGeometry` / `currentSetup` objects
  (`convex/bikes/mutations.ts:441`). Preserve sibling properties when sending one changed measurement.
  Avoid parallel independent hooks that each send a stale full-bike snapshot.
- Optional scalar updates skip `undefined` (`convex/bikes/mutations.ts:474`,
  `convex/wheelsets/mutations.ts:79`, `convex/tireSetups/mutations.ts:128`). Clearing an existing value
  needs a deliberate supported representation. Notes/description can send empty strings; optional
  numeric/scalar clearing needs checking with the backend owner, not a silently dropped update.
- Current numeric mutation arguments use numeric validators; confirm server bounds for every editor
  before promising invalid values are rejected. Keep existing engine/profile limits and do not invent
  new ranges. UI slider ranges alone are not sufficient server validation.
- Mount a query-loaded, bike-keyed editor; do not reset dirty values on subscription echoes. Record
  switches/unmount/visibility changes flush pending saves using C's primitive. Browser termination
  cannot guarantee delivery; only show saved after the mutation resolves.
- New owner-specific NL/EN field/error copy belongs in `src/i18n/account/bikes*.ts`; root dictionaries
  stay frozen. Shared status copy should reuse C's locale module. EN remains available unchanged.

## Implementation verification plan (not yet run)

1. Fake-timer component tests: no initial write, 800 ms text/blur flush, slider/segment commit, deduplication,
   serial latest-wins, visible retained input on failure/retry, invalid values blocked and record-switch flush.
2. Payload regressions: preserve unknown/missing measurements, nested siblings and geometry identity;
   clearing semantics; no archived fit-session/profile mutation; no redirect after autosave.
3. NL/EN assertions for status and validation; generation and explicit create/import/delete remain decisions.
4. NL 1440/390 light/dark screenshots of changed bike editors in saving/saved/error states, then filtered
   sweep on retained bike routes; no retiring import dependency. Keep PNGs out of manifests.
5. Focused tests, full lint/typecheck, exact `files-41c.txt` and final evidence here before DONE 41c.

## Implementation — 2026-10-01

- Bike detail (`bikes/[bikeId]/page.tsx:488`) and the old edit entry (`edit/page.tsx:48`) share
  `BikeSettingsEditor`. The former edit link is gone; gearing and geometry links select inline tabs.
  There is no redirect or save/cancel step for existing-bike values.
- `BikeForm.tsx:303` uses one serial queue for the coherent identity/geometry/setup/gearing group.
  It compares each acknowledged payload and sends only changed top-level fields. Full nested objects
  preserve their sibling measurements. This avoids independent geometry and gearing queues racing
  over the shared crank-length value. Query echoes cannot replace local drafts.
- Notes, descriptions, wheelset names/rim data and tire settings are always editable. Text uses
  800 ms plus blur; slider/option release commits through C’s wrapper. Active wheel/tire choices use
  the same status/retry contract. Explicit create/import/delete, sharing and description generation remain.
  Generation waits for a pending manual description save and does not overwrite the generated source.
- Shared `bikeEditValidation.ts` applies the existing editor ranges on client and server, preserving
  unchanged legacy measurements. Ownership remains required for bike, wheel and tire updates.
  Empty text clears text. Explicit `clearFields` clears optional bike preferences/weight; null clears
  optional wheel widths and tire maximum pressure/casing. No schema change or archived-fit rewrite.
- New NL/EN copy is in `bikesAutosave.ts`; C’s shared status copy is reused. Root dictionaries unchanged
  for this task. A’s garage deletion and retiring import code paths were not changed.

### Verification — complete

- 17 focused component/server tests pass: no mount write, 800 ms/blur/unmount, latest-wins serialization,
  scoped payloads, clear without sibling loss, retained failed input/retry, generation sequencing,
  invalid values and unauthenticated/foreign-owner rejection.
- Full lint passed all stages; typecheck passes after the parallel pressure calculator correction.
- Browser harness uses actual pages, production CSS and local stateful Convex fixtures. It tests reload
  persistence and retry without touching real records. Backend tests provide ownership evidence;
  this is not a live-login end-to-end test.
- Geometry-link hydration has its own regression test: resolving library names/size does not write
  identity or a previously absent frame size. A later user name edit remains a name-only mutation.
- `audit/41c-browser.json`: 16 NL cases (detail/edit × 1440/390 × light/dark × saving/error),
  24 captures including saved states. Bike, wheel and tire names survive reload; retry saves the draft.
  All axe, touch target, overflow, runtime error and applicable structural checks pass.
- `final-sweep/41c/report.md` and `.json`: seven retained bike routes, 28 NL/EN × 1440/390 cases.
  28/28 axe, runtime error, overflow, status, H1, locale and image checks pass; 14/14 mobile target checks pass.
  Marktplaats is excluded. Production snapshot build and TypeScript pass.
- Raw language findings remain deliberately visible: eight stateful cases and four route-sweep cases
  contain the rider-created fixture name “Endurance racefiets”, defined in
  `tests/visual/final-sweep/account-fixture-bikes-runtime.jsx:42`. It is test data, not app copy.
  There are no remaining app-code failures. No language suppression or fixture rename was used.
- The initial axe run found the description textarea missing a usable accessible name. Explicit
  localized aria-labels now supplement the visible labels in the owned bike textareas; rerun passes,
  and the Dutch description name is asserted in its test. Shared UI files were not edited.
- The final source sweep fingerprint is `3b641de743594e6c70b13e0842936c480238da80a4255b83d654fb90e695fa80`.
  Its build ID is `dxGCS1WGumyhbaW3eh6Go`. Stateful browser proof predates only the geometry-hydration
  refinement (covered by the extra test and final route sweep) and formatting.
- Own diagnostic servers closed in harness finally blocks; no listener remains on :4355.


### Release

Deploy Convex before frontend: the update validators now accept `clearFields` and nullable optional
wheel/tire fields. No schema migration, commit, push or deployment was performed by D.


DONE 41c. No commit, push or database writes.

### Lead-review follow-up — gearing-card tests (2026-10-01)

Updated both `BikeGearingCard.test.tsx` cases to assert the current “Bike settings” anchor targets
`#bike-settings-gearing`, for both validated and missing gearing. The existing calculator links and
summary/empty-state assertions remain covered. Inline editing is intentional: `BikeForm` selects the
gearing tab from this fragment, so the old separate edit-page CTA was not restored.

Validation: `npx vitest run 'src/app/(dashboard)/bikes/[bikeId]/BikeGearingCard.test.tsx'` — 2/2 tests pass.
Added the test file to `files-41c.txt`. No application behavior changed; no commit.
