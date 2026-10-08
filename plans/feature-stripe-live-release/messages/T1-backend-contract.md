# T1 backend contract

UI query: `api.pricing.queries.getTransitionOffer`, args `{}`; authenticated through `requireUserId`.

Exact return union (discriminant is `status`):

```ts
type TransitionOfferStatus =
  | { status: "none" }
  | { status: "upcoming"; goLiveAt: number }
  | { status: "available"; redeemBy: number }
  | { status: "redeemed"; bikeId: Id<"bikes">; expiresAt: number }
  | { status: "expired" };
```

Dates are UTC epoch milliseconds. No raw rows or contact details. Billing/enforcement flags do not hide offers.
Redeemed takes precedence over offer deadline; expiry of the granted measurement is exposed as `expiresAt`.
Unredeemed offers become available at `goLiveAt` and expired at `redeemBy` (exclusive redemption deadline).

Mutation remains `api.pricing.mutations.redeemTransitionOffer({ bikeId })` and returns its entitlement ID.
Same-bike retries are idempotent; another bike yields `TRANSITION_OFFER_ALREADY_REDEEMED`.
Missing offer yields `TRANSITION_OFFER_NOT_FOUND`; outside redemption window yields `TRANSITION_OFFER_UNAVAILABLE`.
Ownership is checked first. Neither endpoint starts Stripe or mail operations.

Prelaunch preparation persists offers only; report markers and legacy paid entitlements wait for a separate
dry-run-first execution at/after go-live. Parent owns mail/integration, UI worker owns UI.

## Completed backend handoff

- Added the query with explicit return validators and the exact union above.
- Existing redemption mutation needed no changes; tests verify ownership, missing offer, before-go-live and
  deadline rejection, same-bike retry (even after deadline), different-bike rejection and flags-OFF redemption.
- Preparation mode is fixed by `run.createdAt < run.goLiveAt`, including pages resumed after go-live.
  Runbook requires a fresh preview/execution at launch to migrate access and catch newly eligible accounts.
- Validation passed: pricing tests 30/30; adjacent report/access/Stripe checkout tests 53/53;
  Convex TypeScript; ESLint for changed backend files; scoped diff whitespace check.
- Changed backend files: `convex/pricing/queries.ts`, `convex/pricing/internal.ts`,
  `convex/pricing/pricing.test.ts`; updated `plans/pricing-v3/audit/P1-transition-runbook.md`.
- No codegen, deployment, environment changes, Stripe/mail operations or commits.

DONE T1
