# Prompt 01 — Remove BikeQuickCheckCard and BikeSearchBar from homepage

## Context

`src/app/(public)/page.tsx` contains two bike-related entry sections that serve overlapping purposes and break the page flow:

1. **BikeQuickCheckCard** (renders after ProofBar, ~line 182–195)
   Uses `<BikeQuickCheckCard>` component from `@/components/public/BikeQuickCheckCard`.
   Full section wrapper with gradient bg + max-w-4xl inner container.

2. **BikeSearchBar** (renders after TestimonialSection, ~line 213–218)
   Uses `<BikeSearchBar>` component from `@/components/home/BikeSearchBar`.
   No additional wrapper — just the component directly.

Also remove `BikeShowcaseSection` which depends on `BikeSearchBar` for context and currently immediately follows it (~line 219).

Wait — keep `BikeShowcaseSection`. Only remove the search bar that precedes it. The showcase (bike cards with geometry) is still useful standalone content.

## Task

In `src/app/(public)/page.tsx`:

1. Remove the entire `<section>` block that wraps `<BikeQuickCheckCard>` (the gradient-bg section, lines ~182–195).
2. Remove the `<BikeSearchBar … />` component call (line ~213–217).
3. Remove now-unused imports: `BikeSearchBar`, `BikeQuickCheckCard`.
4. Do NOT remove `BikeShowcaseSection` — keep it with its existing wrapper.

## Verification

- `npx tsc --noEmit` passes.
- Page renders without the two removed sections.
- BikeShowcaseSection still appears.
