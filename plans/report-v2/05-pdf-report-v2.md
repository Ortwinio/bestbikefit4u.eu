# Step 05 — PDF Report V2

## Objective

Upgrade the PDF export to match the v2 report structure — rider profile, priority table, detailed fit table, adjustment sequence, tire pressure section, and 14-day plan. The PDF exports in a single language (the user's active locale at export time).

## Background

Read:
- `src/lib/reports/pdfLayoutTemplate.ts` — current PDF layout template
- `src/lib/reports/pdfValueMapping.ts` — current value mapping
- `src/lib/pdf/htmlPdf.ts` — HTML-to-PDF renderer
- `src/app/api/reports/[sessionId]/pdf/route.ts` — PDF API route
- `src/app/api/reports/[sessionId]/pdf/route.test.ts` — current route tests to extend
- `plans/feature-pdf-layout-upgrade/output-03-layout-implementation-notes.md` — notes from the previous PDF upgrade
- `plans/report-v2/bestbikefit4u_v2_report_and_migration_plan (1).docx.md` — Part A for the target PDF structure

## PDF Sections

The PDF should mirror the in-app results page (Step 03) exactly, but optimized for print/single-page reading:

1. **Cover / header**: Logo, "BestBikeFit4U Fit Report", session ID, export date, locale label
2. **Rider profile table**: compact 2-column layout (field | value)
3. **Priority summary**: table with status chips as text badges (no CSS dependency)
4. **Detailed fit table**: parameter | target | method | feel | watch-outs
5. **Adjustment sequence**: numbered list with measurement references and the 2–5mm guideline note
6. **Tire pressure**: calculated values or "Pending required data" notice
7. **14-day validation plan**: table
8. **Footer**: data quality note, disclaimer, generation timestamp

## Language Handling

The PDF API route currently does not accept a locale parameter. Add `locale` as a query param to the PDF route:
```
GET /api/reports/[sessionId]/pdf?locale=nl
```
Default to `"en"` if not provided.

Pass the locale to the template renderer so all copy is rendered in the correct language, using the same i18n strings from Step 04.

## Tasks

1. Read `pdfLayoutTemplate.ts`, `pdfValueMapping.ts`, `recommendationPdf.ts`, and the current route fallback behavior fully before making changes
2. Consume the Step 02 report payload contract from the PDF route. Do not introduce a second PDF-only mapping shape unless the output document explains exactly why it is unavoidable.
3. Update `pdfLayoutTemplate.ts` to render all 8 sections
4. Update `htmlPdf.ts` if needed for new layout requirements (page breaks, table styles)
5. Update the PDF API route to:
   - Accept `locale` query param
   - Use `getReportV2` Convex query (from Step 02)
   - Pass locale to renderer
   - Preserve the existing rate-limit check and simple-PDF fallback
6. Add a `Content-Disposition: attachment; filename="bestbikefit4u-report-[sessionId]-[locale].pdf"` header

## Fallback Behavior

If the v2 renderer fails (e.g. unexpected data shape), fall back to the current v1 PDF. Log the error to Sentry. Do not expose raw errors to the user.

## Testing

- Add/update `pdfLayoutTemplate.test.ts` to cover v2 sections
- Add/update `route.test.ts` to cover locale handling and fallback behavior
- Add a test that verifies locale param changes the output language of copy strings
- Add a test for the tire pressure pending-data path
- Run targeted report/PDF tests plus `npm run typecheck`

## Output

Write `output-05-pdf-report-v2.md`:
- Template sections implemented
- Locale handling approach
- Fallback mechanism
- Test coverage added
- Quality gate results
