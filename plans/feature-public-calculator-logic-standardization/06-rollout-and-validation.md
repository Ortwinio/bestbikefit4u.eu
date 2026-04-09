# Step 6: Rollout And Validation

## Objective

Turn the logic and UX contracts into an implementation sequence with a clear validation plan.

## Tasks

1. Define rollout phases:
   - shared logic contract
   - shared validation/confidence layer
   - shared result/explanation UI model
   - calculator-by-calculator migration
   - route cleanup
2. Recommend migration order:
   - bike fit
   - saddle height
   - frame size
   - crank length
   - tire pressure
3. Define test coverage:
   - shared input model tests
   - validation tests
   - confidence tests
   - result-format tests
   - page/route tests
4. Define browser acceptance:
   - mobile and desktop
   - EN and NL
   - light, dark, system
   - explanation visibility
   - confidence visibility
   - next-step CTA continuity
5. Define final signoff artifacts.

## Output

Create `output-06-rollout-validation.md`.

## Success Criteria

- The plan can be executed in phases without blocking the full site.
- Shared logic lands before page-specific complexity.
- Validation proves both logic clarity and UX consistency.
