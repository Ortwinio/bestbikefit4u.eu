# Step 03: Dashboard Shared Primitives And Library Alignment

## Objective

Normalize the shared dashboard-facing primitive layer so the dashboard uses approved Prototyper UI foundations or clearly approved wrappers, with slider exceptions preserved.

## Inputs

- `src/components/ui/*`
- `src/components/prototyper-ui/ui/*`
- Dashboard-facing shared components used by touched pages
- Output from Step 01
- Output from Step 02

## Tasks

1. Review the dashboard-facing `@/components/ui` layer and classify wrappers as:
   - approved Prototyper-backed wrappers
   - direct Prototyper usage candidates
   - legacy components still needing alignment
2. Normalize the shared primitives most visible in the dashboard:
   - button
   - card
   - dialog
   - inputs/select/textarea
   - empty/loading/error states
   - section header/info/stat helpers
3. Remove one-off dashboard visual treatments that should instead live in shared wrappers/utilities.
4. Preserve slider-based components on the approved slider path only:
   - `src/components/ui/Slider.tsx`
   - `src/components/measurements/NumberSlider.tsx`
   - `src/components/profile/RidingStyleCard.tsx`
5. Document any remaining dashboard components that should stay out of scope for this pass.

## Deliverable

A normalized shared primitive layer for the dashboard plus a short compliance matrix.

## Completion Checklist

- [ ] Dashboard-facing shared primitives are reviewed and classified.
- [ ] High-visibility wrappers are aligned with Prototyper UI expectations.
- [ ] Slider exceptions are preserved and documented.
- [ ] Remaining out-of-scope legacy components are explicitly listed.
