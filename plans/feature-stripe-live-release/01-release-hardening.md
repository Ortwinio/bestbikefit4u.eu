# 01: Release hardening (code, flags OFF)

## Context

BikeFitBoost (Next.js 16 + Convex) has a complete Stripe integration behind two flags that are OFF in production. Read `plans/feature-stripe-live-release/README.md` first; its "Background" section lists what exists and the seven gaps this prompt closes.

Key files:
- `shared/pricing/products.ts`: the only price catalogue.
- `src/lib/billing/stripeCheckout.ts`, `serverStripe.ts`, `cancelSubscription.ts`.
- `src/app/api/stripe/*`.
- `convex/stripe/{checkout,events,webhook,mutations,queries}.ts`, `convex/http.ts`.
- `convex/emails/templates/pricing.ts`.
- `convex/pricingAppointments/internal.ts`.
- `scripts/check-vercel-env.mjs`, `src/app/api/health/config/route.ts`, `.env.example`, `docs/VERCEL_DEPLOYMENT.md`.

## Rules

- Work in a fresh worktree from `origin/main`, on branch `feature/stripe-live-release`. Open one PR to main at the end; do not merge.
- No real Stripe calls, no deploys, no env changes on any deployment, no real mails. Tests mock Stripe.
- Additive Convex schema only.
- Follow `AGENTS.md`/`CLAUDE.md`: `v.` validators and the `requireUserId()` pattern.
- Both billing flags stay `false` in production. When they are OFF, every path still returns `STRIPE_NOT_IMPLEMENTED`; that behaviour must not regress.
- Never put a secret, user ID, e-mail address or webhook payload in a commit, test snapshot or audit note.

## Tasks

### 1. Send the service mails from verified payment events

The templates are complete and previewed but not wired. Wire them, using the existing e-mail sending path and preferences in `convex/emails/`. They are **service** mails: they ignore marketing consent but respect locale.

| Trigger (after the entitlement is written in `convex/stripe/events.ts`) | Template | Once per |
|---|---|---|
| One-off payment paid (single, personal_fit_standalone) | `renderPurchaseConfirmation` | payment intent |
| First `invoice.paid` (`subscription_create`) for annual / annual_upgrade / annual_personal | `renderSubscriptionWelcome` (+ purchase confirmation if the design requires it; check the template data) | subscription + period start |
| Subscription cancelled through the in-app button or `cancel_at_period_end` | `renderCancellationConfirmation` (with end date and refund amount, if any) | subscription + period start |
| Daily cron: annual renewal in N days (N from the README decision; default 30, as a constant) | `renderRenewalReminder` (€21,50) | subscription period |
| Daily cron: entitlement expired and not renewed | `renderAccessExpired` | entitlement |

Also check whether the M13 transition announcement (`renderTransitionAnnouncement`) and the 7-day reminder for the free transition measurement can actually be sent. If not, add an **admin-triggered, dry-run-first** internal batch in the style of `pricing/internal:beginTransition`:
- it targets accounts with at least one report;
- it is a service mail;
- it has page limits;
- it deduplicates per user;
- it returns aggregate counts only.

Prompt 04 runs it.

Requirements:
- Schedule the mail with `ctx.scheduler.runAfter(0, …)` from the mutation. Never send inside the webhook transaction.
- Deduplicate with a stored send key, so that a replayed event or a cron rerun never sends twice.
- A refund before sending (full refund) cancels the mail.
- Tests: one per trigger, plus replay/duplicate cases and a refund-first case.

### 2. Fitter notification and agenda link

- Finish `convex/pricingAppointments/internal.ts`, so that a paid `annual_personal` or `personal_fit_standalone` sends one notification (name, e-mail, product, paid date; no body measurements) to `FITTER_NOTIFICATION_EMAIL`. The current terminal state is `pending_integration`.
- The checkout success state shows the agenda link from `PERSONAL_BIKEFIT_AGENDA_URL`. The rider's purchase confirmation contains it too.
- Add a server-side switch `PERSONAL_FIT_SALES_ENABLED` (default `false`). Mirror it as `NEXT_PUBLIC_…` for presentation only. When it is false:
  - `annual_personal` and `personal_fit_standalone` are rejected in `reserveCheckout`;
  - the pricing page and checkout show the card as "binnenkort beschikbaar" / "available soon", NL/EN, without a buy button.
  - Reason: the placeholders `[LOCATIE]`, `[DUUR AFSPRAAK]`, `[VOORWAARDEN AFSPRAAK — juridisch toetsen]` and `[AGENDALINK]` must never reach a paying customer.
- When it is true, the preflight requires `PERSONAL_BIKEFIT_AGENDA_URL` (https) and `FITTER_NOTIFICATION_EMAIL`. Add a test that fails if any of those four placeholders is rendered while the switch is on.

### 3. Mode guard

Let `STRIPE_SECRET_KEY` start with `sk_live_`/`rk_live_` (live) or `sk_test_`/`rk_test_` (test).
- In `convex/stripe/webhook.ts` or `events.ts`, reject any event whose `livemode` differs from the configured mode. Reply with 400 and do not record it.
- Convex gets the mode from a new env `STRIPE_MODE` (`test` | `live`), because it has no secret key.
- In Next, add `assertStripeMode()` next to `getServerStripe()`. It fails when the key prefix and `STRIPE_MODE` disagree.
- Preflight: when billing is enabled and `VERCEL_ENV=production`, `STRIPE_MODE` must be `live`; elsewhere it must be `test`.
- Tests for every combination.

### 4. Catalogue sync script

