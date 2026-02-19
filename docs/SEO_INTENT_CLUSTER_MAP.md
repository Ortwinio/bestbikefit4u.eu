# SEO Intent Cluster Map (EN/NL)

Last updated: 2026-02-19

## Objective

Expand high-intent organic coverage with localized landing pages and direct paths into conversion (`/login`).

## Priority Clusters

### Cluster A: Pain-focused bike fitting (high conversion intent)

- EN keyword intents:
  - bike fitting for knee pain
  - bike fitting for lower back pain
- NL keyword intents:
  - bikefitting kniepijn
  - bikefitting lage rugklachten
- URLs:
  - `/guides/bike-fitting-for-knee-pain`
  - `/guides/bike-fitting-for-lower-back-pain`

### Cluster B: Discipline-focused setup (high traffic + mid/high conversion)

- EN keyword intents:
  - road bike fit guide
  - gravel bike fit guide
  - mountain bike fit guide
  - triathlon bike fit guide
- NL keyword intents:
  - racefiets fit gids
  - gravel fit gids
  - MTB fit gids
  - triathlon fit gids
- URLs:
  - `/guides/road-bike-fit-guide`
  - `/guides/gravel-bike-fit-guide`
  - `/guides/mountain-bike-fit-guide`
  - `/guides/triathlon-bike-fit-guide`

### Cluster C: Hub and navigation page

- EN keyword intents:
  - bike fitting guides
  - bike fitting resources
- NL keyword intents:
  - bikefitting gidsen
  - bikefitting uitleg
- URL:
  - `/guides`

## Implemented Internal Linking

Source pages now link into guide pages:

- Homepage: `src/app/(public)/page.tsx`
- About: `src/app/(public)/about/page.tsx`
- FAQ: `src/app/(public)/faq/page.tsx`
- Calculators:
  - `src/app/(public)/calculators/saddle-height/page.tsx`
  - `src/app/(public)/calculators/crank-length/page.tsx`
  - `src/app/(public)/calculators/frame-size/page.tsx`
- Science pages:
  - `src/app/(public)/science/calculation-engine/page.tsx`
  - `src/app/(public)/science/bike-fit-methods/page.tsx`
  - `src/app/(public)/science/stack-and-reach/page.tsx`
- Global footer: `src/components/layout/Footer.tsx`

## Structured Data Scope

Guide detail pages include:

- `Article` JSON-LD
- `FAQPage` JSON-LD

Files:

- `src/app/(public)/guides/[slug]/page.tsx`

## Publishing Order (Execution)

1. `/guides` (hub)
2. `/guides/bike-fitting-for-knee-pain`
3. `/guides/bike-fitting-for-lower-back-pain`
4. `/guides/road-bike-fit-guide`
5. `/guides/gravel-bike-fit-guide`
6. `/guides/mountain-bike-fit-guide`
7. `/guides/triathlon-bike-fit-guide`

## Next Iteration Suggestions

- Add guide-specific conversion events (CTA clicks per guide and locale).
- Add proof snippets/case examples to each guide page.
- Expand with additional pain clusters (neck pain, hand numbness, saddle discomfort).

