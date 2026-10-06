# U3 shared pressure, report and mail

One shared presentation (`shared/pressure/display.ts`) now renders front lime/rear ink, bar and psi in NL/EN. `PressureDisplay` is its React adapter; PDF tires uses the identical renderer and CSS. Numeric inputs are validated before markup, localized labels are fixed, no user HTML is interpolated. Display scales never claim to be a manufacturer limit. The optional safe range only renders when callers have actual positive manufacturer limits; current sources do not provide a complete trustworthy minimum+maximum pair, so none is invented from the board examples.

Integrated sources: PressureCalculatorForm (public and account), PressureResultCard (advanced wizard), PressureBikeLanding (first actual engine table row, its weight/setup visibly labeled), AdviceGroupsView (front and rear from the exact same record and bike), PDF tires. Dashboard/Bikes/BikeProfile/FitResults use this component through the account sibling's integration. Existing tables and sticky text summaries are retained as supporting data, not separate competing gauge components.

Report mail accepts optional saved pressure and prints `5,2 bar · 75 psi` / `5.2 bar · 75 psi` as text. The actual sendFitReport action supplies the existing access-filtered latestPressureCalculation; absent data stays absent. Auth, access and delivery behavior are unchanged. No real mail sent. Preview import graph remains pure; its allowlist explicitly includes only the new shared pure display module.

Round-3 pricing mail copy keeps current product prices. The numerical bike comparator is not live: replaced NL/EN subscription/upgrade comparison promises with setting up and saving bikes. This truthful exception overrides the canvas comparison promise until the feature exists. Re-rendered all mails. Existing product-driven renewal and upgrade prices remain intact. No new features or promises introduced. The open A4 per-surface-difference decision remains open: the PDF retains the one recorded surface instead of inventing pressures for other surfaces.

## Checks

163 focused tests in 11 files pass (shared pressure, every email template test, PDF tires, calculator pressure, SEO pressure and profile advice). Scoped ESLint passes. Whole-project TypeScript check passes at this checkpoint.

42 NL/EN email HTML/text previews and 84 screenshots at 600/375: no overflow, missing images or flex/grid. Inspected actual NL375/EN600 report pressure, NL375 M04 and EN375 M08. Existing mail assets and table/VML layout preserved.

Actual PDF render: baseline/full NL+EN, six pages each; all 10 fixture/stress variants have no content/footer overlap. `verify.py` passes all four PDFs (fonts, pages, text). Inspected both actual rasterized pressure pages, not just HTML previews. Front is lime/ink, rear ink/white with lime arc. All visible safety copy remains visible. Browser FitReport and A4 FitRapport5 share the same actual report renderer in the app; evidence for both is the pressure page of the real report, not a fabricated canvas replica. This does not claim that the pending multi-bike report layout is implemented.

Commands (explicit worktree root; no main checkout writes):

- `cd /Users/ortwinverreck/Developer/bikefitboost-usability && npx vitest run shared/pressure/display.test.ts convex/emails/templates src/lib/reports/pdfPages/tires.test.ts src/components/features/pressure/PressureReliability.test.tsx src/components/seo/PressureBikeLanding.test.tsx src/components/profile/AdviceGroupsView.test.tsx`
- `node /Users/ortwinverreck/Developer/bikefitboost-usability/scripts/render-email-previews.mjs --output=/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/mail`
- `PDF_RENDER_OUTPUT_DIR=/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/pdf node /Users/ortwinverreck/Developer/bikefitboost-usability/tests/visual/pdf-report/render.mjs`
- `PDF_RENDER_OUTPUT_DIR=/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/pdf PYTHONPATH=/private/tmp/f1-pdf-python python3 /Users/ortwinverreck/Developer/bikefitboost-usability/tests/visual/pdf-report/verify.py`

Both render scripts derive their root from their own absolute module location, never the session's process.cwd(). Screenshots/PDF/JSON are ignored local review artifacts. U3 parent owns the final integrated usability guard; this note does not claim it passed before that run.

## Narrow-card and public-example follow-up

Real React PressureDisplay rendered at total widths 180 and 340 px in a 390 px viewport. Fixed the discovered tiny-width overlap from fixed negative margins by using a contained proportional dial/value; title type scales within each wheel. Bounds assertions and visual inspection pass, no horizontal overflow.

PressureCalculatorForm now marks its real result and exposes the common example banner. Untouched numeric fields are gray and labeled example; touching one clears only that field's example. Session-prefilled and explicitly initialized values are never marked examples. The banner disappears after a deliberate edit or reuse. Regressions verify untouched defaults are never persisted. B notified through C-to-B-pressure-example.md.

PDFs regenerated after dial sizing; all four verify again and NL/EN actual pressure raster pages re-inspected. Mail previews regenerated after truthful comparison-copy adjustment; EN375 M08 re-inspected. Surface hashes refreshed.

## Build 5 guard review and corrections

Inspected all 24 pressure-account/profile-advice cases (NL/EN, 390/1440, free/paid/flag-off), including actual-size mobile crops. Saved explicit failures in ignored `guard/U3-build5/review-pressure.json` rather than approving them: advice gauges were squeezed into one facts column; pressure account's saved cards still used white tiles. Mobile feedback obscured the advice recalculate action (root handling shared overlay).

After root thaw: AdviceGroupsView pressure pair spans the complete row above the facts, with a readable max width. BikePressureCard now uses the same PressureDisplay and preserves calculation date, auto note, user notes/editing and recalculate controls. The actual always-visible warning section now has the safety marker; no safety text removed. Added regressions for full-row layout, saved-card shared presentation and preserved notes, and account safety copy. Real 180/340 shared-component bounds validation rerun. No entitlement/payload changes to free fit-results. Final green review requires a new build and new screenshots; build5 failures remain recorded.
