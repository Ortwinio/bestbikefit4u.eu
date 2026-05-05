# Output 10 — Structured Data Normalization

## Schema policy implemented

- `Organization` and `WebSite` schema now live in `src/app/layout.tsx` as the sitewide source.
- Priority public templates now consistently emit `BreadcrumbList` where visible breadcrumbs exist.
- Programmatic pressure pages emit `FAQPage` only where visible FAQ content is rendered.
- Calculator pages continue to use `WebApplication` schema.

## Templates affected

- `src/app/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/how-it-works/page.tsx`
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/components/public/PainPointPageTemplate.tsx`
- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/tire-pressure/[slug]/page.tsx`
- `src/app/(public)/bandenspanning/[slug]/page.tsx`

## Validation results

- Removed duplicate sitewide `Organization` / `WebSite` emission from page-level templates that now inherit layout ownership.
- Existing JSON-LD helper tests and route tests stayed green.
