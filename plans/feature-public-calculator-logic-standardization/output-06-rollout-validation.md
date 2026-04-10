# Rollout And Validation

## Recommended Rollout Sequence

### Phase 1: Shared logic contract

Implement:

- shared anthropometric baseline type
- shared fit-calculator input mapping
- validation result type
- confidence result type

### Phase 2: Shared result contract

Implement:

- standardized result shape
- “range + likely center” output model
- explanation model
- primary driver / secondary modifier / not-covered blocks

### Phase 3: Shared calculator-family UI

Implement:

- page skeleton
- required-input and optional-refinement sections
- confidence presentation
- “why this changed” block
- measurement help patterns

### Phase 4: Calculator rollout

Order:

1. bike fit
2. saddle height
3. frame size
4. crank length
5. tire pressure

### Phase 5: Naming and route cleanup

Implement:

- canonical route standard
- internal link migration
- redirects
- metadata updates

## Engineering Success Criteria

- Shared logic lives in reusable modules rather than page-local helpers.
- Shared result and confidence shapes are reused across calculators.
- Touched calculators render the same result structure and explanation pattern.
- Route changes preserve analytics and SEO behavior.

## Product Success Criteria

- Public calculators feel like one product family.
- Results are more honest and more useful.
- Riders understand why the recommendation moved.
- Confidence is visible without being alarmist.

## Required Test Coverage

### Unit tests

- shared baseline normalization
- validation rules
- confidence scoring
- result formatting
- explanation-generation rules

### Page/component tests

- each calculator shows required vs optional sections correctly
- each calculator shows confidence and “why this changed” areas
- legacy route redirects work

### Browser acceptance

- mobile and desktop
- EN and NL
- light, dark, system
- inline measurement help visibility
- result readability
- CTA continuity

## User Acceptance Tests

### UAT 1: Shared logic clarity

Given a rider uses bike fit and then saddle height,
when they compare the forms,
then the rider recognizes the same baseline concepts and terminology.

### UAT 2: Validation trust

Given a rider enters an implausible height/inseam combination,
when they try to calculate,
then the tool clearly explains the problem before calculation proceeds.

### UAT 3: Range-based result honesty

Given a rider completes saddle height or frame size,
when the result appears,
then they see a usable range and a practical recommended start, not only a single-point answer.

### UAT 4: Explainability

Given a rider selects comfort goal with limited flexibility,
when the result appears,
then the tool explains that those choices made the recommendation more conservative.

### UAT 5: Confidence visibility

Given a rider enters measured inseam,
when the result appears,
then confidence is visibly higher than when inseam is estimated or key refinements are missing.

### UAT 6: Family consistency

Given a rider uses frame size, crank length, and tire pressure,
when they compare the flows,
then each calculator follows the same structural rhythm:

- what this tool is for
- required inputs
- optional refinements
- result
- why this changed
- next best action

### UAT 7: Route polish

Given a rider visits calculator links from homepage or guides,
when they navigate across English and Dutch pages,
then route naming and calculator titles feel consistent and intentional.

## Final Signoff

The work is ready for implementation signoff when:

- all six outputs in this plan are approved
- the rollout order is accepted
- success criteria are agreed by product and engineering
- the UAT set is accepted as the launch gate
