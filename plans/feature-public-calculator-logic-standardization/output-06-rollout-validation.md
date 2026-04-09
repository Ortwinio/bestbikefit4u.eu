# Rollout And Validation

## Rollout Sequence

### Phase 0: Shared contracts

- shared anthropometric baseline type
- shared validation issue model
- shared confidence model
- shared result envelope
- shared calculator route registry

### Phase 1: Fit calculator logic core

- migrate `bike-fit`
- migrate `saddle-height`
- shared measurement help patterns
- shared “why this changed” block

### Phase 2: Fit calculator family completion

- migrate `frame-size`
- migrate `crank-length`
- add shortlist/range model where needed
- add not-covered-here blocks

### Phase 3: Tire-pressure family alignment

- align result envelope
- align confidence language
- align naming/routing
- preserve pressure-specific logic model

### Phase 4: Route canonicalization

- canonical route rollout
- redirects
- metadata updates
- sitemap updates
- analytics normalization

## Engineering Success Criteria

- Shared calculator logic exists in reusable modules, not route-local code.
- Validation and confidence logic are shared across fit-related calculators.
- Result and explanation rendering follow one common model.
- Route naming uses one registry and one redirect strategy.

## Product Success Criteria

- Public calculators feel like one product family.
- Riders understand what affects the result.
- Riders understand what the tool does not cover.
- Confidence and measurement quality are visible.
- The next action after each result is clear.

## Test Plan

### Unit tests

- shared baseline normalization
- validation rules
- confidence scoring
- result-envelope formatting
- explanation-driver selection

### Component/page tests

- required inputs render correctly
- optional refinements stay secondary
- confidence block appears when expected
- “why this changed” block appears with standardized content
- next-step CTA remains visible

### Browser acceptance

- mobile and desktop
- EN and NL
- light, dark, system
- route consistency
- measurement help visibility
- confidence label visibility
- explanation visibility
- CTA continuity

## User Acceptance Tests

### Baseline and flow

1. A rider uses `bike-fit`, then opens `saddle-height`.
   Expected: the shared rider logic feels continuous and the overlapping inputs mean the same thing.

### Validation and confidence

2. A rider enters implausible measurements.
   Expected: the tool blocks or warns clearly before calculation.
3. A rider uses an estimated inseam.
   Expected: the result is still available, but confidence drops and the UI explains why.

### Result explainability

4. A rider changes a major modifier such as goal or flexibility.
   Expected: the result changes and the explanation tells them why.

### UX consistency

5. A rider uses `frame-size` and `crank-length`.
   Expected: both tools use the same structure for required inputs, optional refinements, result, explanation, and next action.

### Naming and route consistency

6. A rider enters through a homepage link, a guide link, or an old route.
   Expected: they land on a consistent canonical calculator route.

## Final Signoff Artifacts

- implementation contract summary
- route migration summary
- test report
- browser QA report
- residual follow-ups list
