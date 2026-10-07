# S2 — personal-fit release hardening

## Scope and implementation

- Worked only in the Stripe release worktree. No commits, deployments, environment-file changes, real Stripe
  requests or real mail. Lead retains release decisions and A retains combined OFF/ON builds and final gates.
- Default-off `PERSONAL_FIT_SALES_ENABLED` rejects annual_personal and personal_fit_standalone reservations,
  including reuse of an existing pending reservation. Existing billing-off STRIPE_NOT_IMPLEMENTED takes precedence.
  NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED is presentation only; its value cannot authorize a reservation.
- NL/EN pricing retains the personal card but replaces its buy link with availability text while disabled.
  Disabled personal products are excluded from the offer schema. Checkout disables both personal selections and
  blocks progression/payment for a direct personal selection. Other products remain available.
- Removed appointment placeholders from pricing/checkout copy, including FAQ and comparison content. No location,
  duration or cancellation terms were invented: those details refer to contact with the team. Existing confirmed
  purchasers still see their booking link if sales are subsequently disabled.
- AppointmentBlock validates HTTPS agenda URLs, rejects credentials and uses a factual unavailable/contact fallback.
  The checkout server page already supplies PERSONAL_BIKEFIT_AGENDA_URL. A owns the matching purchase/welcome
  email agenda integration, coordinated in messages/B-to-A-fitter-integration.md.
- Completed fitter outbox: transactionally queue once per entitlement, schedule an action, atomically claim once,
  recheck eligibility/refund-revoked status and current contact/locale, deliver HTML + text through existing
  deliverEmail with a stable provider idempotency key, then record sent/failed. Notification includes only name,
  contact email, product and payment-confirmation date, not body measurements. Layout helpers escape rider input.
- A supplied additive notification schema statuses/attemptedAt/sentAt. B added the isolated fitter renderer under
  A's explicit permission; did not edit A's billing sender, delivery helper, templates index or shared pricing renderer.

## Checks

- Integrated focused run: **14 files, 251 tests passed**. Covers pricing page, pricing/checkout components,
  default/off/on flag combinations, independent server authorization, both personal products, dedupe/refund-first,
  mocked Resend HTML/text/locale/idempotency/privacy, agenda URL safety, legacy placeholder regression,
  pricing grants and exact billing-off API response/zero-provider-call regression.
- `npm run typecheck`: passed after concurrent owner fixes. Initial cache-write EPERM required an approved rerun.
- Convex standalone `tsc --noEmit -p convex/tsconfig.json`: passed.
- Full lint: ESLint, runtime boundaries, tooltips, 254 contrast checks, CSS tokens, images and brand pass.
  Last full run remains blocked only by A-owned `convex/emails/billing.ts` legacy-product expression flagged by
  lint:prices (currently line 41). Reported in messages/B-integration-typecheck.md; not patched outside ownership.
- Scoped tracked-file diff whitespace check passed. Vite emitted its existing native-config advisory, not failures.

## Visual evidence

- `tests/visual/stripe-live-s2/capture.mjs --capture`: **16/16 cases pass**, combining pricing/checkout step 1,
  personal-sales OFF/ON, NL/EN, 1440/390. No axe violations, document overflow, unexpected browser errors,
  external/API requests or payment/auth calls. Every availability/selection/placeholder assertion passes.
- Evidence: `audit/S2-visual.json` and `renders/S2-{pricing|checkout}-{off|on}-{nl|en}-{1440|390}.png`.
  Parent independently recomputed the bundled source hashes after capture: no changes.
- Parent directly viewed checkout OFF EN390/NL1440 and pricing ON NL1440/OFF EN390: disabled appointments remain
  readable without buy controls; normal products retain their actions, localized copy fits, and enabled personal
  pricing has factual appointment details rather than placeholders. The desktop focus outline and mobile fixed
  continuation button are existing behaviour, not added styling. The mobile comparison table remains scrollable.
- Visual subagent completed direct manual review of all 16 captures and recorded it in S2-visual.json;
  no new visual defect found. Parent confirmed the zero-failure matrix and source hashes independently.
- This is an isolated real-component/CSS fixture, not a Next production build. Framework/auth/data/analytics
  boundaries are adapters; live authentication, persistence, payments and production hydration are not proven.

## Operational caveats / handoff

- Leave both personal-sales flags OFF until the owner approves appointment location, duration, legal terms and
  real agenda/fitter configuration. Removing placeholders does not constitute legal approval or enable sales.
- Payment date is truthfully labeled “Payment confirmed on” / “Betaling bevestigd op”: entitlement.createdAt,
  recorded on verified fulfillment, rendered in UTC. Period startsAt is deliberately not represented as payment
  time. A delayed webhook is not proof of a bank settlement timestamp.
- Missing mail credentials leave pending notifications unsent, allowing an explicit action invocation after
  configuration is restored. Legacy pending_integration intents migrate only when requeued, not by a bulk job.
- Failed or interrupted sending records require provider reconciliation; they are not blindly retried after the
  provider's idempotency window. Database claim plus provider idempotency prevents replay duplicates, but no
  unlimited-time distributed exactly-once guarantee is claimed. A refund after claim cannot unsend an email.
- Full combined gates, sequential OFF/ON builds, email previews and final release output remain A's responsibility.
