# 20.1 — Account presentation implementation

Lead approved 20.1 and committed it in checkpoint `b40d638`. The new batch is recorded below; historical 20.1 evidence remains unchanged.

## 20.2 — Scope and first fixes

- Read the checkpoint ownership rules. New/rewritten account copy lives in `src/i18n/account/*`; `src/i18n/messages/nl.ts` and `en.ts` are untouched. No commits by Codex B.
- First fixed Dashboard questionnaire-value localization through `account/bikeUsage.ts`: experience, weekly hours, ride length, position preference, road riding, terrain, climbing and pain areas. Stored enum values are unchanged. Unknown pain values use localized generic copy rather than exposing a raw enum.
- First fixed the sidebar: the account shell uses a stretched ink grid column for the full document height, with the existing viewport-height navigation sticky within it. This preserves scrollable navigation and the visible plan block without ending the ink rail at the initial viewport.
- Initial regression proof: 26 tests across Dashboard, shell and sidebar pass. Real-component fixture captures at 1440/390 in NL/EN verify no English-value leakage on the NL Dashboard, full-height ink coverage, sticky navigation after scrolling, and both mobile menu openers/focus restoration.
- Batch 20.2 page ownership: Curie — FitStart + FitMethod; Halley — Questionnaire; Archimedes — Results; Carson — History. Parent owns integration, the first fixes and visual fixtures. Sources are the current approved `plans/redesign-canvas/canvas/{FitStart,FitQuestionnaire,FitResults,FitMethod,History}.dc.html` and `canvas/m/FitResults.dc.html`.
### 20.2 implementation and visual proof

- FitStart and Method match the current boards without changing creation/profile/bike eligibility; method copy avoids unsupported formula claims.
- Questionnaire preserves backend ordering, conditional climbing questions, response keys, skipping, saving and completion. Array-shaped display props are guarded during back-navigation; custom radio targets now have localized names and 44px hit areas. The shared pressure-wizard progress API is unchanged.
- Results retain existing generation/retry, access gates, report/email/PDF payloads, checkout cleanup and case-study boundaries. The diagram and summaries use real selected main/climbing values; unknown current measurements never become fabricated deltas. Existing detailed sections remain available in an accessible disclosure.
- History preserves grouping, ordering, deletion, report actions and bike links. Dates, statuses and decimal values are localized. Independent read-only questionnaire/results review found no confirmed functional regressions against checkpoint b40d638.
- Actual-component fixture fallback: 92 NL/EN desktop/mobile cases, 142 PNGs. No runtime errors, horizontal overflow or incomplete ink rails. Parent inspected page families, expanded results, email and mobile navigation; final refreshes tighten the history heading and email input target.
- Shared UI request for C/lead: email dialog's inherited close button is 32px wide and English-labelled, and Input help target is 20px. These remain untouched by ownership rule. The owned email input is now at least 44px high. This is not a claim of zero inherited small controls.
- Reproduction and limits: `tests/visual/account-batch2/README.md`. Synthetic fixture data never enters production defaults. Screenshots do not certify live authentication, delivery, payment or PDF contents.

### 20.2 final validation

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS, final integration rerun |
| `npm run lint` | PASS, including 218 contrast checks; `/tmp/20.2-lint.log` |
| `npm run test:unit -- --maxWorkers=2` | PASS: 212 files, 996 tests; `/tmp/20.2-unit-final.log` |
| `npm run test:i18n` | PASS: 30 tests |
| `npm run test:e2e:i18n` | PASS: 2 locale/proxy smoke tests |
| `npm run build` | PASS: webpack, TypeScript, 230 static pages |
| `git diff --check` | PASS |
| Final browser matrix | PASS: 92 cases, then 8 email and 12 history refreshes; 142 final PNGs |

The first unrestricted-worker unit run had three 5-second timeouts in measurement/gearing tests during concurrent builds. The complete two-worker rerun passes without test/code changes. The first sandboxed build failed fetching Google Fonts; an overlapping retry encountered its lock. After that process exited, the approved network-enabled build completed successfully. No lock was removed or unrelated process killed.

Final visual refresh fingerprints: CSS `356042129f9cf3dfa73af90fad6fe6bf487d59cf0cb26ebfec4304a9cc89138a`, component bundle `37791aa9806a928f506128db7448c3dddf54780259d99fe4e95c6d0f4472d62f`. Shared email-dialog targets remain the documented UI-owner exception, not hidden by the capture script. No commits; ready for lead review.

### 20.2 exact file list

Only the following source/test/docs files and the **142 exact PNG paths** enumerated in `audit/20.2-render-files.txt` belong to this handoff. Do not stage the whole working tree or all of `src/i18n/account`: other agents own later-batch files. `BikeGarageOverview.tsx` also contains concurrent later-batch styling; coordinate that combined diff with its owner before committing.

