# 40d — Dutch account and report language audit

## Scope and ownership

Reviewed the lead's `40-nl-scan-live.json` and `.py`, then audited account source,
including visible copy, enum labels, alt/ARIA text, placeholders, validation,
errors/toasts and metadata. The live scan mainly covers public pages; it is not
evidence that authenticated account screens or report emails are translated.

Hume audited/fixed profile, measurements and improvement guides. Erdos audited/
fixed the fit flow, questionnaire, results and app report actions. Boyle performed
a read-only bike-garage and backend/report audit. Parent reviewed integration and
owns dashboard, settings, feedback, metadata and final validation.

No frozen `src/i18n/messages/nl.ts` / `en.ts`, bike-owner, shared UI, PDF-owner or
backend files were changed. New Dutch copy is in `src/i18n/account/*`. No commits,
pushes, deployments, live emails or backend writes. Exact manifest: `files-40d.txt`.

## Fixed in owned files

- Account sidebar uses **Gratis**, not Free, in Dutch. Dashboard recreational
  riding no longer shows **Casual / fitness**. Existing saved enum values stay intact.
- Profile/wizard instructions, score descriptions, slider labels, illustration
  alt text, numeric validation and improvement exercises use Dutch copy. Existing
  English presentation remains unchanged.
- Questionnaire source headings, legacy questions, options and scale labels,
  including accessible group labels and position illustration alt, are localized.
- Results localize known bike/style/goal/surface/flexibility values, unavailable
  values, generated bike-name fallback and recognized engine notes. Numerical
  results, conditions and saved user content are not changed.
- App report download/email failures and account mutation failures use Dutch
  safe messages. The shared telemetry helper's English auth/permission/rate/input
  messages are translated at owned call sites; telemetry still receives the error.
- Feedback category/type/status/help/empty-state copy no longer exposes feature
  requests, supportcase, fit engine or release wording. Required-field validation
  is Dutch rather than **Titel is required.** Unknown submission exceptions use a
  Dutch fallback; English error behavior is preserved.
- Settings readiness/import explanations, generated Strava ride summaries, speed
  units, sync errors and billing text use Dutch. Raw backend billing/sync failures
  do not leak into Dutch UI. Display-name validation/error headings are localized.
- Dashboard notification-type badges use Dutch labels.
- Server metadata layouts for dashboard, profile, fit, fit-history, settings and
  feedback supply Dutch titles/descriptions/OG/Twitter. EN returns empty overrides,
  retaining its previous inherited metadata. Shared root metadata is not modified.

## Remaining findings for other owners

These are source-confirmed findings, not fixes included in this manifest.

| Owner / file:line | Finding and handoff |
| --- | --- |
| Backend / `convex/emails/actions.ts:24` | Report email has no locale argument. English subject/body at 76, 118, 125, 144, 218, 231–232; stored notes at 220. Add locale to the action and its callers, and localize the email template without changing report data. App toast localization does not fix the delivered email. |
| PDF C / `src/lib/reports/recommendationPdf.ts:154` | Simple PDF fallback prints raw component names, frame notes, rationale and notes (161, 169, 174), plus humanized English enums (185–187). This remains reachable from the PDF API fallback. |
| PDF C / `src/lib/reports/pdfShared.ts:85` | Dutch goal map lacks `aerodynamics`; line 115 uses **Casual / fitness**; line 171 preserves unmapped values. Owned app adapters cover known cases without editing this shared contract. |
| PDF C / `src/lib/reports/reportV2Mapper.ts:211` | Generated **Unnamed bike** reaches `pdfPages/summary.ts:23`; translate system fallback at rendering, not user bike names. |
| PDF C / `src/lib/reports/pdfPages/tires.ts:87` | Raw warning strings/codes are rendered without complete localization. |
| Lead / `src/i18n/messages/nl.ts:1520`, `:1581` | Frozen report section/score titles contain **Core stability**. Owned account presentation uses a Dutch adapter; report copy needs its owner to cover every consumer. |
| Bike D / `src/components/features/bikes/CreateBikeForm.tsx:412` | Gearing, Drivetrain, Front/Inner chainring, Wheel circumference, Cassette teeth, Groupset and Rear derailleur max cog labels at 421–460 are English. |
| Bike D / `src/app/(dashboard)/bikes/[bikeId]/BikeGearingCard.tsx:76` | Dutch branch says **Open gearing calculator**; related gearing wording at 82, 97, 100, 106, 113. |
| Bike D / `src/components/bikes/bikePhotoGalleryHelpers.ts:36` | Generated alt/thumbnail labels include **photo … of …** and **selected** (54). Preserve user bike names, translate templates. |
| Bike D / `src/components/features/bikes/MarktplaatsBikeImportFlow.tsx:104` | Confidence enums high/medium/low precede vertrouwen (also 484, 519, 531, 543, 555); `marktplaatsImport.ts:343` emits raw bike-type enums. |
| Bike D / `src/components/bikes/BikeWheelsetManager.tsx:136` | hooked/hookless appear raw in summaries/options (199); also `CreateBikeForm.tsx:530`. |
| Bike D / `src/components/features/bikes/MarktplaatsBikeImportFlow.tsx:335` | Preview/save catches (also 381) expose raw parse/backend errors; `BikePassportImportFlow.tsx:81` similarly returns unmapped raw errors. |
| Bike D / `src/app/(dashboard)/bikes/[bikeId]/page.tsx:131` | Default profile names can fall through to **Base/Mountain** (138), generated by `convex/bikeProfiles/defaults.ts:33`. Preserve custom names. |
| Bike/backend / `src/components/features/bikes/marktplaatsImport.ts:135` | Generated **Imported bike** fallback; also **Imported bike draft** in `convex/bikeImports/shared.ts:242`. |
| Backend / `convex/bikes/description.ts:43` | Dutch fallback description interpolates raw road/racing/performance enums. |
| Root metadata owner / `src/app/layout.tsx:43` | English description remains inherited outside the six owned metadata layouts, including garage routes. Apply locale-aware metadata in the owning routes. |
| Shared telemetry owner / `src/lib/telemetry.ts:34` | Safe auth/permission/rate/input errors are English. Owned callers wrap these; other consumers still need localization. |
| Shared UI C / `src/components/ui/Toast.tsx:221` | BaseToast viewport defaults to **Notifications** in NL. Confirmed across the fresh browser sweep. |
| Shared UI C / `src/components/ui/ThemeToggle.tsx:29` | Theme radio group has **Theme selection** aria-label in Dutch settings. Confirmed in the browser sweep. |

