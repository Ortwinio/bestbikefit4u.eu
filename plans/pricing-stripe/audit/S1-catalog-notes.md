# S1 catalog/access/grants

Implemented in the existing shared/pricing catalog, after reviewing origin/feature/pricing-model-v2:shared/pricing.ts. Adopted the approved price/coupon/add-on amounts and six-calendar-month window; did not adopt the draft's one-credit upgrade. A's gift module uses two credits for paid annual entitlements.

- Products: single1350, annual2150/renewal2150, upgrade950/renewal2150, bundle23450/renewal2150, standalone20950.
- Upgrade qualification: genuine purchase or gift redemption within six calendar months; excludes transition/legacy freebies, refunded/admin revocations and future rights. Bike-deleted purchase/gift history still qualifies. Active annual subscriptions suppress the upgrade offer; no invented lifetime coupon restriction.
- Standalone requires purchased single history or an active annual. It grants an appointment only, never profile/report/all-bike access. No owner-specified expiry exists: expiresAt=0 is an explicitly untimed appointment sentinel, omitted from the generic expiry index range; booking and fitter-notification checks accept it until used/revoked.
- Historical annual_entry survives only in the additive stored validator/read-normalizer and its compatibility test, never in the product catalog or a new purchase. getAccess and getSubscription return normalized product keys. Removing its validator could reject existing data.
- Purchase grants accept exact verified periodEnd and Stripe subscription/customer/payment references. Replayed grants reject conflicting references but may enrich a previously absent payment intent. Internal eligibilityAt retains trusted checkout-time eligibility when a delayed SEPA payment arrives after the six-month boundary.
- Gift grant helper convex/pricing/gifts.ts validates owned bike, creates a three-calendar-month gift-sourced single entitlement, and is idempotent by gift:<id>; conflicting replay fails. Caller performs token/recipient redemption atomically.

Validation: 58 tests across shared access, appointment preparation, purchase/gift grant tests and fitter queue contracts pass. Focused ESLint passes. Convex tsc passed; the intermediate unrelated schema indexes were removed by their owner and the subsequent Convex check passed. No real provider/mail calls, no commits.

Files changed by catalog worker:
- shared/pricing/products.ts
- shared/pricing/access.ts
- shared/pricing/access.test.ts
- shared/pricing/appointmentNotification.ts
- shared/pricing/appointmentNotification.test.ts
- convex/pricing/grants.ts
- convex/pricing/gifts.ts
- convex/pricing/queries.ts
- convex/pricing/internal.ts
- convex/pricing/pricing.test.ts
- convex/schema.ts (pricingEntitlements section only)
- plans/pricing-stripe/audit/S1-catalog-notes.md

Follow-up review: Stripe checkout.created uses second precision while the trusted reservation timestamp is in milliseconds. The internal eligibility guard permits up to999ms rounding difference, with a realistic same-second regression; larger future offsets are rejected.
