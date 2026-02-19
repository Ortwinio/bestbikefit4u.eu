# Output 05: Validation And Release Checklist

Date: 2026-02-19
Owner: `@codex`

## Result

Step 05 status: `PASS`

Upgraded PDF flow is validated across mapping correctness, section coverage, fallback resilience, and build/deploy readiness.

## 1. Automated Test Coverage

Added/updated tests for required Step 05 goals:

1. Value mapping correctness:
   - `src/lib/reports/pdfValueMapping.test.ts`
2. Required section presence + page breaks:
   - `src/lib/reports/pdfLayoutTemplate.test.ts`
3. Fixture values/ranges in rendered layout:
   - `src/lib/reports/pdfLayoutTemplate.test.ts`
4. Fallback behavior on rich render failure:
   - `src/app/api/reports/[sessionId]/pdf/route.test.ts`
5. Rollback switch behavior (force simple renderer):
   - `src/app/api/reports/[sessionId]/pdf/route.test.ts`

## 2. Quality Gate Execution

Executed in this environment:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test:unit`
4. `npm run test:contracts`
5. `npm run build -- --webpack`

Outcome:

1. All commands passed.
2. ESLint warnings remain in unrelated files, but no lint errors.
3. Unit tests passed (including new PDF mapping/template/route coverage).
4. Contract tests passed.
5. Production webpack build passed.

## 3. Manual Smoke Checks

Performed:

1. Generated sample PDF via Playwright:
   - `node scripts/generate-example-report.mjs`
2. Verified generated file characteristics:
   - `BestBikeFit4U_ExampleReport_EN_v2.pdf`
   - PDF v1.4, 3 pages, ~146 KB.
3. Verified fixture values and ranges through rendered HTML assertions:
   - `754 mm`, `731-774 mm`, `98 mm`, `49 mm`, `538 mm`.
4. Verified section/page-break structure assertions:
   - `Core fit targets`, `Implementation plan`, `Measurement guide`
   - deterministic `pageBreak` markers count = 2.

Notes:

1. Direct CLI extraction of all text from Playwright-generated PDF is limited in this environment.
2. Value checks were validated at mapper+template output level (source of truth before PDF rendering), plus successful PDF generation.

## 4. Release Checklist

Pre-release:

1. Confirm Vercel env:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `PDF_RICH_RENDER_ENABLED=true`
2. Confirm Convex env:
   - `SITE_URL`
   - `AUTH_RESEND_KEY`
   - `AUTH_EMAIL_FROM`
3. Deploy backend:
   - `npx convex deploy --prod`
4. Deploy frontend:
   - Vercel production deploy
5. Post-deploy smoke:
   - complete one owner fit session
   - download `/api/reports/[sessionId]/pdf`
   - confirm key values match recommendation record.

## 5. Rollback Plan

Fast rollback (no code revert):

1. Set `PDF_RICH_RENDER_ENABLED=false` in Vercel.
2. Redeploy Vercel (or trigger redeploy to apply env update).
3. PDF route will serve legacy simple text renderer only.

Hard rollback:

1. Revert PDF integration commit and redeploy frontend.

## 6. Monitoring Points

Track after release:

1. API route error logs:
   - `Rich PDF render failed, using simple fallback.`
   - `Failed to generate PDF report:`
2. Error rate for `GET /api/reports/[sessionId]/pdf` (status 5xx).
3. Fallback frequency trend:
   - rising fallback count indicates browser/runtime drift.
4. User-reported PDF readability/format regressions.

## 7. Supporting Docs Updated

1. `.env.example`
   - added `PDF_RICH_RENDER_ENABLED=true`.
2. `docs/VERCEL_DEPLOYMENT.md`
   - added Vercel env guidance for `PDF_RICH_RENDER_ENABLED`.

## Exit Checklist

- [x] Automated tests cover value correctness and fallback behavior.
- [x] All quality gates pass.
- [x] Manual metric/layout smoke checks completed within environment constraints.
- [x] Release + rollback checklist is complete.
- [x] Output file created.
