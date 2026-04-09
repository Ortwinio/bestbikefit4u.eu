# Validation And Confidence

## Decision

The public calculators should run a shared validation stage before calculation and then express output confidence explicitly.

## Validation Model

### Severity levels

- `blocking`
  - calculation should not run
- `warning`
  - calculation can run, but with visible caution
- `confidence-impacting`
  - calculation can run, but confidence drops

### Validation categories

- impossible raw values
- implausible anthropometric combinations
- category/setup contradictions
- output contradictions
- missing refinement quality

## Shared Validation Rules

### Anthropometric checks

- height outside supported human range
- inseam outside supported human range
- inseam greater than or equal to height
- unusually low inseam relative to height
- unusually high inseam relative to height

### Fit-logic checks

- aggressive drop target combined with very low flexibility and very low core stability
- extremely short or long crank recommendation inconsistent with selected bike category
- frame-size outcome that implies shortlist contradiction with baseline dimensions
- saddle-height shift triggered by category/goal/refinement that exceeds the public-safe adjustment window

### Pressure checks

- impossible tire width for selected discipline
- impossible setup combination for width/discipline
- impossible rider/system weight and tire width combination without warning

## Confidence Model

### Labels

- `High confidence`
  - measured baseline inputs present
  - no validation warnings
  - refinement inputs present where relevant
- `Medium confidence`
  - core baseline present
  - one or more refinements missing or estimated
  - no severe contradiction
- `Lower confidence`
  - estimated inseam
  - validation warnings present
  - critical refinements omitted for a more posture-sensitive output

### Confidence drivers

- measured vs estimated inseam
- presence of category
- presence of riding goal for posture-sensitive calculators
- presence of flexibility/core stability for posture-sensitive calculators
- validation warnings

## UI Contract

### Blocking state

- show inline message near the offending field
- do not produce result cards
- explain what to fix

### Warning state

- show result
- show warning explanation
- lower confidence label if needed

### Confidence presentation

- show a visible confidence badge near the result header
- add one sentence explaining why confidence is high, medium, or lower

## Engineering Implications

- Add a shared validation module for the public baseline.
- Return structured validation issues:

```ts
type ValidationIssue = {
  field?: string;
  severity: "blocking" | "warning" | "confidence-impacting";
  code: string;
  message: string;
};
```

- Confidence should be computed from structured inputs and validation issues, not page-local copy conditions.
- Calculator components should render validation states from a common result envelope rather than inventing their own warning model.

## Success Criteria

- Every public calculator validates before producing its result.
- Validation differentiates between blocking and warning states.
- Confidence labels use one shared model across calculators.
- Estimated or partial inputs lower confidence without breaking usability.

## User Acceptance Tests

1. A rider enters an inseam that is greater than height.
   Expected: calculation is blocked, the rider sees a clear explanation, and no result is shown.
2. A rider enters a plausible but unusual inseam-to-height ratio.
   Expected: the result can still be shown, but a warning explains why the output should be treated cautiously.
3. A rider uses estimated inseam instead of measured inseam.
   Expected: the result appears with a lower confidence label and a clear reason.
4. A rider chooses a comfort goal with very low flexibility/core while the tool trends toward an aggressive posture.
   Expected: the result stays conservative and the explanation calls out the contradiction.
5. A rider uses a tire width that is unrealistic for the chosen discipline.
   Expected: the pressure calculator blocks or warns appropriately instead of silently returning a misleading value.
