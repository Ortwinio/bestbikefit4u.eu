# S3 — pricing UI and copy

Worktree: `/Users/ortwinverreck/Developer/bikefitboost-pricing`, branch `feature/pricing-stripe`.
Owner decision: 4 October 2026. Integration and review: 5 October.

## Implemented

- NL/EN pricing cards, metadata and Service/Offer JSON-LD use €21.50 annual, €13.50 single and
  €234.50 annual/personal bundle. Annual renewal is €21.50, without entry fee or renewal discount.
  Annual cards say two gift measurements per year. No aggregate ratings were introduced.
- Pricing board's mint gift strip links to A's localized `/gift`; its tokenless state asks users to
  use their personal email link. FAQ explains one-month gift redemption, three-month bike access,
  six-month upgrade eligibility, €9.50 first-year upgrade and €209.50 standalone appointment.
- Homepage, general FAQ, subscription/report upsells, commercial/legal terms and both llms documents
  carry the new prices. FAQ schemas reflect the rendered copy. Free calculator/latest-PDF promises
  remain intact.
- Checkout consumes C's existing catalog, not a second catalog. Upgrade and standalone eligibility
  come from the authenticated subscription query. It sends product/bike/locale/withdrawal consent,
  never a client price or coupon. C remains responsible for server-side validation and charging.
- Return route passes scalar session_id/cancelled values. Only C's authenticated, confirmed paid
  checkout status opens success; unknown/unpaid returns remain pending. Runtime validation rejects
  unknown/inherited product keys. Paid receipt uses actual amountTotalCents, not current eligibility.
- Standalone appointment and bundle success expose Plan je afspraak / Book your appointment.
  No booking URL, location, duration or legal terms were fabricated; see release notes below.
- Settings reads normalized products and authoritative upgrade/appointment eligibility. Actual
  annual plans get `/gifts` navigation, not accounts that merely have access while billing is off.
  Cancellation shows success only after an OK response with cancelled:true, leaves flag-off stub
  behavior intact, and does not infer a refund or end date. Tests cover reactive query updates.
- Browser components use C's public-only billing visibility helper; server endpoints retain the
  strict two-flag gate. This avoids nonpublic process variables silently hiding enabled UI in bundles.
- Expired campaign configuration, copy, donation UI and callers are removed. Billing-OFF report
  access remains open; authentication/ownership and server-side checks remain in place. Legacy
  analytics event identifiers remain storage-compatible, not active campaign copy.
- Service mail purchase/welcome/renewal/cancellation/M08/M13 copy is bilingual and catalog-aligned.
  M08 reads €9.50 upgrade / €21.50 renewal and mentions the six-month eligibility window. Recipients
  of standalone appointment receipts are not promised annual access. Renderers stay transport-free.

## Regression guard and ownership

`scripts/check-pricing-copy.mjs` is wired into `npm run lint` as lint:prices. It scans current frontend,
service-email source and the live catalog for obsolete prices/discounts, entry keys and monthly Pro
copy. Fourteen tests cover positive/negative cases and the actual repository. Historical boards and
negative test assertions are excluded, not changed to pretend they use today's amounts. C's documented
legacy storage normalizer/schema are outside published catalog/copy scope and preserve old rows.

No backend, schema, shared catalog, Stripe provider implementation, real email sender or gift module
was edited by B. Shared email registry/sample files have narrowly coordinated edits with A; A's M11
exports and samples are preserved. No dependency installs, flags/env-file edits, commits, deployments,
production reads, real Stripe calls or real emails. Absolute-path tooling stayed in this worktree.

## Validation

| Check | Evidence / result |
| --- | --- |
| Parent pricing/FAQ/home/llms/guard | 51 tests / 6 files PASS |
| Combined S3 UI, settings, email renderer, campaign and guard regression | 398 tests / 31 files PASS; S3-focused.log |
| Checkout final subsection | 74 tests / 7 files PASS; S3-checkout.md |
| Account subsection | 81 tests across final runs (78 combined, then 24 replacing 21 AccountPlan cases); S3-account.md |
| Campaign subsection | 159 focused tests / 14 files PASS; follow-up client-helper tests in S3-campaign.md |
| Mail subsection | 106 focused tests PASS; S3-mails.md |
| Scoped ESLint / CSS tokens / diff whitespace | PASS; 29 CSS modules, zero raw-color findings |
| Price guard | PASS, zero findings |
| Integration typecheck | Latest B run has only A-owned gift/page.tsx:44 invalid-variant expiresAt finding; B finding resolved |
| Final UI visual sweep | PASS: 200 NL/EN 1440/390 captures, zero axe/overflow/effective 44px-target/unexpected-error findings |
| Email previews | 40 NL/EN HTML/text previews, 80 screenshots at 600/375px; all checks PASS |

A owns final combined typecheck/lint/unit/contracts/Convex tsc/build, local SEO crawl and migration
checker. B has not started a competing Next build or claimed those combined gates complete.
Earlier contract blockers were resolved after C-contract.md landed; worker messages are superseded.

## Visual review

Isolated harness: `tests/visual/pricing-ui/capture.mjs`, using actual PricingPage/PricingCard,
CheckoutFlow and SubscriptionOverview, compiled CSS modules/Tailwind and local brand fonts. It mocks
framework/auth/service data, aborts external requests and never invokes Stripe or sends mail. Fixture
paid props are review data, not an app payment shortcut. Screenshots: `plans/pricing-stripe/renders/S3-*`.
The initial 188-case sweep exposed duplicate comparison-region naming and small pricing/footer links.
Sources are fixed: retain one named comparison region, a 44px-high account CTA and 44px-wide footer links.
Final rerun checks source hashes, axe, overflow, effective labelled control targets and browser errors.

Final 200-case rerun completed with all 12 source hashes unchanged; parent independently recomputed
and matched those hashes against the current files. Confirmed first-year/renewed cancellation and
unconfirmed-response scenarios were added to the initial 188-case matrix. The final JSON supersedes
the smoke/pre-fix results. No axe rule was disabled and no external service request was permitted.

Parent inspected mobile NL pricing, EN standalone paid/booking, and NL M08 email. Prices, mono values,
lime-panel ink text, gift strip and mobile stacking are legible; no invented testimonials or ratings.
Email preview runner serves only local assets and pure template samples, including A's M11. Evidence:
`audit/S3-mail-previews/checks.json`. Sample people/bikes/tokens are fictional.

## Owner release content / retained policy

- Appointment duration, location, appointment cancellation terms and optional agenda link remain the
  supplied board/config placeholders. Owner must supply these before enabling actual appointment
  sales. Stripe remains OFF; S3 did not invent a destination or claim an appointment was booked.
- M13's existing transition entitlement has its own two-month claim policy, distinct from the new
  recipient gift's one-month redemption window. Its eligibility and unknown-date placeholders remain
  unchanged rather than silently rewriting historical entitlement behavior.
- Contact still has old Free/Pro support SLA labels (three/one business days) from commercial config.
  These are not monthly prices. No new support SLA was specified, so no new product was silently
  promised that policy. Reported to A in B-to-A-appointment-content.md for an owner wording decision.

Exact B-owned source/test/audit paths: `files-S3.txt` (not the whole shared worktree diff).
Generated PNG/HTML/text preview artifacts are local review outputs, not individually listed in that
source manifest; their check reports and directory locations are included. A owns final staging policy.

S3 source and review evidence are complete. Remaining combined gates and the recorded A-owned gift
typecheck finding are handed to A, not silently fixed outside ownership or reported as passing.
