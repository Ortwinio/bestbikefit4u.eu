# P1 products and entitlement backend

Implemented in shared/pricing and convex/pricing. No Stripe calls, deployments, commits or data operations performed.

- VAT-inclusive products: 0 / 1350 / 2450 / 1350 / 23450 cents; annual renewal 1950. Calendar-month expiry clamps the original day at month end.
- Enforcement is opt-in, literal `true` only; server and browser use their own explicit environment flag. Preview must set BOTH `PAID_ACCESS_ENFORCED=true` on the Convex server deployment and `NEXT_PUBLIC_PAID_ACCESS_ENFORCED=true` at frontend build time; rollback sets BOTH false/unset. Core server helper fast-paths flag-off requests without a bike, keeping pre-existing writes independent of new tables. Public pricing queries still return actual entitlement/eligibility metadata while open.
- Active dates are checked on every access read. Single covers its owned bike and rider profile; annual variants cover all bikes. Missing/deleted/foreign-bike single rows cannot grant profile rights. Expiry and bike-deletion revocation preserve genuine single entry eligibility; refund/admin/unspecified revocations do not. A missing-bike grant is retained as history only, never active access.
- A bounded daily mutation expires 200 rows, scheduling further bounded batches while work remains. Access already expires independently of scheduler timing.
- Transition redemption requires authenticated bike ownership, is idempotent for the same bike, rejects re-binding, and uses the exact redemption deadline. New entitlement lasts three calendar months after redemption.
- `grantPurchasedAccess` is an unregistered server-only helper with no production caller, not a checkout-success or public grant endpoint. Stable grant keys reject mismatched retries. Entry requires genuine prior single; renewals normalize to annual and never issue another appointment. Each explicit new personal package grants one appointment, including after a previously consumed purchase; duplicate grant keys do not duplicate it. Stripe remains stubbed.
- Admin transition uses internal `beginTransition` / `continueTransition`, authenticated billing or super-admin. Default is dry run. Writes require that same admin's completed dry run with exactly matching cutoff; future go-live permits preview only, not writes. Each step handles 50 reports or 25 users and persists its own cursor. Repeated complete runs do not duplicate offers/legacy subscription grants.
- Only reports created before cutoff, for existing owners, receive `legacyFullAccess`. Eligible users get one offer redeemable within two calendar months of go-live. Existing paid active/canceled subscriptions with a real future period end map to annual until precisely that end, without invented extensions or appointment credits. No mail is sent.
- Tests cover products, month boundaries/leap year, flags, bike scoping, expiry boundary, entry, appointment, auth isolation, orphan rights, redemption idempotency, bounded expiry, admin dry run and idempotent transition, purchase-helper safety.

Settings metadata: persisted optional periodPriceCents/renewed/cancelled are returned unchanged. New purchases/renewals record known catalog charges; free transition records zero; legacy migration omits unknown price/renewal and derives cancellation only from actual subscription fields. Stubs never change this data.

Validation: focused Vitest 31 passed; scoped ESLint passed. Tests also cover explicit browser flag isolation, future-only preview, incomplete/foreign/mismatched dry-run rejection, persisted report pagination, expiry continuation/retry scheduling, new personal-package appointments versus renewal, deletion/refund entry eligibility and authoritative purchase/transition/legacy settings metadata. Earlier generated-reference/email-annotation integration blockers are resolved: final standalone Convex tsc, frontend typecheck, lint, 490 contracts and 3,300 unit tests pass (20 existing unit skips); see P1-notes.md.

Files:
- shared/pricing/products.ts
- shared/pricing/flags.ts
- shared/pricing/access.ts
- shared/pricing/access.test.ts
- convex/pricing/access.ts
- convex/pricing/queries.ts
- convex/pricing/mutations.ts
- convex/pricing/internal.ts
- convex/pricing/grants.ts
- convex/pricing/pricing.test.ts
- plans/pricing-v3/audit/P1-entitlements-notes.md
- plans/pricing-v3/messages/A-contract.md
