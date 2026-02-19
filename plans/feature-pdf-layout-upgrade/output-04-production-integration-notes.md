# Output 04: Production Integration Notes

Date: 2026-02-19
Owner: `@codex`

## Result

Step 04 status: `PASS`

The production PDF API route now attempts rich HTML-based rendering first and falls back automatically to the existing simple text PDF renderer when rich rendering fails.

## Route Integration Changes

Updated route:

- `src/app/api/reports/[sessionId]/pdf/route.ts`

What changed:

1. Added Node runtime pin:
   - `export const runtime = "nodejs";`
2. Integrated rich rendering flow:
   - map canonical values with `mapPdfReportData(...)`
   - render report HTML via `renderPdfReportHtml(...)`
   - generate PDF bytes via `renderPdfFromHtml(...)`
3. Added protected fallback path:
   - on rich-render exception, log contextual error and continue with:
     - `buildRecommendationPdfLines(...)`
     - `createSimplePdfFromLines(...)`
4. Preserved existing response behavior:
   - `Content-Type: application/pdf`
   - existing filename pattern using `${BRAND.reportSlug}-${sessionId}.pdf`
   - `Cache-Control: no-store`
5. Preserved auth/session/recommendation guards and existing API error semantics.

## New Renderer Utility

Added:

- `src/lib/pdf/htmlPdf.ts`

Behavior:

1. Uses Playwright Chromium to render provided HTML to A4 PDF.
2. Uses server-safe launch flags:
   - `--no-sandbox`
   - `--disable-setuid-sandbox`
3. Uses same margins as the template/example target.

## Fallback And Resilience Behavior

Fallback trigger:

1. Any exception in rich render path (mapping/template/browser launch/render) enters fallback.

Fallback action:

1. Generate legacy simple PDF from text lines.

Failure escalation:

1. If fallback also fails, route-level catch still returns:
   - `500` with `{ "error": "Failed to generate report." }`

## Test Coverage Updated

Updated tests:

- `src/app/api/reports/[sessionId]/pdf/route.test.ts`

Added/verified:

1. Rich renderer success path returns 200 PDF and does not call fallback renderer.
2. Rich renderer failure path falls back to simple renderer and still returns 200 PDF.
3. Existing auth and hard-failure semantics remain intact.

## Verification Run

Commands executed:

1. `npx vitest run 'src/app/api/reports/[sessionId]/pdf/route.test.ts'`
2. `npm run typecheck`

Result:

1. Route tests: pass (5/5)
2. Typecheck: pass

## Deployment Compatibility Notes

1. Route is explicitly Node runtime, which is required for Playwright/browser usage.
2. Browser import is isolated in renderer utility and executes only when rich rendering is attempted.
3. Runtime fallback limits blast radius if browser launch is unavailable in a given deployment environment.

## Exit Checklist

- [x] Route integration complete without auth regressions.
- [x] Fallback path implemented and tested.
- [x] Response headers/filename behavior verified.
- [x] Output file created.
