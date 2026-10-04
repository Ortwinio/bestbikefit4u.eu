# P3 — Stripe stub, service mail and retired pricing copy

## Implemented

The contract was written first to messages/C-stripe-stub.md and mirrored into the plan messages folder for A/B. One pure implementation in shared/billing/stripeStub.ts is re-exported from src/lib/billing/stripeStub.ts for browser/server callers. It always returns STRIPE_NOT_IMPLEMENTED and the approved localized message, regardless of billing flags. It does not persist data, grant rights, send mail, read secrets or contact Stripe.

Authenticated checkout, portal, cancellation and refund routes return HTTP 501 with that result; unauthenticated requests keep HTTP 401. The existing Convex webhook stays present and inert, as do its former internal entitlement mutation entry points. Existing billing flag semantics are unchanged. Provider SDK/configuration/signature-processing paths have been removed. Historical Stripe IDs may still be displayed by admin views without making provider calls. Environment examples and deployment preflight no longer request Stripe keys or provider price IDs, even when billing flags are true.

Legacy Fit Pass purchase CTAs now lead into B's checkout flow instead of bypassing its withdrawal consent and persisted selection. B's checkout/settings consume the same result. The stub message does not claim payment succeeded, and no success URL grants access.

Five service templates cover purchase, subscription welcome, expired access, renewal and cancellation. M13 transition and M04/M08/M10 previews match the provided boards in NL/EN. Prices consume A's canonical catalog. Purchase facts, expiry dates, activity counts, invoice attachment, withdrawal acknowledgement and refunds are explicit inputs. M13's free-offer block requires eligibility; unknown launch date remains the board placeholder in previews. New service sends are not wired to purchases. Existing lifecycle jobs use separately named educational renderers to avoid accidentally sending receipts or renewal/expiry claims. The €5 renewal-discount comparison requires a supplied first-year price of €24.50; entry/personal/unknown prices omit that claim. Standard annual previews retain the board wording. See P3-emails-notes.md for the deliberate preview-only 2.1 sections of M08/M10.

Removed the retired monthly catalog, old offer prices and monthly suffixes from active copy. Canonical single/annual/entry/personal prices and renewal amounts now feed the legacy Fit Pass, FAQ and terms helpers. Regression guards scan active application/backend/shared/public source for retired prices, product names and forbidden Stripe provider paths.

## Final verification — 4 October 2026

All combined final gates were rerun after B's DONE P2: typecheck, lint, 3,323 unit tests (20 existing skips), 490 contracts, standalone Convex tsc, production build and local crawl (875 checks, zero findings) pass. All 34 bilingual HTML/text email previews and 68 screenshots regenerated successfully with no overflow, missing assets or flex/grid. Exact evidence and offline limits: [P3-integrated-gates.md](P3-integrated-gates.md).

P1-notes.md now contains the current integrated build/crawl evidence. B's completed 200-case visual review closes all earlier UI findings, including the notice screenshot reported mid-run by C. That stale finding is superseded by final verified evidence; no visual blocker remains. Existing visual acceptance is retained for unchanged source, without claiming a new capture on the verification rebuild.

P3 complete. No application changes were needed for this final rerun. No mail, real Stripe call, production data operation, commit or deployment. Screenshot files remain ignored and absent from the manifest.
