# Step 04: End-to-End Tests

## Objective

Test critical user flows through the application using Playwright or Cypress.

## Inputs

- All frontend pages in `src/app/`
- All backend mutations/queries

## Tasks

1. Install E2E test framework:
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. Create `e2e/setup.ts`:
   - Configure base URL (localhost:3000)
   - Set up test user authentication helper
   - Seed question definitions if needed

3. Create `e2e/auth.spec.ts`:
   - Test login page renders
   - Test email input validation
   - Test OTP flow (may need mock for Resend in test env)

4. Create `e2e/profile.spec.ts`:
   - Test measurement wizard loads
   - Test height/inseam validation (out of range shows error)
   - Test inseam ratio warning
   - Test completing all 4 steps
   - Test editing existing profile

5. Create `e2e/fit-session.spec.ts`:
   - Test creating a new session (select bike type, style, goal)
   - Test aero option only shows for road bikes
   - Test questionnaire navigation (next, back, skip)
   - Test results page loads with recommendations
   - Test email report modal

6. Create `e2e/navigation.spec.ts`:
   - Test public page links (homepage, about, pricing)
   - Test dashboard navigation
   - Test protected route redirect (unauthenticated → login)

## Deliverable

- E2E test suite covering the critical user path
- CI configuration for running E2E tests

## Completion Checklist

- [ ] Auth flow tested (even if mocked)
- [ ] Profile creation wizard tested end-to-end
- [ ] Full fit session flow tested (create → questionnaire → results)
- [ ] Protected route redirection verified
- [ ] Tests run reliably in CI (no flaky timeouts)
