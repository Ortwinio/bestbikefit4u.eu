# Output 01 — Landing Pages

## Completed

- Added `/nl/fiets-afstellen` in `src/app/(public)/fiets-afstellen/page.tsx`
- Added `/nl/bikefitting` in `src/app/(public)/bikefitting/page.tsx`
- Added `/en/bike-fitting` in `src/app/(public)/bike-fitting/page.tsx`
- Added `src/lib/seo/pageAlternates.ts` to support locale alternates for pages that do not have a real counterpart in both languages

## Notes

- The Dutch pages are intentionally not hreflang alternates of each other.
- Each page is locale-gated with `notFound()` so unsupported locale variants do not index accidentally.
- Each page includes:
  - metadata with `title`, `description`, `keywords`, Open Graph, and canonical
  - `BreadcrumbList` schema
  - `FAQPage` schema because each page contains real FAQ content
  - clear CTA handoff into the relevant calculator journey
- The implementation reuses the existing public-site primitives:
  - `PublicPageShell`
  - `PublicHero`
  - `PublicSection`
  - `PublicSurfaceCard`
  - `PublicCtaBand`
  - `RelatedLinksSection`
  - `JsonLd`

## Validation

- `npm run typecheck`
