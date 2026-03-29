# Subagent B: Preview UI And Photo Verification

## Ownership

You own the rider-facing Marktplaats preview screen.

Primary files:

- `src/components/features/bikes/MarktplaatsBikeImportFlow.tsx`
- `src/components/features/bikes/marktplaatsImport.ts`
- UI tests for the preview flow

You are not responsible for backend parsing rules.

## Objective

Make the Marktplaats preview easy to validate visually and easy to trust before saving.

## Requirements

1. Show the full imported description in the editable draft field.
2. Add a structured “What we found in this advert” section.
3. Add a larger primary image preview.
4. Add a thumbnail strip with selection and active-preview state.
5. Show photo count and preview-quality warnings.
6. Add an explicit empty state when no photos are available.

## UX Constraints

- Keep the existing save flow intact.
- Do not block save just because the preview is weak.
- Make warnings explicit, not alarmist.
- The rider must still be able to edit name, brand, model, type, and description.

## Acceptance Criteria

- the description is fully readable and editable
- the summary section is visible when findings exist
- the rider can switch the main preview image
- the rider can tell which images will be imported
- no-image and weak-image states are visually explicit

## Validation

Run targeted preview tests and summarize coverage.