Frozen garage dictionary also contains rider/quick check (`nl.ts:2433`, 2466,
2783, 2799), thumbnail/fullscreen/viewer (2491, 2497, 2498) and technical English
copy/workspace/server-side/custom fallback (2524, 2629, 2744, 2849, 2924, 2966).
Lead or bike owner should migrate these to the account dictionary and update
their consumers, rather than editing frozen dictionaries as part of this task.

Unknown recommendation notes and unmapped pressure warnings remain verbatim in
the account results (`src/i18n/account/fitAudit.ts:71`,
`src/app/(dashboard)/fit/[sessionId]/results/components/TirePressureSection.tsx:83`).
They need additional source-owner translation coverage. We do not hide potentially
important fit advice or invent a translated meaning for unknown content.

User bike names, wheelset/tire product names, imported descriptions, user feedback
and comments are user/content data and are not automatically translated. Accepted
cycling terms and brand names are preserved. This task does **not** certify an
English-free delivered PDF/email until the listed owner follow-ups are resolved.

## Validation

- Focused account tests: **45 files / 336 tests passed**. Dutch text and EN
  preservation assertions cover validation, enum labels, illustrations, report
  actions, metadata, profile/wizard and questionnaire. Final typecheck passes after
  `npx next typegen` refreshes stale generated layout route types.
- Full lint passes, including 254 contrast checks and 19 token-only CSS modules.
  `git diff --check` passes. Frozen dictionaries are unchanged by B.
- Sweep command: `node tests/visual/final-sweep/sweep.mjs --filter=/dashboard,/profile,/fit,/settings,/feedback --port=4349 --output=plans/redesign-canvas/final-sweep/40d --label=40d`.
- This substring filter includes public `/fit-pass` and comparison routes as well
  as owned account routes. Keep the raw language failures: shared Notifications
  and Theme selection need C's fixes. The new heuristic also flags the synthetic
  user bike name **Endurance racefiets**, valid Dutch **Beginner**, and **last**
  in an otherwise Dutch paragraph. User data and valid Dutch were not rewritten
  to satisfy a word-list heuristic.
- Raw sweep totals: **56 cases / 14 routes**, 28 without failures and 28 with
  language findings. All status/runtime/overflow/heading/locale/image checks pass;
  **56 axe checks pass**, **28 mobile touch-target checks pass** (28 desktop skips).
  SEO is checked only for the 4 public cases; 52 account fixture cases skip it.
  This is not reported as an all-green language gate.
- The first snapshot attempt collided with another agent's build lock. Retrying
  reused the completed matching production snapshot successfully (source hash
  `e240c5120c5f2abb5d8c3854b9dc7d7e552bfcf29cfc3972dddf5a692f257f0e`, build ID
  `MzVS8aqeCngM6FyASv_i6`). The local `build.log` retains the earlier lock failure;
  `run-context.json` records the successful snapshot reuse. No other agent's process was
  stopped, and no production configuration or checking rules were weakened.
- Renders/reports are local in `final-sweep/40d/`; fixtures use synthetic auth/data.
  Browser checks do not exercise live email delivery or certify the generated PDF.
