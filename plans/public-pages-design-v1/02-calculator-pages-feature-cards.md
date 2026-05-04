# Prompt 02 — Upgrade calculator page trust grids and add RatingBadge

## Context

All 6 public calculator pages follow the same structure:
1. `PublicHero` with chips
2. `PublicSection` with a 3-column `PublicFeatureCard` trust grid ("why this calculator works")
3. Calculator form component
4. FAQ section
5. `RelatedLinksSection`
6. `PublicCtaBand`

The trust grid currently uses `PublicFeatureCard` — a small `PublicIconBadge` (36px, primary blue only) next to the title in a card. This should be replaced with `FeatureIconCard` using per-card colour accents, matching the homepage differentiators in visual weight. A `RatingBadge` should also be added below the hero chips to carry social proof from the homepage into calculator pages.

## Pages to update

All 6 calculator pages:
- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/saddle-width/page.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/crank-length/page.tsx`
- `src/app/(public)/calculators/gearing/page.tsx`

## Changes per page

### 1. Replace `PublicFeatureCard` with `FeatureIconCard`

In each page's trust/feature `PublicSection`, replace the `<div className="grid ... md:grid-cols-3">` of `PublicFeatureCard` items with `FeatureIconCard` items. Assign colours using the `FeatureIconCardColor` type. Use a rotating set of 3 from the palette — each page can use the same trio:

- Card 1: `color="teal"`
- Card 2: `color="primary"`
- Card 3: `color="green"`

Remove the `PublicFeatureCard` import if it's no longer used after the replacement.

### 2. Add `RatingBadge` after hero chips

In `PublicHero`, the `chips` prop renders a chip row. Below the chips, inside a `<div className="mt-5 flex justify-start">`, add:

```tsx
<RatingBadge rating="4.8" count={isNl ? "380+ rijders" : "380+ riders"} />
```

Since `PublicHero` doesn't natively support a rating badge slot, inject it directly in the page JSX after the `<PublicHero>` component — wrap both in a fragment and position the badge using negative margin:

```tsx
<div className="relative">
  <PublicHero ... />
  <div className="mt-4 px-6 md:px-8">
    <RatingBadge rating="4.8" count={isNl ? "380+ rijders" : "380+ riders"} />
  </div>
</div>
```

Or if the page already has a wrapper, place it directly after `<PublicHero>` with `className="mt-4"`.

## Imports to add per page

```ts
import { FeatureIconCard, RatingBadge } from "@/components/public";
```

## Verification

- All 6 calculator pages render `FeatureIconCard` with 3 distinct icon colours.
- `RatingBadge` is visible below the hero on each page.
- No `PublicFeatureCard` import remains on these 6 pages (unless used elsewhere on the same page).
- `npx tsc --noEmit` passes.
