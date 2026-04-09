# Migration Sequence

## Sequence

### Phase 0: Shared primitive preparation

Files likely involved:

- `src/components/profile/RidingStyleCard.tsx`
- `src/components/measurements/NumberSlider.tsx`
- shared destination for extracted calculator primitives
- `src/components/public/PublicFormFields.tsx`
- `src/app/globals.css`

Work:

- extract the ordinal slider primitive
- extract or wrap numeric slider primitives
- add calculator-specific tokens/utilities
- define a public calculator field palette that can consume those primitives

Success condition:

- public and dashboard can both consume the same slider primitives without importing each other’s page shells

### Phase 1: Bike fit calculator

Files likely involved:

- `src/app/(public)/calculators/bike-fit/BikeFitCalculatorForm.tsx`
- `src/app/(public)/calculators/bike-fit/page.tsx`
- shared public calculator primitives

Changes:

- replace `flexibility` select with shared ordinal slider
- replace `core` select with shared ordinal slider
- evaluate whether `ambition` should become an ordinal slider or a stronger segmented control
- align form surface and result surface styling with calculator tokens

Why first:

- strongest overlap with dashboard fit intake
- highest payoff for product continuity

### Phase 2: Saddle height calculator

Files likely involved:

- `src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.tsx`
- `src/app/(public)/calculators/saddle-height/page.tsx`

Changes:

- replace `flexibility` select with shared ordinal slider
- replace `core` select with shared ordinal slider
- evaluate `ambition` control the same way as bike fit
- align surfaces and output emphasis

Why second:

- almost identical fit-context inputs to bike fit
- minimal extra component design work after phase 1

### Phase 3: Frame size and crank length

Files likely involved:

- `src/app/(public)/calculators/frame-size/FrameSizeCalculatorForm.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/crank-length/CrankLengthCalculatorForm.tsx`
- `src/app/(public)/calculators/crank-length/page.tsx`

Changes:

- adopt the same calculator surfaces, result cards, and token usage
- keep typed numeric fields unless a numeric slider is genuinely better
- standardize category control styling with the same calculator field language

Why third:

- fewer true slider gaps
- more about family consistency than direct interaction parity

### Phase 4: Tire-pressure calculator

Files likely involved:

- `src/app/(public)/bandenspanning-calculator/page.tsx`
- `src/components/features/pressure/PressureCalculatorForm.tsx`
- related pressure feature components

Changes:

- align shell, spacing, result emphasis, and color semantics with the calculator family
- only introduce slider parity if the interaction model benefits from it

Why fourth:

- it belongs to the same commercial calculator family, but it is not the closest dashboard analogue

## Rollout Checkpoints

1. Shared slider primitives merged
2. Bike fit migrated and tested
3. Saddle height migrated and tested
4. Frame size and crank length migrated
5. Tire-pressure family aligned
6. Browser QA and parity signoff

## Explicit Non-Goals During Migration

- no formula changes
- no dashboard redesign
- no broad marketing-site redesign outside touched calculator surfaces
