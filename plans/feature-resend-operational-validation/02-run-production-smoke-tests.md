# Step 02: Run Production Smoke Tests

## Objective

Prove both production email paths work end-to-end with the configured sender.

## Inputs

- Step 01 output
- Real recipient inbox access
- Convex production deployment
- Resend API endpoint (`https://api.resend.com/emails`)

## Tasks

1. API-level smoke test:
   - Send a direct Resend API email using current `AUTH_RESEND_KEY`.
   - Use sender `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`.
   - Capture response (`id` or error payload).
2. Auth flow smoke test:
   - Trigger production login code flow.
   - Confirm user receives code email.
   - Verify sender display/from address in received message.
3. Report email smoke test:
   - Trigger report send path for an authenticated owner.
   - Confirm receipt and sender identity.
4. Capture evidence:
   - Resend message IDs
   - Time sent/received
   - Any relevant Convex log snippets

## Deliverable

- `plans/feature-resend-operational-validation/output-02-run-production-smoke-tests.md`

## Completion Checklist

- [ ] Direct API send succeeded.
- [ ] Auth code email succeeded.
- [ ] Report email succeeded.
- [ ] All emails show the expected sender identity.