Add `scripts/stripe/sync-catalog.mjs`. It recreates the sandbox catalogue in any account and is idempotent.
- Input: `--mode test|live`, `--dry-run` (default), `--apply`. Read the key from `STRIPE_SECRET_KEY` in the environment only; never from arguments or files.
- Read the amounts from `shared/pricing/products.ts`, compiled or imported the same way other scripts do, so that the script and the catalogue cannot disagree.
- Desired state, matched by product ID and price `lookup_key`:
  - **Products:**
    - `bfb_annual`: name "Jaarabonnement", statement descriptor `BIKEFITBOOST JAAR`, metadata `product_key=annual`;
    - `bfb_single_fit`: "Losse meting", `product_key=single_fit`;
    - `bfb_personal_fit_addon`: "Persoonlijke bikefit-afspraak", `product_key=personal_fit_addon`.
    - Copy the descriptions from the sandbox objects listed in the README, and keep `url` = `https://bikefitboost.com/pricing`.
  - **Prices**, EUR, `tax_behavior=inclusive`:
    - `annual_yearly_2150`: recurring year/1, 2150;
    - `single_fit_1350`: one-off, 1350;
    - `personal_fit_addon_21300`: one-off, 21300;
    - `personal_fit_standalone_20950`: one-off, 20950.
    - If decision 1 in the README chooses Stripe Tax, also set the agreed `tax_code` on the products. Otherwise leave it empty.
  - **Coupon:** `UPGRADE_SINGLE_FIT_1200`, amount_off 1200 EUR, duration `once`, metadata `purpose=upgrade_single_fit_to_annual`.
- Behaviour:
  - Create what is missing.
  - Never change an existing price amount; prices are immutable. On a mismatch, stop with a clear error.
  - Never reactivate or create `personal_fit_standalone_19900`.
  - Print a dry-run diff, and after `--apply` print the env block (`STRIPE_*_PRICE_ID=…`, `STRIPE_UPGRADE_COUPON_ID=…`). Never print the key.
- Optional `--webhook-url <https://…convex.site/stripe/webhook>` creates or updates one endpoint, API version `2026-06-24.dahlia`, with exactly the events from `convex/stripe/events.ts`. Export that list once as `STRIPE_WEBHOOK_EVENTS` from a shared module and use it in both places, with a test that keeps them equal. Print the signing secret once, on creation only, with a warning that it is shown once.
- Unit tests with a mocked Stripe client: idempotency, mismatch stop, dry-run writes nothing.

### 5. Alerts

Report every caught error in `src/app/api/stripe/handler.ts`, `convex/stripe/webhook.ts` (processing failure) and `cancelSubscription` to Sentry, which already exists via `@sentry/nextjs`. Use tags `area=billing` and the error code only; no payload, e-mail or user ID. For Convex, use whatever error reporting the project already has. If there is none, log a structured line with a stable prefix `BILLING_ALERT` and document how to set a log alert in the Convex dashboard.

### 6. Env, preflight, health and docs

- Add `STRIPE_MODE`, `PERSONAL_FIT_SALES_ENABLED` (+ `NEXT_PUBLIC_`), `PERSONAL_BIKEFIT_AGENDA_URL` and `FITTER_NOTIFICATION_EMAIL` to `.env.example`, with comments saying where each lives (Vercel, Convex or both).
- Update `scripts/check-vercel-env.mjs` and `/api/health/config` accordingly. Health returns names and booleans only, never values.
- Rewrite the billing part of `docs/VERCEL_DEPLOYMENT.md`:
  - remove `STRIPE_PRO_*`;
  - list per deployment (Vercel production/preview, Convex prod/dev) which vars are needed;
  - billing and enforcement flags must be set in **both** Vercel and Convex;
  - the webhook lives on Convex (`https://<deployment>.convex.site/stripe/webhook`);
  - Convex deploys before Vercel.
- Add a short section on the restricted key. Prompt 03 needs the exact permission list, so derive it from the calls in the code. Expected:
  - Checkout Sessions write, Customers write, Prices read, Coupons read;
  - Subscriptions write, Customer portal write;
  - Invoices read, Invoice Payments read, PaymentIntents read, Refunds write.
  - Verify against the code and correct the list if needed.

### 7. Stale branch

`origin/feature/pricing-model-v2` is an obsolete first draft without a merge base with main. Do not use it. Mention it in the PR description so Ortwin can delete it.

## Gates

- `npm run typecheck`, `npm run lint` (including `lint:prices` and `lint:brand`), `npm run test:unit`, `npm run test:contracts`, `npm run test:i18n`.
- Convex standalone tsc.
- `npm run build` with the billing flags OFF, and a second build with flags ON and dummy test values. Check that the preflight passes and fails as designed.
- E-mail previews (`scripts/render-email-previews.mjs`) for the newly wired triggers, NL and EN.
- Visual check at 1440 and 390, NL and EN, of the pricing page and checkout step 1 with `PERSONAL_FIT_SALES_ENABLED` on and off.

## Acceptance criteria

- With the flags OFF, behaviour and output are identical to main, proven by existing tests plus a snapshot of `/api/stripe/checkout` returning 501.
- Each service mail is sent exactly once per trigger in tests, including replayed webhooks and cron reruns.
- An event with the wrong `livemode` is rejected and not stored.
- `sync-catalog.mjs --dry-run` against a mocked empty account shows the full catalogue. Against a mocked copy of the sandbox it shows "no changes".
- Appointment products cannot be bought while `PERSONAL_FIT_SALES_ENABLED` is false.
- Docs and `.env.example` match the code. No `STRIPE_PRO_*` remains.

## Output

- `plans/feature-stripe-live-release/output-01-hardening.md`: what changed, gate results, the restricted-key permission list, anything uncertain.
- Update the progress table in the README. Open the PR and print `DONE 01`.
