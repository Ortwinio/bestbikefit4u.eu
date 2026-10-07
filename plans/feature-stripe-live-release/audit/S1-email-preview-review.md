# S1 email preview review

2026-10-07. Local Chromium previews only; no provider requests or real email delivery. Synthetic fixture inputs, actual repository templates and product catalogue. All network requests are intercepted: matching image assets are read from this worktree; all other requests are aborted. Outputs are locally ignored by `email-extras/.gitignore`.

## Supplemental scenarios: complete

Harness: `audit/render-s1-email-extras.mjs` (paths relative to this release plan).

Individually opened and visually inspected all 32 full-page PNGs: transition reminder, annual-personal welcome, standalone appointment purchase, dated transition announcement without a transition offer, single purchase without invoice attachment, renewal reminder without synthetic usage statistics, expired access, and cancellation with a refund. Each is in NL and EN at 375 and 600 pixels. No clipped text, overlapping elements, broken images, missing buttons, or unreplaced appointment placeholders observed. Long mobile headings and product names wrap within the card. Booking buttons are visible and point to the HTTPS fixture agenda. Standalone price is €209.50/€209,50 from the catalogue; annual welcome and renewal state €21.50/€21,50; single purchase shows €13.50/€13,50; cancellation includes the synthetic €10.75/€10,75 refund. Transition dates and CTAs render in the requested locale.

Automated checks confirm locale, viewport overflow absence, loaded images, no four known appointment placeholders, and the booking link in both appointment variants. The sender-shaped single purchase has no invoice-attachment promise, and the dated announcement has no date placeholder. Sixteen HTML/text pairs and 32 PNGs plus checks are individually SHA-256 bound in `audit/email-extras/inventory.json`.

- Inventory SHA-256: `178d6173905d7053ce941aa4777b43b3b35416265360b30bba58331899e90599`.
- Harness SHA-256: `2c96f41218c6d10beb83dae4d2c3a54a0afdd34b00f66d04962d2dbea01bc592`.

## Standard newly wired templates

Individually opened and visually inspected purchase confirmation, subscription welcome, access expired, renewal reminder, cancellation confirmation, transition announcement; NL/EN at 375/600 (24 PNGs). Layouts are readable, buttons and footer fit, images load, and no overlap or clipping was observed. `audit/S1-standard-email-inventory.json` binds these 24 PNGs plus 12 HTML/text pairs (48 files); inventory SHA-256: `09de163fdf806a293e66a2323eb441f6d896c48aa243bac857a1551e021d5544`.

Standard preview fixtures deliberately exercise optional content that differs from the new sender: transition sample omits launch date and shows `[DATUM]`/`[DATE]`; purchase sample explicitly sets `invoiceAttached`, so it promises an attached PDF; renewal sample includes synthetic usage statistics. These are fixture limitations, not defects in the wired sender: `billing.ts` supplies a validated future launch date, never passes `invoiceAttached`, and omits usage counts. The supplemental sender-shaped scenarios verify the corresponding rendered output. No invoice attachment or real delivery is claimed here. An initial review concern about the attachment promise was corrected after tracing that optional template input.

## Limits

This evidence establishes local browser layout and fixture links/content only. It does not establish inbox delivery, provider acceptance, live agenda availability, or Gmail/Outlook/Apple Mail rendering. Booking URLs are fixtures and were never followed. Screenshots do not prove production environment configuration or payment-event delivery. Send deduplication, preferences and webhook/refund ordering are assessed by separate mocked tests and source review.
