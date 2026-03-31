# 02 On-Page Layout Alignment

## Objective

Bring the fit results page much closer to the PDF layout without making it a static PDF clone.

## Work

1. Use the PDF section order as the canonical page order.
2. Rework the results page shell in `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`:
   - branded intro band
   - report date / session metadata strip
   - cleaner action row for email/download/view
3. Replace generic stacked card rhythm with a more report-like composition:
   - alternating wide and split sections
   - metric blocks
   - stronger section headings and lead text
4. Reuse the PDF copy source and mapped payload as the single source of truth.

## Acceptance

- a user can visually recognize the on-page report as the same report family as the PDF
- section order and labels match the PDF
- report actions stay usable on mobile and desktop
