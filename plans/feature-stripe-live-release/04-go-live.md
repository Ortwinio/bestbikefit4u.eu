# 04: Go-live: real payments, enforcement, transition, monitoring

## Context

Prompts 01–03 are done. Production runs with the live Stripe configuration, all billing flags are OFF, and Ortwin has set a go-live date (README, decision 6). Read `plans/feature-stripe-live-release/README.md`, `output-03-live.md`, `plans/pricing-v3/RELEASEPLAN.md` (sections "Overgang", "Go/no-go", "Na livegang") and `plans/pricing-v3/audit/P1-transition-runbook.md` first.

## Rules

- Every production step needs Ortwin's explicit go at that moment, recorded in `output-04-golive.md` with time (Europe/Amsterdam).
- Flags are changed by Ortwin, or by the agent only after that go.
- Changing a `NEXT_PUBLIC_*` flag needs a **Vercel rebuild**, not just a redeploy of the old build. Convex env changes take effect without a deploy.
- Order is always **Convex first, then Vercel**, when switching ON; **Vercel first, then Convex**, when switching OFF.
- No user data, e-mail addresses or payment details in the output file; aggregate counts and Stripe object IDs only.

## Timeline

### T−14 days: announcement

1. Check the go/no-go list below. Everything except the real payment must already be ticked.
2. Run the transition announcement batch from prompt 01 as a **dry run**. Review the aggregate count with Ortwin. Then run it for real after his go.
3. If decision 7 is "yes": run `pricing/internal:beginTransition` with the approved go-live timestamp as a **dry run**, following the P1 runbook. Review `reportCount`, `offerCount` and `legacyProCount`.

### T−1 day: final checks

- A fresh dry run of the transition. Explain any differences.
- Health green; Stripe live webhook endpoint enabled; Sentry and `BILLING_ALERT` alerts reach Ortwin (send a test alert).
- Support ready: `docs/BILLING_SUPPORT_NOTES.md` updated for the new products and for the in-app cancellation and refund.

### T0: switch billing on (still without enforcement)

1. **Convex production:** `STRIPE_BILLING_ENABLED=true`, `NEXT_PUBLIC_STRIPE_BILLING_ENABLED=true`. Set `PERSONAL_FIT_SALES_ENABLED=true` only if decision 4 is complete.
2. **Vercel production:** the same flags, then rebuild and deploy.
3. **Real payment test** by Ortwin with his own card or iDEAL, on bikefitboost.com:
   a. Buy a losse meting for one bike. Check: the amount on the Stripe receipt is €13,50; the live webhook delivery is 200; access is open for that bike only; the purchase mail arrived.
   b. Refund it fully from the Stripe Dashboard. Check: access revoked, checkout marked refunded.
   c. Take out an annual subscription (€21,50). Check: invoice, welcome mail, all bikes open. Cancel through the in-app button: end date shown, no refund in year 1, cancellation mail. Then refund the €21,50 from the Dashboard so no real money is kept. Check that access is revoked.
   d. If appointment products are on: open the "Plan je afspraak" link from case c, or use a test purchase of €209,50 followed by a refund. Check that the fitter mail arrived.
   - Note: Stripe does not return its processing fees on refunds; the test costs a few euros.
4. Webhook check: zero failed deliveries in the Dashboard, no unexplained `BILLING_ALERT`.
5. If anything fails: switch billing OFF (Vercel first, then Convex), record the failure, fix it via a PR and rerun the case on preview before trying again.

### T0 + agreed moment: enforcement and transition

1. If decision 7 is "yes": run the transition **for real** at or after the go-live timestamp, with the completed dry-run ID, exactly as in the P1 runbook. Record the aggregate counts.
2. **Convex production:** `PAID_ACCESS_ENFORCED=true`. **Vercel production:** `PAID_ACCESS_ENFORCED=true` and `NEXT_PUBLIC_PAID_ACCESS_ENFORCED=true`, then rebuild.
3. Spot-check with a free test account and a paid test account:
   - free: core values, profile up to 80%, PDF of the latest report;
   - paid: everything;
   - an old report: marked "gemaakt met volledige toegang" and fully visible.
4. Check whether the one-time dashboard notice about the new prices is shown, if it was built. If it was not built, record that.

### T0 → T+48 hours: monitoring

Check at least at T+1 h, T+4 h, T+24 h and T+48 h, and record each check:
- Stripe: webhook deliveries (failed = 0, or explained and replayed), payments, disputes.
- Sentry `area=billing` and Convex `BILLING_ALERT`.
- Checkout reservations versus paid checkouts. If more than 2% of started checkouts fail for technical reasons, propose a rollback.
- Support questions.

## Rollback

1. **Vercel production:** `STRIPE_BILLING_ENABLED=false` and `NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false`, then rebuild. Then do the same on **Convex production**.
   - Result: new purchases stop and show the not-implemented message.
   - Paid entitlements stay. Live subscriptions keep running at Stripe.
   - While Convex billing is OFF the webhook returns 501, so Stripe retries for up to 3 days. Switch back on within that time, or replay the events afterwards.
2. To reopen all reports as well, also set `PAID_ACCESS_ENFORCED` and `NEXT_PUBLIC_PAID_ACCESS_ENFORCED` to false (Vercel, then Convex).
3. Tell paying customers with a service mail, per `RELEASEPLAN.md`.
4. Do not delete Stripe objects, entitlements or transition records. Any data repair needs a separate reviewed plan.

## Go/no-go (all ticked before T0)

- [ ] 02 complete with zero open findings; 03 complete
- [ ] Terms, privacy statement, withdrawal text and appointment conditions reviewed by the lawyer and published
- [ ] VAT set-up chosen and confirmed by the accountant
- [ ] Live catalogue verified; restricted runtime key in place; catalogue-sync key deleted
- [ ] Live webhook endpoint enabled with the right events; signing secret only in Convex production
- [ ] Announcement sent 14 days before T0
- [ ] Alerts reach Ortwin
- [ ] Appointment products: either complete (location, duration, conditions, agenda URL, fitter address) or switched off
- [ ] Rollback rehearsed on preview (case 20/21 in `output-02-sandbox.md`)

## Acceptance criteria

- The real payment tests a–c (and d if applicable) passed and were refunded.
- Enforcement is on, and the transition (if chosen) ran with the recorded counts.
- 48 hours of monitoring with no unexplained failures.
- The README progress table and `RELEASEPLAN.md` go/no-go list are updated.

## Output

- `plans/feature-stripe-live-release/output-04-golive.md`: timeline with times, the go per step, results, monitoring log, open points.
- Final README status "live". Print `DONE 04`.
