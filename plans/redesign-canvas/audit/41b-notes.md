# 41b — Profile direct editing and autosave

Status: DONE 41b, 2026-10-01. Awaiting lead review; no commit/push/deployment.

## Implementation

Lead confirmed DONE 41a; all six Mijn profiel blocks now edit directly with C's
useAutosave / AutosaveField / AutosaveStatus. No simple-value edit/save/cancel mode.
Body and extra measurements have separate writers; flexibility/core share one serial
writer because the existing mutation requires both. Comfort and riding have separate
writers and disjoint mutation payloads. Release/blur or 500 ms debounce commits changes.
Per-block NL/EN saving/saved/error/retry status; saved fades after two seconds.
Invalid measurements/assessment/severity values are not written. Failed drafts stay visible.
The keyed editor hydrates once and never overwrites local edits with query refreshes.
Measurements and preferences send only locally changed keys. Unedited server-valid legacy
measurements outside the current slider range do not block another field's save.
Visibility/pagehide/unmount flush use the approved shared primitive.

Existing BMI, measurement warnings, measurement/assessment help links, profile photo,
first-profile wizard, fit CTA and explicit weight/pressure recalculation decision remain.
Old ?edit=measurements|flexibility|core|comfort links now focus their always-visible headings.
Dashboard tiles stay read-only navigation; they do not introduce a second profile writer.
Fit creation, questionnaire Next/Finish and report/email actions retain explicit decision
buttons under the brief's wizard/action exception. No result/session snapshot writes added.
Questionnaire autosave is optional under that exception and is not introduced here.

### Backend addition and release ordering

Deploy Convex before the frontend: new `profiles.updatePreferences` mutation accepts
optional enum-validated preferences only. It authenticates the current user, queries their
own profile, updates only provided preference keys and stamps changed preferences.
No schema change, no session writes. Existing updateRiderProfile API is untouched.
This avoids two concrete regressions found in the first implementation's shared lifestyle
queue: a riding edit clearing legacy pain without selected areas, and incomplete riding
preferences blocking independent comfort edits. Both have regression tests.
No backend deployment, commit or push performed.

## Audit inventory (baseline source locations)

| File:line | Existing pattern | Planned change |
| --- | --- | --- |
| `src/app/(dashboard)/profile/page.tsx:212` | BodyMeasurementsEditor has local draft, isEditing, Save/Cancel at 490 | Always-visible body + extra blocks; existing measurement limits and warnings; use updateMeasurements with only changed values. |
| `src/app/(dashboard)/profile/page.tsx:527` | ComfortCard edit gate and manual save at 658 | Direct per-area severity controls; derive hasPain/overall severity from draft exactly as existing updateComfort. |
| `src/app/(dashboard)/profile/page.tsx:673` | FlexibilityCard edit gate and manual save at 765 | Direct assessment slider/cards; group assessment persistence with core to avoid stale paired writes. |
| `src/app/(dashboard)/profile/page.tsx:780` | CoreStabilityCard edit gate and manual save at 864 | Same shared assessment draft/writer; retain independent visible status where appropriate. |
| `src/components/profile/RidingStyleCard.tsx:68` | editing/onCancel/onSave + action row at 219 | Direct option cards; persist the four current rider preference fields. |
| `src/app/(dashboard)/profile/page.tsx:1066` | Five edit flags and query edit targets at 1101 | Remove simple-value edit flags; retain old links as focus/scroll targets. |
| `src/app/(dashboard)/profile/page.tsx:1124` | Profile wizard completion | Keep explicit multi-step completion; not a simple Save-button replacement. |
| `src/app/(dashboard)/profile/page.tsx:1168` | Measurement save + weight-triggered pressure refresh dialog | Local saved status, no toast flood; retain explicit recalculation decision and existing pressure-refresh behavior. |
| `src/app/(dashboard)/profile/page.tsx:1210` | Flex/core saves submit both assessment values | A single serialized assessment writer must merge both edited values; two independent stale query snapshots could overwrite each other. |
| `src/app/(dashboard)/profile/page.tsx:1252` | Comfort save derives areas/maximum severity | Preserve exact derivation, including zero/no-pain handling and saved area values. |
| `src/app/(dashboard)/profile/page.tsx:1276` | Riding preference save | C primitive, validation before mutation; keep failures visible and retryable. |
| `src/app/(dashboard)/dashboard/page.tsx:111` | Profile edit link; measurement tiles are read-only | Retain navigation, not an edit mode; no competing profile writer on dashboard tiles. |
| `src/components/profile/ProfileImproveGuideClient.tsx:358` | Links to `/profile?edit=…` | Keep deep links, resolve them to visible controls rather than opening an edit mode. |
| `src/app/(dashboard)/fit/page.tsx:160` | Start-fit form creates a session | Keep explicit start-fit decision; do not create sessions on every input change. |
| `src/components/questionnaire/QuestionnaireContainer.tsx:146` | Local answer saved on Next at 156 | Keep explicit wizard Next/Finish under contract item 6; no new questionnaire autosave or duplicate writes. |
| `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx:37` | Existing saveResponse mutation | Reuse for current draft; never modify completed session snapshots. |
| `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:411` | Report recipient field followed by send action | Keep explicit send; recipient typing must not send email or alter an archived fit. Results/fit history are derived/read-only. |

