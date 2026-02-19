# Output 05: Step 04 - SEO Landing Pages and Internal Linking

Date: 2026-02-19
Status: Completed

## Objective Delivered

Expanded intent-based SEO coverage with localized EN/NL guide pages, added FAQ schema on guide detail pages, and connected new pages through internal linking from major public entry points.

## Implemented SEO Landing Pages

### Hub

- `/guides`

### Pain cluster

- `/guides/bike-fitting-for-knee-pain`
- `/guides/bike-fitting-for-lower-back-pain`

### Discipline cluster

- `/guides/road-bike-fit-guide`
- `/guides/gravel-bike-fit-guide`
- `/guides/mountain-bike-fit-guide`
- `/guides/triathlon-bike-fit-guide`

Files:

- `src/app/(public)/guides/page.tsx`
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/app/(public)/guides/data.ts`

## Metadata + Structured Data

1. Intent-focused metadata titles/descriptions/keywords per guide and locale:
   - Implemented in `src/app/(public)/guides/[slug]/page.tsx` from `src/app/(public)/guides/data.ts`.

2. Structured data on guide detail pages:
   - `Article` JSON-LD
   - `FAQPage` JSON-LD

3. Hub metadata localized for EN/NL intent terms.

## Internal Linking Implemented

Links into the new guide cluster were added from:

- Homepage:
  - `src/app/(public)/page.tsx`
- About page:
  - `src/app/(public)/about/page.tsx`
- FAQ page:
  - `src/app/(public)/faq/page.tsx`
- Calculators:
  - `src/app/(public)/calculators/saddle-height/page.tsx`
  - `src/app/(public)/calculators/crank-length/page.tsx`
  - `src/app/(public)/calculators/frame-size/page.tsx`
- Science pages:
  - `src/app/(public)/science/calculation-engine/page.tsx`
  - `src/app/(public)/science/bike-fit-methods/page.tsx`
  - `src/app/(public)/science/stack-and-reach/page.tsx`
- Global footer:
  - `src/components/layout/Footer.tsx`
  - Added localized footer label key `guides` in:
    - `src/i18n/messages/en.ts`
    - `src/i18n/messages/nl.ts`

## Crawl Coverage

Sitemap paths expanded to include hub + all guide URLs:

- `src/app/sitemap.ts`

## Supporting Strategy Artifact

Added cluster map + publishing order:

- `docs/SEO_INTENT_CLUSTER_MAP.md`

## Validation

- `npm run test:i18n` passed (18/18 tests).
- `npm run lint:eslint -- ...` passed for all touched Step 04 files.
- `npm run build` passed.
  - Build output includes:
    - `ƒ /guides`
    - `ƒ /guides/[slug]`
- `npm run typecheck` still fails due unrelated pre-existing issues in:
  - `convex/recommendations/__tests__/generate.mapping.integration.test.ts`

## Notes

- Deployment was intentionally not executed.
- Step 05 can now focus on KPI instrumentation and iteration loops for guide-page performance and CTA conversion.

