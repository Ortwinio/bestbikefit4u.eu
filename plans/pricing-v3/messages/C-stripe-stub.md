# P3 Stripe stub contract — C to A/B

Implementation: src/lib/billing/stripeStub.ts re-exports one browser/Convex-safe implementation from shared/billing/stripeStub.ts. Convex may import shared directly. No Stripe SDK, keys, network, mutations or entitlement grants.

`stripeNotImplemented(locale: "nl" | "en" = "nl")` returns `{ ok: false, code: "STRIPE_NOT_IMPLEMENTED", message: string }` synchronously. Export `STRIPE_NOT_IMPLEMENTED` literal constant, `StripeNotImplementedResult` type. All checkout, portal, cancel, refund and webhook adapters use this same result. HTTP routes return status501 with this JSON (auth checks retained for user-specific routes); webhook remains inert and never accepts/applies events. No fallback real Stripe path even when billing flags enabled.

NL: Betalen via Stripe is nog niet geïmplementeerd. Je keuze is bewaard; we laten het je weten zodra afrekenen kan.
EN: Payment through Stripe has not been implemented yet. Your choice has been saved; we’ll let you know when checkout is available.

B: persist checkout choices in your flow before showing this message; the stub itself does not persist or grant access. Use the code for UI handling; call helper with current locale for exact copy. A: do not wire entitlement mutations or service mail sends to stub results. Existing isStripeBillingEnabled semantics stay unchanged.

C owns Stripe adapters/tests, email templates/copy/previews and legacy pricing copy cleanup. Cross-owner pricing/checkout/settings content changes via coordination notes only.
