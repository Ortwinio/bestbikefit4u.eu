# Pricing model per "Stripe-inrichting prijsmodel v2" (Ortwin, 4 Oct 2026): prices, real Stripe code (flag off), gift measurements

Worktree `/Users/ortwinverreck/Developer/bikefitboost-pricing`, branch `feature/pricing-stripe` (from main @ 2a9157a, pricing v3 live).
Absolute paths only; git only as `git -C /Users/ortwinverreck/Developer/bikefitboost-pricing`. No commits, deploys, prod data,
env changes, real Stripe calls or real mails. Design: boards in `plans/pricing-stripe/boards/` (Pricing, Cadeau, CadeauOntvangen,
mail M11 Cadeau, M08 Upgrade) plus the live v3 boards in `plans/pricing-v3/boards/`. **Amounts in this README override the boards**
(boards still show €13,50-first-year/€19,50).

## Price table (all incl. 21% VAT, EUR)
| Product | Customer pays | Stripe build-up | Renewal | Access |
|---|---|---|---|---|
| Jaarabonnement ("Favoriete keuze") | €21,50 per year | recurring price €21,50/yr, lookup `annual_yearly_2150` | auto-renews at €21,50; no start fee, no renewal discount | all bikes, profile to 100%, 12 months, **2 gift measurements per subscription year** |
| Losse meting | €13,50 one-off | one-off price, lookup `single_fit_1350` | none | 1 bike, 3 months |
| Upgrade naar jaarabonnement | €9,50 first year | annual price €21,50 + coupon `UPGRADE_SINGLE_FIT_1200` (€12,00 once) | €21,50 | only within 6 months after buying a losse meting or redeeming a gift; server applies the coupon, never a promo code |
| Jaarabonnement + persoonlijke bikefit | €234,50 first year | annual price + one-off item €213,00, lookup `personal_fit_addon_21300` | as annual, €21,50 | annual + 1 fitter appointment |
| Persoonlijke bikefit-afspraak (los) | €209,50 one-off | one-off price, lookup `personal_fit_standalone_20950` | none | only for users who bought a losse meting or have an annual subscription; afterwards "Plan je afspraak" |
| Cadeaumeting | worth €13,50 | no Stripe product; granted in the app | — | a losse meting for the recipient; 1 month to redeem; then upgrade for €9,50 within 6 months |

Owner decisions (4 Oct): keep bundle €234,50 and standalone €209,50 as above; upgrader paying €23,00 in year 1 is intended.
Old numbers must disappear everywhere: €24,50, €19,50, "€5 korting", entry offer €13,50-first-year (`annual_entry`), Pro monthly/€9.

## Stripe (real code, behind `isStripeBillingEnabled()` = false in production)
- Env (Vercel): `STRIPE_SECRET_KEY` (restricted key), `STRIPE_ANNUAL_PRICE_ID`, `STRIPE_SINGLE_FIT_PRICE_ID`,
  `STRIPE_PERSONAL_FIT_ADDON_PRICE_ID`, `STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID`, `STRIPE_UPGRADE_COUPON_ID`; Convex: `STRIPE_WEBHOOK_SECRET`.
  Remove reads of `STRIPE_PRO_MONTHLY_PRICE_ID` / `STRIPE_PRO_YEARLY_PRICE_ID`. Update `.env.example`, `scripts/check-vercel-env.mjs`
  (only require Stripe vars when billing is enabled) and the health route.
- Test-mode IDs from the sandbox (document them in `.env.example` comments / runbook only, never as code defaults):
  annual `price_1UMvc5CJ75oazdcM079bPqkW`, single `price_1UMvc6CJ75oazdcMjEpH4Ycy`, addon `price_1UMvc8CJ75oazdcMJklTMENP`,
  standalone `price_1UMwB8CJ75oazdcMwOK82DaP`, coupon `UPGRADE_SINGLE_FIT_1200`; product IDs `bfb_annual`, `bfb_single_fit`, `bfb_personal_fit_addon`;
  product metadata `product_key` = annual | single_fit | personal_fit_addon.
- Checkout Sessions: `mode: payment` for losse meting and standalone appointment; `mode: subscription` for annual, with the €213,00
  one-off line item for the bundle and the coupon added **server-side only** when eligible (6-month rule). Payment methods per
  dashboard (iDEAL | Wero, SEPA Direct Debit, Bancontact, cards); prices are tax-inclusive. Return URLs from the shared origin helper.
  The per-bike choice for the losse meting is carried in metadata.
- Webhook on Convex `/stripe/webhook` (`convex/http.ts`), API version `2026-06-24.dahlia`; handle checkout.session.completed/expired,
  customer.subscription.created/updated/deleted, invoice.paid, invoice.payment_failed, invoice.payment_action_required, charge.refunded,
  **plus checkout.session.async_payment_succeeded / async_payment_failed** (SEPA). Also subscribe `invoice_payment.paid`
  to link modern unexpanded invoice payments to refunds without provider calls from Convex. Grant entitlements only on confirmed payment;
  idempotent by event id; signature verified.
