# Prompt 03 — Sprint 3: Calculator And Bike Entry Optimization

## Context

Read `plans/homepage-redesign/README.md` before starting.

Sprints 1 and 2 must be complete first.

Important repo-state note:

`BikeShowcaseCard.tsx` currently renders as a root `<button>`. If this sprint adds a second CTA, the card must be refactored to valid interactive semantics first.

## Task

Improve the lower conversion funnel so users can reach the calculator flow or bike-specific entry points faster, with less duplication at the bottom of the homepage.

## Deliverables

### 1. `BikeSearchBar`

Create a bike search entry component under `src/components/home/`.

Requirements:

- visible on all breakpoints
- submits to the localized bike-fit flow with an informational query parameter
- includes a fallback path for manual geometry entry
- uses a minimal client boundary only where needed

If the showcase carousel remains desktop-only, the search bar must still remain available on mobile.

### 2. Refactor bike showcase card semantics before adding CTA depth

If a “Use in my fit” action is added to showcase cards:

- do not nest a link or button inside the current root button
- refactor the card structure first so details-view behavior and fit-entry behavior can coexist accessibly
- preserve modal-open analytics for the details path
- ensure the fit-entry CTA does not accidentally trigger the details action

### 3. `CalculatorGrid`

Extract the homepage calculator grid into a reusable component under `src/components/home/`.

Requirements:

- calculators remain high on the page
- each item has a clearer subtitle/value statement
- pricing stays available as a secondary path, not as the primary action

### 4. Consolidate the lower-page CTA stack

Replace the current recommendation-card-plus-final-CTA combination with one closing conversion section.

You may:

- wrap `PublicCtaBand` with homepage-specific copy, or
- create a very thin `src/components/home/` wrapper if that keeps `page.tsx` cleaner

Do not create a brand-new CTA pattern if the shared one already works.

## Integration

Update `src/app/(public)/page.tsx` so that:

1. the search entry appears above the bike showcase experience
2. the calculator grid is rendered via the extracted component
3. the guides and rider-scenario sections remain below the core funnel
4. the page ends with one closing CTA surface, not two stacked ones

## Constraints

- No new npm packages.
- Preserve `TrackedCtaLink`, `CampaignCtaGroup`, and existing bike-showcase analytics behavior.
- The closing CTA contains the third and final primary CTA on the page.
- Any donate action remains secondary.
- Maintain valid link/button semantics throughout.

## Completion Checklist

- [x] Bike search is visible on mobile and desktop.
- [x] Calculator entry remains high in the funnel.
- [x] Any bike-card secondary CTA uses valid semantics and does not interfere with the details interaction.
- [x] The page ends with one clear CTA surface instead of a duplicated recommendation/CTA stack.
- [x] Pricing and campaign donation remain accessible as secondary actions.

## Shipped Output

- `src/components/home/BikeSearchBar.tsx`
- `src/components/home/CalculatorGrid.tsx`
- `src/components/home/ClosingCtaBand.tsx`
- `src/components/home/bikeFitHref.ts`
- `src/components/home/BikeShowcaseCard.tsx`
- `src/components/home/BikeShowcaseCarousel.tsx`
- `src/components/home/BikeShowcaseModal.tsx`
- `src/components/home/BikeShowcaseSection.tsx`
- `src/app/(public)/page.tsx`
