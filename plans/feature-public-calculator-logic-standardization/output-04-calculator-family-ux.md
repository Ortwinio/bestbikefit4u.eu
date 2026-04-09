# Calculator-Family UX Contract

## Decision

All public calculators should use one UX skeleton so the tools feel like one family instead of isolated pages.

## Shared UX Skeleton

### 1. What this tool is for

- short value statement
- practical scope
- trust framing

### 2. Required inputs

- minimal fields needed for a useful result
- measurement support at point of entry

### 3. Optional refinements

- collapsed or secondary by default
- clearly framed as “improves confidence” or “fine-tunes result”

### 4. Result

- center + range
- confidence
- result summary

### 5. Why this result changed

- primary drivers
- secondary modifiers
- short plain-language explanation

### 6. Next best action

- what to adjust first
- what to validate on the next ride
- account/signup bridge where appropriate

## Shared Content Blocks

### Measurement support

- inline measurement hint
- “how to measure” drawer or inline expander
- confidence note on measured vs estimated values
- quick retake action

### Dependency block

Each calculator should show:

- primary drivers
- secondary modifiers
- not covered here

### Confidence block

- confidence label
- why this confidence level applies

## Interaction Rules

- Required fields appear first and above optional refinements.
- Optional refinements should never visually compete with the first required inputs.
- Result and explanation modules should remain visible in the same structural position across calculators.
- Input-help affordances should appear where friction happens, not in a separate general guide only.

## Calculator-Specific Notes

### Bike fit

- richest fit-intake form
- full explanation model
- strongest bridge into account creation

### Saddle height

- simpler input entry
- strong measurement help
- explanation should stress safe starting band

### Frame size

- shortlist framing
- simpler optional refinements
- stronger “not covered here” block

### Crank length

- concise form
- clear dependency explanation around saddle-height recheck

### Tire pressure

- keep current strong structure
- use it as the reference page for shared rhythm and explanation visibility

## Engineering Implications

- Build shared calculator sections rather than page-local layouts for every route.
- Standardize field/help/result/explanation slots.
- Use one shared result-header pattern for confidence and result summary.
- Add route-level tests for required blocks, not just headline text.

## Success Criteria

- A rider moving between calculators sees the same structural rhythm.
- Optional refinements are clearly secondary.
- Measurement support is available where input friction occurs.
- “Why this result changed” is a standard UX section, not a page-specific extra.

## User Acceptance Tests

1. A rider opens bike fit and then saddle height.
   Expected: both tools use the same overall structure and section ordering.
2. A rider is unsure how to measure inseam.
   Expected: measurement help is available directly in the form, not only via a separate guide page.
3. A rider completes a calculator result.
   Expected: they can immediately see confidence, why the result changed, and what to validate next.
4. A rider uses only required inputs.
   Expected: the tool still works, and optional refinements are clearly framed as accuracy boosters rather than hidden requirements.