```text
plans/redesign-canvas/README.md
plans/redesign-canvas/audit/20-notes.md
plans/redesign-canvas/audit/20.2-render-files.txt
plans/redesign-canvas/output-20-batch2-questionnaire.md
plans/redesign-canvas/output-20-batch2-results.md
src/app/(dashboard)/dashboard/page.test.tsx
src/app/(dashboard)/fit-history/page.test.tsx
src/app/(dashboard)/fit-history/page.tsx
src/app/(dashboard)/fit/[sessionId]/questionnaire/page.test.tsx
src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx
src/app/(dashboard)/fit/[sessionId]/results/components/AdjustmentSequence.tsx
src/app/(dashboard)/fit/[sessionId]/results/components/BikeContextCard.tsx
src/app/(dashboard)/fit/[sessionId]/results/components/DetailedFitTable.tsx
src/app/(dashboard)/fit/[sessionId]/results/components/PriorityTable.tsx
src/app/(dashboard)/fit/[sessionId]/results/components/ResultsPrimitives.tsx
src/app/(dashboard)/fit/[sessionId]/results/components/RiderProfileCard.tsx
src/app/(dashboard)/fit/[sessionId]/results/components/TirePressureSection.tsx
src/app/(dashboard)/fit/[sessionId]/results/components/ValidationPlan.tsx
src/app/(dashboard)/fit/[sessionId]/results/fixture.test-support.ts
src/app/(dashboard)/fit/[sessionId]/results/page.test.tsx
src/app/(dashboard)/fit/[sessionId]/results/page.tsx
src/app/(dashboard)/fit/how-it-works/page.test.tsx
src/app/(dashboard)/fit/how-it-works/page.tsx
src/app/(dashboard)/fit/page.test.tsx
src/app/(dashboard)/fit/page.tsx
src/app/(dashboard)/layout.test.tsx
src/app/(dashboard)/layout.tsx
src/components/account/FitQuestionnaireGuide.tsx
src/components/account/FitQuestionnaireHeader.tsx
src/components/account/FitQuestionnaireProgress.tsx
src/components/account/FitResultsOverview.test.tsx
src/components/account/FitResultsOverview.tsx
src/components/account/FitResultsValue.tsx
src/components/bikes/BikeGarageOverview.tsx
src/components/bikes/BikeWithFitHistory.test.tsx
src/components/bikes/BikeWithFitHistory.tsx
src/components/layout/DashboardSidebar.test.tsx
src/components/layout/DashboardSidebar.tsx
src/components/questionnaire/QuestionRenderer.tsx
src/components/questionnaire/QuestionnaireContainer.test.tsx
src/components/questionnaire/QuestionnaireContainer.tsx
src/components/questionnaire/QuestionnaireIntro.tsx
src/components/questionnaire/questions/ExperienceLevelSelector.tsx
src/components/questionnaire/questions/PositionFeelingSelector.tsx
src/components/questionnaire/questions/RideDistanceSelector.tsx
src/components/questionnaire/questions/SelectorAccessibility.test.tsx
src/components/questionnaire/questions/SingleChoiceTooltipQuestion.tsx
src/components/questionnaire/questions/WeeklyHoursSelector.tsx
src/i18n/account/bikeUsage.test.ts
src/i18n/account/bikeUsage.ts
src/i18n/account/fitHistory.ts
src/i18n/account/fitMethod.ts
src/i18n/account/fitQuestionnaire.ts
src/i18n/account/fitResults.ts
src/i18n/account/fitStart.ts
tests/visual/account-batch2/README.md
tests/visual/account-batch2/capture.mjs
tests/visual/account-batch2/entry.jsx
tests/visual/account-batch2/runtime.jsx
```

### Historical 20.1 evidence


Scope: dashboard shell, `/dashboard`, `/profile`, `/profile/improve/*`, `/login`. Batch 2 is not started. No commits. Convex queries, mutations, authorization and authentication contracts remain unchanged.

## Sources and ownership

- The checked-out canvas snapshot is stale: Profile/ProfileImprove and mobile Dashboard are missing there. Used the lead-approved task-17 drafts (`drafts/Dashboard.dc.html`, `Profile.dc.html`, `ProfileImprove.dc.html`, `Login.dc.html`, plus available `drafts/m/` counterparts). No review strips or example-data chips ship in the app.
- One subagent per page family: Curie (Dashboard), Halley (Profile), Archimedes (ProfileImprove), Carson (Login). Parent owns shell and final integration. Archimedes additionally owns actual-component visual fixtures; Curie runs full validation.
- No edits to Codex C's `src/components/ui/*`, public Header/Footer, or globals.css. Account additions live in `src/components/account/` and `src/components/dashboard/`; existing page/profile/measurement presentation is updated in place.
- **Route to Codex C/lead:** plan 20's public `BikeFitCalculatorForm.tsx` height-range correction (130–210 cm with test) is deliberately not edited here because public calculator pages belong to C.

## Shell and real state

