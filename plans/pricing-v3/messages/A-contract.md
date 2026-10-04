# A — P1 implementation contract

Release 2.0 only. No Stripe calls, grants from checkout success URLs, gifts, commits or deploys.
This is the canonical contract for B/C; implementation follows immediately.

## Products and flags

`shared/pricing/products.ts`: `PRODUCTS` keyed by `free`, `single`, `annual`, `annual_entry`,
`annual_personal`; exported `ProductId`. Each entry has `id`, `priceCents`, `renewalPriceCents`
(null for free/single), `currency: EUR`, `durationMonths`, `scope` (none/bike/user).
Prices: 0 / 1350 / 2450 / 1350 / 23450; recurring renewal 1950. Single = 3 calendar months;
annual variants = 12 calendar months. Instap eligibility requires a prior genuine single entitlement
(including redeemed transition single), not gifts or a selected checkout product. Appointment credit
only comes from annual_personal; renewal never creates another appointment.

`shared/pricing/flags.ts` exports `isPaidAccessEnforced()`; client uses the explicit static
NEXT_PUBLIC_PAID_ACCESS_ENFORCED reference, server PAID_ACCESS_ENFORCED. Only literal `true`
enables it; default OFF. This flag is independent of billing availability so local preview can enforce
while Stripe is stubbed. Existing isStripeBillingEnabled semantics stay unchanged; rollback must leave
paid enforcement OFF as well. A does not edit C-owned commercial.ts. B must use authoritative access
instead of isReportAccessOpen for new gated views.

## Access

`shared/pricing/access.ts`: pure `getAccess(user, bikeId?, options?)`; user contains entitlements,
not a user-controlled tier claim. options provides enforced/now. Return:
`{ enforced, fullProfile, fullReport, maxBikes, profileScoreCap, productId, expiresAt,
eligibleForEntry, appointmentAvailable }`. maxBikes null = unlimited. Off always preserves full
access. On: free = 1 bike/80%; single opens its owned bike and full rider profile while active;
annual variants cover all bikes. Access expiry is checked at read time, not delayed until the cron.

`convex/pricing/queries:getAccess({bikeId?: Id<bikes>})` returns that access for the authenticated
owner (null logged out). Supplying somebody else's bike rejects. `getSubscription({})` returns
`{ access, entitlements, transitionOffer }` for settings/checkout. No other user's rows are returned.
Backend helper `convex/pricing/access.ts`: `getUserAccess(ctx,userId,bikeId?)` checks owned bike.
`convex/pricing/mutations:redeemTransitionOffer({bikeId})` binds an unused eligible offer to an
owned bike, starts three-month access and is idempotent for the same bike. No paid purchase grant API.

## Profile

Refinement field IDs follow the Profile board: femurLengthCm, footLengthCm, sitBoneWidthMm,
handSpanCm, flexibilityTestCm, coreTestSeconds. Guided test fields are separate from always-editable
self-declared flexibilityScore/coreStabilityScore. Complaints always editable. Expired values remain
readable and removable; unchanged old values in full-form payloads may pass, changed paid values
must reject server-side when enforced. No body data in analytics or URLs.

`scoreRiderProfile` retains its old behaviour without enforcement. Optional access argument adds
80-point normalized base and 20-point refinements (5/4/4/2/3/2 as the board). Fully completed free
base is exactly 80, not 100 scaled after selecting locked fields. A owns shared score code and the
shared account profile-data hook, not B's account page components. A will publish precise hook
signature once existing callers are inspected; B can consume getAccess query now.

## Report contract and server protection

A owns backend report/PDF/email checks; B owns presentation. `recommendations/queries:getReportAccess`
args `{sessionId}` returns `{fullReport,canDownloadPdf,canEmailReport,legacyFullAccess,isLatestReport,
enforced}` for owner (null otherwise). Free may view core results and export the latest report only.
An active matching bike/year entitlement opens full results. Explicit legacy full-access marker preserves
the full old report and PDF regardless of expiry. UI must not infer this from createdAt alone.

A will coordinate getReportV2 redaction with B before changing payload shape. Preserve calculatedFit
core data required by the existing mapper; remove paid narrative/steps server-side, not CSS-only locks.
Server PDF/email paths apply the same checks. Existing reports are marked only by the admin transition
operation using an explicit go-live cutoff, never by a client flag or a new request's timestamp.

## Persistence/operations

A owns convex/schema.ts and convex/crons.ts. New `pricingEntitlements`, `pricingTransitionOffers`,
`pricingTransitionRuns` store explicit grants, offers and dry-run evidence. Daily bounded expiry job;
no entitlement deletion, no Stripe integration. Admin-triggered transition is internal, requires a
verified billing/super admin identity, defaults dry-run; write requires a matching completed dry-run.
Eligibility: existing account with at least one report before go-live. Once-only single offer must be
redeemed within 2 calendar months of go-live, then lasts 3 calendar months. Existing Pro with an actual
future period end maps to annual until that same end; no invented extension. No emails sent by transition.

Fields and endpoints in this contract are authoritative; follow-ups will be appended here and messaged.

## Settings metadata follow-up

`getSubscription({}).entitlements` now exposes optional authoritative `periodPriceCents?: number`,
`renewed?: boolean`, `cancelled?: boolean` on each persisted entitlement. Unknown is deliberately
omitted, not inferred from product name or date. New purchase grants record the catalog's actual period
price, `renewed: false`, `cancelled: false`; annual renewals record 1950 cents and `renewed: true`.
Redeemed transition singles record 0 cents, `renewed: false`, `cancelled: false`. Legacy Pro migration
leaves period price and renewal unknown; cancellation is true only when the actual subscription has
`cancelAtPeriodEnd === true` or status `canceled`. Cancellation/checkout stubs do not mutate any of this.
