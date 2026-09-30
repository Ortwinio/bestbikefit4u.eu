# 26 — Six-page PDF report

Initial round 26 was approved in 89ef75c. Round 26.1 is ready for lead review; no commit or push by C.
The existing report route, authorization, payment behavior and network resource policy remain unchanged.
Round 26.1 adds two optional report fields mapped from already-queried profile/bike data.
PDF-only copy is bilingual in reportV2Copy.ts; dashboard consumers retain browser-safe exports.

## Page order and field mapping

| PDF | Canvas | Session fields and behavior |
|---|---|---|
| 1 | FitRapport1 | rider.name; bike.name; reportDate; profile.goal/sessionId/globalConfidence; detailedFit A–D targetLabel; first three ready prioritySummary rows |
| 2 | FitRapport6 | rider dimensions and three scores; bike identity; goal/style/questionnaire; missing cards and scores omitted |
| 3 | FitRapport2 | detailedFit targets; only actual rangeLabel intervals; blank handwritten current-value boxes; parsed stem angle; frameTargets |
| 4 | FitRapport5 | saved tirePressure front/rear bar and psi, actual inputs/surface/warnings; blank measured-pressure column |
| 5 | FitRapport3 | first three available adjustmentSequence entries; educational day strip and trial guidance; blank ride log; bounded fitNotes excerpt |
| 6 | FitRapport4 | available A–D targets; bilingual measuring instructions, pressure check, disclaimer and unchecked 14-day checklist |

No board example identity or numerical session value is hardcoded. General educational copy and
blank forms are retained when personalized data is absent. A4 page structure stays six sheets.

## Data limitations and deliberate departures

- Completeness 14/19 and its progress bar are hidden: no canonical denominator exists in reportV2.
- Reported pain locations, current frame size, bike weight, tire/rim specifications are omitted
  when absent. Recommended frame size is not substituted for the rider's current frame size.
- Pressure per-surface alternatives cannot be recalculated reliably: the existing payload lacks
  front/rear tire widths and tube type required by the engine. Only the recorded surface is shown.
  Pending pressure omits gauges/table rather than displaying quick-start example values.
- Pending target rows are hidden; zero-valued valid targets remain visible.
- Range bars appear only for a real parsable range. Stem angle is extracted from the existing
  stem target label; missing angle/frame data hides those cards.
- **D is saddle-to-handlebar reach.** convex/recommendations/seedEngine.ts maps
  handlebarReachMm from saddleToBarReachMm. The canvas raster's BB-to-bar arrow is corrected with
  an SVG overlay, and page 6 explains the saddle/contact-point reference. No engine value changed.
- Superseded in 26.1: known engine notes are localized before excerpting; unknown note provenance
  uses an explicit translation-unavailable notice in Dutch. Long notes retain a dashboard reference. Excessive pressure warnings are replaced by an explicit instruction to
  read all warnings in the dashboard before using the values, rather than partial safety advice.

## Rendering and deployment

True A4 (210 × 297 mm), six explicit page breaks, embedded per-page header/footer and page number.
The existing Chromium renderer opts into zero margins only for this report. Print colors remain
exact; JavaScript stays disabled and external-resource filtering remains in place.
Fonts are local SIL OFL assets (Bricolage Grotesque, Figtree, DM Mono). Static weight instances
avoid Chromium's unnamed Type3 output for variable fonts. See font README and bundled licenses.
Next output tracing explicitly includes the fonts, logo, bike drawing and three illustrations;
production route.js.nft.json verified all referenced assets.

## Validation — initial round 26

- Typecheck and full lint pass, including 254 contrast pairs and CSS-module token checks.
- Unit suite: 1,229 passed, 20 skipped; locale suite: 30 passed. 85 focused PDF/report tests cover both
  locales, missing data, escaped values, actual targets, range handling, six sheets and route access.
- Production build passes. No payload/schema/engine changes.
- Actual NL/EN PDFs, all 12 rasterized PDF pages, HTML captures and six board captures are local
  under code-renders/26-*. Browser overflow evidence: audit/26-browser.json.
