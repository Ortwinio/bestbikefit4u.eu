# 09 — Account: my bikes

Codex B handoff. Six subagents drafted one board each; parent reviewed sources, normalized the shared sidebar, ran final checks and rendered the states. Drafts only: no app changes, canvas publication or commit.

## Shared shell and scope

All boards use the Dashboard shell: ink sidebar 264 px, 48 px content margins, lime active item, example plan/usage footer. Navigation order comes from `src/components/layout/DashboardSidebar.tsx:50`; Dutch labels from `src/i18n/messages/nl.ts:564`; destinations from `audit/route-map.md:78`. Visual reference: `canvas/Dashboard.dc.html:24`.

Navigation: Dashboard, Mijn profiel, Mijn fietsgarage, Nieuwe fiets, Fietsafstelling, Nieuwe fit-sessie, Bandenspanning, Verzet, Zadelkiezer, Instellingen, Feedback. BikeAdd and create-form states activate Nieuwe fiets; edit, garage, import and compare states activate Mijn fietsgarage. Footer usage belongs to “Sanne · voorbeeldaccount”, not real account data. Checkout is not offered, following the explicit phase-3 payment-pause instruction; the account link goes to Settings. `docs/BILLING_SUPPORT_NOTES.md` describes support procedures rather than declaring the pause; billing feature flags are in `src/config/billing.ts:1`.

All imported bikes, photo shapes, identity options, report values and save actions are labeled local examples. No network lookup, account write, PDF download or email is performed. Input controls remain interactive; review switches expose service-dependent states. Source forms accept textual identity, URL, passport ID and cassette-list inputs, so these are text fields rather than fabricated numeric sliders. Optional measurements stay unknown until explicitly set and can be cleared.

## Boards, sources and states

### Bikes.dc.html — /bikes

Sources: `src/app/(dashboard)/bikes/page.tsx:53` (loading, entry actions and empty garage); `src/components/bikes/BikeGarageOverview.tsx:85` (latest fit), `:162` (identity), `:230` (usage), `:335` (advice); `src/components/reports/FitReportActionGroup.tsx:88` (actions), `:193` (report errors).

Garage rows show bike type, fit availability, usage from the latest session, latest advice and pressure context. The second example has no fit. States via `view`: `filled`, `empty`, `loading`, `stale`, `no-pressure`, `climbing`, `report-error`. `report: 'ready'` opens the report example; `report: 'error'` opens its error state. PDF/email actions only show local-preview notices. The latest-session context is shown without inventing a real session date.

### BikeAdd.dc.html — /bikes/new

Sources: `src/app/(dashboard)/bikes/new/page.tsx:13`; `src/i18n/messages/nl.ts:2581`.

Single chooser state. Three large cards link to BikeForm, BikeImportMarktplaats and BikeImportPassport. No invented import operation or fake loading state on this static route.

### BikeForm.dc.html — /bikes/new/manual and /bikes/[bikeId]/edit

Sources: `src/components/features/bikes/CreateBikeForm.tsx:95` (validation), `:491` (follow-up); `src/components/bikes/BikeForm.tsx:223` (optional geometry/setup), `:289` (deletion); `src/components/bikes/BikeGeometryLibraryFields.tsx:315` (guided selection), `:265` (preview); `src/components/bikes/bikeFormGeometry.ts:110` (fallback resets); `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx:60` (loading/missing/hydration). Read `plans/feature-bike-geometry-guided-picklist/README.md` and its implementation references.

Create includes identity, riding preferences, weight, required gearing and optional wheelset follow-up. Edit includes existing identity, optional measured geometry/setup, sharing and deletion. Brand → model → year where needed → size resets downstream selection. Missing catalogue entries, missing linked record and manual fallback are represented. Example selections deliberately do not manufacture verified catalogue geometry; library values are shown unavailable and measured values remain independent.

Review indices: 0 create, 1 edit, 2 loading, 3 not-found, 4 picker-loading, 5 no-models, 6 no-sizes, 7 missing-record, 8 error, 9 saving, 10 saved, 11 wheelset, 12 done. Use `reviews[index].pick()`, then `tab` = identity/details/gearing/measurements/sharing. Extra states: `fallback: true` and `deleteDialog: true` on edit.

Slider bounds needing approval (UI choices, not claimed engine limits): chainring 20–70 t, inner ring 20–60 t, wheel circumference 1000–3000 mm, derailleur maximum 10–60 t; stack 200–900 mm, reach 200–600 mm, seat/head angles 50–90°, saddle height 400–1000 mm, setback −100–200 mm, stem 20–200 mm and −45–45°, bar width 300–900 mm, crank 120–220 mm, internal rim widths 10–60 mm. Weight 3–20 kg, tire widths 18–80 mm and max pressure 3.5–10 bar follow CreateBikeForm validation. Discrete/millimeter steps and angle/weight/rim decimal steps are presentation choices where source has no strict step contract. The cassette is a variable-length tooth list; one scalar slider would lose the real data structure.

### BikeImportMarktplaats.dc.html — /bikes/import/marktplaats

