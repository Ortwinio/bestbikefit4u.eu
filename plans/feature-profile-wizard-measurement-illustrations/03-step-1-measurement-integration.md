# Step 03: Step 1 Measurement Integration

## Task
Integrate the correct illustrations into Step 1 of the profile wizard.

## Target File
- `src/components/measurements/StepBodyMeasurements.tsx`

## Requirements
- Show the height illustration with the height instruction block
- Show the inseam illustration with the inseam instruction block
- Keep weight text-only
- Ensure the slider remains visually primary and the image supports the instruction
- Keep the existing warning/info behavior

## Layout Guidance
- Prefer a compact stacked mobile layout
- Prefer a two-column or balanced layout on wider screens only if it improves clarity
- Do not introduce popups, dialogs, or collapsible image sections

## Acceptance
- Height and inseam each display the correct image
- Weight does not display an unrelated image
- Step 1 still feels cohesive and readable on small screens
