# 03 Component Refactor And Visual System

## Objective

Refactor results components so their visual language aligns with the PDF template.

## Work

1. Update:
   - `RiderProfileCard.tsx`
   - `BikeContextCard.tsx`
   - `PriorityTable.tsx`
   - `DetailedFitTable.tsx`
   - `AdjustmentSequence.tsx`
   - `TirePressureSection.tsx`
   - `ValidationPlan.tsx`
2. Prefer:
   - metric tiles over raw text grids where possible
   - clearer badges/status pills
   - pressure bars matching the PDF treatment
   - fewer plain border-only blocks
3. Keep tables only where comparison density is actually useful.
4. Avoid introducing a second copy system or second data mapper.

## Acceptance

- profile and bike context look like report summary sections, not generic form cards
- tire pressure mirrors the PDF’s visual emphasis
- priority and validation sections are easier to scan than the current raw tables