- 264px ink sidebar, lime active navigation, 48px desktop content margin; one canonical ordered account navigation list. Most-specific match prevents both Bikes and New bike becoming active.
- Mobile header and five bottom tabs; More opens an accessible Base UI dialog with focus management, escape/backdrop closure, localized links, account state, and sign-out. Crossing the desktop breakpoint closes the modal. Main content reserves bottom-tab and safe-area space.
- Existing auth guard, admin-role filtering, profile-photo control, Strava trigger, dashboard messaging and sign-out destination remain intact. Language switching preserves route and query.
- Integration review found the existing global feedback launcher covering the new mobile bottom tabs. A small account-specific placement helper is now passed by `FeedbackPanelProvider`; public and desktop placement are preserved. Ten route-placement tests cover this boundary. The actual launcher is included in the visual fixtures.
- Plan label uses the real user tier. Usage is the actual `sessions.listByUser` count. **No invented “1 of 1” quota or progress bar:** the existing sessions create mutation has no enforced allowance and exposes no entitlement denominator. Unknown user/usage renders an ellipsis rather than a fake subscription/count.
- Payment-paused copy appears only when the existing `isStripeBillingEnabled()` configuration disables billing, not unconditionally as in the fixture board. Settings remains available, with no fabricated upgrade checkout.

## Page preservation

- Dashboard retains real garage, fit advice, profile, photo-upload and report flows; localized profile indicators and missing-weight action accompany the redesign.
- Profile retains the existing measurement and assessment data contracts.
- ProfileImprove retains all four route contents and edit destinations; missing profiles do not receive an invented score, exercises expand with accessible controls.
- Login retains email-code authentication (seven-character codes), Google, resend cooldown, errors, redirects, campaign attribution and localhost dev-login behavior. Its approved layout replaces the old narrow card, not its authentication logic.

## Validation

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS, including parent rerun after final profile/guide presentation fixes |
| `npm run lint` | PASS; 218/218 brand contrast checks, runtime and tooltip guards; `/tmp/20-parent-final-lint.log` |
| `npm run test:unit` | PASS: 185 files / 827 tests; `/tmp/20-final-test-unit.log` |
| `npm run test:i18n` | PASS: 6 files / 30 tests |
| `npm run test:e2e:i18n` | PASS: 2 locale/proxy smoke tests; not a live authenticated browser test |
| `npm run build` | PASS: webpack compilation, TypeScript and 230 static pages; `/tmp/20-final-build.log` |
| Final focused checks | Shell + actual plan-state: 17 tests; ProfileImprove: 15 tests; final Profile layout: 8 tests; scoped diff whitespace check PASS |

Historical concurrent integration failures and their superseding results are retained in `20-validation.md`. Public calculator/home/pricing failures resolved through their owners, not changes by this account worker. The final parent lint supersedes the transient public-home tooltip guardrail failure. A further build request after the last presentation-only polish encountered another worker's Next build lock; no process was killed or lock removed. The successful full build above plus subsequent typecheck/focused tests are the build evidence, not a claim of a second completed build.

## Visual proof

- `audit/20-renders/`: actual application components at **1440×1000 and 390×844**, NL and EN. Initial matrix: 68 page/state cases, 102 base PNGs plus four mobile navigation-dialog PNGs. Representative viewport and full-page shots are included.
- Test-only source and reproduction: `tests/visual/account-batch1/README.md` and `capture.mjs`. The existing localhost dev-login flow was unavailable (disabled public flag and absent local secret); used isolated fixtures, not a production auth bypass. Convex/auth/telemetry are mocked, while real page/layout/UI code, compiled Next CSS, fonts and assets render in Chromium.
- Fixtures cover filled/empty/loading/missing-weight Dashboard; filled/empty/loading/edit Profile; all four improve routes plus loading/missing profile; login email/code/error. All fixture identities, sessions and advice are synthetic and remain outside live application defaults.
- Parent inspected desktop/mobile Dashboard, Profile, Login and improve screenshots, plus the mobile More dialog. Corrected the profile grid's oversized gap, the dialog title contrast, and selected/collapsed exercise backgrounds. The global feedback launcher clears the bottom tabs.
- Final focused refreshes cover the corrected Profile, navigation dialog and all 24 improve-route cases. **106 final PNGs**, zero reported runtime errors, horizontal overflow or undersized visible controls. Base UI's visually hidden native range input is not the interaction surface; the real slider surface measured 44px high. Full capture boundaries, fingerprints and final results: `20-render-handoff.md`.
- Mobile navigation has browser checks for both openers, focus containment, Escape focus restoration and desktop-resize dismissal. These complement unit auth-guard/locale tests; fixture screenshots do not certify real email delivery, OAuth, backend writes or image optimization.

## Shared UI follow-up for lead/C

- Existing `AccessibleDialog` uses a 32px close control and has no class override prop. This pass leaves shared UI untouched as instructed; its inherited close target in existing profile/photo dialogs should be raised to 44px by the UI owner. The new account navigation dialog already uses its own 44px close control over the shared dialog primitive.
- Shared ghost Button background utilities can override consumer background classes on hover-capable devices. ProfileImprove now supplies the page's explicit state color via the supported `style` prop (paper collapsed, lime expanded); route the shared override-order behavior to the UI owner rather than changing shared UI here.
- Existing garage questionnaire answer strings and some profile help/schema copy remain English in NL, as before. Presentation changes do not rewrite stored values or shared dictionaries. See `output-20-batch1-profile.md` for preserved optional-measurement prediction behavior.

## Batch 20.3 — bikes (Codex D, implementation in progress)

**Not DONE yet. No commit.** Scope follows the ownership section added after checkpoint `b40d638`.
Account shell, shared UI, globals, backend and root EN/NL dictionaries were not edited by this worker.

