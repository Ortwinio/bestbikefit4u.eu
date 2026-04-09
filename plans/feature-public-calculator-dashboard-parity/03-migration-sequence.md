# Step 3: Migration Sequence

## Objective

Define the order and scope for migrating public calculators to the shared dashboard-style UI system.

## Tasks

1. Group public calculators by interaction type:
   - fit-style multi-input tools
   - numeric measurement tools
   - pressure calculator
2. Recommend the migration order, with reasoning.
3. For each calculator, define:
   - files likely to change
   - slider changes
   - color/surface changes
   - CTA or result-panel constraints
   - copy considerations if labels/helpers must be updated
4. Identify shared primitives that must land before page-level migration starts.
5. Define rollback-safe checkpoints so work can ship in stages.

## Recommended Default Sequence

1. Shared slider primitives and calculator color tokens
2. Bike fit calculator
3. Saddle height and frame size calculators
4. Crank length calculator
5. Tire pressure calculator

## Output

Create `output-03-migration-sequence.md`.

## Success Criteria

- The sequence minimizes duplicated effort.
- Shared primitives land before page-specific rework.
- High-visibility calculators move first.
