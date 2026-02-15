# Step 05 Output: E2E Communication Tests

## Summary

Implemented end-to-end communication tests for Convex flow reliability using the existing Vitest stack, with full flow coverage and failure/recovery scenarios.

## Environment Constraint and Approach

- Browser E2E setup via Playwright was attempted but blocked by network (`ENOTFOUND registry.npmjs.org`), so Playwright could not be installed in this environment.
- Implemented Node-based E2E communication tests that execute real Convex handlers in sequence with an in-memory DB context.
- This still validates end-to-end backend communication behavior and retry/recovery logic for core flows.

## New E2E Test File

- `tests/e2e/convex-communication.e2e.test.ts`

## Scenarios Covered

1. Happy path:
   - profile upsert -> session create -> questionnaire save/complete -> recommendation generate/read -> email report send.
2. Failure mode:
   - session creation blocked when profile is missing.
3. Failure + recovery:
   - recommendation query returns `null` before generation and returns data after generation.
4. Failure + recovery:
   - email send rejected for non-owner recipient, then succeeds when retried with owner email.
5. Ownership boundary:
   - recommendation query returns `null` for non-owner session access.
6. Contract assertion:
   - `sendFitReport` action uses server-side recommendation source via `runQuery` calls.

## Validation

Commands run:

- `npm test` -> pass (`11` files, `42` tests)
- `npm run typecheck` -> pass

## Notes

- These tests complement Step 04 integration contract tests by validating cross-module communication flows from start to finish.
- If network access is available later, Playwright can be added as an additional browser-layer E2E suite without replacing this communication-flow coverage.
