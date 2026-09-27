# Backend/API security review — 2026-09-27

Scope: Convex authorization/storage/billing boundaries, server API remote fetches, PDF rendering, public submissions, and regression validation. Authentication/login and dependencies/CSP are covered by other workstreams. This is a source review and local regression pass, not a production penetration test. No production writes, external messages, or deployment were performed.

## Findings fixed

### P1: Client-controlled Stripe customer binding

`convex/users/mutations.ts` exposed `storeStripeCustomerId` as a public authenticated mutation. Any user with no existing binding could assign a known Stripe customer ID; the server checkout route then trusted that binding, and a paid account could request a portal for it. Customer IDs are identifiers, not authorization credentials.

Changes:
- Removed the public binding mutation; signature-verified Stripe webhook processing remains the trusted persistence path.
- Checkout and portal retrieve the customer from Stripe and require its server-created `metadata.userId` to equal the authenticated user ID. Deleted, unbound, or mismatched customers fail closed with HTTP 409.
- New customer creation uses a stable per-user idempotency key; no public mutation is needed. User email is collected by Checkout rather than included in the idempotent customer creation payload, so profile changes do not alter that payload during Stripe's idempotency window.
- Checkout supplies user metadata on the subscription as well as the Checkout session, allowing subscription events arriving before checkout completion to map correctly.
- Removed the webhook plan resolver's fallback from unknown prices to any Pro plan. Unmapped subscriptions produce an audit event without granting access.

Regression evidence: checkout/portal tests cover valid ownership, another user's customer, missing metadata, deleted customer, webhook-only persistence, and idempotent creation. Webhook tests cover an unrelated price and existing active/failed/canceled/idempotent event paths.

Rollout: deploy Convex and frontend together. Existing bindings without matching Stripe metadata require trusted administrative reconciliation; do not restore client-controlled binding as a workaround. New customer creation remains idempotent within Stripe's retention window; abandoned checkouts outside that window can leave unused customers.

### P1: Arbitrary storage deletion and incomplete references

`convex/files/actions.ts` exposed an unused public `deleteFile(storageId)` mutation that only checked authentication. A user knowing another file's storage ID could delete it directly. Bike cleanup also ignored user avatar references and scanned the entire bikes table.

Changes:
- Removed the unused public delete endpoint; no UI caller existed.
- Bike/photo cleanup now preserves storage IDs referenced by user profile images.
- Added `users.by_profile_image` and `bikes.by_photo_url` indexes, replacing the full bike-table scan with indexed lookups.
- Removing one gallery row preserves a shared file if a surviving sibling still uses it.

Regression evidence: storage-reference tests cover another user's avatar, shared bikes, and legacy primary images; gallery mutation contracts cover primary-photo replacement and removal.

Limit: storage does not yet have a comprehensive upload ownership ledger. URLs/storage IDs remain bearer-style image references, and arbitrary upload claims plus abandoned upload cleanup need a dedicated ownership design. The new profile protection covers the storage-ID representation used by the current upload UI; legacy free-form storage URLs merit migration before building a broader deletion job.

### P1: Redirect-based server-side request forgery in Marktplaats fetches

The image API, advert preview action, and import image action validated only the initial hostname and then followed redirects. A permitted URL redirecting elsewhere could escape the allowlist. Some paths read unbounded bodies and accepted active SVG under `image/*`.

