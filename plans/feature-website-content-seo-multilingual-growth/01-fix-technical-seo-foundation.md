# Step 01: Fix Technical SEO Foundation

## Objective

Resolve crawl/index blockers and standardize technical SEO signals.

## Inputs

- `src/app/layout.tsx`
- `src/i18n/metadata.ts`
- Public routes under `src/app/(public)/`
- Production checks for:
  - `https://bestbikefit4u.eu/robots.txt`
  - `https://bestbikefit4u.eu/sitemap.xml`

## Tasks

1. Add Next.js metadata routes for `robots.txt` and `sitemap.xml`.
2. Ensure canonical tags use absolute URLs.
3. Verify locale alternates (`en`, `nl`, `x-default`) remain correct.
4. Add Organization and WebSite schema JSON-LD on homepage/layout.
5. Re-validate production responses and indexability after deploy.

## Deliverable

- Working `robots.txt` and `sitemap.xml`
- Updated metadata implementation
- Audit notes showing before/after verification

## Completion Checklist

- [ ] `robots.txt` returns 200 with valid content.
- [ ] `sitemap.xml` returns 200 with expected URLs.
- [ ] Canonical is absolute and matches locale.
- [ ] JSON-LD appears in source and validates.

