# Plan: Profile Wizard Measurement Illustrations

## Goal
Improve the rider profile wizard on the My Profile page by showing the correct measurement illustration for each relevant field in Step 1 and Step 2, so riders understand exactly how to measure height, inseam, torso length, arm length, and shoulder width.

## Why This Matters
The current wizard already explains each measurement in text, but the highest-friction part of the intake is not the slider UI. It is measurement ambiguity. Riders need to know exactly what body landmarks and posture we expect. The new images in `public/measure` are the right asset set to reduce confusion and improve data quality.

## Current State
- The wizard lives in [MeasurementWizard.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/measurements/MeasurementWizard.tsx).
- Step 1 is in [StepBodyMeasurements.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/measurements/StepBodyMeasurements.tsx).
- Step 2 is in [StepAdvancedMeasurements.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/measurements/StepAdvancedMeasurements.tsx).
- Available measurement illustrations already exist in `public/measure`:
  - `height-bbf4u.png`
  - `inseam-bbf4u.png`
  - `torso-bbf4u.png`
  - `arm-length-bbf4u.png`
  - `shoulder-bbf4u.png`
- There is no matching femur illustration in `public/measure` yet.

## Product Decisions
- Use the new illustrations only for measurements where we have a matching asset now.
- Do not fabricate or reuse the wrong image for femur length.
- Keep weight without an illustration.
- Show the illustration close to the relevant measurement field, not as a separate gallery.
- Keep the wizard scoped to My Profile only. Do not change the public measurement guide in this pass.
- Reuse existing card and `InfoBox` styling patterns from the wizard instead of introducing a new design language.

## Measurement-to-Asset Mapping
- Height → `public/measure/height-bbf4u.png`
- Inseam → `public/measure/inseam-bbf4u.png`
- Torso length → `public/measure/torso-bbf4u.png`
- Arm length → `public/measure/arm-length-bbf4u.png`
- Shoulder width → `public/measure/shoulder-bbf4u.png`
- Femur length → no image in this scope

## Scope

### In scope
- Add a reusable measurement illustration block/component for the wizard.
- Add the correct image to Step 1 height and inseam.
- Add the correct image to Step 2 torso, arm, and shoulder width.
- Add a graceful no-image state for femur length.
- Tune copy/layout so the image clarifies the instruction instead of competing with it.
- Validate mobile and desktop layout behavior.

### Out of scope
- New backend logic
- Schema changes
- Rewriting the wizard flow
- Changing the public measurement guide
- Adding or generating a femur image
- Dashboard pages outside the profile wizard

## UX Requirements
- Each illustrated measurement block must include:
  - the slider
  - a short “how to measure” instruction
  - the corresponding illustration
- The illustration must be visible without opening a modal or popup.
- The illustration must remain readable on mobile and not force horizontal scrolling.
- The image should support the instruction text, not replace it.
- Femur length must stay text-only until a correct asset exists.

## Technical Approach
- Create one shared measurement illustration helper in `src/components/measurements/`.
- Use `next/image` with stable aspect handling.
- Centralize image metadata in a small config object so the wizard step files do not hardcode filenames and alt text repeatedly.
- Keep image rendering optional per field so measurements without an asset use the same component contract.

## Risks
- Oversized images could make Step 1 and Step 2 feel too long on mobile.
- Poorly placed illustrations could push the slider too far below the fold.
- Reusing the wrong image for femur would reduce trust, so it must be explicitly avoided.

## Acceptance Criteria
- Step 1 shows the correct image for height.
- Step 1 shows the correct image for inseam.
- Step 2 shows the correct image for torso length.
- Step 2 shows the correct image for arm length.
- Step 2 shows the correct image for shoulder width.
- Step 2 does not show an incorrect placeholder image for femur length.
- All images render cleanly in the wizard on mobile and desktop without breaking layout.
- The images are placed next to the relevant measurement instruction, not in a disconnected section.
- The wizard remains fully functional and validation behavior does not change.

## Success Criteria
- Riders can identify the right measuring posture and landmarks for every illustrated measurement.
- The wizard feels more trustworthy and easier to complete.
- Measurement ambiguity is reduced specifically in Step 1 and Step 2.
- The implementation is reusable if more measurement images are added later.

## Implementation Pack
- `01-audit-and-asset-contract.md`
- `02-shared-illustration-component.md`
- `03-step-1-measurement-integration.md`
- `04-step-2-measurement-integration.md`
- `05-validation-and-closeout.md`

## Progress
- [ ] 01 Audit and asset contract
- [ ] 02 Shared illustration component
- [ ] 03 Step 1 integration
- [ ] 04 Step 2 integration
- [ ] 05 Validation and closeout
