# 04 Validation And Rollout

## Objective

Validate both the PDF rendering behavior and the visual alignment of the in-app report.

## Work

1. Test:
   - `src/app/api/reports/[sessionId]/pdf/route.test.ts`
   - `src/lib/reports/pdfLayoutTemplate.test.ts`
   - add/extend results-page component tests where useful
2. Run:
   - `npm run build:vercel`
   - targeted report tests
3. Manual QA:
   - local rich PDF
   - production-like PDF path
   - EN/NL report rendering
   - mobile and desktop results page
4. Verify viewer/download/email actions still work after UI alignment.

## Rollout Notes

- deploy Convex only if telemetry/report backend contracts change
- deploy frontend after the PDF rendering strategy is production-safe
- monitor logs for any continued `Rich PDF render failed, using simple fallback.` events

## Exit Criteria

- production-safe rich PDF path is shipped
- on-page report is visually aligned with the PDF
- tests and build pass
