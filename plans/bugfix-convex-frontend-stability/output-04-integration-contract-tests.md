# Step 04 Output: Integration Contract Tests

## Summary

Added integration-style contract tests for the highest-risk Convex communication boundaries:

- Session creation contract
- Recommendation generation contract
- Email action contract
- Ownership/not-found query contracts

These tests invoke Convex handlers directly via `_handler` with mocked Convex contexts to validate behavior at the server boundary.

## New Test Files

- `convex/sessions/__tests__/create.contract.test.ts`
- `convex/sessions/__tests__/queries.contract.test.ts`
- `convex/recommendations/__tests__/generate.contract.test.ts`
- `convex/recommendations/__tests__/queries.contract.test.ts`
- `convex/emails/__tests__/sendFitReport.contract.test.ts`

## Coverage Added

### Session creation contract

- Persists explicit `bikeType` into `fitSessions`
- Rejects `bikeId` + `bikeType` mismatch

### Recommendation generation contract

- Uses `session.bikeType` snapshot over linked bike fallback
- Falls back to linked bike type when session snapshot is missing (legacy session case)
- Returns existing recommendation without re-running algorithm or writing duplicates

### Email action contract

- Accepts minimal payload contract (`sessionId`, `recipientEmail`)
- Validates email format
- Enforces “send only to authenticated user email”
- Returns “Recommendation not found” when recommendation is missing

### Query auth/not-found behavior

- `sessions.getById` returns `null` for unauthenticated or non-owner access
- `recommendations.getBySession` returns `null` for unauthenticated or non-owner access
- Owner path returns expected documents

## Validation

Commands run:

- `npm test` -> pass (`10` files, `36` tests)
- `npm run typecheck` -> pass

## Notes

- Tests use Convex handler-level invocation and mocked DB/query chains to lock request/response/error contracts without adding external test dependencies.
- This suite is designed as regression protection for Step 02 and Step 03 contract/resilience changes.
