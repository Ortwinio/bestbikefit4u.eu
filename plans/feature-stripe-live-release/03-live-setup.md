# 03: Live Stripe and production configuration (billing still OFF)

## Context

Prompts 01 and 02 are done, and Ortwin gave the go after `output-02-sandbox.md`. Read `plans/feature-stripe-live-release/README.md` (Decisions section), `output-01-hardening.md` and `output-02-sandbox.md` first.

This prompt moves the sandbox set-up to the **live** Stripe account and puts the live configuration in production, with every billing flag still OFF. After this step, production is technically ready, but nobody can pay yet.

The sandbox is a separate Stripe account, so nothing is copied: the live catalogue is recreated with `scripts/stripe/sync-catalog.mjs`.

## Rules

- Steps marked **[Ortwin]** are done by Ortwin in the Stripe Dashboard, Vercel or Convex. The agent prepares exact instructions, checks the result where it can, and never handles live secrets.
- No flag is switched ON in production in this prompt.
- Every production env change is listed in `output-03-live.md` by name only (never values), with date and who made it.
- Stop immediately on any mismatch between the live catalogue and `shared/pricing/products.ts`.

## Preconditions (check, do not assume)

- README decisions 1 (VAT), 2 (payment methods) and 3 (legal review) are recorded.
- Decision 4 (appointment content) is recorded, or the explicit choice "go live without appointment products" is recorded. In that case `PERSONAL_FIT_SALES_ENABLED` stays `false` in production.

## Steps

### A. Live Stripe account [Ortwin, agent provides the checklist]

1. Activate the live account for Ormac BV:
   - business details and KvK;
   - bank account for payouts;
   - public business name "BikeFitBoost";
   - support e-mail and URL;
   - statement descriptor (short descriptor `BIKEFITBOOST`).
2. Turn on 2FA for every Dashboard user.
3. Branding: logo and colours (petrol #0A7263, lime #CFF26A) for Checkout, invoices and the portal.
4. Payment methods per decision 2 (for example cards, iDEAL | Wero, SEPA Direct Debit, Bancontact). Turn off everything else.
5. VAT per decision 1:
   - Stripe Tax: registration NL, default tax behaviour inclusive, product tax codes;
   - or no Stripe Tax: invoices show tax-inclusive amounts only. In that case the accountant must confirm the invoice content.
6. Customer e-mails: decide whether Stripe sends receipts and invoice mails, alongside our own service mails. Recommendation: Stripe receipts ON for payments and refunds, our service mails for everything else. The agent checks that the content does not overlap confusingly.
7. Billing → Subscriptions and e-mails:
   - Smart Retries on;
   - after all retries fail, **cancel** the subscription (our access logic follows `customer.subscription.deleted`);
   - no Stripe-sent renewal reminders, because we send our own.
8. Customer Portal default settings are irrelevant: the code creates its own configuration (invoices and payment method only).

### B. Live catalogue

1. **[Ortwin]** Create a live **restricted** key named `bikefitboost-catalog-sync`, with write access to Products, Prices, Coupons and Webhook Endpoints only. Run the sync in a local shell with that key in `STRIPE_SECRET_KEY`:

   ```bash
   node scripts/stripe/sync-catalog.mjs --mode live --dry-run
   node scripts/stripe/sync-catalog.mjs --mode live --apply --webhook-url https://<prod-deployment>.convex.site/stripe/webhook
   ```

   - The dry run must show exactly:
     - 3 products;
     - 4 prices: `annual_yearly_2150`, `single_fit_1350`, `personal_fit_addon_21300`, `personal_fit_standalone_20950`;
     - 1 coupon, `UPGRADE_SINGLE_FIT_1200`;
     - 1 webhook endpoint with the events from `STRIPE_WEBHOOK_EVENTS`.
   - Store the printed live webhook signing secret straight into Convex production (step C) and nowhere else.
   - Delete the `bikefitboost-catalog-sync` key afterwards.
2. The agent verifies the live catalogue read-only (Stripe MCP or Dashboard export provided by Ortwin): amounts, currency EUR, tax behaviour, `recurring` year/1 for annual, coupon `once` and €12,00, product IDs and metadata. Record the live price IDs and coupon ID in `output-03-live.md`; these IDs are not secret.
3. **[Ortwin]** Create the live **runtime** restricted key `bikefitboost-production` with exactly the permission list in `docs/VERCEL_DEPLOYMENT.md` (proven in prompt 02).

### C. Production env [Ortwin, agent provides the exact list]

| Where | Set | Value |
|---|---|---|
| Convex **production** | `STRIPE_WEBHOOK_SECRET` | live signing secret from B1 |
| | `STRIPE_MODE` | `live` |
| | `STRIPE_BILLING_ENABLED`, `NEXT_PUBLIC_STRIPE_BILLING_ENABLED` | `false` (unchanged) |
| | `PAID_ACCESS_ENFORCED` | `false` (unchanged) |
| | `PERSONAL_FIT_SALES_ENABLED` | `false` for now |
| | `FITTER_NOTIFICATION_EMAIL` | if decision 4 is done |
| Vercel **production** | `STRIPE_SECRET_KEY` | live restricted runtime key |
| | `STRIPE_MODE` | `live` |
| | `STRIPE_ANNUAL_PRICE_ID`, `STRIPE_SINGLE_FIT_PRICE_ID`, `STRIPE_PERSONAL_FIT_ADDON_PRICE_ID`, `STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID`, `STRIPE_UPGRADE_COUPON_ID` | live IDs from B2 |
| | `PERSONAL_BIKEFIT_AGENDA_URL` | if decision 4 is done |
| | billing, enforcement and personal-fit flags (+ `NEXT_PUBLIC_`) | `false` (unchanged) |
| Vercel **preview** | unchanged: sandbox key, test IDs, `STRIPE_MODE=test` | |

### D. Deploy and verify (agent)

1. Deploy: `npx convex deploy` (production), then the Vercel production deploy of current main.
2. Check:
   - `/api/health/config` is green;
   - the build log shows the preflight passed;
   - the pricing page and checkout show the not-implemented message, exactly as before;
   - the live webhook endpoint exists and is enabled.
3. Stripe cannot send test events to a live endpoint, so verify the endpoint in the Dashboard instead: it shows the right URL and events, and no deliveries yet. The first real delivery happens in prompt 04.
4. Prove the mode guard works in production with no risk: a `POST` to `/stripe/webhook` without a signature returns 400 (or 501 while billing is OFF). Record which one.

## Acceptance criteria

- The live catalogue is identical to the sandbox catalogue, except for IDs and the inactive €199 price, which does not exist in live.
- Production runs with the live configuration and all billing flags OFF. User-visible behaviour is unchanged.
- The live runtime key is restricted. No full secret key is used anywhere. The catalogue-sync key is deleted.
- `output-03-live.md` lists every env change by name, date and person, plus the live object IDs.

## Output

- `plans/feature-stripe-live-release/output-03-live.md`.
- Update the README progress table. Print `DONE 03` and stop: **gate, wait for Ortwin's go and the go-live date**.
