# Output 04 — CMS Hardening And Validation

## Source-Of-Truth Decision

- Guide keyword metadata remains fallback-first for this release.
- Effective source of truth: `getLegacyGuideSeoKeywords(slug, locale)` from the fallback guide content layer.
- Existing precedence for title, description, canonical URL, and Open Graph metadata remains unchanged and can still be overridden by CMS-managed guide fields where those already exist.

## Why CMS Keyword Schema Was Deferred

- The release does not depend on CMS-managed keyword editing to ship the missing SEO slice.
- Fallback guide keyword coverage already exists and now powers route metadata directly.
- Extending the Convex guide schema now would create a broader content-model migration without changing current organic landing-page discoverability.

## What Shipped

- Three new intent-targeted landing pages
- Sitemap registration for the new landing pages
- Guide `keywords` metadata from the fallback content source
- Strengthened internal linking across homepage, pain, guide, calculator, and science surfaces

## Validation

- `npm run typecheck`
- `npx vitest run src/lib/seo/sitemap/sources.test.ts 'src/app/(public)/guides/[slug]/page.test.tsx' 'src/app/(public)/bandenspanning-calculator/page.test.tsx' 'src/app/(public)/page.test.tsx'`

## Post-Launch Monitoring

- Search Console impressions and clicks for:
  - `/nl/fiets-afstellen`
  - `/nl/bikefitting`
  - `/en/bike-fitting`
- Internal-link click behavior from homepage and guide routes into:
  - `/calculators/bike-fit`
  - `/calculators/saddle-height`
  - `/science/stack-and-reach`
- Whether guide CMS authors now need direct keyword control often enough to justify a later schema extension
