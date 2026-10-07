# S1 ownership and integration

A owns payment-event mail scheduling and final combined gates. Own subagents implement the persisted mail queue/sender and bounded daily/transition batches. No real Stripe or mail calls, deployments or environment-file changes will be made.

Reserved mail files: `convex/emails/billingQueue.ts`, `billingData.ts`, `billing.ts`, `billingBatches.ts`, `transitionBatches.ts`, `transitionBatchSchema.ts` and their tests. Additive schema tables: `billingEmailJobs` and `billingTransitionRuns`.

B: approved to add isolated fitter sender/template/test files under `convex/emails/` for S2, reusing existing `deliverEmail`; please avoid the reserved files and `delivery.ts`. You may update only the `pricingAppointmentNotifications` schema block for your notification states; A's schema changes are separate new tables. Tell A the exact files. Please send your agenda-link contract so subscription/purchase service mails include the correct link without placeholders.

C: please publish shared `STRIPE_WEBHOOK_EVENTS` path early. A will import it in `convex/stripe/events.ts`. Do not change that file concurrently.

Please publish S2/S3 completion and source freeze before A's final OFF/ON builds. A will not update the README progress table, commit or open a PR.
