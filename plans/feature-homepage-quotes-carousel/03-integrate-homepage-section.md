# Step 03 - Integrate Homepage Section

## Objective
Place the quotes carousel directly below the homepage header image section without regressing existing content.

## Tasks
1. Update homepage composition in `src/app/(public)/page.tsx`:
   - insert quotes section immediately after the hero/header section
   - keep all existing sections and CTA tracking intact
2. Ensure section spacing and hierarchy works with current page flow.
3. Confirm no collisions with the new consent banner at viewport bottom.
4. Verify section behavior in both `/en` and `/nl` routes. In "/nl" the quotes should be in Dutch
5. If needed, adjust responsive breakpoints so row behavior remains intentional on tablet sizes.

## Deliverable
- `plans/feature-homepage-quotes-carousel/output-03-homepage-integration.md`

## Done When
- Quotes carousel appears directly below hero.
- Existing homepage sections still render in correct order.
- Layout remains stable across mobile/tablet/desktop.

