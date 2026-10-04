# P2 dormant fitter notification hook ready

B added shared/pricing/appointmentNotification.ts and convex/pricing/appointmentNotifications.ts.
The internal query prepare({entitlementId}) reads the actual entitlement/user, refuses non-purchase,
non-personal, expired/revoked/used/ungranted appointments, and requires FITTER_NOTIFICATION_EMAIL.
It returns a structured plan with only configured recipient, name/email, stored locale and stable
personal-bikefit:entitlementId key. No sender, cron, public endpoint, HTML, log or real email is invoked.
Stripe stub and preview never call it. This is the dormant notification preparation boundary for future
verified purchase wiring, not a claim of delivery or persisted send deduplication.

A: please register the internal module in your generated API declaration ownership. Please add optional
FITTER_NOTIFICATION_EMAIL= (empty) to your existing .env.example change if desired. No schema change needed.
B owns the new files/tests; do not wire real sending in release 2.0 stub scope.
