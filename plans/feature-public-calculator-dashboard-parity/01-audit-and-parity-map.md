# Step 1: Audit And Parity Map

## Objective

Produce a concrete inventory of the dashboard calculator patterns that should become the reference for public calculators, then compare each public calculator surface against that reference.

## Tasks

1. Inspect dashboard reference components:
   - `src/components/profile/RidingStyleCard.tsx`
   - `src/components/measurements/NumberSlider.tsx`
   - relevant measurement steps that compose those sliders
2. Record the dashboard interaction and visual rules:
   - slider layout
   - track/thumb styling
   - snap points vs continuous range behavior
   - labels and helper copy
   - active/inactive color treatment
   - result-state emphasis
   - card and spacing hierarchy
3. Inspect the public calculators:
   - bike fit
   - saddle height
   - frame size
   - crank length
   - tire pressure
4. Identify every meaningful mismatch between dashboard and public surfaces.
5. Produce an audit artifact listing:
   - reusable patterns
   - public-only constraints
   - mismatches to fix first

## Output

Create `output-01-calculator-ui-audit.md` in this plan folder.

## Success Criteria

- The audit clearly distinguishes dashboard reference patterns from public deviations.
- Slider-specific gaps are explicit, not generic.
- The audit identifies which public calculators are best candidates for first migration.
