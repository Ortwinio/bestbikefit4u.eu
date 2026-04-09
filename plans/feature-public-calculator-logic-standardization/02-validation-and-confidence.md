# Step 2: Validation And Confidence

## Objective

Define a validation layer that runs before calculation and a confidence model that makes input quality visible to the rider.

## Tasks

1. Define validation categories:
   - impossible values
   - implausible body-measurement combinations
   - category/setup contradictions
   - output contradictions
2. Define concrete checks, such as:
   - implausible height/inseam combinations
   - unusually low/high inseam relative to height
   - impossible tyre width and bike-type combinations
   - impossible crank-length guidance for category
   - aggressive output paired with very low flexibility/core
3. Define validation severity:
   - block calculation
   - warn but continue
   - explain uncertainty
4. Define confidence labels:
   - high confidence
   - medium confidence
   - lower confidence
5. Define how confidence is computed from:
   - measured vs estimated inputs
   - missing refinements
   - validation warnings

## Output

Create `output-02-validation-confidence.md`.

## Success Criteria

- Validation improves trust rather than just rejecting input.
- Confidence labels are explainable and consistent across calculators.
- The validation model can be implemented as shared logic instead of page-local checks.
