# Step 01: Unit Test Setup

## Objective

Set up the testing framework and create the first unit tests for the fit algorithm's utility functions and score mapping.

## Inputs

- `convex/lib/fitAlgorithm/` — all algorithm source files
- `convex/lib/fitAlgorithm/validation.ts` — `mapFlexibilityScore`, `mapCoreScore`, `validateInputs`
- `package.json` — current dependencies

## Tasks

1. Install test dependencies:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   ```

2. Create `vitest.config.ts` at project root with path aliases matching `tsconfig.json`

3. Add test scripts to `package.json`:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```

4. Create `convex/lib/fitAlgorithm/__tests__/validation.test.ts`:
   - Test `mapFlexibilityScore` for all 5 inputs (1→2, 2→4, 3→5, 4→7, 5→9)
   - Test `mapCoreScore` for all 5 inputs (same mapping)
   - Test `validateInputs` with valid inputs → `isValid: true`
   - Test `validateInputs` with height out of range → error
   - Test `validateInputs` with inseam >= height → error
   - Test `validateInputs` with unusual inseam ratio → warning

5. Create `convex/lib/fitAlgorithm/__tests__/crankLength.test.ts`:
   - Test crank length lookup for each inseam band:
     - inseam 720mm → 165mm
     - inseam 780mm → 170mm
     - inseam 850mm → 172.5mm
     - inseam 900mm → 175mm
     - inseam 960mm → 177.5mm
   - Test MTB adjustment (inseam >= 820 and crank >= 175 → subtract 2.5)

## Deliverable

- Working `vitest` setup with passing tests
- All score mapping and crank length tests green

## Completion Checklist

- [ ] `npm test` runs without errors
- [ ] All `mapFlexibilityScore` cases pass
- [ ] All `mapCoreScore` cases pass
- [ ] Input validation edge cases covered
- [ ] Crank length lookup matches docx spec table exactly
