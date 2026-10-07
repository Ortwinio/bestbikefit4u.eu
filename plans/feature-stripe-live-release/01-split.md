# 01 task split (lead, 7 Oct 2026)

Worktree `/Users/ortwinverreck/Developer/bikefitboost-stripe`, branch `feature/stripe-live-release` (from main @ fd27c3f).
Absolute worktree paths only (never `process.cwd()` or the main repo `~/Developer/bikefitboost`); git only as
`git -C /Users/ortwinverreck/Developer/bikefitboost-stripe`. No commits, pushes, PRs, deploys, env changes, real Stripe
calls or real mails: the lead commits and opens the PR. Source of truth: `README.md` and `01-release-hardening.md` here.
Coordination via `plans/feature-stripe-live-release/messages/`. Use subagents in parallel.

| ID | Owner | Tasks from 01 | Owns |
|---|---|---|---|
| S1 | A | 1 service mails (all five triggers, dedupe send keys, refund cancels, crons) + transition announcement / 7-day reminder batch (admin-triggered, dry-run first). Also switches `events.ts` to the shared `STRIPE_WEBHOOK_EVENTS` list from S3. **Final combined gates for 01.** | `convex/stripe/events.ts`, `convex/emails/**`, `convex/crons.ts`, new mail/batch internals, schema additions for send keys |
| S2 | B | 2 fitter notification, agenda link, `PERSONAL_FIT_SALES_ENABLED` switch (server reject in `reserveCheckout`, "binnenkort beschikbaar"/"available soon" on pricing + checkout NL/EN, placeholder test). Visual check 1440/390 NL/EN with the switch on/off. | `convex/pricingAppointments/**`, `convex/stripe/checkout.ts`, pricing/checkout UI and their i18n, `src/config/*` flag helper for the switch |
| S3 | C | 3 mode guard (`STRIPE_MODE`, `assertStripeMode()`, livemode check in `webhook.ts`), 4 `scripts/stripe/sync-catalog.mjs` + shared `STRIPE_WEBHOOK_EVENTS` module (+ equality test), 5 alerts (Sentry `area=billing`, Convex `BILLING_ALERT`), 6 `.env.example`, `scripts/check-vercel-env.mjs`, `/api/health/config`, `docs/VERCEL_DEPLOYMENT.md` billing rewrite + restricted-key permission list verified against the code, 7 stale branch note. | `convex/stripe/webhook.ts`, `src/lib/billing/serverStripe.ts`, `src/app/api/stripe/handler.ts`, `src/lib/billing/cancelSubscription.ts` (alerts only), `scripts/stripe/**`, env/preflight/health/docs |

Interfaces:
- C publishes the shared events module path in `messages/C-webhook-events.md` early; A then imports it in `events.ts`.
- B sends its new env names (`PERSONAL_FIT_SALES_ENABLED`, `NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED`, `PERSONAL_BIKEFIT_AGENDA_URL`, `FITTER_NOTIFICATION_EMAIL` rules) to C in `messages/B-env.md`; C owns `.env.example`, preflight and health.
- A's mails and B's fitter notification both send via the existing `convex/emails/` path; B asks A before touching `convex/emails/**`.

Each owner writes `audit/S<n>-notes.md` (changes, tests, uncertainties) and prints `DONE S<n>`. A then runs the full gates
from 01 (typecheck, lint incl. prices/brand, test:unit, test:contracts, test:i18n, Convex tsc, build flags OFF and flags ON
with dummy test values, preflight pass/fail, email previews NL/EN, visual check from B) and writes `output-01-hardening.md`
(incl. the restricted-key permission list from C). A prints `DONE 01`. Do not update the README progress table; the lead does.
