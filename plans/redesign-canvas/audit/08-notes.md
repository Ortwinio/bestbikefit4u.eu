# 08 — Account profile and fit flow

Draft review handoff; no app code, publication or commit by Codex A.

## Shared decisions and sources

- Account layout follows `canvas/Dashboard.dc.html:24`: 1440-wide artboards, 264 px ink sidebar, 48 px content margins. Navigation follows `src/components/layout/DashboardSidebar.tsx:50`, labels `src/i18n/messages/nl.ts:565`, destinations `audit/route-map.md:78`.
- Sanne and all displayed measurements, bikes and usage are explicitly examples, not live account information.
- Checkout is paused as required by the brief. `src/config/billing.ts:2` implements the billing switches; `src/components/features/fitpass/FitPassPaywall.tsx:59` provides the paused state. The campaign in `src/config/commercial.ts:7` ended on 4 June 2026; no active free campaign is shown.
- Artboard interactions demonstrate UI states only; no backend writes, report downloads, email sends or payment calls are made.

## ProfileImprove

Sources:
- `src/components/profile/ProfileImproveGuideClient.tsx:60` — current level and categories; `src/components/profile/ProfileImproveGuideClient.tsx:202` — edit destinations; `src/components/profile/ProfileImproveGuideClient.tsx:258` — exercises; `src/components/profile/ProfileImproveGuideClient.tsx:286` — progress tips.
- `src/app/(dashboard)/profile/improve/body-measurements/page.tsx:22` — five strategies; progress tips at line 135.
- `src/app/(dashboard)/profile/improve/flexibility/page.tsx:22` — five exercises; progress tips at line 125.
- `src/app/(dashboard)/profile/improve/core-stability/page.tsx:22` — five exercises; progress tips at line 125.
- `src/app/(dashboard)/profile/improve/comfort/page.tsx:22` — seven adjustments; progress tips at line 179.
- `src/lib/validations/profile.ts:142` — comfort categories; `src/i18n/messages/nl.ts:1970` — guide headings.

States: `variant` is `body-measurements`, `flexibility` (default), `core-stability` or `comfort`; `exercise` selects an accordion item, with `-1` closing all. Four primary renders use `exercise:0`. Guides remain read-only; their CTAs return to the relevant profile-edit section.

## Profile

Sources:
- `src/components/measurements/MeasurementWizard.tsx:26` — six steps; validation/navigation at line 106.
- `src/lib/validations/measurementWizard.ts:3` — fields, ranges and enums; riding and conditional pain requirements at line 42.
- `src/components/measurements/StepBodyMeasurements.tsx:91` — required height/inseam and optional weight. `src/components/measurements/StepAdvancedMeasurements.tsx:132` — optional torso, arm, shoulder and femur measurements.
- `src/components/measurements/StepFlexibility.tsx:15`, `src/components/measurements/StepCoreStability.tsx:15`, `src/components/measurements/StepComfort.tsx:19`, `src/components/measurements/StepRidingStyle.tsx:10` — assessments and riding context.
- `src/lib/validations/profile.ts:125` — assessment descriptions; core durations at line 214. `src/i18n/messages/nl.ts:967`, `src/i18n/messages/nl.ts:1000`, `src/i18n/messages/nl.ts:1079` — distance, hours and pain options.
- `src/app/(dashboard)/profile/page.tsx:872` — summary/edit; save at line 1127; loading at line 1339; onboarding/full edit/errors at line 1343.

States: `step:1..6` covers body, optional advanced measurements, flexibility, core, comfort and riding context. `mode:new|summary|edit` and `status:ready|loading|error` cover onboarding, saved, editing and failure/loading. Comfort below five requires at least one pain area; all four riding choices are required before saving. Eleven renders cover these states, including all optional measurements expanded in onboarding and edit mode. Artboard height is 1400 to accommodate that expanded state. Measurement illustration uses the requested local asset path; the lead replaces it with a canvas asset at publication.

## FitQuestionnaire

Sources:
- `convex/questionnaire/questions.ts:224` — current-position options; line 247 — climbing choice; line 261 — conditional follow-up; line 282 — road riding; line 324 — terrain.
- `convex/questionnaire/questions.ts:358` — excludes profile questions from the session intake.
- `src/components/questionnaire/QuestionnaireContainer.tsx:85` — conditional visibility; save/advance/completion at line 149.
- `src/components/questionnaire/questions/PositionFeelingSelector.tsx:7` — exclusive good/no-bike options versus multi-select discomfort.
- `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx:75` — loading/missing session.

States: five source questions, with climbing importance visible only after yes. Default `view:questions,index:0`; indices 1–4 show road, terrain, climbing choice and follow-up. Selecting no removes the fifth question. `view:intro|loading|missing|empty|done` and `error:true` demonstrate the remaining lifecycle. Twelve renders include both climbing branches and all lifecycle states. Numeric profile questions are excluded from the real active questionnaire; this board therefore uses option cards, not invented sliders.

## FitStart

