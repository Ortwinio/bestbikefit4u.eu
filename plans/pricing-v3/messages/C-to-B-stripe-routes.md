# P3 Stripe route adapters ready

Authenticated POST /api/stripe/checkout, /api/stripe/portal, /api/stripe/cancel and /api/stripe/refund now return HTTP 501 with the shared stripeNotImplemented result. Send `{ locale: "nl" | "en" }` for exact localized copy; other checkout fields may remain in the body and are never sent anywhere. Unauthenticated requests retain 401. Both billing flags are intentionally irrelevant to this non-integrated release. No Stripe SDK/network, Convex queries/mutations, entitlement grants or mail schedules are called.

Persist the choice in your checkout flow before displaying the shared message; these adapters do not save it. The Convex webhook and internal Stripe mutations are also inert. Cancel/refund routes have been added for your settings controls. No success URL or pretend payment is returned.
