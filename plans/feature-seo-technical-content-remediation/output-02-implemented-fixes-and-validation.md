# SEO Remediation Implementation Status

## Completed Fixes

### Route and canonical cleanup

- Replaced homepage links to legacy `/use-cases` routes with direct `/guides/...` destinations.
- Replaced the homepage “view all use cases” link with `/guides`.
- Removed public `case-study?pain=` CTA links from pain templates and routed them to the clean `/case-study` URL.
- Changed the tire-pressure alias pages so they redirect to the canonical localized route instead of rendering as duplicate crawl surfaces:
  - `/en/bandenspanning-calculator` -> `/en/tire-pressure-calculator`
  - `/nl/tire-pressure-calculator` -> `/nl/bandenspanning-calculator`

### Robots and crawl-policy cleanup

- Removed `/login`, `/en/login`, and `/nl/login` from `ROBOTS_DISALLOW_PATHS`.
- Added locale-aware metadata for the auth layout so login remains non-indexable but crawlable:
  - `robots: noindex,follow`
  - canonical and alternate handling through `buildLocaleAlternates("/login", locale)`

### Public-to-protected CTA normalization

- Added `resolveGuidePrimaryCta()` so guide CTAs that point to protected app routes now resolve to `/login` at render time.
- Applied that CTA normalization to:
  - guides hub page
  - guide detail pages
- This removes public direct links to deep protected destinations such as shoe-cleat-fit and compare-fit from rendered guide CTAs while preserving the editorial backlog source data.

### Heading hierarchy remediation

- Added `titleAs` support to shared public card and panel primitives:
  - `PublicSurfaceCard`
  - `PublicInfoPanel`
- Changed the collapsed `BikeQuickCheckCard` title from a semantic heading to plain text so it no longer inserts an `h3` before the first page-level `h2` on the homepage.

## Files Changed

- `src/app/(auth)/layout.tsx`
- `src/app/(public)/bandenspanning-calculator/page.tsx`
- `src/app/(public)/bandenspanning-calculator/page.test.tsx`
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/app/(public)/guides/page.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/tire-pressure-calculator/page.tsx`
- `src/components/public/BikeQuickCheckCard.tsx`
- `src/components/public/PainPointPageTemplate.tsx`
- `src/components/public/PublicInfoPanel.tsx`
- `src/components/public/PublicSurfaceCard.tsx`
- `src/lib/guides/content.ts`
- `src/lib/seo/sitemap/config.ts`

## Validation Completed

### Lint

- Targeted ESLint pass completed successfully for the modified SEO-related files.

### Tests

- `npx vitest run src/app/'(public)'/page.test.tsx src/app/'(public)'/bandenspanning-calculator/page.test.tsx src/components/public/BikeQuickCheckCard.test.tsx src/app/'(auth)'/login/page.test.tsx --bail=1`
- Result: 4 test files passed, 14 tests passed.

### Known unrelated validation gap

- `npm run typecheck` still fails because of a pre-existing unrelated issue in `src/app/(dashboard)/gearing/GearingCalculatorForm.tsx`:
  - `TS18048: 'profile.weightKg' is possibly 'undefined'`

## Remaining Open Audit Item

- The single reported `nofollow` URL and the single reported `noindex` URL cannot be identified with certainty from the summary CSV alone.
- Code inspection suggests the most likely sources are:
  - a non-production host affected by `src/proxy.ts`
  - an invalid or non-canonical dynamic URL discovered by the crawler
- This still requires the exact URL-level crawler export before making an additional code change.

## Recommended Next Validation Pass

1. Re-run the crawler on production after deploy.
2. Confirm that:
   - internal 3xx warnings no longer include `/use-cases`
   - canonicalized duplicates no longer include tire-pressure alias pages
   - parameter warnings no longer include `case-study?pain=...`
   - robots-blocked internal links no longer include `/login`
3. Export the exact URL behind the remaining `nofollow` and `noindex` warnings.