- Customer Portal: invoices + payment method only; cancellation stays the in-app button (restitution rules from v3).
- When the flag is OFF, every Stripe path keeps returning the existing `STRIPE_NOT_IMPLEMENTED` message (no regression).
- Turn off campaign mode in `src/config/commercial.ts` (end date 4 Jun 2026 passed) and remove its copy.

## Tasks
| ID | Owner | Scope |
|---|---|---|
| **S1 catalog + Stripe backend** | C | Update `shared/pricing/products.ts` + entitlements to the table (replace `annual_entry` with upgrade eligibility: losse meting purchase or gift redemption within 6 months; add `personal_fit_standalone`); review `origin/feature/pricing-model-v2` (someone's first draft: `shared/pricing.ts` + tests) and fold anything useful into the existing structure — no second catalog. Real Stripe Checkout/webhook/portal code + env + preflight as above, behind the flag, with tests that mock Stripe (no network). Write `messages/C-contract.md` first (product keys, access helper, checkout API, gift entitlement hooks). |
| **S2 gift measurements** | A | Annual subscribers get 2 gift credits per subscription year (reset on renewal). Give: recipient email + optional message (boards Cadeau, M11). Recipient gets mail M11 (house-style email system, NL/EN, previews only, no real send), redeem page per CadeauOntvangen (states: valid, expires in ≤5 days, expired), must redeem within 1 month; on redeem a losse-meting entitlement (1 bike, 3 months) + upgrade eligibility 6 months. Expired gift returns the credit to the giver and deletes the stored recipient email. Giver and recipient never see each other's profile. Additive schema only. Abuse limits (no self-gift, rate limits, token-based redeem links). Build against C's contract. |
| **S3 UI + copy** | B | Pricing page cards (annual €21,50/yr with "2 cadeaumetingen per jaar", losse meting €13,50, annual + personal fit €234,50), checkout flow (upgrade €9,50 offer when eligible, standalone appointment purchase €209,50 + "Plan je afspraak"), settings/subscription overview, dashboard upsells, FAQ, structured data (no aggregateRating), llms.txt, service mails (purchase, welcome, renewal reminder now €21,50 without "€5 korting", cancellation, M08 upgrade €9,50 then €21,50, M13), campaign mode off. Regression guard test: none of €24,50 / €19,50 / €5 korting / annual_entry / Pro monthly. |

Coordination via `plans/pricing-stripe/messages/`. Disjoint files; C's contract first. Use subagents in parallel.
Gates (combined, A owns final): typecheck, lint (brand/domain/price guards), test:unit, test:contracts, Convex tsc, build with
`NEXT_PUBLIC_SITE_URL=https://bikefitboost.com` + offline Convex URLs, seo-crawl-check --local, domain-migration-check --local,
email previews, NL/EN 1440/390 visual sweep of pricing, checkout (all products + upgrade), gift give/redeem/expired, settings.
Notes `plans/pricing-stripe/audit/<id>-notes.md`. Print `DONE S1` / `DONE S2` / `DONE S3`.

## S2 completion — 5 October 2026

S2 integrated with C's catalog/entitlements and completed the combined S1/S2/S3 candidate gates. Typecheck, lint, unit, contracts, standalone Convex tsc, offline production build, local SEO/domain crawls, email previews and gift visuals all pass. Evidence: `audit/S2-notes.md`; changed S2 files: `audit/files-S2.txt`. No commit, deploy, actual environment change, real Stripe call or real mail; billing remains off.

## S3 status (5 Oct)

Complete: bilingual pricing/checkout/settings/upsells/FAQ/SEO/llms/service mails, campaign removal,
and lint price guard. C's catalog/eligibility/status and public client billing helper are integrated.
Parent regression run: 398 tests / 31 files pass. Final isolated UI sweep: 200 NL/EN 1440/390
captures, zero findings; all 12 source hashes stable. Email previews: 80 screenshots, all checks pass.
No real Stripe/mail calls, env changes, commits or deployments. A owns combined final gates; latest
B typecheck reports only A's gift/page.tsx invalid-variant expiresAt finding. Details and B-owned
file list: `audit/S3-notes.md`, `audit/files-S3.txt`. Appointment release-content placeholders remain
explicitly documented rather than invented; billing remains OFF.

## S1 completion — 5 October 2026

C source frozen. Catalog + enabled Stripe paths, signed/idempotent webhook, payment/refund ordering and safe renewal cancellation retries implemented. 209 focused tests, Convex tsc and whole-tree lint pass. Full-app typecheck has one A-owned gift-page union error, reported with the legacy paid-entry gift-credit compatibility finding. A retains ownership of combined release gates. See [S1 notes](audit/S1-notes.md) and [file list](audit/files-S1.txt). No commit/deploy/provider calls/env changes.
