# Validation And QA

## Code-Level Validation

### Shared slider primitive tests

Required coverage:

- renders label and selected-value badge
- renders all ordinal labels
- updates value on click
- supports keyboard interaction where applicable
- applies active and inactive state classes or token hooks
- respects light and dark theme styling without hard failure

Reference files for new tests:

- shared slider primitive test file
- `src/components/measurements/NumberSlider.tsx`

### Public calculator tests

Required coverage:

- `bike-fit`: flexibility/core controls render as sliders after migration
- `saddle-height`: flexibility/core controls render as sliders after migration
- `frame-size`: calculator shell uses aligned calculator surfaces
- `crank-length`: calculator shell uses aligned calculator surfaces
- `bandenspanning-calculator`: family-level route still renders, and CTA flow remains intact

## Browser Acceptance

### Required routes

- `/en/calculators/bike-fit`
- `/en/calculators/saddle-height`
- `/en/calculators/frame-size`
- `/en/calculators/crank-length`
- `/en/bandenspanning-calculator`

NL spot checks:

- `/nl/calculators/bike-fit`
- `/nl/calculators/saddle-height`
- `/nl/bandenspanning-calculator`

### Required checks

- mobile viewport
- desktop viewport
- light theme
- dark theme
- system theme
- slider usability on touch and pointer
- result panel readability
- CTA visibility after calculation

## Visual Parity Checks

Compare public calculators against dashboard references for:

- active track color
- thumb size and emphasis
- selected-value badge treatment
- label hierarchy
- card hierarchy
- result emphasis

Reference sources:

- `src/components/profile/RidingStyleCard.tsx`
- `src/components/measurements/NumberSlider.tsx`

## Regression Checks

- no migrated fit-style public question remains a select if the dashboard equivalent is a slider
- no duplicate public-only slider primitive exists for the same use case
- no touched calculator keeps old color drift relative to the new calculator tokens
- no dead imports or unused calculator field variants remain

## Final Signoff Artifact

Create a final closeout note with:

- migrated routes
- primitive extraction summary
- token changes summary
- tests run
- browser QA result
- remaining follow-ups if any
