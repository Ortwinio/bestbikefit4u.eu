# 10 — Account tools, settings and guidance

Drafts only. No app code, publication, backend requests or commit by Codex A.

## Shared references

- `BOARD-RULES.md` — account shell and review-state strip. Review-only controls are outside the product UI in a 44 px top strip; actual product tabs remain in the product UI. Single-state information pages have no strip.
- `canvas/Dashboard.dc.html:24` — 264 px ink sidebar and 48 px content margins.
- `src/components/layout/DashboardSidebar.tsx:50`, `src/i18n/messages/nl.ts:565`, `audit/route-map.md:78` — actual navigation order, Dutch labels and board destinations.
- Example rider, bikes, saved values and histories are explicitly examples. Actions demonstrate local UI states, not real account mutations.

## ShoeCleatFit

- `src/app/(dashboard)/shoe-cleat-fit/page.tsx:17` — topic and introduction; line 37 — foot/shoe/cleat context; line 66 — conservative changes and ride testing; line 82 — common signals; line 94 — initial checks; line 106 — when to seek help; line 118 — fit CTA.
- One read-only information state. Three-step checklist reformats the source's foot measurement → shoe volume → cleat position ordering; it is not an invented fitting wizard.
- CTA correctly targets `FitStart.dc.html` rather than the app's broken `/dashboard/fit` destination. No matching sidebar item exists for this route, so none is falsely marked current.

## FitMethod

- `src/app/(dashboard)/fit/how-it-works/page.tsx:20` — four input categories; line 64 — five calculation stages; line 118 — six report outputs; line 134 — practical tips; line 152 — return to fit.
- One read-only state. Source explanations are shortened into rider language without exposing calculation jargon. Actual source sequence and outputs are preserved. The `/fit` sidebar item is current, matching the app route-prefix behavior.

## Suggestions outside scope

### Account tools

- Pressure sources: `src/lib/pressure-engine.ts:134` calculation, `:214` warnings, `:329` validation; `src/components/features/pressure/PressureWizard.tsx:32` defaults and `:73` profile weight; `src/components/features/pressure/wizard/StepWeightGoal.tsx:50` weight/baggage; `src/components/features/pressure/wizard/StepWheelsetTires.tsx:117` tyre widths and optional equipment; `src/components/features/pressure/wizard/StepRoute.tsx:81` conditions; `src/components/features/pressure/wizard/StepResult.tsx:107` input mapping, `:198` calculation save, `:249` profile save; `convex/pressureProfiles/mutations.ts:16` profile upsert; `src/components/features/pressure/BikePressureCard.tsx:77` notes. Exact pressure calculation and warnings are carried into the draft, with approved public gauges.
- Pressure states rendered: filled, weight, conditions, loading, no bikes, no history, saved, save error, TT and hookless/high-pressure warning. Equipment values (21 mm rim, 6 bar material limit) are explicitly examples and read-only: source optional inputs have no bounded slider domains. No invented bounds. A future implementation must define those domains and forward rim type/internal widths on the saved-wheel path in StepResult, where those fields are currently omitted.
- Gearing sources: `src/app/(dashboard)/gearing/GearingCalculatorForm.tsx:128` inputs, `:145` bike prefills, `:163` FTP clearing, `:173` profile weight, `:247` cassette comparison, `:272` persistence, `:344` history, `:375` autosave; `convex/gearing/mutations.ts:78` validator and `:158` authenticated save; `src/lib/gearing-engine/math.ts:175` shared physics; `src/lib/gearing-engine/config.ts:61` duration bands. Uses approved public Gearing physics rather than the legacy account display approximation.
- Gearing states rendered: filled, missing FTP, no bike/manual, loading, save error, wheel refinement, gravel. Actual source imports profile weight but NOT FTP; draft states this rather than claiming nonexistent FTP prefilling. Cassette endpoints are disclosed as endpoints, not a fabricated complete cassette. Proposed duration 1–180 min and derailleur cog 9–54 slider domains need approval because account inputs lack explicit bounds; rider mass/FTP follow task-05 domains. Suggested implementation work: unify account/shared physics, persist FTP context, and define a full cassette editor.
- Saddle sources: `src/app/(dashboard)/saddle-selector/SaddleSelectorForm.tsx:263` defaults, `:343` calculation, `:387` save, `:437` inputs, `:647` outputs/history; `src/lib/saddle-width-engine/width-engine.ts:104` symptom adjustments, `:186` matching, `:212` calculation; `src/lib/saddle-width-engine/suitability-engine.ts:8` suitability. Retains approved public width math plus actual account adjustments and output recommendations.
- Saddle states rendered: measured, estimated, both refinement panels open with symptoms, saved and no history. Core/current shape/width-feel choices are retained as source inputs without falsely making them influence the width result when the current engine does not. Example saved advice is labelled.

