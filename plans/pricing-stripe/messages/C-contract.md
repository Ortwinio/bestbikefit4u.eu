# S1 contract — catalog, Checkout and gift hooks

4 October. C owns shared/pricing, Convex pricing/Stripe, Stripe API/env/preflight/health. A owns gifts; B UI/copy/campaign. No second catalog. README prices override boards and draft branch.

## Product keys and access

Keep `free`, `single`, `annual`, `annual_personal`; replace old entry product with `annual_upgrade`; add `personal_fit_standalone`. `PRODUCTS` stays in shared/pricing/products.ts. Prices cents: single1350, annual2150/renewal2150, upgrade950/renewal2150, annual_personal23450/renewal2150, standalone20950/no renewal. Bundle adds21300 to annual. Annual products grant2 gift credits per paid subscription year (draft's one-credit upgrade is NOT adopted).

`getAccess` retains current booleans/caps and exposes `eligibleForUpgrade` (replaces eligibleForEntry), `eligibleForPersonalFit`. Upgrade requires a purchased single or redeemed gift within6 calendar months, excluding transition freebies/refunds; bike-deleted eligibility remains. Standalone appointment requires a purchased single or an annual subscription; appointment does not itself grant full-profile/all-bike access.

## Checkout API

POST /api/stripe/checkout body `{ productId, bikeId?, locale, withdrawalAccepted: true }`. Existing B client may be adapted to this. Token/auth required. OFF: existing501 STRIPE_NOT_IMPLEMENTED localized result, zero provider/network calls. ON: server validates product, ownership, eligibility and withdrawal acceptance; resolves configured price IDs and server-only coupon; returns `{ url, sessionId }`. No client prices/coupons/customer IDs trusted. Metadata carries userId/productId/bikeId/locale. Shared resolveSiteOrigin for all return URLs. Paid access only on verified paid webhook, never return page.

Portal POST returns `{url}` when enabled, invoices/payment methods only (disable cancellation in session configuration). Cancel/refund remain authenticated in-app endpoints using server-owned subscription/payment records and original v3 restitution policy. All OFF paths preserve stub.

## Gift entitlement hook for A

C adds source `gift` to pricing entitlements. A may insert a redeemed gift entitlement as `productId: single`, source: gift, owner+chosen bike, active, startsAt=redemption time, expiresAt=addCalendarMonths(start,3), unique grantKey `gift:<gift-id>`, appointmentGranted:false, periodPriceCents:0, renewed:false, cancelled:false, createdAt. This qualifies for the six-month upgrade; no Stripe product for gifts. A validates recipient/bike ownership and single-use token transactionally.

Annual credit integration UPDATED to A-backend-contract.md: A derives two credits from each real paid annual entitlement ID + startsAt, no separate credit hook/table/callback required. C grants one idempotent annual entitlement per confirmed paid subscription period; no grant on subscription-created or unpaid checkout. C exports `grantGiftEntitlement(ctx,{userId,bikeId,giftId,redeemedAt})` from `convex/pricing/gifts.ts` for A's atomic redemption transaction.

## Schema coordination

A owns new gift tables only. C catalog worker owns pricingEntitlements validator/fields. C Stripe worker owns new Stripe billing state tables and existing stripe_events validators. Use narrow patches; no whole-file schema rewrite. C integrates generated API once stable; A/B please share new module names.

## Safety/coordination

Real Stripe SDK calls only through enabled server paths; tests inject/mock SDK and never use sandbox IDs as defaults. Env examples list provided test IDs as comments only. No actual env changes, production calls, real Stripe or mail. B owns src/config/commercial.ts campaign removal and all UI/mail price-copy migration. A owns final combined build/crawl/sweep gates after source freeze. C will run focused S1 checks first.

## Checkout return + status contract (authoritative, for S3)

Success URL: `${resolveSiteOrigin()}/${locale}/checkout?session_id={CHECKOUT_SESSION_ID}`. Cancel URL: same localized checkout with `cancelled=1&product=<canonical-key>`. B route passes session_id as sessionId prop. URL alone is NEVER paid proof.

`api.stripe.queries.getCheckoutStatus({sessionId:string})`: authenticated owner; null for unknown/not-owned; otherwise `{status:"pending"|"paid"|"failed"|"expired", productId, bikeId?, amountTotalCents:number|null, currency:"EUR"}`. Only signed confirmed-payment processing changes to paid. Display actual amountTotalCents for receipts, including950 upgrade; use pending while unknown/processing, never infer success from an older entitlement.

## Storage compatibility / appointment duration

Old entry key may remain ONLY in additive storage validator/read-normalizer for existing rows, never current catalog/Checkout/UI. C will test normalization; S3 public-copy guard should exempt only this documented storage seam. No arbitrary standalone appointment expiry invented: standalone grants appointment-only availability until used/revoked, never full profile/report access. Catalog worker is implementing the explicit representation and will document it.