### Completed within ownership

- Garage, add-method chooser, detail, edit and comparison use the account shell and semantic brand colors.
  Garage text tiles use body typography and wrap on mobile; measurements retain numeric typography.
- Compare-fit remains honest guidance, with its localized CTA fixed from `/dashboard/bikes` to `/bikes`.
- Edit form groups details, measurements, gearing and notes into accessible section controls.
  Sliders keep unknown measurements null until explicitly entered, preserve legacy out-of-range saved values,
  and allow clearing. Cassette sprockets can be added, adjusted and removed individually.
- Bike detail previews the saved saddle height against the actual latest recommendation. Missing reach/drop
  values are explicitly shown as not saved. Preview controls and reset never write to Convex or alter reports.
- Geometry linking, public-fit sharing, descriptions, photos, notes, wheelsets, fit history and pressure sections
  remain available. Existing query/mutation identities and payload construction are preserved.
- New copy lives in `src/i18n/account/bikes.ts` and `bikesPreview.ts`.
- The pending `BikeGarageOverview.tsx` translation change importing `account/bikeUsage` predated this batch
  and is preserved. That dictionary is owned by the account worker, not authored by D.

### Ownership question that prevents completing the batch

The three assigned routes delegate their entire presentation to files outside the supplied ownership list:

- `/bikes/new/manual`: `src/components/features/bikes/CreateBikeForm.tsx`
- `/bikes/import/passport`: `src/components/features/bikes/BikePassportImportFlow.tsx`
- `/bikes/import/marktplaats`: `src/components/features/bikes/MarktplaatsBikeImportFlow.tsx`

Asked the user via the pending scope question and the lead in Sfora to include these three components.
They remain untouched pending an answer. They still need the approved presentation, choice controls,
manual-create sliders and 44px inputs. No duplicate flow implementation or runtime DOM patch was introduced.
The imported `features/pressure/BikePressureSection.tsx` also retains its owner's existing styling.

### Validation so far

- Typecheck PASS after resolving local nullable measurement tile typing.
- Full lint PASS, including 218/218 brand contrast checks; subsequent scoped ESLint PASS.
- Full unit suite PASS: **211 files / 985 tests**, using `npm run test:unit -- --maxWorkers=2`.
  An earlier highly concurrent run had transient timeouts and other owners' in-flight failures; superseded.
- Bike-focused tests PASS: **10 files / 41 tests**. Five new tests protect null measurement state,
  legacy range preservation, cassette removal, unchanged edit payloads and required-name navigation.
- i18n PASS: 30 tests. `test:e2e:i18n` PASS: 2 tests.
- Production build PASS. Build completed before the final mobile tile/tab and tooltip-target polish;
  final typecheck and focused verification cover those subsequent presentation adjustments.

### Visual evidence and boundaries

`audit/20-3-renders/` contains actual-component fixture captures at 1440×1000 and 390×844, NL and EN.
As for batch 20.1, the local dev-login flow was unavailable; the harness adapts that batch's fixture renderer.
It imports current bike pages, account layout, ThemeProvider and ToastProvider and uses real compiled Next CSS
and fonts. Convex/auth are explicit fixtures and mutations are mocked; no backend writes or production bypass.
The scope includes garage filled/empty/loading, add chooser, baseline manual/import pages, compare guidance,
detail filled/missing/loading, and edit details/measurements/gearing/save-error states.
Missing fixture queries fail the harness. Filled pages wait for their real heading after React Suspense resolves.
No horizontal document overflow or unexpected queries in the completed matrix.

Desktop/mobile garage, add chooser, detail and edit were visually inspected. Corrected oversized textual
measurement tiles and mobile section wrapping. Shared tooltip triggers are enlarged through an owned form
selector. Base UI's hidden radio inputs and native range thumbs are not the actual interaction surfaces;
shared slider surfaces are 44px high. The unowned manual/import flows still have 36px inputs and small numeric
steppers; those baseline images are evidence for the ownership request, not a completed acceptance claim.

### D-authored code file list (for eventual lead review; do not commit as a completed batch yet)

- `src/app/(dashboard)/bikes/[bikeId]/BikeGearingCard.tsx`
- `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx`
- `src/app/(dashboard)/bikes/[bikeId]/SignedInFitFollowUpCard.tsx`
- `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx`
- `src/app/(dashboard)/bikes/[bikeId]/page.tsx`
- `src/app/(dashboard)/bikes/compare-fit/page.tsx`
- `src/app/(dashboard)/bikes/new/page.tsx`
- `src/app/(dashboard)/bikes/page.tsx`
- `src/components/bikes/BikeDescriptionEditor.tsx`
- `src/components/bikes/BikeFitHistorySection.tsx`
- `src/components/bikes/BikeFitPreview.tsx`
- `src/components/bikes/BikeForm.test.tsx`
- `src/components/bikes/BikeForm.tsx`
- `src/components/bikes/BikeFormControls.test.tsx`
- `src/components/bikes/BikeFormControls.tsx`
- `src/components/bikes/BikeGarageOverview.tsx`
- `src/components/bikes/BikeGeometryLibraryFields.tsx`
- `src/components/bikes/BikeNotesEditor.tsx`
- `src/components/bikes/BikePhotoGallery.tsx`
- `src/components/bikes/BikePublicFitControls.tsx`
- `src/components/bikes/BikeWheelsetManager.tsx`
- `src/components/bikes/BikeWithFitHistory.tsx`
- `src/i18n/account/bikes.ts`
- `src/i18n/account/bikesPreview.ts`

