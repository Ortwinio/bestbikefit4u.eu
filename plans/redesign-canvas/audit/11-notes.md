# 11 — Existing-board alignment

Date: 2026-09-29. Owner: Codex B. Five board workers (one per board); parent integrated the shared shells and performed final checks. Drafts only; no app code, canvas snapshot, publishing, or commits changed by this task.

## Deliverables and checks

| Draft | Size | check-board | check-runtime | PNGs |
|---|---|---|---|---|
| `drafts/Dashboard.dc.html` | 1440 × 1604 | PASS | PASS, 70 states | 17 |
| `drafts/BikeProfile.dc.html` | 1440 × 2444 | PASS | PASS, 109 states | 15 |
| `drafts/History.dc.html` | 1440 × 1244 | PASS | PASS, 55 states | 14 |
| `drafts/Main.dc.html` | 1440 × 4600 | PASS | PASS, 10 states | 3 |
| `drafts/Pricing.dc.html` | 1440 × 2700 | PASS | PASS, 1 state | 1 |

Final commands, from repository root:

```sh
for name in Dashboard BikeProfile History Main Pricing; do
  node plans/redesign-canvas/check-board.mjs plans/redesign-canvas/drafts/$name.dc.html
  node plans/redesign-canvas/check-runtime.mjs plans/redesign-canvas/drafts/$name.dc.html
done
```

All 245 runtime traversals pass, without unbound-handler warnings. Fifty PNGs are in `drafts/_renders/`; each default is named `<Board>.png`, variants `<Board>-<state>.png`.

Parent assertions also pass: PNG file counts and IHDR dimensions match the table; all three account sidebars have eleven links and one active item; their first root child is Ontwerpstaat; Main/Pricing footer markup is identical; Dashboard new-account usage is zero; adjusting BikeProfile changes the illustration but not saved measurements/targets; History deletion removes only the selected local fixture; all 101 Home slider values match the default-context estimate and band.

Rendering uses a local VM for DCLogic/state, JSDOM expansion of holes/conditionals/loops, and headless Chromium after fonts are ready. It does not execute `support.js` or represent native-canvas QA. The lead still owns publication and native review. All rendered states have width 1440, no content beyond their fixed height, no unresolved holes, no duplicate IDs, and no visible button/link/input shorter than 44px. Default boards and representative long/error states were visually inspected. Initial clipping and the absent History/BikeProfile sidebar plan blocks were corrected before refreshing renders.

## Shared rules

- Three account boards retain the 264px ink sidebar and 48px content margins. All eleven items and their order follow `src/components/layout/DashboardSidebar.tsx:50`; Dutch labels follow `src/i18n/messages/nl.ts:564`; board links follow `audit/route-map.md`. The current item has lime plus `aria-current="page"`.
- Plan/usage blocks are consistent; the new-account Dashboard state correctly shows zero used sessions. Payment links do not start checkout.
- Each multistate account board has its 44px dashed Ontwerpstaat strip above, outside, the shell; pills are 32px inside 44px targets. Main is one calculator-teaser screen and Pricing one paused-payment screen, so neither gets an artificial state switcher.
- Example data is marked once next to the heading, not appended to names or buttons. Loading/not-found states without example content do not require the chip. All account figures are fixtures, not live user measurements or verified manufacturer records.
- Main/Pricing share byte-identical footer markup copied from the concurrently available `drafts/HowItWorks.dc.html:8`, with its shared `mk-*` CSS. The header is the same component with only current-page selection changed. This adopts the existing phase-4 shell instead of introducing another footer.
- Footer columns/links derive from `src/components/layout/Footer.tsx:63`, `src/components/layout/Footer.tsx:96`, `src/components/layout/Footer.tsx:178`, `src/components/layout/Footer.tsx:241`, and `src/components/layout/Footer.tsx:272`; labels from `src/i18n/messages/nl.ts:19`. Guide slugs map to GuideDetail and both legal pages to Legal, per the route audit; these are template destinations, not claims that their default preview selects each originating article. Language links and sitemap use the actual site destinations.
- Off-palette colors replaced with the locked ink/lime/petrol/status palette, following `reference/brand.md:33`. Shared marketing shell retains the negative footer logo and NL/EN switch.

