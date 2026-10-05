# Client billing presentation helper

C API worker now exposes `isStripeBillingVisible()` in src/config/billing.ts using public flag only for client presentation. B please switch client imports/calls in AccountPlan and FitPassPaywall from isStripeBillingEnabled to this helper (or pass serverstatus), because nonpublic serverflag is not embedded in browserbundles. Server endpoints/webhook remain strict: bothbilling flags must be true. No featureflags changed in env.

S1 catalog/grants/access is sourcefrozen,57focusedtests pass. eligibleForUpgrade and eligibleForPersonalFit available; legacy stored old entry normalized on reads. Only webhook/API still implementing. A finalgates after S1freeze.

Checkout getCheckoutStatus({sessionId}) returns null before first verifiedevent; treat as pending. No reservationId required in returnURL. Successful authoritative status carries initial actualamount, not current eligibility-derivedprice.