Evidence: this audit section and `plans/redesign-canvas/audit/20-3-renders/`.

Final fixture run: **60 cases**, no runtime failures, unknown queries or document overflow. Full results: `20-3-renders/capture-results.json`. Reproduction source snapshot: `20-3-fixture-harness.zip` (adapted from the existing batch-1 harness; unzip to `/tmp/bikes-visual` and run `node /tmp/bikes-visual/capture.mjs` from the repo with localhost:3000 running).

Final focused rerun: 41 bike tests PASS. The full BikeForm DOM regression allows 15 seconds because concurrent agent builds/tests caused a 5-second timeout despite isolated passes. No assertion was removed.


## Batch20.4 — Codex C account tools, settings, feedback and app

Assigned by lead after18.2 approval in b40d638. No commits. Reuse the current account shell;
no DashboardLayout/Sidebar or marketing layout edits by C. Convex functions, authz and engines
unchanged. New copy is imported directly from `src/i18n/account/tools*.ts`; frozen roots untouched.
Three page-family subagents implemented pressure, gearing, and saddle/cleat; parent implemented
settings/feedback/app and integrated validation. Board review-state strips are not shipped.

## Account pressure route —20.4

Exact changed/new files:
- src/app/(dashboard)/pressure-calculator/page.tsx
- src/app/(dashboard)/pressure-calculator/PressureDashboardClient.tsx
- src/app/(dashboard)/pressure-calculator/PressureDashboardClient.test.tsx
- src/app/(dashboard)/pressure-calculator/error.tsx
- src/i18n/account/toolsPressure.ts
- src/components/features/pressure/PressureCalculatorForm.tsx (authorized warning dedupe only)
- src/components/features/pressure/PressureCalculatorForm.test.tsx (dedupe regression)

Route-local presentation replaces old PressureCalculatorDashboard container. Same existing listByUser/getLatestByBikeForUser queries, initialBikeId linking, bike selection, recalculate/scroll callback preserved. Existing PressureWizard retains all advanced input sources/state/query behavior and calculation/save/preset mutations; existing BikePressureCard retains notes/auto-notes/edit/cancel/mutation behavior. No backend/authz/shared feature logic changed. Parent shared QuestionnaireProgressBar compatibility fix needed for old wizard estimatedMinutes prop after parallel change.

Board header/eyebrow, explicit genuine loading (not fake empty), real empty + add-bike/manual actions, selected bike cards, calculator/main aside, equipment-limit block, ordered steps and saved notes sections. For a selected bike with a real saved calculation, front lime/rear ink gauge panels show exact saved pressures, explicitly titled Last saved for this bike plus saved-not-new warning. Gauge0–10bar scale extends if an existing persisted value is higher, never silently clips saved number; not presented as safety range. No invented values if missing. Responsive sections stack. Route error boundary provides localized retry/reset. Local utility border overrides correct legacy raw-tuple invalid borders within embedded components without shared edits.

New copy direct import toolsPressureMessages NL/EN; root dictionaries unchanged. All touched files formatted printWidth110/max120; known lengthy class concatenations split only between complete utility tokens.

Deliberate deviation: continuous board calculator is preserved as the existing real five-step advanced wizard rather than copying/forking its state/payload logic. Optional rim/pressure/route numbers retain their existing empty and numeric-entry semantics because source provides no new approved slider domains; existing weight/offroad sliders remain. Live new calculation is original StepResult, separate from explicitly saved overview gauges. No fixture/example rider values ship. Board review-state switcher excluded. Account save/profile flow unchanged; no unsupported saved-pressure promises.

Public warning dedupe: retain detailed static tire/rim maximum guidance once and all returned engine warningMessages; remove second resultLabels.disclaimer paragraph (same max-pressure message). Regression verifies static max message exists, duplicate disclaimer absent, real MTB width warning retained.

Validation:11 tests across2 suites pass; focused ESLint passes. Actual PressureWizard (not mocked), real calculateAdvancedPressure tested through manual-tire + wet setup and original save mutation inputSnapshot/output fields. Actual BikePressureCard editing test verifies original updateNotes payload. Loading/empty/link-selected gauges and retry covered. Tests mock only Convex boundary data/mutations and locale. Initial typecheck blocked solely by stale .next pain route and parallel QuestionnaireProgressBar API change, parent final gates. Screenshot harness fixtures supplied parent; await visual inspection.

