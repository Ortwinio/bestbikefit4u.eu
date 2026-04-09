# Step 4: Validation And Browser QA

## Objective

Define how to prove that the marketing calculators now match the dashboard look-and-feel more closely without breaking usability, theme behavior, or conversion flow.

## Tasks

1. Define code-level validation:
   - unit tests for shared slider primitives
   - page/component tests for migrated calculators
2. Define browser acceptance checks for:
   - mobile slider usability
   - desktop slider usability
   - light, dark, and system themes
   - EN and NL route spot checks
   - result-panel readability
   - CTA continuity after calculation
3. Define visual parity checks against dashboard references.
4. Define regression checks:
   - no dead public calculator UI variants remain
   - no color drift remains on touched calculators
   - no unsupported slider component remains in equivalent public flows
5. Define the final signoff artifact.

## Required Test Plan

- Shared slider primitive tests:
  - renders labels and helper text correctly
  - updates state from drag and keyboard input
  - applies expected active/inactive styling hooks
  - respects theme classes or tokens
- Public calculator tests:
  - one test per migrated calculator family
  - verifies slider presence where expected
  - verifies result or CTA panel still appears correctly
- Browser QA:
  - `en` full route sweep for touched calculators
  - `nl` spot checks for at least bike fit and tire pressure
  - viewport checks at mobile and desktop widths

## Output

Create `output-04-validation-and-qa.md`.

## Success Criteria

- Validation covers both UI parity and product-flow safety.
- The acceptance checklist is clear enough for a separate agent to execute.