### Settings, feedback and installation

- Settings sources: `src/app/(dashboard)/settings/page.tsx:78` state, `:135` deletion, `:155` name, `:176` connect, `:188` disconnect, `:200` billing portal, `:273` account/photo, `:295` paused payments, `:320` subscription, `:374` preferences, `:416` installation, `:418` Strava, `:609` deletion and `:635` confirmation; `src/i18n/messages/nl.ts:2012` deletion wording, `:2116` consent; `src/components/settings/IPhoneAppInstallCard.tsx:45` installation; `src/components/settings/StravaBikeImportSection.tsx:397` imports.
- Settings renders cover connected/disconnected/error, consent, disconnect confirmation, delete confirmation/error, loading, installed app, paid with/without billing link and import panel. Confirmation requires exact `Verwijder`; disabled primary controls now look disabled. Language/units controls remain real product controls. Potential follow-up: full imported-bike type confirmation, English content and dark-theme visual states. Review strip intentionally scrolls horizontally; product content does not overflow.
- Feedback sources: `src/components/feedback/FeedbackHubPage.tsx:37` tabs, `:120` queries, `:160` votes, `:268` own feedback, `:358` requests, `:438` releases; `src/components/feedback/FeedbackDialog.tsx:102` stages, `:341` authenticated contact behavior, `:362` required fields, `:402` bug fields, `:439` diagnostic disclosure; `src/components/feedback/feedback-flow.ts:52` validation; `src/components/feedback/FeedbackDetailDialog.tsx:33` read-only detail/comments; `convex/feedback/queries.ts:86` and `convex/feedback/mutations.ts:23` backend contracts.
- Feedback renders: own list, ideas, releases, empty/loading, type selection, all four form types, validation, submit failure/success, read-only detail and vote failure. Three feedback examples and votes are clearly examples. No fabricated reply composer.
- AppInstall sources: `src/app/app/page.tsx:12` standalone detection, `:27` browser detection, `:49` authentication redirects, `:88` status notices, `:103` instructions; `src/i18n/messages/nl.ts:2063` iPhone copy. Renders: iOS logged out, Android, desktop, logged in, other iPhone browser, installed logged in/out. No account sidebar.
- Android/desktop tabs show explicit `[INSTALLATIESTAPPEN ANDROID]` / `[INSTALLATIESTAPPEN DESKTOP]` placeholders: current source supplies only iPhone/Safari instructions. Obtain approved platform instructions rather than inventing steps. Also verify `src/app/manifest.ts:9` start URL `/` against the source instructions expecting `/app` as installation launch context.

## Final QA

- Parent reran both checkers for all eight boards: board PASS; runtime PASS, 707 explored states (82 pressure, 217 gearing, 214 saddle, 1 shoe, 73 settings, 94 feedback, 1 method, 25 installation).
- 58 state PNGs under `drafts/_renders/`: 10 pressure, 7 gearing, 5 saddle, 12 settings, 15 feedback, 7 installation and 2 information pages. Full-height renders include loaded Bricolage Grotesque, Figtree and DM Mono fonts.
- Expanded-state overflow was corrected by matching board/preview heights: Pressure 1844, Gearing 2444, Saddle 2944. Product bounds, text clipping, 44 px button/input targets and unresolved bindings checked across render states. Intentional review-strip horizontal scrolling is excluded from product overflow checks.
- Parent visually reviewed calculator/refinement, information, feedback form, installation and destructive-dialog renders. Task-08 switcher work is separately recorded in `08-notes.md` (DONE 08b).
- Three subagents authored six boards; parent authored information boards, reconciled sizing, rendered and ran final checks. No publication, app edits or commit by this task. Await lead review; no phase gate claimed.

### Information pages

- A real cleat wizard would need its own input/output contract, validation and reviewed guidance; the present source is informational only. Do not infer such functionality from this draft.
- Correct the live shoe/cleat CTA from `/dashboard/fit` to `/fit` during implementation.
- Method-page scientific and clinical claims remain subject to source/content review; these drafts do not establish new validation evidence.