Visual inspection completed using new `tests/visual/account-batch4` actual-component fixture harness.
Additional new files: tests/visual/account-batch4/{README.md,capture.mjs,entry.jsx,runtime.jsx}.
Harness renders real seven pages and unchanged shared shell (App standalone), explicit fail-on-unknown
Convex fixtures, simulated mutations, real CSS/fonts; FeedbackPanelProvider only is stubbed.
No live-auth/database validation claimed.36 planned screenshots cases plus viewport variants.
Initial pressure NL/EN1440/390, populated/loading/empty all no errors/overflow. Visually inspected main
pressure desktop+mobile; route-scoped border-b/card-background fix applied for legacy saved cards.
Initial other pages issue: Settings mobile404px horizontal overflow reported to parent; App Computer
selector was a fixture label mismatch and corrected. Full final manifest pending root fixes/rerender.
Harness ESLint passed and all new files<=120chars. Final screenshots audit/20.4-renders.


# Batch 20.4 — account gearing

Completed owned page presentation against `canvas/GearingDashboard.dc.html` and step20.
No commits. No shell/root dictionaries/Convex/engine/gearingMath changes.

## Exact files
- `src/app/(dashboard)/gearing/page.tsx`
- `src/app/(dashboard)/gearing/page.test.tsx`
- `src/app/(dashboard)/gearing/GearingCalculatorForm.tsx`
- `src/app/(dashboard)/gearing/GearingCalculatorForm.test.tsx` (new)
- `src/app/(dashboard)/gearing/GearingControls.tsx` (new)
- `src/i18n/account/toolsGearing.ts` (new; direct import, no registration)

## Presentation and preserved behavior
- Board question heading, soft-petrol saved-bike cards and rider panel, numbered input cards,
  lime live gear ladder, real ratio/speed/power/cadence results, climb assessment,
  adjustment order, account-backed history.
- Shared Slider, OptionCard, SegmentedControl, StepCard, ResultTile, StatusChip, AdjustOrder.
- Numbers use accessible keyboard sliders with visible units; choices use cards/segments.
- Actual saved cassette teeth retained, editable individually under an expander. Endpoint
  controls edit only the actual min/max tooth count. Preset ranges explicitly supply only
  their two endpoints; UI explains they do not invent intermediate sprockets. Missing
  endpoints stay missing until edited. Ladder marks only actual entered teeth.
- Optional FTP stays unfilled, no profile FTP invented. Clear action returns it to missing.
- Missing values announce “Not entered”; Home/End also enter an explicitly chosen bound.
- Slider bounds follow board intent while retaining saved values outside display bounds.
  Wheel range stays engine's 1500–2800, not board's narrower 1800–2600.
- Current cassette and alternative remain independent; both real computed ratios/speeds shown.
- Existing queries, mutation route, buildGearingData, compute/classify functions and engine
  analysis/persistence payload preserved. Saved-bike type remains from actual bike; no
  invented independently editable account-bike type added.
- Existing manual selection with URL `?bikeId=` now works (empty override instead of null).
- Added actual saving/error/retry states. Rejected save retains all inputs. Avoids associating
  previous-bike inputs with a newly selected bike before its query/prefill resolves.
- Loading, unavailable selected bike, empty saved bikes, empty history are real query states.
- New UI text is direct-import NL/EN dictionary copy. Verdict/recommendation summaries and
  history confidence/public verdict translated without changing stored engine output.
- Locale formatted numbers/history timestamps; current result engine arithmetic unchanged.

## Verification
- `npx vitest run 'src/app/(dashboard)/gearing' --maxWorkers=1`: 2 files, 7 tests pass.
  Covers real engine save payload equality, cassette tooth retention, cadence recalculation,
  explicitly entering FTP, manual override with bikeId URL, 1x switching, alternative cassette,
  real derailleur-limit warning, failure/retry preserving payload, loading/empty/unavailable,
  Dutch results and real history timestamp/confidence.
- Targeted ESLint on all six files: passes.
- Full `tsc --noEmit --pretty false`: clean latest log. An earlier run hit another agent's
  in-progress questionnaire syntax; resolved before latest run.
- All six owned files <=120 columns; Prettier applied.
- Parent owns aggregate build/unit/i18n and 1440/390 screenshot harness; ready for screenshots.

## Existing engine limits deliberately preserved
- `gearingMath` uses positive-only gradient parsing: zero gradient has no climb-power verdict.
  No math changed to hide this. Missing-data copy is shown rather than fabricated confidence.
- Comparison is local ratio/speed evaluation; original saved scenario marker/base analysis
  payload preserved, not silently replaced by a different engine scenario contract.


## 20.4 Saddle selector and shoe/cleat fit

Exact changed/new source files:
- src/app/(dashboard)/saddle-selector/page.tsx
- src/app/(dashboard)/saddle-selector/SaddleSelectorForm.tsx
- src/app/(dashboard)/saddle-selector/SaddleSelectorForm.test.tsx
- src/app/(dashboard)/shoe-cleat-fit/page.tsx
- src/app/(dashboard)/shoe-cleat-fit/page.test.tsx (new)
- src/i18n/account/toolsSaddle.ts (new)
- src/i18n/account/toolsCleat.ts (new)
Existing SaddleSelectorForm.test.ts mapping/normalization tests remain intact. No shared components, account shell, root dictionaries, engine files, Convex functions or authz changes. No commits.

