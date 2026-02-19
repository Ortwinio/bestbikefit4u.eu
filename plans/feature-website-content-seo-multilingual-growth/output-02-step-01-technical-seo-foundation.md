# Output 02: Step 01 - Technical SEO Foundation

Date: 2026-02-19
Status: Completed

## Changes Implemented

1. Added `robots.txt` metadata route:
   - `src/app/robots.ts`
   - Includes sitemap pointer and disallow rules for auth/dashboard/api paths.

2. Added `sitemap.xml` metadata route:
   - `src/app/sitemap.ts`
   - Includes locale-aware URLs for EN/NL public indexable pages.

3. Made canonical/hreflang alternates absolute:
   - `src/i18n/metadata.ts`
   - `buildLocaleAlternates` now emits absolute URLs based on `BRAND.siteUrl`.

4. Added `metadataBase`:
   - `src/app/layout.tsx`
   - Set to `new URL(BRAND.siteUrl)`.

5. Added homepage structured data:
   - `src/app/(public)/page.tsx`
   - Injected JSON-LD `@graph` with `Organization` and `WebSite` entities.

## Validation

- `npm run typecheck` passed.
- `npm run test:i18n` passed (18/18 tests).
- `npm run lint:eslint -- src/app/layout.tsx src/app/robots.ts src/app/sitemap.ts src/i18n/metadata.ts src/app/(public)/page.tsx` passed.
- `npm run build` passed.
- Build output confirms static metadata routes:
  - `○ /robots.txt`
  - `○ /sitemap.xml`
- Generated build artifacts confirm route content:
  - `.next/server/app/robots.txt.body` contains `Host: bestbikefit4u.eu` and `Sitemap: https://bestbikefit4u.eu/sitemap.xml`.
  - `.next/server/app/sitemap.xml.body` contains locale URLs like `https://bestbikefit4u.eu/en` and `https://bestbikefit4u.eu/en/about`.

## Notes

- This step resolves the previously observed production gap where `robots.txt` and `sitemap.xml` served 404 content.
- Production deploy is still required for public verification on `https://bestbikefit4u.eu/robots.txt` and `https://bestbikefit4u.eu/sitemap.xml`.