Settings, feedback, gearing and saddle autosave belong to C under this brief;
garage/passport/geometry/wheelsets belong to D. Pressure is A's task 42. No edits
to those routes or shared UI are included here. The sole backend addition is the
authenticated preferences-only mutation described above.



## Validation

- Focused profile + measurements + page + preferences mutation tests: 12 files, 88 tests pass.
  Command: `npx vitest run convex/profiles/preferences.test.ts src/components/profile
  src/components/measurements 'src/app/(dashboard)/profile/page.test.tsx' --maxWorkers=2`.
- Additional preferences mutation tests cover user scoping, authentication, partial/no-op
  writes and preservation of pain data. Profile integration tests cover debounce, coalescing,
  assessment serialization/latest-wins, query refresh, invalid inputs, retries, pagehide,
  unmount, weight refresh and NL/EN status labels.
- A read-only subagent reviewed overlapping fields and help links. Separate preference/pain
  persistence, changed-only patches, legacy-range handling and retained measurement/comfort
  guidance address the concrete findings. Cross-tab conflict resolution for assessment/comfort
  groups is not added; these retain the existing grouped mutation contracts.
  Final read-only review: no remaining blocking finding within the agreed scope.
- Whole-tree `npm run lint` and `npm run typecheck` pass. Contrast 254/254 and CSS module tokens pass.
- Whole-tree gates initially hit D's in-progress BikeWheelsetEditor type/tooltip errors;
  owner notified; resolved before the successful whole-tree gates.
- Production-backed NL 1440/390 light/dark saving/saved/error captures: 8 cases, 12 screenshots,
  zero failed checks. All three actual fonts verified loaded; slider spacing/tick wrapping checked.
  `audit/41b-browser.json`, `code-renders/41b-profile-autosave/`.
- Filtered profile + four improve routes sweep: 20 NL/EN 1440/390 cases, zero failures;
  `final-sweep/41b/report.md`. Final preservation-patch refresh passes on a fresh production build.
- Browser auth/Convex are deterministic fixtures, not a live backend persistence claim.
  Relative font URLs are rebased in this task's capture response only. Shared sweep font handling
  needs a harness-owner follow-up; no shared harness code changed by B.

Release ordering: this batch depends on approved 41a UI primitives and the existing 40d
profile-language/client-error dictionaries. Deploy `profiles.updatePreferences` before frontend.
Only current-profile measurements/preferences/assessment/comfort are saved; derived BMI stays local.
Refresh-pressure and fit-start remain explicit decisions. No archived fit/report writes.

Exact own-file manifest: `audit/files-41b.txt`.
43d remains gated on the lead's confirmation of DONE 43a.
