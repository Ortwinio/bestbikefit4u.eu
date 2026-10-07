# Step 01 — release hardening

Status: DONE S1 / DONE 01, local code gates complete. Worktree: `/Users/ortwinverreck/Developer/bikefitboost-stripe`, branch `feature/stripe-live-release`. This is not approval to enable payments or send a batch.

No commits, pushes, PRs, deployments, deployment/environment-file changes, real Stripe calls or real mails. The requested `.env.example` source documentation is updated; no operational environment is changed. The lead owns the commit, PR and README progress table. Logs and rendered artifacts remain local/ignored.

## Integrated changes

### S1: service delivery and bounded transition batches

- Verified events persist a deduplicated outbox job and schedule an action after the transaction. Purchase, first-invoice welcome, cancellation, renewal and expiry triggers use stored semantic send keys. Sender reads service preferences and NL/EN locale; marketing consent is not required.
- Atomic claims, frozen retry payloads and provider idempotency keys cover replay/concurrent delivery tests. Pending full-refunded purchases are suppressed. Cancellation mail waits for the exact tagged successful refund where one is due, rather than reporting unrelated or cumulative refunds. Missing evidence does not exhaust send attempts; later signed invoice/payment/refund events wake waiting jobs.
- Added `refund.created` and `refund.updated` to the shared fourteen-event contract with C: charge refund expansion is optional in the installed SDK. Tests cover late invoices, cancellation-before-payment, refund-first, replay, zero-cent refunds and separate cumulative/cancellation amounts.
- Paginated daily renewal/expiry scan runs at 00:30 after existing access expiry. Renewal lead time defaults to 30 days. Cancelled periods skip renewal reminders, not expiry; replacement access suppresses old expiry.
- Administrator-triggered transition announcement and seven-day offer reminder require completed, matching, one-use dry-run evidence and bounded pages. Results contain aggregate counts and an opaque run handle, not contacts. Prelaunch announcements alone can run with billing disabled, with persisted administrator proof; Stripe payment endpoints remain disabled. No batch was applied.
- Additive schema only: mail jobs, transition-run proof, refund evidence and fitter notification lifecycle fields. Updated the exact cron-manifest contract for the added daily job.

Implementation/evidence: `audit/S1-notes.md`, `audit/S1-delivery-notes.md`, `audit/files-S1.txt`.

### S2: appointment safety and fitter notification

- Default-OFF personal-fit sales gate rejects appointment reservations server-side and independently disables purchase controls in NL/EN pricing/checkout.
- Paid appointment products schedule one minimal fitter notification via the existing mail transport, without body measurements. Atomic claims and provider keys are tested with a mock.
- Validated HTTPS agenda links appear in success/confirmation variants; enabled fixture renders contain none of the four prohibited appointment placeholders. No invented appointment location, duration or legal terms.
- Production appointment sales must remain OFF per the owner's decision, regardless of the positive local ON-build fixture.

Evidence: `audit/S2-notes.md`, `audit/S2-visual.json`, `audit/files-S2.txt`.

### S3: provider boundaries, tooling and operations

- Key prefix / configured mode guard in Next; signature-verified Convex webhook rejects wrong or invalid `livemode` before storing/processing events. Shared event list matches handler branches and endpoint provisioning.
- Idempotent catalogue tool defaults to dry-run, uses shared prices, refuses immutable price mismatches and never recreates the retired price. Existing names/descriptions stay unchanged; new descriptions use checked-in NL copy per the lead's later clarification. All catalogue tests use mocks.
- Sanitized billing alerts contain stable codes only: Sentry `area=billing` on Next and `BILLING_ALERT` in Convex. Deployment preflight and health share configuration rules; health returns names/booleans only.
- Deployment documentation covers Vercel/Convex ownership, default-OFF flags, backend-first deployment, restricted permissions and rollback limitations. No obsolete `STRIPE_PRO_*` remains in the rewritten deployment documentation.

Evidence: `audit/S3-notes.md`, `audit/files-S3.txt`, `docs/VERCEL_DEPLOYMENT.md`.

## Combined gates

All commands ran from the absolute worktree, on the integrated S1/S2/S3 sources. Unit/contract/i18n sets overlap; counts are not additive.

| Gate | Result | Evidence |
|---|---|---|
| `npm run typecheck` | PASS | `audit/typecheck-final.log` |
| `npm run lint` | PASS, including prices/brand and every other configured stage | `audit/lint-final.log` |
| `npm run test:unit -- --maxWorkers=4` | PASS: 4,600 tests, 493 files; 20 tests / one file intentionally skipped | `audit/unit-final.log` |
| `npm run test:contracts` | PASS: 622 tests, 55 files | `audit/contracts-final.log` |
| `npm run test:i18n` | PASS: 30 tests, six files | `audit/i18n.log` |
| Standalone `tsc --noEmit -p convex/tsconfig.json` | PASS | `audit/convex-tsc.log` |
| Production build, flags OFF | PASS; build ID `qIJvtwKr9BIC7kmlUBZ_u` | `audit/build-off.log` |
| Production build, flags ON, dummy test configuration | PASS; build ID `vBjQbpfFagtAm3-LSZPAO` | `audit/build-on.log` |
| Hermetic preflight accept/reject matrix | PASS: 24 cases | `audit/check-preflight.mjs`, `audit/preflight.log` |
| Disabled checkout literal NL/EN 501 snapshot | PASS; no Stripe/Convex/fetch calls | `src/app/api/stripe/checkout/route.test.ts` |
| Catalogue mocked dry-run/idempotency/mismatch checks | PASS: 31 checks in the full unit wrapper | `scripts/stripe/` tests |
| Pricing and checkout visual matrix | PASS: 16 fixture cases, zero assertion/axe/overflow/page-error findings | `audit/S2-visual.json` |
| Standard email previews | PASS: 42 bilingual HTML/text previews, 84 screenshots rendered | `audit/email-previews.log` |
| Sender-shaped supplemental previews | PASS: 16 HTML/text pairs, 32 screenshots | `audit/S1-email-preview-review.md` |
| Diff whitespace | PASS | `git diff --check` |

