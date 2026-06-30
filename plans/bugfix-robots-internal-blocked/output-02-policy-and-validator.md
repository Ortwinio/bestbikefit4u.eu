# Output 02 — Policy And Validator Update

## Files Changed

- `src/lib/seo/routePolicy.ts`
- `src/lib/seo/routePolicy.test.ts`
- `scripts/seo/validate-sitemaps.mjs`
- `plans/bugfix-robots-internal-blocked/*`

## Implementation

- Verified the existing split between `SEO_SITEMAP_EXCLUDED_PATHS` and `SEO_ROBOTS_DISALLOW_PATHS`.
- Removed auth entry pages from robots disallow output.
- Kept private app, admin, API, static, and TRPC route families in robots disallow output.
- Kept auth entry pages excluded from sitemaps through `SEO_SITEMAP_EXCLUDED_PATHS`.
- Updated the sitemap validator to fail if `robots.txt` disallows paths that should stay crawlable:
  - `/robots.txt`
  - `/sitemap*.xml`
  - `/_next`
  - `/login` and localized variants

## Validation

- `npx vitest run src/lib/seo/routePolicy.test.ts src/lib/seo/sitemap/xml.test.ts src/lib/seo/sitemap/sources.test.ts 'src/app/(auth)/login/page.test.tsx'` passed.
- `BASE_URL=http://127.0.0.1:3006 npm run seo:validate-sitemaps` passed.
