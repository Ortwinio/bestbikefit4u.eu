# Public Calculator Logic Standardization

## Goal

Turn the public calculators into one coherent product system by standardizing:

- the shared rider input model
- calculator validation rules
- result formatting
- explanation logic
- calculator UX structure
- naming and route consistency

The aim is not to add more complexity. It is to make the existing methodology feel more unified, more explainable, and more trustworthy.

## Why This Work Matters

The current public calculators are credible, but they still feel like adjacent tools rather than one fit product language. The next improvement is to make the shared logic visible and consistent:

- one anthropometric core
- one validation contract
- one result pattern
- one explanation pattern
- one calculator-family UX structure

This will improve trust, perceived product quality, and the transition from free tools into the wider SaaS funnel.

## Scope

In scope:

- Public fit-related calculators
  - `bike-fit`
  - `saddle-height`
  - `frame-size`
  - `crank-length`
- Public tire-pressure calculator
- Shared public calculator logic and UI contracts
- Result semantics, confidence, and explanation patterns
- Naming and route consistency for calculator pages

Out of scope:

- Dashboard redesign
- Rewriting the fit engine from scratch
- Paid dashboard feature expansion
- Major SEO content rewrites outside touched calculator routes

## Target Product Model

### Layer 1: Shared rider baseline

- height
- inseam
- bike category
- riding goal
- flexibility
- core stability

### Layer 2: Calculator-specific inputs

- frame size: baseline only at first, optional goal bias later
- saddle height: optional crank length and adjustment-aware refinements
- crank length: optional pedaling/hip-compression refinements later
- tire pressure: system weight, tire width, surface, setup

### Layer 3: Standardized output

- recommended value
- recommended range
- confidence level
- what affected the result
- what to adjust first
- what to validate on the next ride

## Acceptance Criteria

- All fit-related public calculators share one documented anthropometric core.
- Every touched calculator has a validation layer before calculation.
- Results use a standardized “range + likely center” pattern where applicable.
- Each calculator clearly distinguishes:
  - primary drivers
  - secondary modifiers
  - what the tool does not cover
- Each calculator uses the same UX skeleton:
  - what this tool is for
  - required inputs
  - optional refinements
  - result
  - why this result changed
  - next best action
- Confidence labels are defined and implemented consistently.
- Route and naming consistency are defined with a migration strategy.
- Browser and test validation exist for the shared logic and touched routes.

## Approach

1. Define the shared public calculator logic contract.
2. Define validation and confidence rules.
3. Define the standardized result and explanation model.
4. Define the shared calculator UX skeleton.
5. Define naming and routing cleanup.
6. Roll out the implementation in phases.
7. Validate in code and browser.

## Deliverables

- shared anthropometric-core specification
- validation and confidence specification
- result and explanation model
- calculator UX/family design contract
- route and naming migration plan
- rollout sequence and test plan

## Status

- [x] Step 1: Define shared public anthropometric core
- [x] Step 2: Define validation and confidence model
- [x] Step 3: Define standardized result and explanation model
- [x] Step 4: Define calculator-family UX contract
- [x] Step 5: Define naming and route consistency plan
- [x] Step 6: Define implementation sequence and validation plan

## Execution Notes

- The plan is now executed as an implementation-ready specification package.
- Each output includes:
  - product decision
  - engineering implications
  - success criteria
  - user acceptance tests
