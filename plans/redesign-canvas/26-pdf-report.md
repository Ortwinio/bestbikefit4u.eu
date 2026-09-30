# 26 — New PDF fit report (6 × A4) (Codex C)

**App code, don't commit** (the lead reviews). The design comes from Ortwin on the canvas, page "Fitrapport (PDF)": `canvas/FitRapport1.dc.html` … `FitRapport6.dc.html` (794 × 1123 px = A4 @ 96 dpi). Page order in the PDF:

| PDF page | Board | Content |
|---|---|---|
| 1 | `FitRapport1` | Summary: name, bike/date/goal/session, the **bike drawing with A–D measurement labels** (`public/brand/report/bike-dimensions.png` + positioned labels), advice confidence (semicircle gauge), "Pas eerst deze punten aan" (top 3) |
| 2 | `FitRapport6` | Base data: rider (length, inseam, weight, extra measurements), flexibility/core/comfort as 5-segment bars, reported discomfort, bike table, "Hoe je fietst", profile completeness |
| 3 | `FitRapport2` | Fit values: per value a target, a test-margin bar and an empty "Nu" box to fill in by hand; stem angle + frame direction |
| 4 | `FitRapport5` | Tires: front/rear gauges, bar + psi, per-surface table with a "Gemeten" column, how to test, check the maximum |
| 5 | `FitRapport3` | 14-day plan (day strip + 3 phases), "Wat je voelt" table, ride log to fill in |
| 6 | `FitRapport4` | How to measure A–D, checking tire pressure, the disclaimer, and the "Klaar na 14 dagen?" checklist |

## How
- The existing pipeline stays: `src/app/api/reports/[sessionId]/pdf/route.ts` → HTML → `src/lib/pdf/htmlPdf.ts` (Chromium). Rebuild the HTML template (`src/lib/reports/pdfLayoutTemplate.ts` and related) to match the boards. Data comes **only** from the existing payload (`src/lib/reports/reportV2Mapper.ts` / `reportV2Types.ts`, `pdfValueMapping.ts`). If the design needs a field that doesn't exist (e.g. profile completeness 14/19, the per-surface table, stem angle), check first whether it can be derived from existing data or engines (the pressure engine provides per-surface values). If not, hide that block gracefully and note it in `audit/26-notes.md`. **Never show invented values.**
- **The example data on the boards (Lisa Jansen, 754 mm, …) is for layout only**; everything comes from the session.
- Fonts: Bricolage Grotesque, Figtree and DM Mono must be **embedded** in the PDF (check `resourcePolicy.ts`: no external network from Chromium; bundle the fonts locally or as a data URI through the existing asset path). Logo: `public/brand/report/report-logo.svg`. Illustrations: `public/illustrations/04-bandenspanning.webp`, `06-meetset.webp`, `08-stack-en-reach.webp`.
- Page breaks: exactly 6 pages, each 1123 px high, with a header (logo + section title + lime line) and a footer (name · date · bestbikefit4u.eu · N / 6) on every page. Print colors on (`print-color-adjust: exact`).
- i18n: NL + EN via the existing `reportV2Copy.ts` (add the new copy there in both languages).
- Access: Free vs Pro/Fit Pass behaviour of the PDF route stays unchanged (payments paused).

## Done when
- Unit tests for the template (all 6 pages present, page numbering, the A–D values come from the payload, blocks without data are hidden) plus the existing route tests stay green.
- `npm run typecheck`, `lint`, `test:unit`, `test:i18n` and `build` pass.
- Render the PDF locally with a fixture session (NL + EN) → save a `.pdf` and a PNG per page to `plans/redesign-canvas/code-renders/26-*`, next to the board renders for comparison.
- `audit/26-notes.md`: field mapping per page (board element → payload field), hidden blocks and why. `audit/files-26.txt` (no .png/.pdf). Print `DONE 26`.
