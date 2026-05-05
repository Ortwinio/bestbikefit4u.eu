# Output 11 — Image SEO, CWV, and QA

## Image SEO changes

- Published guides now require localized image alt text when a featured image or hero image exists.
- Guide editor copy now makes the image-alt requirement visible to admins/editors.

## CWV findings and fixes

- A browser timing baseline was captured in this turn.
- The bounded technical fixes completed here were:
  - schema de-duplication at layout/page level
  - route-policy/robots/sitemap consistency
  - shared-page export cleanup for the public pressure calculator pair so production builds complete cleanly

## Browser timing baseline

- Captured on `2026-05-05` with Playwright against a clean local frontend on `http://127.0.0.1:3001`.
- These numbers are useful as a relative engineering baseline, not as final production Lighthouse scores.

| Route | Status | Title | FCP | LCP | CLS | TTFB (`responseStart - requestStart`) | Transfer size |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/en` | `200` | `BestBikeFit4U - Online Bike Fitting for Comfort and Performance` | `5292ms` | `5352ms` | `0` | `4921ms` | `73.4KB` |
| `/en/guides/bike-fitting-for-knee-pain` | `200` | `Bike Fit for Knee Pain | BestBikeFit4U` | `3292ms` | `3292ms` | `0` | `3211ms` | `51.7KB` |
| `/en/calculators/bike-fit` | `200` | `Free Bike Fit Calculator | BestBikeFit4U` | `1080ms` | `1080ms` | `0` | `862ms` | `49.3KB` |

## Baseline interpretation

- The bike-fit calculator is already in a reasonable first-pass range relative to the other public templates.
- The guide page is materially slower than the calculator and should be the second optimization target.
- The homepage is the clear bottleneck. The dominant issue in this local baseline is server response time before paint, not layout instability.
- CLS was `0` across all three sampled routes, which is a good sign for visual stability on these templates.

## Recommended next optimization slice

1. Reduce homepage server/render path cost first.
2. Audit hero and above-the-fold content on homepage and guide templates for heavyweight blocking components.
3. Re-run the same browser harness against a production-like `next start` server or deployed preview before final release sign-off.

## QA checklist used

- `npx vitest run src/lib/seo/routePolicy.test.ts src/i18n/metadata.test.ts src/lib/seo/programmatic/tirePressure.test.ts src/lib/seo/sitemap/sources.test.ts src/lib/seo/jsonLd.test.ts convex/guides/__tests__/mutations.contract.test.ts 'src/app/(public)/guides/[slug]/page.test.tsx' 'src/app/(public)/calculators/bike-fit/page.test.tsx' 'src/app/(public)/page.test.tsx'`
- `npm run test:i18n`
- `node scripts/seo/validate-sitemaps.mjs`
- `npm run build`

## Validation results

- SEO-focused test slice passed: 29/29 tests.
- `npm run test:i18n` passed: 30/30 tests.
- Sitemap validator passed against the local app.
- Production build passed after extracting shared pressure-calculator content out of a page-only export.

## Follow-up recommendation

- Capture live CWV/Lighthouse baselines for homepage, one guide page, and one calculator page in a browser-backed environment before release sign-off.
