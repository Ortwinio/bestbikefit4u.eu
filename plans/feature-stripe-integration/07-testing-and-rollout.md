# Prompt 07 — Testing And Rollout

## Goal

Ship Stripe safely through test mode, production env setup, and monitored live rollout.

## Read First

- `package.json`
- `scripts/check-vercel-env.mjs`
- `plans/security-audit/findings/03-api-routes.md`
- `plans/security-audit/findings/06-report.md`

## Tasks

1. Add automated tests for:
   - checkout route validation
   - production missing-env fail-closed behavior
   - webhook signature verification
   - webhook idempotency
   - subscription status mapping
   - customer portal route
2. Add Stripe CLI manual test commands to a rollout output file:
   - checkout completed
   - subscription updated
   - invoice paid
   - invoice payment failed
   - subscription canceled/deleted
3. Add production deployment checklist:
   - Vercel env vars
   - Convex env vars
   - Stripe live product/price IDs
   - Stripe live webhook endpoint
   - Customer Portal live configuration
4. Add rollback plan:
   - Disable paid CTA
   - Keep webhook accepting events
   - Reconcile Stripe Dashboard manually if needed
5. Add post-launch verification:
   - complete one live low-risk subscription
   - verify Convex user tier
   - verify admin subscription row
   - verify portal cancellation flow
   - verify failed payment behavior with test mode before live

## Acceptance Criteria

- Stripe test-mode rollout passes before live mode.
- Production deploy fails if required Stripe config is absent.
- Live webhook endpoint returns 2xx for valid Stripe events.
- A rollback path exists that does not lose Stripe events.

