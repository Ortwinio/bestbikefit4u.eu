# Output 02 — Sitemap And Guide Keywords

## Completed

- Registered the new landing pages in the public `pages` sitemap source:
  - `/nl/fiets-afstellen`
  - `/nl/bikefitting`
  - `/en/bike-fitting`
- Added `keywords` metadata to guide pages in `src/app/(public)/guides/[slug]/page.tsx`

## Source Of Truth

- Guide keywords currently come from the fallback guide content source via `getLegacyGuideSeoKeywords(slug, locale)`.
- Existing precedence for title, description, canonical URL, and Open Graph metadata remains unchanged.
- If a published or draft CMS guide has no keyword field, the route still uses fallback guide keywords when they exist.
- CMS-localized keyword support remains a later hardening step, not a prerequisite for this release.

## Validation

- `npm run typecheck`
- `npx vitest run src/lib/seo/sitemap/sources.test.ts 'src/app/(public)/guides/[slug]/page.test.tsx'`
