# 27 — Dashboard / report alignment

## Board comparison

Compared `git show 0a7183d:plans/redesign-canvas/canvas/Dashboard.dc.html` with the
current read-only canvas board (1440 × 1764; formerly 1440 × 1604).

- Header, account shell and profile → garage ordering remain. Example identity
  and measurement values change; these are not production constants.
- Profile adds an extra-measurement tile, comfort alongside flexibility/core,
  three segmented scores, and a missing-data callout with example completeness.
- Bike context replaces the riding-style tile with current frame size, tires and
  rim type; questionnaire values and discomfort examples change.
- Fit advice changes from three plain numbers to A/C/D targets with test ranges
  and markers, followed by advice confidence and report date. Its report preview
  additionally exposes B (saddle setback), giving the same A–D vocabulary.
- Pressure remains per bike, now with a rim-type warning, changed example values,
  current pressures, and the existing recalculate/stale/missing states.
- The brief also requests “Pas eerst deze punten aan”; added the report's top
  three available priorities beneath confidence. All four A–D targets are shown
  directly rather than hiding B behind a separate preview.

## Data contract and ownership

Each latest fit resolves through the existing authenticated
`recommendations.queries.getReportV2` query, the exact query used by the PDF route,
and `mapReportV2Payload`. No backend query, engine, billing/access or PDF action
behavior changes. The existing latest-fit-by-bike selection and report actions
are retained. Queries live in one child per bike, never in a parent hook loop.

| Dashboard element | Source |
| --- | --- |
| A–D targets / available ranges | `report.detailedFit`, no independent rounding |
| Advice confidence / date | `report.profile.globalConfidence`, `report.reportDate` |
| First three adjustments | `report.prioritySummary`, excluding pending/missing rows, like PDF summary |
| Pressure for a fitted bike | `report.tirePressure` from the same latest saved calculation as PDF |
| Pressure without a fit | Existing bike `advisedPressureSummary`; independent of fit availability |
| Current pressures | Source calculation `currentFrontBar` / `currentRearBar` |
| Frame / tires / rim | Bike current geometry and active tire/wheelset summaries |
| Questionnaire | Mapped report context with existing saved-response fallback while loading |
| Rider scores | Same flexibility scale / comfort derivation as mapper, report score copy |
| Report wording | `getReportV2Copy`, `PDF_SUMMARY_COPY`, `localizePdfValue`, `formatPdfDate` |

Coordinated with C through `messages/20260930-c-to-b-info-report26-contract.md`
and the two B-to-C messages. B edits **no** `src/lib/reports/*` files. C's new
`PDF_SUMMARY_COPY` and browser-safe `pdfShared.ts` exports are dependencies of
this batch and must land with/before it. Dashboard-only bilingual copy lives in
`src/i18n/account/dashboardReport.ts`; frozen root dictionaries stay unchanged.

## Missing data and intentional differences

- No fabricated 14/19 completeness score: the report has no agreed denominator.
  Missing extra measurements get a real missing-state tile and callout instead.
- No invented test ranges; absent ranges have no range bar. The lime band's endpoints
  are the exact mapped bounds; the neutral track adds purely visual half-width padding.
  No extra numeric bounds are shown. Markers are decorative
  alongside textual values/ranges, avoiding another unnamed progressbar.
- Unknown rim type prompts checking actual tire/rim limits, not an unconditional
  5.0-bar limit copied from example data. Tire types use the actual schema enums.
- Pending-data targets/priorities and invalid confidence are omitted like the PDF
  summary. Loading and unavailable report sources are distinct; neither uses a
  different recommendation as a silent fallback.
- No saved pressure produces a bike-specific calculator link, never example psi.
- Existing uploaded bike photos remain; missing photos use the report illustration.
- The current profile is editable live; each bike's PDF source remains its session
  profile. No archived session profile is overwritten with newer profile data.
- Existing climbing advice and stale-pressure warnings remain available.

## Validation and renders

- Dashboard/range/score and adjacent dashboard tests: **5 files, 39 tests pass**.
  Covers both locales, exact mapped A–D/ranges/confidence, separate bike sessions,
  pending-data filtering, pressure without fit, saved metadata and missing sources.
- Full lint passes, including **254 contrast pairs** and **18 token-only modules**.
- Full unit suite on the combined tree: **1,185 passed, 20 skipped** (before the
  final two added dashboard tests); i18n: **30 passed**. Final rerun recorded below.
