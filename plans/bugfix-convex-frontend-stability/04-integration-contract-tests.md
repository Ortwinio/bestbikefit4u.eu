# Step 04: Integration Contract Tests

## Objective

Add backend-focused tests that lock communication contracts and prevent regressions between frontend expectations and Convex behavior.

## Inputs

- `convex/sessions/mutations.ts`
- `convex/recommendations/inputMapping.ts`
- `convex/recommendations/mutations.ts`
- `convex/emails/actions.ts`
- Existing tests in `convex/**/__tests__/`
- `vitest.config.ts`

## Tasks

1. Create contract tests for session creation:
   - Verify explicit bike type handling is persisted or intentionally omitted by contract.
   - Verify profile-required guard behavior.
2. Create recommendation mapping tests:
   - Verify precedence order for bike category resolution.
   - Verify fallback behavior is deterministic and documented.
3. Create email action tests:
   - Verify minimal action args contract.
   - Verify own-email restriction and invalid-email errors.
4. Create authorization/error-path tests:
   - Unauthorized user access.
   - Missing session/profile/recommendation cases.
5. Ensure tests assert both data correctness and error-message contracts used by frontend.

## Deliverable

- New integration test files under `convex/**/__tests__/` with stable pass results.

## Completion Checklist

- [ ] High-risk communication contracts have dedicated regression tests.
- [ ] Error-path behavior is covered for auth and missing resources.
- [ ] Tests pass via `npm test`.
- [ ] No flaky test behavior observed in repeated runs.