## Dashboard

Source: `src/app/(dashboard)/dashboard/page.tsx:58` (loading, greeting, profile and actions), `src/app/(dashboard)/dashboard/page.tsx:187` (garage), `src/components/bikes/BikeGarageOverview.tsx:185` (usage, latest advice, pressure), `src/components/profile/ProfilePhotoUpload.tsx:48` (photo), `src/components/dashboard-messages/DashboardMessageCards.tsx:30` (messages), `src/components/reports/FitReportActionGroup.tsx:88` (reports).

Replaced the speculative action checklist/check-in dashboard with the actual rider measurements, flexibility/core indicators, bike usage, fit advice, pressure context and next actions. Missing-profile, weight, bike, fit and pressure cases point to the correct boards. Kept the familiar card/ink-sidebar visual language rather than the unsupported content.

Removed fabricated fitscores, completed-adjustment counts, comfort check-ins and the hand-authored recent-session summary. A persisted adjustment checklist or longitudinal comfort log would be a separate feature proposal requiring storage, dates and a validated interpretation; neither is silently included here. Flexibility/core indicators are profile data, not a new fit score.

Review indices 0–13: `filled`, `empty`, `loading`, `missing-profile`, `no-bikes`, `no-fit`, `missing-weight`, `stale`, `no-pressure`, `climbing`, `report`, `report-error`, `photo-error`, `message`. Additional PNGs: `photo`, `download`, `email`. Use `component.renderVals().reviewStates[index].pick()` to select a review state.

## BikeProfile

Source: `src/app/(dashboard)/bikes/[bikeId]/page.tsx:233` (identity), `src/app/(dashboard)/bikes/[bikeId]/page.tsx:351` (passport), `src/app/(dashboard)/bikes/[bikeId]/page.tsx:386` (profiles); geometry: `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx:163`, `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx:187`, `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx:232`, `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx:252`; stored measurement/recommendation shapes: `convex/schema.ts:438`, `convex/schema.ts:1211`; report actions: `src/components/reports/FitReportActionGroup.tsx:88`.

Added real identity, wheel/tire context, passport, geometry availability/update states, bike profiles and report actions. Removed the invented score, unsupported tolerance grading, fitter-email destination and speculative Pro gate on the actual report component.

The requested Nu vs. doel visual remains an explicit local comparison upgrade: stored dimensions are labeled separately; reach/drop are explicitly not stored on this example bike. Sliders change only the illustration/comparison and never the saved bike or report. Difference chips indicate a nonzero difference, not a medical or engine tolerance judgment. The list describes the first three local differences, not the engine's full adjustment prescription. Existing target±40 slider windows are visual comparison controls, not recommended physical adjustment ranges. Their persistence would require a separate product/data decision; the edit action points to BikeForm. This distinction avoids turning an attractive comparison into fabricated stored functionality.

Review indices 0–9 (also accepted as `props.view`): `linked`, `unlinked`, `missing-record`, `superseded`, `no-fit`, `passport-pending`, `public-fit`, `loading`, `not-found`, `report-error`. Additional PNGs: `report`, `copy-passport`, `download`, `email`, `at-target`. At-target sets `cur` to `{sh:742,sb:67,reach:552,drop:40,bw:400,crank:170}` and removes nonzero differences.

## History

Source: `src/app/(dashboard)/fit-history/page.tsx:30`; grouping/session summaries/deletion: `src/components/bikes/BikeWithFitHistory.tsx:126`; report actions: `src/components/reports/FitReportActionGroup.tsx:138`.

Replaced the unsourced line chart, comfort trend and per-ride adjustment table with sessions grouped by bike, status/date, recommendation availability, saddle height/drop, the existing recommendation confidence field, report actions and deletion confirmation. Confidence is an example of the actual field, not a new comfort score. Removed the speculative retention/upgrade panel from this screen; plan terms remain on Pricing.

Future suggestion only: saddle/comfort trends need dated measurements, actual ride feedback and an agreed aggregation contract. Current recommendation records alone do not support the removed chart.

