# B4 — canvas versus local implementation

## Scope and evidence

The current canvas manifest contains **109 boards**: 79 implemented surfaces, 10 known deviations, 3 missing follow-up mail surfaces, and 17 explicit release exclusions. Every manifest entry is accounted for below; `B4-inventory.json` stores route, existing source path, snapshot path, dimensions and extracted board headings. Regenerate the inventory with `node plans/rebrand/audit/B4-inventory.mjs`.

“Implemented” means the board's main surface exists in the source, **not** an unqualified pixel-match or acceptance of every review state. Snapshot mock names, measurements, dates and review-state switchers are not live-data requirements. No old logo is required to match an older snapshot. Pricing-v3 paid refinement/status areas on otherwise included boards are outside this branch.

Source/reference comparison and captured-viewport visual review are complete. Manually inspected **220 screenshot views across 55 board-equivalent routes**, NL/EN at 1440/390, in 28 contact sheets. This covers every included routed board family except the deliberately retired Marktplaats route. The first pass found the calculator header's wider new wordmark clipping the login link; integration fixed the responsive header and both final mobile locales were visually rechecked. Final integration evidence is `plans/rebrand/renders/sweep-final/report.json`: **320 cases / 80 routes, 315 cases with no findings; zero runtime, overflow, image, brand or axe failures**. The five remaining cases are the nonbrand findings listed below. No blanket claim of pixel parity or below-fold/state coverage is made: these are initial-state viewport captures (1440×1000 / 390×844), not full-page interactive acceptance. Account pages use actual UI with mocked auth/Convex, not production records.

Email visual review is complete: all current 11 templates, both locales, 375/600 px, 44 full-page renders, new brand, zero broken assets or horizontal overflow (`B3-notes.md`). Email dimensions follow the email renderer rather than stretching a mail to 1440 px. PDF boards use A4, not a 390 px report layout. B2 regenerated and reviewed all 12 actual NL/EN PDF page rasters after the initial HTML-capture issue; PDF acceptance and font/footer checks are recorded in `B2-notes.md`.

## Final visual findings and comparison limits

- Resolved brand-related finding: public fit calculator mobile header now puts language/login controls on their own row, preventing clipping at 390 px while preserving the full horizontal mark.
- Final sweep language heuristics flag Dutch `professional` on home (two widths) and `endurance` on saddle width (two widths). These are existing word-choice/classifier findings, not old brand text.
- Final sweep flags a 22 px-high EN contact-page link at 390 px. Existing nonbrand touch-target issue; not expanded into an unrelated UI redesign.
- RP6 account saddle-height desktop result card wraps the numeric result `745` into `74` and `5`; recorded as a nonbrand visual deviation, not fixed under the brand-only instruction.
- Blog index captures the empty local CMS state; detail uses a local article fixture. RP3 welcome has no pending handoff, RP7 advice has no saved advice, and BikeCompare captures its start state. Their populated, loading/error and every interaction state are not visually certified by this sweep.
- Public marketing headers, account negative sidebar/mobile marks, stacked login mark, localized guide headers, report pages and email headers preserve the selected brand consistently in inspected captures. Earlier board copy/fixture values are not used to undo later approved localization or riderprofile behavior.

## Known differences and unavailable evidence

- Resolved PDF preview issue: initial EN HTML screenshots lacked loaded images/numerals. B2 replaced that evidence with actual PDF rasterization, reviewed all 12 pages, and confirmed fonts/assets/footer; see `B2-notes.md`.
- `BikeSetup`: the current locale-route map redirects `/fiets-afstellen` to the localized bikefitting landing. The separate long setup-article canvas is therefore not the live destination; recorded as intentional route/design divergence.

- `BikeAdd` and `BikeImportMarktplaats`: approved task 46 retired Marktplaats import. Its route permanently redirects to bike creation; restore neither the tile nor scraper to match an obsolete board.
- `FitReport`: older three-page report board is superseded by six dedicated `FitRapport1–6` boards and corresponding six-page PDF modules.
- `Logo` and four `merk/*` exploration boards: only selected Badge 1.3.6 plus favicon F should ship; discarded proposals and the former mark are intentional differences.
- `N07Dag7`, `N14Dag14`, `M12Evaluatie`: no matching day-7 check-in/day-14 evaluation/review renderer exists in current exports. They are recorded as missing, not silently implemented during a brand-only task.
- Nine mail entries are in the current manifest but absent from the supplied snapshot folder. Seven map to existing rendered templates; two are the missing follow-ups. A reference comparison cannot be certified for absent files.
- Production CMS content/IDs are unverified by design; production reads and edits are prohibited. Static import inventory is in `B3-cms-inventory.md`.

