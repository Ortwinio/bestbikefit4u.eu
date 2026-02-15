# Step 03: Validation Auth Flow

## Objective

Prove the backend now runs properly and auth magic-code flow still works after the runtime fix.

## Inputs

- Updated auth implementation from step 02
- Local dev stack (`npm run dev`)
- Auth-related test files under `convex/**/__tests__` and relevant frontend login flow

## Tasks

1. Start fresh dev stack and verify:
   - Convex local backend starts cleanly.
   - No repeated runtime bundling errors in logs.
2. Validate endpoint health:
   - `http://127.0.0.1:3210` responds as running.
3. Exercise login flow:
   - Development path (no resend key) logs code correctly.
   - Production-configured path sends email request without runtime errors.
4. Run focused tests/type checks relevant to auth changes.
5. Capture evidence (commands + key outputs) for future debugging.

## Deliverable

- `plans/bugfix-convex-auth-runtime/output-03-validation-auth-flow.md`

## Completion Checklist

- [ ] Convex server is healthy and stable.
- [ ] Auth flow is validated in at least one real execution path.
- [ ] Test/check results are recorded.
- [ ] Any remaining risk is documented with mitigation.
