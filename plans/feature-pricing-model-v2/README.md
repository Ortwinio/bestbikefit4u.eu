# Pricing model v2

## Goal

Replace the €9 per month Fit Pass with an annual licence as the main choice, a single fit for one bike, an upgrade path and an annual licence with a personal bike fit appointment, sold through Stripe.

## Prices (incl. 21% VAT, hypotheses until data supports them)

| Product | Customer pays | Built in Stripe as | Renewal |
| --- | --- | --- | --- |
| Annual licence (main choice) | €21,50 per year | Recurring price €21,50 / year | €21,50, no renewal discount |
| Single fit | €13,50 one-off | One-time price €13,50 | None; 1 bike, 3 months |
| Upgrade single fit or gift → annual (within 6 months) | €9,50 first year | Annual price + coupon €12,00 `once` | €21,50 |
| Annual + personal bike fit | €234,50 first year | Annual price + one-time item €213,00 | €21,50 |
| Personal fit appointment (standalone, after a purchase) | €209,50 one-off | Second one-time price on the appointment product | None |
| Gift fit | worth €13,50 | No Stripe product; granted in the app | As single fit; upgrade €9,50 |

Source of truth in code: `shared/pricing.ts`.

Stripe test mode (sandbox "ormac bv sandbox", created 2026-10-04):

| Item | ID | Lookup key |
| --- | --- | --- |
| Product Jaarabonnement | `bfb_annual` | |
| Price €21,50 / year | `price_1UMvc5CJ75oazdcM079bPqkW` | `annual_yearly_2150` |
| Product Losse meting | `bfb_single_fit` | |
| Price €13,50 | `price_1UMvc6CJ75oazdcMjEpH4Ycy` | `single_fit_1350` |
| Product Persoonlijke bikefit-afspraak | `bfb_personal_fit_addon` | |
| Price €213,00 | `price_1UMvc8CJ75oazdcMJklTMENP` | `personal_fit_addon_21300` |
| Price €209,50 (standalone appointment) | `price_1UMwB8CJ75oazdcMwOK82DaP` | `personal_fit_standalone_20950` |
| Archived: price €199,00 | `price_1UMvtZCJ75oazdcMNPpfpbkE` | `personal_fit_standalone_19900` |
| Coupon €12,00 once, annual only | `UPGRADE_SINGLE_FIT_1200` | |

## Scope

In scope: product catalogue, entitlements model (per user and per bike), Stripe checkout and webhooks, cancellation, gifts, report gating, pricing page NL/EN, lifecycle emails, launch.

Out of scope: B2B / bike-shop plans, millimetre margins per recommendation, changes to the public calculators.

## Approach

Stripe stays off (`STRIPE_BILLING_ENABLED=false`) until step 08. Each step is shippable without changing what users see.

| # | Step | Status |
| --- | --- | --- |
| 01 | Product catalogue, `entitlements` table, `getAccess`, expiry cron | Done (this branch) |
| 02 | Checkout (one-off + subscription, coupon server-side, add-on item), webhooks incl. SEPA async events, cancel | Next |
| 03 | Gift fits | |
| 04 | Profile field tiers and score (free max 80%) | |
| 05 | Report and PDF gating via `getAccess` | |
| 06 | Pricing page and copy NL/EN; switch off expired campaign mode | |
| 07 | Lifecycle emails (renewal 30 days ahead at €21,50, gift reminders, review) | |
| 08 | Live Stripe setup and launch checklist | |

## Acceptance criteria (whole)

1. A single fit costs €13,50 and opens the full report for one bike for 3 months.
2. The annual licence costs €21,50 and renews automatically at €21,50.
3. The upgrade costs €9,50 only within 6 months after a single fit purchase or gift redemption; the server refuses it otherwise.
4. The annual licence with personal fit costs €234,50 and renews as a normal annual licence.
5. After expiry an account falls back to free without data loss.
6. All existing tests pass; new logic has unit and contract tests.

## Open decisions

Decided 2026-10-04: upgrade window 6 months; gift recipients may upgrade for €9,50; standalone appointment €209,50; all prices include 21% VAT.

- Bundle vs standalone: annual €21,50 + standalone appointment €209,50 = €231,00, while the bundle costs €234,50 (€3,50 difference). Align?
- An upgrader pays €23,00 in year one (€13,50 + €9,50), €1,50 more than buying the annual licence directly. Keep?
- Personal fit: location, duration, fitter, booking link, cancellation terms (legal check).
- Stripe Tax or a fixed 21% inclusive rate.

## Progress notes

- 2026-10-04: Step 01 implemented on branch `feature/pricing-model-v2`. `users.tier` is unchanged; tier sync from entitlements comes with the webhooks in step 02. Upgrade window (6 months) and standalone appointment price added.
