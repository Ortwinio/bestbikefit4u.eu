# Task 20.1 — Profile worker handoff

Status: profile-owned presentation implemented, uncommitted. Parent owns integration, shell, screenshots, audit/20-notes.md and full validation. This is not a claim that the entire batch is complete.

## Design source

Explicit fallback authorized by the user: `drafts/Profile.dc.html`, including task-17 polish documented in `audit/17-notes.md`. The approved canvas snapshot lacks Profile/ProfileImprove and has old Dashboard/Login boards. `drafts/m/` has no Profile board; this implementation adapts the desktop Profile draft to a single column on narrow screens. No canvas files were edited. No review strip, example chips or fixture values were added to the live UI.

## Exact owned files

- `src/app/(dashboard)/profile/page.tsx`: lime summary/fit CTA, two-column saved-card grid, responsive display headings, mono measurements/BMI, solid BMI track, 44px summary controls. All queries, mutation handlers/payloads, dialogs, effects, deep-link editing and authorization remain unchanged.
- `src/components/measurements/MeasurementWizard.tsx`: localized six-step progress, responsive form/guidance columns and shared card presentation. Form defaults, schema, validation sequencing, navigation and submit behavior unchanged.
- `src/components/measurements/NumberSlider.tsx`: uses existing shared Slider with original ranges, steps and values; missing values remain unset until interaction. Pointer and keyboard interactions mark dependent measurements as manually edited. Read-only measurements use mono values.
- `src/components/measurements/IllustratedMeasurementHelp.tsx`: keyboard-accessible disclosure with existing localized label, original instructions and illustrations retained.
- `src/components/measurements/StepRidingStyle.tsx`: existing choice keys presented through OptionCard; position labels reuse localized `messages.fit.goals`.
- `src/components/profile/RidingStyleCard.tsx`: same OptionCard presentation for inline riding edits; profile assessment slider export uses the existing shared Slider through a profile-specific wrapper. Payloads and save/cancel state unchanged.
- `src/components/profile/ProfilePhotoUpload.tsx`: 44px minimum avatar control and visible keyboard focus; upload hook, accepted formats, mutation, preview and errors unchanged.
- `src/components/account/ProfileWizardGuide.tsx`: NL/EN page-local guide copy and localized real improve links, using the existing illustration asset.
- `src/components/account/ProfileChoiceQuestion.tsx`: account-specific choice and assessment presentation using shared OptionCard/Slider; original string keys and zero-based pain severity preserved.
- `src/components/measurements/MeasurementWizard.test.tsx`: six-step NL/EN navigation/submission and required-measurement blocking.
- `src/components/measurements/NumberSlider.test.tsx`: unset optional values, keyboard/manual-edit ordering, fractional values/errors, read-only missing values.
- `src/components/account/ProfileChoiceQuestion.test.tsx`: unanswered choices, original selection keys, assessment keyboard mapping and localized live guide links.
- This handoff file.

## Behavior and localization

Preserved measurement prediction effects, optional schema fields, all assessment and riding choices, pain-area validation, form state, save/cancel/error flows, photo flows, weight-change pressure refresh and fit links. Existing English-only legacy help prose and validation-schema text were not translated or rewritten as part of the presentation pass; all new copy is NL/EN and shared dictionaries are untouched. In particular, existing height-based auto-population of optional wizard values remains unchanged rather than adopting the draft's different optional-field toggles.

## Verification

18 tests pass across six focused suites: MeasurementWizard, NumberSlider, StepComfort, StepRidingStyle, ComfortLevelBar, ProfileChoiceQuestion. The wizard test initially matched both its progress bar and the assessment bar; it now selects the correctly named wizard progress bar and passes in both locales.

Scoped ESLint passes for all twelve owned TS/TSX files. Scoped `git diff --check` passes. No whole build, whole lint, full typecheck, integration, E2E or screenshots run by this worker.

## Parent integration / harness

- No shared UI source changes requested. Shared Slider/OptionCard/Card/Button APIs are reused as they stand. Header, Footer, globals.css, sidebar/layout, shared dictionaries and ProfileImproveGuideClient.tsx were not edited by this worker.
- Capture `/nl/profile` and `/en/profile` at 1440 and 390 with the parent shell. Verify no horizontal overflow, focus visibility, touch targets, expanded measurement help and long translated labels.
- Cover loading (`getMyProfile` undefined), onboarding (null), saved profile, wizard edit/cancel, all six wizard steps, save failure, individual card editors, missing optional measurements, photo upload/error and weight-change pressure refresh.
- A fixture harness must stay outside live UI. Mount the real ProfilePage with localized pathname/searchParams, router, Toast provider and Convex hooks/providers. Supply `getMyProfile`, `getCurrentUser`, `getRecalculableBikeCount`; stub the existing profile/user/pressure mutations and image upload/resolution dependencies. Use deferred/rejected mutations for pending/error checks. No live backend changes are necessary for rendering fixtures.
- Parent should inspect old help prose localization and unchanged optional-value prediction behavior separately if a broader copy/behavior change is desired; those were not silently changed to match the design prototype.

DONE 20.1 — profile-owned slice only; awaiting parent integration/review.
