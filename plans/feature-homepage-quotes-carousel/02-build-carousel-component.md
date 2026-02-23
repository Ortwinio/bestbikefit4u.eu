# Step 02 - Build Carousel Component

## Objective
Implement a reusable carousel/row component that renders 4 random quotes in a horizontal layout.

## Tasks
1. Add a new component (for example `src/components/home/QuotesCarousel.tsx`).
2. Implement quote selection utility:
   - Shuffle or sample from full list.
   - Return exactly 4 unique quotes.
3. Implement UI behavior:
   - Desktop: four quote cards in one row.
   - Mobile: maintain horizontal flow (scroll snap row or carousel with controls).
4. Keep visual style aligned with current homepage design system (Tailwind + existing spacing/typography tokens).
5. Add lightweight accessibility support:
   - semantic section heading
   - meaningful text contrast
   - keyboard navigability if interactive controls are used
6. Add/extend tests for selection logic (unit test for unique 4-quote output and bounds).

## Deliverable
- `plans/feature-homepage-quotes-carousel/output-02-carousel-component.md`

## Done When
- Component renders 4 unique quotes.
- Horizontal row behavior is confirmed for desktop and mobile.
- Randomization logic has test coverage.