### Saddle selector
Approved board question header; real bike option cards; measured/estimated option cards; numeric sliders; riding/posture/environment/duration choices; collapsible current-saddle and symptom controls; optional flexibility/core sliders; two-column live result; schematic SVG, actual width-bin scale and confidence, translated suitability and setup warnings; explicit save, success/failure, previous recommendations and real empty/loading states.

Retained query identities/arguments: getMyProfile, bikes.list({}), listSaddleWidthSessions({limit:5}), bikes.get({bikeId}) or skip. createDashboardSaddleWidthSession still receives actual engine/suitability output, bike reference and all supported refinements. Bike style→riding type and goal→posture mapping kept; URL bikeId prefill kept. Initial bike remains unlinked if none explicitly selected. Query hydration now seeds a bike parameter once so the user can unlink afterward; profile hydration no longer overwrites local edits on a same-profile live refresh.

Replaced manual calculate/scroll stage with live calculation through unchanged calculateSaddleWidth/classifySaddleSuitability. Missing measurements remain null: slider shows a clearly labelled example until moved or explicitly confirmed. No example result or save is emitted while required measurements are missing; measured and estimated paths omit inactive fields. Real profile measurements seed the sliders. Optional current width also stays null until moved/confirmed. Warnings translated by engine warning code; stored warning payload remains engine text as before. Current comparison and confidence are engine classifications, not new formulas. Returned widths outside supported125–190mm bins remain visible with an explicit warning and no highlighted end class.

Saving is disabled during selected-bike loading/unavailability and duplicate submission. Errors are caught and shown; success belongs to the saved input signature and disappears after edits. Latest results and matching input snapshots are saved together. History uses real query rows and locale dates; loading and empty history are distinct. No fake review-state strip or example rider/bike data added. Profile/bike query errors remain handled by existing account/Convex boundaries.

### Shoe and cleat fit
Lime hero “Begin bij je voeten”, symptoms/whole-setup guidance, numbered feet→shoes→cleats checks via AdjustOrder, petrol-soft caution section, help section and dark final CTA. Kept as the real informational module; no invented foot measurements, diagnosis or pretend calculator. Removed board review/example badge because page contains no personal/sample data. Main CTA fixed from nonexistent /dashboard/fit to localized /nl/fit or /en/fit. Uses genuine Link semantics styled with shared buttonVariants. Explicit foregrounds on lime/ink headings avoid global heading-color override.

### i18n / visual adaptation
New bilingual modules consumed directly; toolsSaddle reuses existing public saddle-width dictionary for identical engine labels/advice and adds account-specific labels, validation, lifecycle, choices and translated warnings. No root registration. Mobile uses naturally stacked input/result columns and wrapping option cards, no extra fixed bar competing with shell bottom navigation. Shared StepCard/Slider/OptionCard/ResultHero/ResultTile/SizeScale/StatusChip/AdjustOrder reused. Both pages remain within parent account shell.

### Verification
Targeted ESLint clean. All owned TSX/new copy source audited <=120chars after installed Prettier printWidth115. Twelve focused tests cover live engine output/keyboard in EN+NL, unlinked+linked/URL bike defaults, explicit unlink, real current saddle and symptom inputs/warning translation/payload, missing measurement confirmation, genuine loading/history/empty states, save rejection and success invalidation, mapping helpers, both localized cleat routes/ordered guidance. Parent owns final gates and actual-component fixture screenshots. Initial full typecheck only found concurrent pressure wizard progress-prop mismatch, no owned errors.


### Settings

Board question heading and two independent card columns: account/subscription/install on the left,
preferences/Strava/privacy/delete on the right. Existing profile-photo widget, display-name save,
language/theme/units actions, Strava consent/connect/disconnect/import, billing portal and typed
account deletion remain. Paid/free/paused billing is driven by the real user and feature flag.
Loading is distinct from a free account; missing-user fallback and route retry boundary are real.
Existing unit preference failure is now caught and announced. No new account or preference fields.
New copy uses toolsSettings; existing labels remain sourced from the established dictionary.

The board’s single-line panels retain existing application widgets and helper text, so card heights
can differ. Mobile grid columns explicitly allow shrinking; theme options and Strava actions wrap.
Route-scoped decorative card/section borders use border tokens without reducing input-border contrast.
Settings input controls and confirmation still use the original backend calls and confirmation word.

### Feedback

Route-local FeedbackAccountPage preserves the established hub’s query identities, tab URL behavior,
optimistic voting/rollback, pending states, release history, real empty/loading states and shared
FeedbackDetailDialog/FeedbackPanelProvider integration. Presentation uses lime question header,
shared segmented tabs, larger report titles and semantic status badges. Existing feedback forms
and detail-dialog implementation are reused, not forked. Route-level error boundary adds retry.
The route-local presentation copy uses toolsFeedback; no root/module registration is needed.

### App installation

Standalone `/app` stays outside the dashboard layout, matching the approved AppInstall board.
Brand header, large heading, device segments, numbered iOS instructions and lime phone illustration.
Existing standalone detection and authenticated `/dashboard` vs signed-out `/login` redirect retained.
Safari-only warning remains for Apple mobile using another browser. Android/computer choices show
an honest browser-use state; no unsupported install prompt or fabricated steps. New copy lives in
toolsApp; existing verified iOS instructions are reused from the current dictionary.