Sources: `src/app/(dashboard)/bikes/import/marktplaats/page.tsx:1`; `src/components/features/bikes/MarktplaatsBikeImportFlow.tsx:275` (states/actions), `:510` (fields), `:598` (photos); `src/components/features/bikes/marktplaatsImport.ts:110` (URL validation); `src/lib/bikes.ts:15` (types); `src/i18n/messages/nl.ts:2460` (copy).

URL → editable preview → confirmation. Fields: name, brand, model, type, description. Confidence/warnings, recognized details, photo selection and primary-photo review are shown. Photo slots contain explicitly illustrative shapes, never scraped pictures. Saving without selected photos remains possible.

States via `screen` or `reviews[].pick()`: idle, loading, invalid, previewError, unavailable, ready, noPhotos, duplicate, saving, saveError, processing. Additional `selected: []` and empty-name states verify optional photos and blocked save. Confirmation stays local and exposes the saving state, not a fabricated created bike.

### BikeImportPassport.dc.html — /bikes/import/passport

Sources: `src/app/(dashboard)/bikes/import/passport/page.tsx:1`; `src/components/features/bikes/BikePassportImportFlow.tsx:102` (lookup), `:145` (save), `:273` (preview), `:337` (editable fields); `src/i18n/messages/nl.ts:2604`; `convex/bikes/mutations.ts:640` (copy behavior).

Passport ID → shared-bike preview → editable private copy. Name, brand, model, bike type and description are editable; geometry is informational, not invented as a user measurement. Original ownership remains unchanged. Missing details and existing-copy link have separate states. Default example has no available photos.

States through `reviewState` prop or `reviewStates[].pick()`: idle, loading, ready, missing, invalid, notFound, owned, unavailable, saveError, saving, existing. Example ID is BBF-AB12-CD34. Arbitrary real IDs are never looked up. Using review handlers resets input fixtures consistently for each state.

### BikeCompare.dc.html — /bikes/compare-fit

Sources: `src/app/(dashboard)/bikes/compare-fit/page.tsx:19` (explanation), `:78` (checklist), `:118` (CTA).

Single informational state, not a working calculator. Explains geometry, cockpit adjustment, desired position and when fuller assessment is useful. CTA correctly targets `Bikes.dc.html`; the app’s broken `/dashboard/bikes` path is not reproduced.

## Validation and renders

Both required checkers pass on all six boards. Runtime exploration: Bikes 37, BikeAdd 1, BikeForm 226, Marktplaats 94, Passport 82, BikeCompare 1 — 441 states total. Run from repo root:

```sh
node plans/redesign-canvas/check-board.mjs plans/redesign-canvas/drafts/<Name>.dc.html
node plans/redesign-canvas/check-runtime.mjs plans/redesign-canvas/drafts/<Name>.dc.html
```

The 53 PNG previews live in `drafts/_renders/<Name>.png` and `<Name>-<state>.png`. Default filenames cover the default state; additional images cover the review states and form tabs. Final board heights: Bikes 1404, BikeAdd 1000, BikeForm 1744, Marktplaats 2084, Passport 1724, BikeCompare 1120 px, all 1440 px wide. Long import/form boards keep their required review and field content rather than omitting functionality to meet a shorter target height.

Review-switcher follow-up: all four multi-state boards now have the specified 44 px Ontwerpstaat strip above the entire account shell, outside product content. It uses #EEF3EF, a dashed #B9CCC6 bottom border, the uppercase 12 px label, 13 px pills with 32 px visual height inside 44 px click targets, ink/white selection, and horizontal scrolling. Heights increased by exactly 44 px. BikeAdd and BikeCompare remain unchanged with no strip. All 51 affected PNGs were regenerated; both checkers still pass across 441 states.

Final render metrics across all 53 states: no horizontal or fixed-height overflow, no visible link/button/input below 44 px height, no duplicate visible IDs and no unresolved template holes. Parent also asserted sidebar order/active markers, no broken compare route, garage/report transitions, unsupported Marktplaats URLs, photo deselection, empty-name save guards, passport invalid/missing states, dependent frame-selection resets, optional measurements staying unset, and delete cancellation.

Local rendering evaluates DC state and expands template controls into HTML before Playwright screenshots. This is not native support.js/canvas validation. Parent checks representative screenshots, target sizes, fixed-height overflow, missing values and duplicate IDs; lead owns native canvas QA and publication.

## Suggestions outside scope

1. Build a real compare tool only after a separate contract: select two saved bikes, compare verified stack/reach and measured cockpit/setup side by side, show missing data/provenance and adjustment constraints. Do not add a universal fit score or purchase recommendation without a validated method.
2. Repair `/dashboard/bikes` in the app’s compare CTA during implementation.
3. Approve non-engine slider ranges, especially existing values outside the proposed windows. Retain clear/unknown behavior and full cassette lists.
4. Consider garage latest-session dates and query-error recovery; the current source does not expose these as dedicated garage UI states.
5. Reconcile passport frontend photo-count/copy wording with backend copying behavior before final implementation.
6. Replace backend-specific import error wording with rider-facing messages in app code, not just drafts. Preserve duplicate/in-progress distinctions.
