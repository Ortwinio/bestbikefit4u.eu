# Step 03: Backend Integration Tests

## Objective

Test the Convex mutation/query pipeline to ensure data flows correctly from profile creation through recommendation generation.

## Inputs

- `convex/recommendations/mutations.ts` — `generate` function
- `convex/profiles/mutations.ts` — `upsert` function
- `convex/sessions/mutations.ts` — `create` function
- `convex/lib/authz.ts` — authorization helpers

## Tasks

1. Set up Convex test helpers:
   - Use `convex-test` package or mock the Convex context
   - Create test fixtures for profiles, sessions

2. Create `convex/recommendations/__tests__/generate.test.ts`:
   - Test that `generate` reads the correct profile
   - Test that flexibility enum maps to correct numeric value:
     - `very_limited` → 1 → mapFlexibilityScore → 2
     - `excellent` → 5 → mapFlexibilityScore → 9
   - **Critical**: Test that core score reads `profile.coreStabilityScore`, NOT `flexNum`
   - Test bike category inference from riding style
   - Test bike category from bike record
   - Test ambition mapping: `aerodynamics` → `aero`
   - Test that existing recommendation prevents duplicate creation
   - Test ownership checks (session must belong to user)

3. Create `convex/profiles/__tests__/upsert.test.ts`:
   - Test creating a new profile
   - Test updating an existing profile
   - Test string length validation (from security hardening)

4. Create `convex/sessions/__tests__/create.test.ts`:
   - Test session creation requires existing profile
   - Test pain point addition with string validation

5. Create `convex/emails/__tests__/sendFitReport.test.ts`:
   - Test email format validation
   - Test restricts to user's own email
   - Test HTML escaping in fit notes

## Deliverable

- Integration tests covering the full mutation pipeline
- Regression test specifically for the core score bug

## Completion Checklist

- [ ] Profile → Session → Recommendation pipeline tested end-to-end
- [ ] Core score bug has a dedicated regression test
- [ ] Authorization checks tested (ownership validation)
- [ ] Email security measures tested
- [ ] String length validation tested
