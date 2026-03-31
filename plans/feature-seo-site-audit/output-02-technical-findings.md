# Technical SEO Findings

## High

### 1. Preview sitemap endpoints can still look indexable

- Area: preview SEO safety
- Affected files:
  - [proxy.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/proxy.ts)
  - [xml.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/xml.ts)
- Observed behavior:
  - preview/local `noindex` protection is applied in the proxy layer
  - the proxy matcher excludes dotted paths, so `/sitemap.xml` and `/sitemap-*.xml` do not receive that header
  - sitemap XML responses always emit `X-Robots-Tag: index, follow`
- Expected behavior:
  - preview deployments should not expose indexable sitemap endpoints
- Recommended fix:
  - add deployment-aware `X-Robots-Tag` handling to sitemap XML responses, or explicitly noindex sitemap routes off-production

### 2. Sitemap validation currently fails locally because `/sitemap.xml` returns `500`

- Area: sitemap reliability
- Affected routes/files:
  - [sitemap.xml/route.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/sitemap.xml/route.ts)
  - [validate-sitemaps.mjs](/Users/ortwinverreck/Developer/bestbikefit4u/scripts/seo/validate-sitemaps.mjs)
- Observed behavior:
  - running `node scripts/seo/validate-sitemaps.mjs` failed immediately with:
    - `/sitemap.xml returned status 500 (expected 200)`
- Expected behavior:
  - sitemap index should return `200` and pass the existing validator in a healthy local/preview environment
- Recommended fix:
  - reproduce the route failure in a clean local or preview runtime
  - identify whether the fault is route logic, dev-server state, or runtime incompatibility
  - add a regression check in CI or release validation so sitemap regressions are caught before deploy

## Medium

### 3. Programmatic Dutch tire-pressure pages disagree on `x-default`

- Area: canonical/alternate consistency
- Affected files:
  - [bandenspanning/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/bandenspanning/[slug]/page.tsx)
  - [tire-pressure/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/tire-pressure/[slug]/page.tsx)
  - [metadata.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/metadata.ts)
  - [config.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/config.ts)
- Observed behavior:
  - the shared locale default is English
  - the Dutch programmatic route family points `x-default` at Dutch
- Expected behavior:
  - one route cluster should have one stable `x-default` target
- Recommended fix:
  - move programmatic pressure metadata to the shared alternate builder or equivalent shared helper

### 4. `robots.txt` and sitemap validation do not fully mirror the current protected-route surface

- Area: robots / validator parity
- Affected files:
  - [robots.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/robots.ts)
  - [config.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/config.ts)
  - [validate-sitemaps.mjs](/Users/ortwinverreck/Developer/bestbikefit4u/scripts/seo/validate-sitemaps.mjs)
- Observed behavior:
  - current blocked-path lists do not cover all real protected roots like `/settings`, `/fit-history`, `/pressure-calculator`, and `/feedback`
- Expected behavior:
  - robots and validator blocklists should track the actual protected route policy
- Recommended fix:
  - centralize the protected-route list or derive the robots/validator exclusions from one source

### 5. Blog sitemap is shipped even though the blog section is empty

- Area: sitemap clarity
- Affected files:
  - [sources.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/sources.ts)
  - [sitemap-blog.xml/route.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/sitemap-blog.xml/route.ts)
- Observed behavior:
  - sitemap index includes `sitemap-blog.xml`
  - `BLOG_ROUTE_SEEDS` is empty
- Expected behavior:
  - either the blog sitemap should be intentionally omitted until it has content, or it should remain with a documented reason
- Recommended fix:
  - decide whether to keep reserved sitemap sections in production
  - if kept, document the choice in tests or comments so it is not mistaken for broken content coverage

### 6. Programmatic tire-pressure pages use route-local metadata logic instead of the shared locale helper

- Area: canonical/alternate consistency
- Affected files:
  - [tire-pressure/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/tire-pressure/[slug]/page.tsx)
  - [bandenspanning/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/bandenspanning/[slug]/page.tsx)
- Observed behavior:
  - these routes build canonical/alternate metadata locally instead of relying on [metadata.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/metadata.ts)
- Expected behavior:
  - the largest SEO surface should use the most centralized locale/canonical logic
- Recommended fix:
  - refactor these route families to use a shared helper for canonical + alternate generation
  - add a focused test for EN/NL reciprocity on programmatic calculator pages

## Low

### 7. Preview noindex behavior is correct for page routes, but not sufficiently covered by automated checks

- Area: preview SEO safety
- Affected files:
  - [proxy.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/proxy.ts)
- Observed behavior:
  - preview/local deployments get `X-Robots-Tag: noindex, nofollow, noarchive`
  - canonical URLs still point to production domain
- Expected behavior:
  - preview should stay non-indexable across both pages and sitemap endpoints
- Recommended fix:
  - keep the current page-level behavior
  - expand validation to cover preview headers and sitemap endpoints too

### 8. Sitemap routes are technically well-structured, but release validation is not automated enough

- Area: regression prevention
- Affected files:
  - [validate-sitemaps.mjs](/Users/ortwinverreck/Developer/bestbikefit4u/scripts/seo/validate-sitemaps.mjs)
  - [xml.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/xml.test.ts)
- Observed behavior:
  - validation exists but is not clearly part of a routine release check for every change touching SEO routes
- Expected behavior:
  - sitemap validation should be part of repeatable release or CI checks
- Recommended fix:
  - add the validator to release procedures or CI for SEO-affecting changes

## Technical Positives

- [app/layout.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/layout.tsx) sets a stable `metadataBase`
- [metadata.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/metadata.ts) centralizes locale alternates
- [robots.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/robots.ts) excludes private/app routes
- sitemap routes explicitly run on Node.js
- sitemap XML rendering already includes:
  - ETag
  - cache control
  - `X-Robots-Tag: index, follow`
  - alternate links