Builds use the canonical site URL and unreachable loopback Convex URLs; provider credentials are empty (OFF) or unmistakable dummy test fixtures (ON). Provider network calls are blocked by `audit/provider-network-guard.cjs`. Its final import-only lint correction was separately verified to block four provider request attempts before network dispatch. No environment files were written. The local `.next` directory contains the ON fixture build, not a deployable production configuration.

Preflight runs `--no-env-files` in isolated child environments. It accepts OFF without provider config, preview/test, synthetic production/live and personal-sales OFF without booking values; rejects wrong modes/key prefixes, malformed configuration, each missing required variable, unsafe agenda URLs, mismatched personal flags and deployed loopback Convex. It never echoes dummy secret/recipient values. This is configuration validation, not actual account connectivity or credential effectiveness.

The first contract run exposed the now-outdated exact cron list; its expected daily entry was updated and the full contract suite rerun green. A final lint run caught CommonJS import syntax in the new audit network blocker; it now uses Node built-in module access, without disabling lint rules. Final unit tests include an independent literal disabled-response snapshot, not merely comparison with the response factory. Existing disabled flag permutations, unauthenticated 401 behavior and no-provider-call assertions also pass. The shared disabled response is unchanged from the starting branch.

## Visual and email scope

B personally reviewed all 16 pricing/checkout images: NL/EN × 390/1440 × sales OFF/ON × two surfaces. A independently revalidated all 29 recorded source hashes, artifact presence and zero failed assertions/axe/overflow/errors. These are isolated real-component fixtures with framework/auth/data adapters, not full Next hydration, authenticated backend or payment evidence. Existing fixed mobile checkout controls and horizontal pricing-table behavior are documented in B's notes; no newly introduced flag-related defect was observed.

Our independent review agent opened 56 email PNGs individually: 24 standard newly wired trigger images and 32 supplemental sender-shaped images, NL/EN at 375/600. A rechecked all 113 inventory hashes. Supplemental cases cover all seven mail kinds plus both appointment variants, including an actual dated announcement, single purchase without an attachment promise, renewal without fabricated usage counts and refunded cancellation. Local browser checks pass for overflow, loaded assets, booking links and prohibited placeholders. External requests are intercepted; booking URLs were not followed.

The unchanged standard renderer has legacy samples that intentionally omit the announcement date or set `invoiceAttached`. Those optional fixtures do not reflect the new sender: it requires a future announcement date and never promises an invoice attachment. Sender-shaped supplementary renders verify this distinction. This review does not claim provider delivery or Gmail/Outlook/Apple Mail compatibility. Raw previews/screenshots are ignored; hash inventories and review notes are retained.

## Restricted runtime Stripe key

Source-audited by C; exact real-dashboard grouping and effectiveness require step02.

| Resource | Minimum permission | Runtime operations |
|---|---|---|
| Checkout Sessions | Write | create |
| Customers | Write | create |
| Prices | Read | retrieve |
| Coupons | Read | retrieve |
| Subscriptions | Write, including read | retrieve, update, cancel |
| Customer portal | Write | configurations.create and sessions.create |
| Invoices | Read | retrieve |
| Invoice Payments | Read | list |
| PaymentIntents | Read | retrieve |
| Refunds | Write, including read | list, create |

The runtime key does not need Products/Webhook Endpoints write or Charges/Connect/balance/payout/transfer access. Convex uses the webhook signing secret and mode, not a Stripe API key. Separate operator provisioning requires Products/Prices/Coupons write and optional Webhook Endpoints write. Do not broaden runtime permissions to match provisioning. No real restricted key was exercised.

## Remaining release decisions and step02/04 checks

The current README decisions supersede earlier individual notes: fixed tax-inclusive prices without Stripe Tax; iDEAL with SEPA renewal mandates; approved free transition measurement; launch without appointment products. Legal review, launch date and final renewal reminder approval remain open. The accountant must confirm invoice content. This hardening step does not claim that the later payment-method or live configuration matrix has been run.

- Transition sequencing: existing offer grants cannot precede go-live; the sender only promises an offer when matching persisted evidence exists. Decide how the approved gift is announced fourteen days earlier before applying a real announcement. No promise/date is invented here.
- A found `redeemTransitionOffer` in the backend but no frontend call under `src/`. The reminder points to the existing fit route. Step02 must verify the rider redemption journey before any reminder batch is applied; no new UI was invented outside this scope. See `messages/A-transition-launch-followup.md`.
- Provider delivery and database commit are not a distributed atomic transaction. Stable retry requests/deduplication are proven in mocks, not external exactly-once delivery forever. A refund after the last safety check cannot recall an in-flight mail. Terminal/ambiguous failures require reconciliation, and paused jobs require explicit rescheduling after configuration recovery.
- Billing OFF pauses checkout, portal, cancellation and webhook processing, not provider renewals or existing access. Later sandbox rollback must include operator support/redelivery handling.
- No real catalogue, webhook, credentials, delivery, alert destination, agenda, payment, refund or production behavior was exercised. Those remain step02+ work, requiring the lead's next authorization.
- `origin/feature/pricing-model-v2` is an obsolete first draft without a merge base with main. It was not used or modified. The lead should mention it in the PR description so Ortwin can delete it.

Step01 implementation and requested local gates are complete. Production billing/enforcement/appointment flags remain untouched and OFF by release policy.
