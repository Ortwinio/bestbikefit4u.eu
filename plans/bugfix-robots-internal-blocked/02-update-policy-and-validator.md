# Step 02 — Update Policy And Validator

## Goal

Update robots generation and sitemap validation so they encode the decided crawl policy.

## Likely Files

- `src/lib/seo/routePolicy.ts`
- `src/lib/seo/routePolicy.test.ts`
- `src/lib/seo/sitemap/config.ts`
- `src/app/robots.ts`
- `scripts/seo/validate-sitemaps.mjs`

## Tasks

1. Split route policy exports if needed:
   - one list for sitemap exclusion and private URL checks
   - one list for actual `robots.txt` disallow output
2. Remove crawler utility endpoints from `robots.txt` disallow output:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/sitemap-pages.xml`
   - `/sitemap-calculators.xml`
   - `/sitemap-guides.xml`
   - `/sitemap-blog.xml`
3. Keep sitemap validation rejecting private/auth/API URLs in sitemap payloads.
4. Update validator checks so it fails if crawler utility endpoints are disallowed.
5. Update route-policy tests to cover the new distinction.

## Validation

- `npx vitest run src/lib/seo/routePolicy.test.ts src/lib/seo/sitemap/xml.test.ts`
- `npm run seo:validate-sitemaps`

## Expected Outcome

Robots output is less contradictory while sitemap and private-route protections remain strict.