Sources:
- `src/app/(dashboard)/fit/page.tsx:68` — selected bike/create/error state; profile/loading at line 77; saved/inferred bike context at line 82; start gating at line 102; create mutation and questionnaire navigation at line 130.
- `src/app/(dashboard)/fit/page.tsx:218` — missing profile; incomplete riding profile at line 243; saved bikes/loading at line 266; add bike at line 318; empty garage at line 330; missing bike attributes at line 354; start/error actions at line 375.
- `src/i18n/messages/nl.ts:804` — Dutch fit-start copy.

States: `mode:selected` (default), `loaded` (no selection), `empty`, `missing-profile`, `missing-rider-profile`, `missing-attributes`, `loading`, `bikes-loading`, `error`, `creating`. Default `selectedBike:road`; no-selection render uses an empty string. All ten are rendered, plus an expanded review-controls view. Height 1400 accommodates the expanded controls and warning state. Session context is read-only and comes from the selected bike; there are no invented per-session riding-goal fields.

## FitResults

Sources:
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:74` — report source; paid access at line 87; climbing report substitution at line 98.
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:304` — loading/missing; incomplete/calculating/retry at line 322; email dialog at line 378; paid report actions at line 496; position tabs at line 573; priority summary and paid detail at lines 681–682.
- `src/lib/reports/reportV2Mapper.ts:259` — current setup; deltas at line 295; ranges at line 447; priorities at line 471; adjustment order at line 480.
- `drafts/BikeFit.dc.html:270` — schematic bike geometry reused; `src/components/features/fitpass/FitPassPaywall.tsx:59` — paused purchases.

States: `view:pro` (default), `free`, `pass`, `no-current`, `loading`, `missing`, `incomplete`, `calculating`, `error`; `profile:main|climbing` changes both targets and geometry. `emailOpen`, `emailSent`, `emailError` and `notice` cover report feedback. Thirteen renders include Pro/Free/Fit Pass, climbing, missing current measurements, loading/error states, email entry/sent, and PDF error. Example report targets are fixed illustration data, not freshly calculated recommendations for Sanne's profile. Stuurdrop has no current value/delta, matching the mapper. No current-setup editor is invented; report actions preserve access gating.

## Final QA

### 08b — Review-state strip

Moved the review controls on all five boards outside the product UI, into the prescribed 44 px top strip. Pill faces are 32 px inside 44 px click targets; active pills are ink/white, with horizontal scrolling available. Each artboard and its preview grew by exactly 44 px. All 51 state renders were refreshed; both checkers still pass (266 runtime states). Product controls such as the results position tabs remain inside the product UI.

- Each of the five boards had a separate subagent owner. Codex A performed the final source review, validation and rendering.
- `node plans/redesign-canvas/check-board.mjs plans/redesign-canvas/drafts/{Profile,ProfileImprove,FitStart,FitQuestionnaire,FitResults}.dc.html` — all PASS, no warnings.
- `node plans/redesign-canvas/check-runtime.mjs plans/redesign-canvas/drafts/{Profile,ProfileImprove,FitStart,FitQuestionnaire,FitResults}.dc.html` — all PASS, 266 states total, no unbound handlers.
- Supplemental flow assertions PASS: conditional profile pain/riding validation, nested choices, save/edit transition, questionnaire yes/no branching and exclusive choices, bike-context/start gating, paid report access, target deltas, changing drawing geometry, email state and unknown current values.
- 51 account PNGs in `drafts/_renders/`, all 1440 wide. Real Bricolage Grotesque, Figtree and DM Mono loaded. Browser geometry checks found no artboard overflow, horizontal clipping, unresolved text holes or undersized visible button/input targets across those states. Main layouts and key variants were visually inspected.
- Fixed two issues found only during rendering: expanded profile/start states needed more height, and custom loop markup inside a native table lost rows during HTML parsing. The comparison now uses an accessible grid table with all four rows visible.
- 03c also passes both checkers (110 states), with refreshed TirePressure (expanded), Login-email and Login-code renders. Duplicate warnings/spam hints removed, the pressure CTA panel fits its content, and gauge prose uses Figtree with numeric spans in DM Mono.

## Suggestions outside scope

- Correct the route-map description of `/profile/improve/body-measurements`: the real page covers BMI/body composition, not measurement instructions. Measurement instructions belong to Profile.
- Review `ProfileImproveGuideClient.tsx:167`: comfort category comparison uses a label string rather than a numeric index. The draft explicitly highlights an example category; no app fix is included.
- Source comfort/BMI claims need editorial and clinical review before publication. The draft retains existing source content rather than introducing new claims.
- Standardize the app's mixed English/Dutch measurement wizard copy and replace typed optional measurements with sliders at implementation time.
- Consider filtering road/terrain questions by bike context only after backend/frontend agreement; the current source presents both.
- Consider session-specific riding-goal overrides only as a future feature; current FitStart uses bike attributes. Clarify the invalid-aerodynamics-goal state, which currently only disables start.
- Results hero stats in `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:599` use the main fit even when the climbing tab is active. Keep them consistent with the active mapped report at implementation time; the draft does so.
- The requested result overview condenses the full report. Preserve rider/context, pressure, detailed validation and opt-in sections when implementing the complete report; do not remove their existing functionality.
