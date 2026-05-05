# Output 06 — Sitemaps and Robots

## Behavior changed

- `robots.txt` disallow inputs now inherit from the shared route-policy configuration via sitemap config.
- The sitemap validator was aligned with the same canonical disallow prefixes (`/api`, `/trpc`, `/login`, dashboard/private routes).
- Sitemap QA now passes against the local app with canonical/indexable public URLs only.

## Files changed

- `src/lib/seo/sitemap/config.ts`
- `scripts/seo/validate-sitemaps.mjs`

## Validator coverage

- Validates `robots.txt`
- Validates sitemap index presence and child sitemap list
- Validates canonical absolute URLs, duplicate URLs, `lastmod`, reciprocal hreflang links, and `x-default`
- Rejects private/auth/API route leakage into sitemaps

## Validation results

- `node scripts/seo/validate-sitemaps.mjs` passed against `http://127.0.0.1:3000`.
- Existing sitemap source tests for programmatic pages and excluded utility/private routes remained green.
