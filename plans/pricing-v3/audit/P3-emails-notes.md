# P3 email templates

Implemented five service templates (`renderPurchaseConfirmation`, `renderSubscriptionWelcome`,
`renderAccessExpired`, `renderRenewalReminder`, `renderCancellationConfirmation`) and M13
`renderTransitionAnnouncement`. Existing preview exports M04 `renderFitPassWelcome`, M08
`renderUpgradeNudge`, M10 `renderProExplainer` now use the updated boards. NL copy is literal where
boards supply it; EN is the equivalent translation. Welcome, expiry and cancellation service copy
uses the release's confirmed facts; no invented location, appointment duration or legal terms.

All reuse the table/VML house layout. New optional boxed value rows, discount strip, three-column
metrics, secondary headings and paper panel preserve existing defaults. Currency formatting no
longer adds an invented monthly interval, and fractional euro prices retain two decimal digits.
Core price values come from `shared/pricing/products.ts`.

## Truthful contracts and send boundaries

- Purchase `productId` is required. Single-bike receipts match M04; annual/entry/personal products
  get correctly named generic purchase receipts. Amount and access dates must be supplied.
- Invoice-attachment and withdrawal statements appear only when their explicit booleans are true.
- Renewal dates, activity counts, refund amounts are real caller inputs; absent facts are hidden.
  The €5 discount strip requires actual `firstYearPriceCents: 2450` and a €19.50 renewal;
  entry, personal-fit and missing first-year prices never receive that comparison claim.
  Thirty-day renewal wording requires explicit `daysUntilRenewal: 30`.
- M13 requires explicit transition-offer eligibility. No free-offer claim is made for ineligible
  recipients. `launchAt: null` preserves the design's `[DATUM]`/`[DATE]` review placeholder;
  no live date is fabricated. Fourteen-day wording requires explicit `daysUntilLaunch: 14`.
- The M08 board includes a gift/entry offer belonging to release 2.1; it is preview-only with its
  marketing unsubscribe/preferences links. The separate expiry service notice contains no offer.
  Likewise M10 gift metrics/benefits only appear when supplied/explicitly enabled for preview.
- No sending, purchase wiring or database writes were added. Existing welcome, 24h fit tips and
  upgrade-nudge jobs were redirected to explicitly named educational renderers so they cannot
  accidentally send a receipt, expiry announcement or renewal reminder without purchase evidence.
  Their existing preferences/idempotency behaviour remains covered by the contract tests.

## Preview and verification

`node scripts/render-email-previews.mjs --output=plans/pricing-v3/renders/mails` renders all 17 kinds
in NL+EN as 34 HTML/text pairs and 68 screenshots (600/375 px). Sample dates and activity counts are
explicit fictional fixtures, not production facts. M13 keeps the unknown launch-date placeholder.
The harness checks image loading, overflow and absence of flex/grid at both sizes.

Focused email tests and scoped ESLint pass. Root runs the integrated full gates. Renders are
ignored and excluded from source manifests; no mail was sent and no commit or deploy performed.
