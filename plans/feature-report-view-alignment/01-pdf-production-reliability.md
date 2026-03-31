# 01 PDF Production Reliability

## Objective

Remove the silent dependency on raw local Playwright launch behavior and make rich PDF rendering reliable on Vercel production.

## Work

1. Audit `src/lib/pdf/htmlPdf.ts` and choose one production-safe rendering strategy:
   - `playwright-core` + serverless Chromium package
   - remote browser service
   - dedicated out-of-band render worker
2. Keep `src/app/api/reports/[sessionId]/pdf/route.ts` on `runtime = "nodejs"`.
3. Preserve the simple fallback path, but instrument it:
   - log `sessionId`
   - log locale
   - log rich render failure reason
   - add a clear success/fallback marker
4. Add a test that verifies:
   - rich render path returns HTML-based PDF bytes
   - fallback still works when rich render throws

## Acceptance

- rich PDF path is production-safe by implementation, not by assumption
- fallback remains functional
- failure reasons are visible in logs and easy to trace
