# Output 09 — Template SEO UX

## Templates updated

- Added a reusable visible breadcrumb component for public pages.
- Rolled breadcrumbs into:
  - guide detail pages
  - pain point pages
  - bike-fit calculator page
  - programmatic EN tire-pressure pages
  - programmatic NL bandenspanning pages

## Internal-link and heading behavior

- Breadcrumb labels are locale-aware and link to canonical public destinations.
- Existing H1/H2 structures on the touched templates were preserved; no conflicting extra H1 was introduced.
- Related-links modules were left in place and now sit under clearer breadcrumb/context scaffolding on priority templates.

## Files changed

- `src/components/public/PublicBreadcrumbs.tsx`
- `src/components/public/index.ts`
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/components/public/PainPointPageTemplate.tsx`
- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/tire-pressure/[slug]/page.tsx`
- `src/app/(public)/bandenspanning/[slug]/page.tsx`

## Validation results

- Updated guide and bike-fit calculator page tests to match the visible breadcrumb UI.
- Priority template tests in the SEO-focused run passed.
