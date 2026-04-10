# Validation And Confidence

## Mission

BestBikeFit4U should validate before it calculates, then explain how trustworthy the output is.

## Validation Layers

### Layer A: Impossible inputs

Block calculation.

Examples:

- height outside supported human range
- inseam outside supported human range
- tyre width outside tool range
- negative or zero weights

### Layer B: Implausible body combinations

Warn, then calculate if still reasonable.

Examples:

- unusually low inseam relative to height
- unusually high inseam relative to height
- inseam nearly equal to height
- extreme fit scores paired with small/large body values

### Layer C: Category/setup contradictions

Warn, then calculate if recoverable.

Examples:

- road bike with obviously MTB tyre width
- MTB with implausibly narrow tyres for the selected setup
- crank-length output outside typical range for the chosen category

### Layer D: Output contradictions

Warn and downgrade confidence.

Examples:

- very aggressive bar drop with very low flexibility and very low core stability
- strongly performance-biased frame or fit output while rider inputs suggest a safer center
- crank-length recommendation implying a saddle-height recheck

## Proposed Validation Severity

- `error`: block calculation and explain why
- `warning`: calculate, but show reduced confidence
- `notice`: calculate, but add explanation or follow-up guidance

## Confidence Model

### High confidence

Conditions:

- measured inseam entered
- core baseline inputs present
- no blocking errors
- no major warnings

### Medium confidence

Conditions:

- core baseline present
- one or more refinement fields missing
- minor plausibility warnings

### Lower confidence

Conditions:

- inseam estimated instead of measured
- key refinements missing
- contradiction or plausibility warnings present

## Confidence Drivers

Confidence should be derived from:

- measured vs estimated inseam
- presence of required baseline fields
- presence of optional refinement fields
- number and severity of validation warnings
- whether the tool is outputting a simplified model rather than a full-fit result

## UI Contract

Each calculator should display:

- validation state near the affected input
- confidence label near the result
- short explanation for confidence level

Example:

- `High confidence: measured inseam entered and no major contradictions found`
- `Medium confidence: result is sound, but riding-goal and stability refinements are missing`
- `Lower confidence: inseam was estimated and some inputs reduce certainty`

## Engineering Contract

Create a shared validation result shape, for example:

```ts
type ValidationSeverity = "error" | "warning" | "notice";

type PublicCalculatorValidation = {
  field?: string;
  severity: ValidationSeverity;
  code: string;
  message: string;
  explanation?: string;
};

type ConfidenceLevel = "high" | "medium" | "lower";
```

## Success Criteria

- Every calculator validates before calculation.
- Validation logic improves trust rather than simply rejecting inputs.
- Confidence is derived from shared rules, not page-specific copy.
- Contradictions reduce certainty visibly instead of being silently ignored.

## User Acceptance Tests

1. If a rider enters an impossible height/inseam combination, the calculator blocks calculation and explains the problem clearly.
2. If a rider enters a plausible but unusual body combination, the calculator still works but lowers confidence and explains why.
3. If a rider estimates inseam instead of measuring it, the result visibly shifts to a lower confidence state.
4. If a rider chooses low flexibility and low core stability, the calculator avoids presenting a highly aggressive fit output as fully trustworthy.
