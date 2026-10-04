# S3 service emails

## Scope and ownership

Mail boards reviewed: current M08, v3 M10 renewal and M13 transition. Pricing-stripe README amounts override their historical prices. A owns gift M11. Parent owns UI and the broad price guard. C owns catalog, entitlement facts and senders. No sender signatures, transport calls or shared catalog files changed here. Shared registry ownership accepted after A had already added the gift exports/sample/preview kind; verified without duplicating those edits.

## Changes

- NL/EN purchase labels include standalone personal appointments; their confirmation uses the supplied booking URL and omits annual-access dates/renewal claims. Annual receipts display the actual amount paid, including an upgrade payment, and the standard renewal amount.
- Annual welcome includes two gift measurements per subscription year and automatic annual renewal. Renewal has no first-year discount calculation. Optional historical `firstYearPriceCents` stays accepted by the existing interface.
- M08 retains the board's expired-access section and consent/preference links. Upgrade wording explicitly limits the offer to six months after a single purchase or gift redemption. Expiry service mail remains separate from marketing.
- M13 preserves unknown date placeholders and eligibility-gated transition gifts; its transition gift's existing two-month claim period is separate from A's one-month recipient-gift redemption window.
- Cancellation retains supplied access end/refund facts only; no inferred refund, dates or purchase attachments.
- C's `annual_upgrade` product is labelled in both languages; M08 now reads its €9,50 price from the shared catalog and renews at €21,50. Removed the obsolete discount comment from the retained optional `firstYearPriceCents` field.

## Files

- `/Users/ortwinverreck/Developer/bikefitboost-pricing/convex/emails/i18n/pricing.ts`
- `/Users/ortwinverreck/Developer/bikefitboost-pricing/convex/emails/i18n/nl.ts`
- `/Users/ortwinverreck/Developer/bikefitboost-pricing/convex/emails/i18n/en.ts`
- `/Users/ortwinverreck/Developer/bikefitboost-pricing/convex/emails/i18n/i18n.test.ts`
- `/Users/ortwinverreck/Developer/bikefitboost-pricing/convex/emails/templates/pricing.ts`
- `/Users/ortwinverreck/Developer/bikefitboost-pricing/convex/emails/templates/pricing.test.ts`
- `/Users/ortwinverreck/Developer/bikefitboost-pricing/convex/emails/templates/sampleData.ts` (renewal fixture only)
- `/Users/ortwinverreck/Developer/bikefitboost-pricing/convex/emails/templates/index.ts` (obsolete comment removal; A's gift exports retained)
- `/Users/ortwinverreck/Developer/bikefitboost-pricing/plans/pricing-stripe/messages/S3-mails-coordination.md`
- `/Users/ortwinverreck/Developer/bikefitboost-pricing/plans/pricing-stripe/messages/S3-mails-registry-status.md`

## Validation

106 tests passed across pricing, templates, followups/import purity, giftMeasurement and i18n test files. Tests render fictional data locally with no transport. Scoped ESLint and git diff whitespace checks pass. Source scan finds no obsolete prices, entry key or Pro-monthly copy in non-test email modules.

The former catalog blocker is resolved: pricing tests pass against C's actual catalog, including annual upgrade and standalone appointment products. The shared registry exports `renderGiftMeasurement`/`GiftMeasurementData`; `sampleData.giftMeasurement` uses a fictional sender/message/expiry and a localized `/gift#token=` link containing 64 dummy hex characters. The established preview kind includes M11.

Existing `/Users/ortwinverreck/Developer/bikefitboost-pricing/scripts/render-email-previews.mjs` was inspected: it imports pure templates, intercepts browser requests to serve local image assets, aborts other requests, and never imports senders. Final refresh against C's catalog generated 40 NL/EN HTML/text previews and 80 screenshots at 600/375px, including M11; all layout/asset checks passed. Visually inspected the refreshed mobile NL M08 and EN M11, both showing the correct upgrade and renewal amounts. Scanning all generated HTML/text finds no obsolete annual/renewal/discount/entry/monthly copy. Preview directory: `/Users/ortwinverreck/Developer/bikefitboost-pricing/plans/pricing-stripe/audit/S3-mail-previews`; machine-readable evidence: `/Users/ortwinverreck/Developer/bikefitboost-pricing/plans/pricing-stripe/audit/S3-mail-previews/checks.json`. The runner required sandbox escalation because this sibling worktree is outside the initial writable root.

No application builds, dependency changes, environment edits, production operations, Stripe calls or email sends performed.

Status: DONE S3 service-mail subsection. Source frozen for A's combined gates; parent retains overall S3 completion ownership.
