# S2 M11 gift email verification

Verified 5 October 2026 in `/Users/ortwinverreck/Developer/bikefitboost-pricing`.

- M11 NL/EN template uses the shared product catalog for €13.50 gift value, €9.50 first-year upgrade and €21.50 annual renewal. Copy states one month to redeem, one bike, three months of access and six months to upgrade after redemption.
- Optional message and preview sender name pass through escaped house-layout primitives. Production sender uses an anonymous fallback and no giver identity. Redemption token is a URL fragment.
- Internal action fetches current gift context and uses house delivery with a gift-specific idempotency key. Backend query checks token, pending status, expiry, prior delivery and source revocation. Delivery success alone marks email sent. No recipient data appears in the email body, CC or BCC.
- Template exports, fictional bilingual sample and preview-kind registration are integrated.
- `node_modules/.bin/vitest run convex/emails`: 16 files, 288 tests passed, including all M11 tests and catalog price assertions.
- ESLint passed for the five dedicated M11 source/test files.
- `node scripts/render-email-previews.mjs --output=plans/pricing-stripe/audit/email-previews`: 40 bilingual HTML/text previews and 80 screenshots generated offline. All asset, overflow and table-layout checks passed at 375 and 600 px. See `email-previews/checks.json`.
- Refreshed M11 Dutch mobile and English desktop screenshots visually inspected; prices and layout are correct.
- No actual mail, Stripe request, production data access, deployment or commit.
