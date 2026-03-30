# Step 01: Audit And Asset Contract

## Task
Audit the current profile wizard measurement steps and define the exact illustration contract for each measurement.

## Deliverable
Create `output-01-asset-contract.md` with:
- each relevant measurement field in Step 1 and Step 2
- whether an illustration exists
- the image filename to use
- the required alt text
- whether the field is image-backed or text-only

## Requirements
- Confirm the field list directly from:
  - `src/components/measurements/StepBodyMeasurements.tsx`
  - `src/components/measurements/StepAdvancedMeasurements.tsx`
- Confirm the asset list directly from `public/measure`
- Explicitly mark femur as `text-only for now`
- Define concise, instructional alt text for each image

## Acceptance
- The output maps every Step 1 and Step 2 measurement field to either:
  - a concrete illustration
  - or an explicit no-image decision
- No guessed or missing mappings remain