Changes:
- Added a shared HTTPS host validator that rejects credentials and nonstandard ports.
- Fetch redirects manually, validating every destination before any request; cap at four redirects with a request deadline. Advert actions now explicitly use Node so request deadlines use a supported runtime (the shared helper is only called by Node actions/routes). See [Convex runtime documentation](https://docs.convex.dev/functions/runtimes).
- Bound actual streamed response bytes, including responses with missing/dishonest Content-Length: 10 MiB images and 2 MiB advert HTML.
- Restrict proxied/imported images to common raster MIME types; proxy adds `nosniff` and returns a controlled upstream error.

Regression evidence: private redirect target never fetched; relative and approved CDN redirects work; loops stop; streaming body limit cancels reads; API authentication and SVG rejection tested. Existing preview/import contracts still pass.

Limit: host allowlisting trusts Marktplaats-controlled DNS/CDN infrastructure; it is not a DNS-pinning implementation.

### P1: User-controlled network requests during PDF rendering

Profile/bike URLs from editable data were inserted into report HTML, and server-side Chromium loaded them without a network policy. HTTP localhost/private destinations could therefore be requested by the server renderer.

Changes:
- Disable JavaScript and service workers in the report page.
- Allow remote image requests only to the configured Convex deployment's `/api/storage/` endpoint and the two existing avatar CDN hosts used by the site.
- Block other resource types, schemes, credentials, ports, and hosts.
- Retrieve allowed images with redirect following disabled; abort redirects so browser routing cannot be bypassed through them.

Regression evidence: private addresses, foreign Convex deployments, credentialed URLs, and host suffix tricks are blocked; expected storage/avatar images are allowed; renderer tests prove redirects are not followed and JavaScript is disabled. Existing report API tests pass.

Behavior: external/custom image URLs outside those trusted hosts are omitted from exported reports. Report text/calculations still render. PDF route fallback behavior remains unchanged.

## Validation

- Targeted security + affected functionality suite: **15 files, 75 tests passed**.
- Broader backend authorization/functionality suite: **33 files, 108 tests passed** (admin, bikes, fit flows, feedback/messages, and Strava).
- `npm run lint:runtime-boundaries`: passed.
- ESLint on changed production security files: passed.
- TypeScript passed after initial payment/SSRF implementation. Final concurrent check found only `GuideCreateView.test.tsx:141` (React cloneElement mock typing, another workstream); root notified for integrated correction.
- Repaired the stale case-study submission test database mock and added a rate-limit exhaustion regression ensuring no record/email scheduling happens after rejection.

No live Stripe charge, portal access, production webhook replay, remote account deletion, or third-party attack request was attempted. Fetch exploits were tested against mocked responses; no private infrastructure was contacted.

## Remaining prioritized work

1. **Account erasure lifecycle:** `users.deleteAccount` removes older core entities but does not cascade all newer feature tables or explicitly clear auth account/session records. Design an indexed, resumable erasure workflow and define retention for billing/audit data before claiming complete erasure.
2. **Upload ownership:** establish an authenticated upload-finalization/ownership model before allowing generic deletion or comprehensive orphan cleanup. Current image URLs are intentionally usable as bearer links; changing access policy requires coordinated frontend/API design.
3. **Billing operations:** verify existing customer metadata in a trusted environment, validate current live Stripe invoice/subscription payload formats, and add reconciliation/out-of-order event handling. Signed event deduplication exists, but it does not alone solve delayed event ordering across subscription lifecycles.
4. **Abuse controls:** the shared upstream API limiter fails open when unavailable/unconfigured. Anonymous analytics limits include attacker-controlled paths, and lead limits are email-keyed. Distributed/global abuse safeguards need traffic-aware budgets without blocking legitimate new-user conversion.
5. **Production proof:** deployed environment settings, logs, delivery/provider dashboards, and fresh-user mailbox completion are needed to establish the actual registration failure cause. Source review cannot prove why registrations stopped.


## Independent integration recheck

A second pass found and fixed billing compatibility issues that strict price authorization would otherwise expose:

- Resolve explicitly configured monthly/yearly price IDs to `pro_monthly` / `pro_yearly`, with `pro` retained only as a legacy fallback for those known prices. Unknown prices still fail closed.
- Parse the installed Stripe SDK's current invoice shape (`parent.subscription_details`, `lines[].pricing.price_details`) and subscription-item period fields while preserving legacy payload support. This lets the first paid invoice identify its user from the subscription metadata even before checkout completion arrives.
- An expired abandoned Checkout session now records its billing event without replacing the user's current customer/subscription binding.
- A one-off invoice cannot grant subscription access without a subscription ID.

Added regressions cover both checkout/subscription event orders, first-invoice-before-binding, current-format failed renewal, monthly/yearly/legacy plan keys, expired checkout preservation, and one-off invoice isolation. PDF tests additionally cover successful own-storage image delivery and browser closure on rendering failure.

Second-pass evidence:
- Billing + PDF suite: **7 files, 49 tests passed**.
- Integrated `npm run typecheck`: passed.
- ESLint on additional modified billing/test files: passed.
- Real local Chromium smoke render with inline HTML/SVG: **8,905-byte `%PDF-` output** using the hardened `playwright` renderer. No network request or production access occurred.
- Repository source search confirmed no callers remain for the removed public `storeStripeCustomerId` or `files.deleteFile` functions.
- `git diff --check` passed; the storage file's trailing blank line was fixed.

Release gates remain operational: coordinated frontend/Convex deployment (including both new indexes), trusted reconciliation of legacy Stripe customer metadata, and confirmed matching billing plan/price configuration in Convex. Missing plan configuration must stay fail-closed; the code deliberately does not fabricate a paid plan. Existing report logos are inline and still render; uploaded images use the deployment's storage host, while unapproved custom image hosts/redirects are intentionally omitted. Live Stripe payment/webhook and serverless Chromium verification still require staging/production-shaped environment testing.