### Validation and limitations

- Full unit suite:996 tests pass across212 files. Includes7 new tools-dictionary parity cases.
- Typecheck passes. Full lint including218 contrast pairs passes. i18n30/30 and locale e2e2/2 pass.
- Final settings/feedback presentation follow-up:5 targeted tests pass after final visual polish.
- All batch-owned TS/TSX lines audited<=120. No formatter dependency added.
- Desktop/mobile evidence uses actual route components and the untouched account shell with explicit
  synthetic Convex fixtures; no local dev-login secret was available in the existing setup. No real
  account data was read or written for screenshots. This does not validate authentication/SSR or
  live backend persistence. Mutation contracts and failure states are exercised in component tests.
- Fixture harness:tests/visual/account-batch4. Captures: audit/20.4-renders.48 cases cover all7 NL
  pages at1440/390, extra loading/empty/tab/platform/delete-dialog states, and all7 EN main pages at both
  sizes. Manifest checks runtime errors, unexpected active queries and horizontal overflow.
- The fixture intentionally stubs feedback-panel opening and does not claim dialog-submission
  coverage; production still uses the existing provider. Explicit save calls are mocked boundaries.
- Initial shared build lock/typecheck/test failures during concurrent edits were resolved; no C
  changes to their owners’ files. No body overflow clipping used to hide sizing defects.

### Exact20.4 source/test file list for lead commit

- `src/app/(dashboard)/feedback/FeedbackAccountPage.test.tsx`
- `src/app/(dashboard)/feedback/FeedbackAccountPage.tsx`
- `src/app/(dashboard)/feedback/error.tsx`
- `src/app/(dashboard)/feedback/page.tsx`
- `src/app/(dashboard)/gearing/GearingCalculatorForm.test.tsx`
- `src/app/(dashboard)/gearing/GearingCalculatorForm.tsx`
- `src/app/(dashboard)/gearing/GearingControls.tsx`
- `src/app/(dashboard)/gearing/page.test.tsx`
- `src/app/(dashboard)/gearing/page.tsx`
- `src/app/(dashboard)/pressure-calculator/PressureDashboardClient.test.tsx`
- `src/app/(dashboard)/pressure-calculator/PressureDashboardClient.tsx`
- `src/app/(dashboard)/pressure-calculator/error.tsx`
- `src/app/(dashboard)/pressure-calculator/page.tsx`
- `src/app/(dashboard)/saddle-selector/SaddleSelectorForm.test.tsx`
- `src/app/(dashboard)/saddle-selector/SaddleSelectorForm.tsx`
- `src/app/(dashboard)/saddle-selector/page.tsx`
- `src/app/(dashboard)/settings/error.tsx`
- `src/app/(dashboard)/settings/page.test.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/shoe-cleat-fit/page.test.tsx`
- `src/app/(dashboard)/shoe-cleat-fit/page.tsx`
- `src/app/app/page.test.tsx`
- `src/app/app/page.tsx`
- `src/components/features/pressure/PressureCalculatorForm.test.tsx`
- `src/components/features/pressure/PressureCalculatorForm.tsx`
- `src/i18n/account/toolsApp.ts`
- `src/i18n/account/toolsCleat.ts`
- `src/i18n/account/toolsFeedback.ts`
- `src/i18n/account/toolsGearing.ts`
- `src/i18n/account/toolsMessages.test.ts`
- `src/i18n/account/toolsPressure.ts`
- `src/i18n/account/toolsSaddle.ts`
- `src/i18n/account/toolsSettings.ts`
- `tests/visual/account-batch4/README.md`
- `tests/visual/account-batch4/capture.mjs`
- `tests/visual/account-batch4/entry.jsx`
- `tests/visual/account-batch4/runtime.jsx`

Audit/handoff files updated by C: `plans/redesign-canvas/audit/20-notes.md`,
`plans/redesign-canvas/audit/18-notes.md`, and the appended20.4 entry in
`plans/redesign-canvas/README.md`. These shared notes must retain other agents’ entries.
Capture artifacts are enumerated separately in `audit/20.4-files.txt`, including manifest.json.

Final20.4 production build passes after settings/feedback polish. Latest full lint and diff whitespace
checks pass. Matching approved board images are copied next to the captures for review. Legacy
bike-fit height range130–210cm requirement was already implemented/tested in approved18.2.

## 20.3b — approved review follow-up

- Numeric garage tile values and unit spans use `whitespace-nowrap`; textual tiles still wrap.
- Compact numeric typography (18px, 12px units) and 8px horizontal padding keep all three tiles readable.
  The numeric font size is scoped inline to withstand the dashboard wrapper's 23px `dd` override; shell unchanged.
- New `BikeGarageOverview.test.tsx` asserts nowrap on every unit span and its parent; test and scoped lint PASS.
- Real-component fixtures: `/bikes` and `/dashboard`, NL/EN, 1440px and 390px; all 24 measurements fit,
  with no document overflow. Narrowest available width 74px; longest rendered measurement 71.33px.
- Screenshots and measurements: `audit/20-3b-renders/`. Exact source list updated in `files-20.3.txt`.
- DONE 20.3b. No commit.