- PDF page size, numbering and embedded-font verification: audit/26-pdf.json.
- Reproduce: node tests/visual/pdf-report/render.mjs, then Python with PyMuPDF:
  tests/visual/pdf-report/verify.py. Rendering requires local Chromium; Python verifier requires
  pymupdf (QA-only dependency, not added to the app).

## Long-input safeguards — initial round 26

The browser harness additionally checks sparse sessions, 80-character rider/bike names, 64-character
session IDs, two long notes, and warnings both beyond and just below the display budget in NL/EN.
Long summary metadata uses a smaller heading/diagram while retaining the full text. Longer note
blocks use compact ride-log spacing. No content is clipped to force a six-page result.
All eight browser cases (48 sheets) have no footer/horizontal overflow. All six stress PDFs
also contain exactly six pages.
Warnings over 240 combined characters or more than three entries use the explicit dashboard notice.
Canvas previews expand the repository's DC loops/bindings locally; no network runtime is required.

## Changed files

Current round 26.1 source/test/harness/notes manifest (round 26 is already committed): [files-26.txt](files-26.txt).
No PNG/PDF is versioned or included in the manifest. Parallel dashboard/layout/sweep work is excluded.


## 26.1 — Lead review fixes

- Dutch page 2 uses **Rompstabiliteit**. Visible PDF copy was audited; other static English strings
  belong to the EN branches. Technical terms (stack/reach, crank, PSI) and user-entered identifiers
  remain unchanged.
- **fitNotes provenance:** production `generateFromData` in `convex/recommendations/actions.ts`
  merges `generateFitNotes` output and `bikeRoleBias` advisory notes. The mapper forwards stored
  `recommendation.fitNotes`. This is machine-generated recommendation copy, not a user notes field.
  The old “Confirm long-ride comfort after each adjustment.” was a fixture-only sentence, absent
  from the engine; the fixture now uses exact engine templates with its real fixture measurements.
- `pdfEngineNotes.ts` translates known generated templates and all 18 bike/profile advisory summaries
  (including generated style/goal phrases and numerical mm values) before
  truncation. Stored string arrays have no author/provenance flag; the legacy create mutation accepts
  arbitrary strings, but no UI caller establishes user authorship. Unknown NL strings therefore get
  an explicit translation-unavailable/dashboard notice rather than an assumed user-text exemption.
- The full fixture calls `runEngineV1Seed`, then the real mapper. Engine `FitOutputs` and
  `seedEngine.buildRecommendationItems` provide ranges only for **A saddle height, C handlebar drop,
  D saddle-to-bar reach**. B setback, stem, crank and bar width have no source ranges; they stay blank.
  Page 1 follows its board's A–D value labels; the actual range bars belong to page 3.
- Full questionnaire context uses real valid enums: intermediate, 6–10 hours/week, long (80–150 km),
  performance priority and group riding. Optional report fields now carry existing query data:
  `profile.painAreas` → `rider.painAreas`, and `bike.currentGeometry.frameSize` →
  `bike.currentFrameSize`. No backend/schema/engine change; absent values remain hidden. Reported
  knee-front discomfort is distinct from the comfort score; current frame size is never inferred
  from a recommended frame size.
- Footer now keeps `Fitrapport · name · date · bestbikefit4u.eu` together on the left (localized
  “Fit report” in EN), with a monospace date and page number at the right. Long names alone ellipsize
  so the date/site/page number stay available.
- Baseline and full-data fixtures render in both locales: `26-report-{nl,en}.pdf` and
  `26-full-report-{nl,en}.pdf`; their page PNGs remain local. `verify.py` checks all four PDFs.
  Browser audit includes the full-data cases alongside sparse and long-input stress cases.

26.1 final validation: 115 focused report/PDF/route/fixture tests pass; full lint and typecheck pass.
The four baseline/full NL/EN PDFs each have six A4 pages, named embedded fonts, correct footers and
localized NL score/note checks in verify.py. All 10 browser cases / 60 sheets pass overflow checks.
Actual full-data NL/EN page previews inspected. No commit by C.