- Light/dark, NL/EN, 1440/390: **72 browser cases**, all without runtime errors,
  unexpected queries, overflow or sub-44px controls. Automated solid-background
  text contrast / sampled focus checks pass; not a complete accessibility audit.
  This includes eight additional missing-extra-measurement callout cases.
- Renders and theme JSON: `code-renders/27-light-*`, `27-dark-*`; board reference:
  `code-renders/27-board.png`. Board rendering resolves its blob illustration to
  the supplied `public/brand/report/bike-dimensions.png` without changing the board.
  The review strip's intentional horizontal scrolling is not production UI.
- Actual account components use isolated synthetic Convex/auth fixtures. No real
  backend writes, emails, PDF downloads, auth bypass, git commit or deployment.

The initial isolated production build compiled successfully, then failed on C's
in-progress `src/lib/reports/pdfPages/fitValues.ts` TS7053 errors at 54/76/105.
Full typecheck reports the same out-of-scope errors, no dashboard errors. C was
notified; those files are not modified here. Build log:
`code-renders/27-sweep/build.log`. No passing combined build/production sweep is
claimed while this integration blocker remains.

Final combined unit rerun: **1,191 tests passed, 20 skipped**, with one suite
unable to load: C's `pdfLayoutTemplate.test.ts` currently imports the unfinished
`pdfPages/measurement.ts`. Final i18n rerun: **30/30 pass**. Focused dashboard
checks remain **39/39 pass**. Both combined-tree blockers are reported to C;
lead must rerun combined unit/typecheck/build gates once task 26 is integrated.

Reproduce visuals using `tests/visual/account-batch1/capture.mjs` with
`VISUAL_FILTER=dashboard`, `VISUAL_THEME=light` or `dark`, `VISUAL_PREFIX=27-light-`
or `27-dark-`, and `VISUAL_OUTPUT=plans/redesign-canvas/code-renders`.

## 27.1 — Lead visual review corrections

- Dutch score heading and accessible name now use account-owned `Rompstabiliteit`.
  Reviewed profile, bike usage, A–D, priority, pressure and missing-state labels in
  Dutch; no other raw English enum labels found. Saved bike names, plan names and
  established terms such as Tubeless remain unchanged.
- Dashboard numeric presentation explicitly uses `var(--font-mono)` throughout
  profile tiles, scores, targets, range captions, priorities, confidence/date and
  pressure, including Huidig. Units are separate small muted spans.
- Range bars show the exact mapped band at 25–75% of a neutral track, with a
  target marker on that padded scale. Numeric labels retain the mapped endpoints
  in compact `727-739 mm` form. Gauss implemented this isolated component and
  its 14 regression cases; parent reviewed and integrated the changes.
- Bike actions reuse shared primary/outline pill buttons; report availability is
  a conditional lime chip and saved discomfort entries are outlined chips.
- Found and fixed the capture harness's actual font-loading defect: concatenated
  Next CSS resolved relative font URLs against `/fixture.css`, causing fallback
  Arial despite the computed DM Mono family. Font URLs now resolve against their
  original stylesheet paths. Each capture requires successful real font loading
  and verifies numeric computed families, not just a `font-mono` class.
- Focused dashboard tests: **6 files / 56 tests pass**. Full lint passes, including
  **254 contrast checks / 19 token-only CSS modules**.
- Updated renders: `code-renders/27.1-light-*`, `code-renders/27.1-dark-*`.
  Task 27's original font-fallback renders are superseded by these captures.
- Final captures: **72/72 pass** (9 states × 2 locales × 2 widths × 2 themes),
  zero runtime/unknown-query/overflow/small-control findings. Solid-background
  contrast and sampled focus checks pass. Reviewed filled NL desktop/mobile
  screenshots in light/dark; real DM Mono digits and padded lime bands are visible.
- Final full-lint rerun encountered an unrelated concurrently added file:
  `tests/visual/final-sweep/slider-hydration-repro.mjs:18` assigns `module`, failing
  `@next/next/no-assign-module-variable`. Initial full lint was green; this file
  is not owned or modified by B. Focused tests remain **56/56** on the final tree.
  Final owned-file ESLint, `lint:contrast` (254/254) and `lint:css-modules`
  (19 files, zero raw colors) all pass independently.
- No report-owned source changes, backend writes, commits, pushes or deployments.