Review indices 0–12: `filled`, `empty`, `loading`, `error`, `unlinked`, `statuses`, `report`, `report-error`, `delete`, `deleting`, `delete-error`, `email-missing`, `download-error`. Additional `deleted` PNG removes only the first fixture locally. Destructive, report, email and photo interactions never call a backend, send mail, upload files or export anything; their notices disclose this boundary.

## Main — claim audit

The original section order/composition remains: hero, calculator cards, three steps, complaint guides, testimonials, report contents and closing CTA. Header/footer and vertical canvas size were adjusted for shared-shell consistency.

| Claim/number | Decision and source |
|---|---|
| 4,8 from 380+ riders | Kept as existing site copy: `src/app/(public)/page.tsx:226`. |
| 2.400+ fits, 180+ brands | Kept: `src/components/home/homeRedesignContent.ts:38`; also permitted in `reference/brand.md:21`. |
| Thomas/Laura/Pieter names, bike years and quotes | Aligned to `src/components/home/homeRedesignContent.ts:283`, `src/components/home/homeRedesignContent.ts:290`, `src/components/home/homeRedesignContent.ts:297`. |
| Testimonial changes: saddle −4mm, handlebar +10mm, saddle 3mm back | Kept from the same three source objects; not newly invented outcomes. No new pain-cure promise added. |
| Most-popular calculator badge | No verified supporting source; visible `[CLAIM — bron?]`. |
| Measurement-guide duration of three minutes | No verified supporting source; visible `[CLAIM — bron?]`. |
| Three-step workflow and calculator descriptions | `src/components/home/homeRedesignContent.ts:147`, `src/components/home/homeRedesignContent.ts:340`; navigation maps to actual boards. |
| Report outputs | `src/i18n/messages/nl.ts:264`; crank wording is advice, not an unsupported optimality guarantee. |
| Free/no-account calculator start | `src/app/(public)/pricing/page.tsx:111`; CTA leads to BikeFit. |
| Hero 84cm / 742mm | An example slider input and computed output, not proof of accuracy. Road/balanced/average flexibility/core context is visible; 55–105cm step0.5 follows `src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.tsx:212`. |
| Saddle estimate and adjustment band | Default-context 0.883 multiplier and 0.86–0.91 band from `convex/lib/fitAlgorithm/calculations.ts:90`, `convex/lib/fitAlgorithm/calculations.ts:118`. Simplified-rule comments identify the engine. Full refinements link to SaddleHeight. |
| Upgrade/purchase availability | Replaced with current payment-pause text from `src/app/(public)/pricing/page.tsx:172`; free-account and comparison links remain. |

Source-backed marketing copy means traceable to this repository, not an independent audit of live review records or business metrics. Source freshness remains the lead's publishing responsibility. The previous promise of an animated bike was removed because that animation does not exist. PNGs: default84cm, `minimum`55cm, `maximum`105cm.

## Pricing — claim audit

Retained the existing two-plan/comparison layout. Free €0 and Pro €9/month are `src/config/commercial.ts:265` and `src/config/commercial.ts:302`. Free's one monthly session, core recommendations, emailed report and seven-day history are `src/config/commercial.ts:291`. Pro unlimited sessions/bikes/history, advanced recommendations, PDF/email and priority support are `src/config/commercial.ts:334`. Comparison rows, including one Free bike and report/support distinctions, follow `src/config/commercial.ts:123`. The Meest gekozen badge already exists in `src/config/commercial.ts:333`; it is repository copy, not independently verified sales evidence.

Exact pause notice: “Betalingen zijn tijdelijk niet beschikbaar. Je kunt wel gratis een account aanmaken.” (`src/app/(public)/pricing/page.tsx:172`). The disabled Pro CTA says “Tijdelijk niet beschikbaar” (`src/app/(public)/pricing/page.tsx:275`). Free account creation follows the login route (`src/app/(public)/pricing/page.tsx:282`). No checkout call is simulated.

No June campaign is presented as active: `src/config/commercial.ts:7` sets its end to 2026-06-04; `src/config/commercial.ts:12` also checks the date. That date has passed. One state only: payments-paused.

## Handoff

Review/publish these five drafts and the fifty renders. No open implementation question blocks this task. The two visible Main claim placeholders remain intentional content gaps for the lead, not factual assertions. Other agents' concurrent app/source changes were left untouched.
