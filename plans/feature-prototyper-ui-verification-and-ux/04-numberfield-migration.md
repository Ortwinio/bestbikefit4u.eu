# Step 04 — NumberField Migration

## Objective

Replace the highest-value `<Input type="number">` usages with a Prototyper-style `NumberField` only after scope is explicitly confirmed in Step 01.

## Background

The current `Input` adapter wraps `PrototyperInput` (a text input). When used with `type="number"`, browsers render a native number input with no Prototyper styling, inconsistent spinner controls, and no min/max enforcement at the component level. Prototyper UI's `NumberField` is built on Base UI's NumberField primitive with proper keyboard behavior and accessibility.

## Find All `type="number"` Usages

Search `src/` for:
- `<Input type="number"`
- `type="number"` in form components

Initial high-priority locations:
- `src/components/measurements/StepBodyMeasurements.tsx` — inseam, height, arm length, torso length
- `src/components/measurements/StepAdvancedMeasurements.tsx` — additional body metrics
- `src/components/questionnaire/questions/NumericQuestion.tsx` — questionnaire numeric questions

Note:
- The repo contains many additional numeric inputs in bikes, pressure wizard, and public calculators.
- Do not silently migrate all of them in this step unless Step 01 explicitly expands the scope.

## Tasks

1. **Feasibility check:**
   Confirm whether a Prototyper `NumberField` exists upstream and is safe to introduce.

2. **Decision point:**
   - If `NumberField` exists, install/copy it and create a local adapter.
   - If it does not exist or is too disruptive, narrow this step to documenting why numeric inputs should remain on the current adapter for now.

3. **Create a `NumberInput` adapter** at `src/components/ui/NumberInput.tsx`:
   - Wraps Prototyper `NumberField`
   - Preserves the current `Input`-compatible API: `label`, `tooltip`, `error`, `helperText`
   - Adds `min`, `max`, `step`, `unit` props
   - Exports from `src/components/ui/index.ts`

4. **Migrate measurement forms:**
   Replace `<Input type="number" ...>` with `<NumberInput ...>` in measurement step components. Set appropriate `min`/`max`/`step` for each measurement (e.g. inseam: min=600, max=1000, step=1 mm).

5. **Migrate questionnaire numeric questions:**
   Update `NumericQuestion.tsx` to use `NumberInput`. Preserve the existing questionnaire validation logic.

6. **Migrate BikeForm numeric fields** if any exist.

7. **Run** targeted validation plus `npm run build` after migration.

## Constraints Note

The ranges below are examples, not source-of-truth validation rules. Confirm actual accepted units and ranges from the current forms and backend validation before applying them.

## Output

Write `output-04-numberfield-migration.md`:
- Locations migrated
- `NumberInput` adapter API
- Any questionnaire validation logic that needed updating
- Any locations explicitly deferred and why
- Quality gate results
