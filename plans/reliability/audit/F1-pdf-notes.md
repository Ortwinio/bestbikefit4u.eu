# F1 PDF report — 5 October 2026

Implemented the Rapport design within the existing six-page report, preserving page order, engine targets,
identity, pressure, notes, measurement instructions and embedded fonts.

- Page 3 now labels its column `95%-bereik` / `95% range`. A–D use the shared reliability model;
  crank length uses its discrete size options. Legacy `rangeLabel` is retained in the payload for compatibility
  but never drawn: it may be the engine safety/test band, not uncertainty.
- Page 1 replaces the percentage gauge with the accuracy block, actual A–D ± values and the saddle model's
  next step. Unknown historical measurement method is explicitly an estimate, never invented as one measurement.
- `ReportV2Source.reliabilityEvidence` accepts actual collected evidence for profile-aware narrowing. Without
  evidence, the stored inseam is treated as declared. Missing inseam hides the saddle range; unsupported stem
  and handlebar-width ranges remain empty. Subscription level alone never narrows a range.
- Engine centre is untouched. A regression test keeps 787 mm and checks a recorded single measurement yields
  765–810 mm / ±23 mm. Public/default drop and reach remain ±30/±25 unless supplied evidence supports narrowing;
  the Rapport board's example ±20/±15 is not copied onto profiles without that evidence.
- Model widths are described as estimates awaiting validation, matching the written model's open calibration
  points. No invented empirical accuracy guarantee is added.

## Verification

- `vitest run src/lib/reports`: 12 files / 94 tests passed.
- Focused ESLint on all eight changed report files passed.
- Existing `tests/visual/pdf-report/render.mjs`: NL+EN baseline and full-data PDFs, plus sparse, long-input and
  warning-budget variants: six pages each, zero overflow. The summary diagram is slightly reduced to give the
  accuracy block and footer sufficient clearance, including long names.
- Existing `verify.py`: all four PDFs passed A4, six pages, N/6 footers, embedded Bricolage/Figtree/DM Mono fonts
  and Dutch language checks. Used PyMuPDF installed only in `/private/tmp/f1-pdf-python`.
- Inspected actual rasterized PDF summary and fit-value pages in both languages. No clipping/overlap.
- The runner and verifier now default to ignored `plans/reliability/renders/pdf/`, including machine audit JSON.
  Both accept `PDF_RENDER_OUTPUT_DIR` for reruns elsewhere. Old machine audit files were moved to `/private/tmp`,
  never included in the source file list.

No PDF route edits, commits, deploys, production access, environment edits or real mails.

## Changed files

- src/lib/reports/reportV2Types.ts
- src/lib/reports/reportV2Mapper.ts
- src/lib/reports/reportV2Mapper.test.ts
- src/lib/reports/reportV2Copy.ts
- src/lib/reports/pdfPages/fitValues.ts
- src/lib/reports/pdfPages/fitValues.test.ts
- src/lib/reports/pdfPages/summary.ts
- src/lib/reports/pdfPages/summary.test.ts
- tests/visual/pdf-report/render.mjs
- tests/visual/pdf-report/verify.py
- plans/reliability/messages/C-PDF-QA.md
- plans/reliability/audit/F1-pdf-notes.md