## Explicit exclusions

Pricing-v3: `Pricing`, `FitPass` (current board title “Kies je meting”), `mail/M04FitPass`, `mail/M08Upgrade`, `mail/M10ProUitleg`, `mail/M13Overgang`, and all eight `afsluiten/*` desktop/mobile purchase boards. Gifts 2.1: `Cadeau`, `CadeauOntvangen`, `mail/M11Cadeau`. Existing fit-pass and commercial email brand surfaces still receive the rebrand; their new pricing designs are excluded.

## Every-board matrix

| Board | Status | Local equivalent | Source evidence | Comparison / scope note |
|---|---|---|---|---|
| `About.dc.html` | implemented | /about | `src/app/(public)/about/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `AppInstall.dc.html` | implemented | /app | `src/app/app/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `BikeAdd.dc.html` | deviates | /bikes/new | `src/app/(dashboard)/bikes/new/page.tsx` | Deviates intentionally: retired Marktplaats choice is absent; manual/passport choices remain. |
| `BikeCompare.dc.html` | implemented | /bikes/compare-fit | `src/app/(dashboard)/bikes/compare-fit/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `BikeFit.dc.html` | implemented | /calculators/bike-fit | `src/app/(public)/calculators/bike-fit/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `BikeFittingLanding.dc.html` | implemented | /bikefitting | `src/app/(public)/bikefitting/page.tsx` | Locale pair: /nl/bikefitting and /en/bike-fitting; shared localized landing. |
| `BikeForm.dc.html` | implemented | /bikes/new/manual | `src/app/(dashboard)/bikes/new/manual/page.tsx` | Create and /bikes/[bikeId]/edit share BikeForm; live autosave behavior exceeds static review controls. |
| `BikeImportMarktplaats.dc.html` | deviates | /bikes/import/marktplaats | `src/app/(dashboard)/bikes/import/marktplaats/page.tsx` | Deviates intentionally: permanent redirect to /bikes/new; import was removed by approved task 46. |
| `BikeImportPassport.dc.html` | implemented | /bikes/import/passport | `src/app/(dashboard)/bikes/import/passport/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `BikeProfile.dc.html` | implemented | /bikes/[bikeId] | `src/app/(dashboard)/bikes/[bikeId]/page.tsx` | Live bike provenance implementation includes riderprofile work; pricing-v3 paid score-cap portions remain another release. |
| `BikeSetup.dc.html` | deviates | /fiets-afstellen | `src/app/(public)/fiets-afstellen/page.tsx` | Deviates intentionally: localeRoutes redirects /fiets-afstellen to /nl/bikefitting or /en/bike-fitting; setup article board no longer has a separate live route. |
| `Bikes.dc.html` | implemented | /bikes | `src/app/(dashboard)/bikes/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `BlogArticle.dc.html` | implemented | /blog/[slug] | `src/app/(public)/blog/[slug]/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `BlogIndex.dc.html` | implemented | /blog | `src/app/(public)/blog/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `CaseStudy.dc.html` | implemented | /case-study | `src/app/(public)/case-study/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `ClimbPlanner.dc.html` | implemented | /calculators/climb-planner | `src/app/(public)/calculators/climb-planner/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `Contact.dc.html` | implemented | /contact | `src/app/(public)/contact/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `CrankLength.dc.html` | implemented | /calculators/crank-length | `src/app/(public)/calculators/crank-length/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `Dashboard.dc.html` | implemented | /dashboard | `src/app/(dashboard)/dashboard/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `FAQ.dc.html` | implemented | /faq | `src/app/(public)/faq/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `Feedback.dc.html` | implemented | /feedback | `src/app/(dashboard)/feedback/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `FitMethod.dc.html` | implemented | /fit/how-it-works | `src/app/(dashboard)/fit/how-it-works/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `FitPass.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `FitQuestionnaire.dc.html` | implemented | /fit/[sessionId]/questionnaire | `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `FitRapport1.dc.html` | implemented | Fit PDF export | `src/lib/reports/pdfPages/summary.ts` | A4 six-page report implementation; page/paper layout is reviewed in PDF renders, not responsive browser width. |
| `FitRapport2.dc.html` | implemented | Fit PDF export | `src/lib/reports/pdfPages/fitValues.ts` | A4 six-page report implementation; page/paper layout is reviewed in PDF renders, not responsive browser width. |
| `FitRapport3.dc.html` | implemented | Fit PDF export | `src/lib/reports/pdfPages/plan.ts` | A4 six-page report implementation; page/paper layout is reviewed in PDF renders, not responsive browser width. |
| `FitRapport4.dc.html` | implemented | Fit PDF export | `src/lib/reports/pdfPages/measurement.ts` | A4 six-page report implementation; page/paper layout is reviewed in PDF renders, not responsive browser width. |
| `FitRapport5.dc.html` | implemented | Fit PDF export | `src/lib/reports/pdfPages/tires.ts` | A4 six-page report implementation; page/paper layout is reviewed in PDF renders, not responsive browser width. |
| `FitRapport6.dc.html` | implemented | Fit PDF export | `src/lib/reports/pdfPages/baseData.ts` | A4 six-page report implementation; page/paper layout is reviewed in PDF renders, not responsive browser width. |
| `FitReport.dc.html` | deviates | Fit PDF export | `src/lib/reports/pdfLayoutTemplate.ts` | Older three-page board superseded by six dedicated FitRapport pages and six-page A4 renderer. |
| `FitResults.dc.html` | implemented | /fit/[sessionId]/results | `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `FitStart.dc.html` | implemented | /fit | `src/app/(dashboard)/fit/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `FrameSize.dc.html` | implemented | /calculators/frame-size | `src/app/(public)/calculators/frame-size/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `FtpWkg.dc.html` | implemented | /calculators/ftp-wkg | `src/app/(public)/calculators/ftp-wkg/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `FuelHydration.dc.html` | implemented | /calculators/fuel-hydration | `src/app/(public)/calculators/fuel-hydration/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `Gearing.dc.html` | implemented | /calculators/gearing | `src/app/(public)/calculators/gearing/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `GearingDashboard.dc.html` | implemented | /gearing | `src/app/(dashboard)/gearing/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `GuideDetail.dc.html` | implemented | /guides/[slug] | `src/app/(public)/guides/[slug]/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `Guides.dc.html` | implemented | /guides | `src/app/(public)/guides/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `History.dc.html` | implemented | /fit-history | `src/app/(dashboard)/fit-history/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `HowItWorks.dc.html` | implemented | /how-it-works | `src/app/(public)/how-it-works/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `Illustraties.dc.html` | implemented | Illustration asset library | `public/illustrations` | Design library, not a website route; existing ink illustrations reused without changing art style. |
| `Legal.dc.html` | implemented | /privacy | `src/app/(public)/privacy/page.tsx` | One board covers /privacy and /terms; production legal text is preserved except brand name. |
| `Login.dc.html` | implemented | /login | `src/app/(auth)/login/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `Logo.dc.html` | deviates | Brand asset library | `public/brand/svg/logo-horizontaal.svg` | Deviates intentionally: old logo board replaced by selected BikeFitBoost Badge 1.3.6 / favicon F. |
| `Main.dc.html` | implemented | / | `src/app/(public)/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `MeasurementGuide.dc.html` | implemented | /measurement-guide | `src/app/(public)/measurement-guide/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `PainDetail.dc.html` | implemented | /pain/[slug] | `src/app/(public)/pain/[slug]/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `PainIndex.dc.html` | implemented | /pain | `src/app/(public)/pain/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `PowerSpeed.dc.html` | implemented | /calculators/power-speed | `src/app/(public)/calculators/power-speed/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `PressureDashboard.dc.html` | implemented | /pressure-calculator | `src/app/(dashboard)/pressure-calculator/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `PressureLanding.dc.html` | implemented | /bandenspanning/[slug] | `src/app/(public)/bandenspanning/[slug]/page.tsx` | Parameterized NL /bandenspanning/* and EN /tire-pressure/*; board is one sample weight. |
| `Pricing.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `Profile.dc.html` | implemented | /profile | `src/app/(dashboard)/profile/page.tsx` | Live provenance/profile implementation includes subsequent riderprofile work; pricing-v3 locked-refinement portions remain another release. |
| `ProfileImprove.dc.html` | implemented | /profile/improve/flexibility | `src/app/(dashboard)/profile/improve/flexibility/page.tsx` | One board family covers body-measurements, flexibility, core-stability and comfort routes. |
| `SaddleHeight.dc.html` | implemented | /calculators/saddle-height | `src/app/(public)/calculators/saddle-height/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `SaddleSelector.dc.html` | implemented | /saddle-selector | `src/app/(dashboard)/saddle-selector/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `SaddleWidth.dc.html` | implemented | /calculators/saddle-width | `src/app/(public)/calculators/saddle-width/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `ScienceArticle.dc.html` | implemented | /science/bike-fit-methods | `src/app/(public)/science/bike-fit-methods/page.tsx` | One board covers /science/bike-fit-methods, /science/calculation-engine and /science/stack-and-reach. |
| `Settings.dc.html` | implemented | /settings | `src/app/(dashboard)/settings/page.tsx` | Brand surface implemented; pricing-v3 subscription/renewal changes are excluded from this release. |
| `ShoeCleatFit.dc.html` | implemented | /shoe-cleat-fit | `src/app/(dashboard)/shoe-cleat-fit/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `TirePressure.dc.html` | implemented | /tire-pressure-calculator | `src/app/(public)/tire-pressure-calculator/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `WhyBikeFit.dc.html` | implemented | /why-bikefit-matters | `src/app/(public)/why-bikefit-matters/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `m/BikeFit.dc.html` | implemented | /calculators/bike-fit | `src/app/(public)/calculators/bike-fit/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `m/Dashboard.dc.html` | implemented | /dashboard | `src/app/(dashboard)/dashboard/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `m/FitResults.dc.html` | implemented | /fit/[sessionId]/results | `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `m/Home.dc.html` | implemented | / | `src/app/(public)/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `m/Login.dc.html` | implemented | /login | `src/app/(auth)/login/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `m/SaddleHeight.dc.html` | implemented | /calculators/saddle-height | `src/app/(public)/calculators/saddle-height/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `mail/Bouwstenen.dc.html` | implemented | Email layout | `convex/emails/layout/index.ts` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `mail/M01Inlogcode.dc.html` | implemented | Email: loginCode | `convex/emails/templates/renderers.ts` | Both locales and 600/375 px email views rendered and inspected; renders/emails/loginCode-{nl,en}-{600,375}.png. **Reference file absent** from supplied snapshot. |
| `mail/M02Resultaten.dc.html` | implemented | Email: resultsSummary | `convex/emails/templates/renderers.ts` | Both locales and 600/375 px email views rendered and inspected; renders/emails/resultsSummary-{nl,en}-{600,375}.png. **Reference file absent** from supplied snapshot. |
| `mail/M03Fitrapport.dc.html` | implemented | Email: fitReport | `convex/emails/templates/renderers.ts` | Both locales and 600/375 px email views rendered and inspected; renders/emails/fitReport-{nl,en}-{600,375}.png. **Reference file absent** from supplied snapshot. |
| `mail/M04FitPass.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `mail/M06CaseStudy.dc.html` | implemented | Email: caseStudyConfirmation | `convex/emails/templates/renderers.ts` | Both locales and 600/375 px email views rendered and inspected; renders/emails/caseStudyConfirmation-{nl,en}-{600,375}.png. **Reference file absent** from supplied snapshot. |
| `mail/N01Dag1Tips.dc.html` | implemented | Email: day1Tips | `convex/emails/templates/renderers.ts` | Both locales and 600/375 px email views rendered and inspected; renders/emails/day1Tips-{nl,en}-{600,375}.png. **Reference file absent** from supplied snapshot. |
| `mail/M07FitHerinnering.dc.html` | implemented | Email: fitReminder | `convex/emails/templates/renderers.ts` | Both locales and 600/375 px email views rendered and inspected; renders/emails/fitReminder-{nl,en}-{600,375}.png. **Reference file absent** from supplied snapshot. |
| `mail/N07Dag7.dc.html` | missing | — | — | Missing: no day-7 check-in renderer in current email template exports; current-board reference file absent from snapshot. **Reference file absent** from supplied snapshot. |
| `mail/N14Dag14.dc.html` | missing | — | — | Missing: no day-14 evaluation renderer in current email template exports; current-board reference file absent from snapshot. **Reference file absent** from supplied snapshot. |
| `mail/M08Upgrade.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `mail/M09Winback.dc.html` | implemented | Email: winback | `convex/emails/templates/renderers.ts` | Both locales and 600/375 px email views rendered and inspected; renders/emails/winback-{nl,en}-{600,375}.png. **Reference file absent** from supplied snapshot. |
| `mail/M10ProUitleg.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `RP1PublicSaddle.dc.html` | implemented | /calculators/saddle-height | `src/app/(public)/calculators/saddle-height/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `RP2LoginHandoff.dc.html` | implemented | /login | `src/app/(auth)/login/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `RP3Welcome.dc.html` | implemented | /welcome | `src/app/welcome/WelcomeClient.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `RP4Dashboard.dc.html` | implemented | /dashboard | `src/app/(dashboard)/dashboard/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `RP5Profile.dc.html` | implemented | /profile | `src/app/(dashboard)/profile/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `RP6SaddleAccount.dc.html` | deviates | /tools/saddle-height | `src/app/(dashboard)/tools/saddle-height/page.tsx` | Deviates: desktop result card wraps 745 as 74 + 5 in the captured account fixture; nonbrand layout gap, not changed in this release. |
| `RP7Advice.dc.html` | implemented | /profile/advice | `src/app/(dashboard)/profile/advice/page.tsx` | Live grouped advice and performed/ride-feedback controls implemented; pricing-v3 paid upsell portions excluded. |
| `RP8Bike.dc.html` | implemented | /bikes/[bikeId] | `src/app/(dashboard)/bikes/[bikeId]/page.tsx` | Route and main board surface implemented; detailed visual evidence recorded separately. |
| `RPSidebar.dc.html` | implemented | Account sidebar | `src/components/layout/DashboardSidebar.tsx` | Shared account navigation includes profile scores; visual evidence comes from every account route. |
| `Cadeau.dc.html` | excluded | — | — | Gift release 2.1 excluded explicitly. |
| `CadeauOntvangen.dc.html` | excluded | — | — | Gift release 2.1 excluded explicitly. |
| `mail/M11Cadeau.dc.html` | excluded | — | — | Gift release 2.1 excluded explicitly. |
| `mail/M12Evaluatie.dc.html` | missing | — | — | Missing: no evaluation/review renderer in current email template exports; distinct follow-up, not a rebrand fix. |
| `mail/M13Overgang.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `afsluiten/Kies.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `afsluiten/Account.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `afsluiten/Bevestig.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `afsluiten/Gelukt.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `afsluiten/Mislukt.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `afsluiten/m/Kies.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `afsluiten/m/Bevestig.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `afsluiten/m/Gelukt.dc.html` | excluded | — | — | Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board. |
| `merk/BikeFitBoostLogos.dc.html` | deviates | Brand reference only | `public/brand/svg/logo-horizontaal.svg` | Design exploration, not site route: selected round-4 Badge 1.3.6 is implemented; other proposals intentionally not shipped. |
| `merk/BikeFitBoostLogos2.dc.html` | deviates | Brand reference only | `public/brand/svg/logo-horizontaal.svg` | Design exploration, not site route: selected round-4 Badge 1.3.6 is implemented; other proposals intentionally not shipped. |
| `merk/BikeFitBoostLogos3.dc.html` | deviates | Brand reference only | `public/brand/svg/logo-horizontaal.svg` | Design exploration, not site route: selected round-4 Badge 1.3.6 is implemented; other proposals intentionally not shipped. |
| `merk/BikeFitBoostLogos4.dc.html` | deviates | Brand reference only | `public/brand/svg/logo-horizontaal.svg` | Design exploration, not site route: selected round-4 Badge 1.3.6 is implemented; other proposals intentionally not shipped. |
