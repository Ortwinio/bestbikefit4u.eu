# S2 — gift measurements

Status: **DONE**, 5 October 2026. Combined S1/S2/S3 candidate gates pass. This supersedes the earlier missing-contract/typecheck blocker; no production activation performed.

## Integration

- Two credits per actual paid annual entitlement/period, using C's shared constant and product normalizer. Historical paid entry subscriptions retain credits; open-mode and transition access do not create credits.
- Gift creation requires authentication, normalized non-self email, bounded message/daily sends and UUID idempotency. Random 256-bit tokens are hashed in records; public preview and giver history reveal neither party's profile/identity.
- Verified invitation-email recipient selects an owned bike. Redemption atomically calls C's real grantGiftEntitlement: one single-bike entitlement for three calendar months, six-month upgrade eligibility, replay-safe grant key.
- One-month invitation expiry restores only its original-period credit and removes email/message. Exact-deadline scheduling plus hourly fallback apply, subject to scheduler latency.
- Protected /gifts and public noindex/no-referrer /gift. Fragment tokens scrubbed into validated session storage. Fixed gift=1 login/manual-bike return avoids arbitrary redirects. Account changes reset state; late requests cannot erase newer tokens.
- Gift expiresAt now uses explicit union narrowing without casts. M11 uses PRODUCTS.annual_upgrade.priceCents and annual renewal from C's catalog.
- Updated the existing Strava-removal contract's exact cron snapshot for hourly gift expiry. Initial contract failure was that stale expectation; rerun passes.
- Gift forms have permanent labels/instructions, registered in the existing tooltip exemption list; axe verifies accessible names.

## Final combined gates

Commands ran in /Users/ortwinverreck/Developer/bikefitboost-pricing. Logs: S2-final-<gate>.log beside this note.

| Gate | Result |
|---|---|
| npm run typecheck | PASS |
| npm run lint | PASS, including brand/domain/price, runtime, tooltip, contrast, CSS and image guards |
| npm run test:unit | PASS: 429 files passed, 1 skipped; 3630 tests passed, 20 skipped |
| npm run test:contracts | PASS: 53 files, 581 tests |
| tsc -p convex/tsconfig.json --noEmit | PASS |
| npm run build | PASS, local production build |
| seo-crawl-check.mjs --local --skip-build --label=s2-final --delay=0 | PASS: 875 page/user-agent checks, zero findings |
| domain-migration-check.mjs https://bikefitboost.com https://bestbikefit4u.eu --local --skip-build --label=s2-final | PASS: 684 redirects, zero findings |
| Full email suite | PASS: 16 files, 288 tests |
| Offline email previews | PASS: 40 bilingual emails, 80 screenshots, asset/layout/overflow checks |
| Gift visuals | PASS: 28 NL/EN 1440/390 variants, zero axe/overflow/undersized-control/runtime findings |
| git diff --check | PASS |

Build/crawls explicitly used process-only NEXT_PUBLIC_SITE_URL=https://bikefitboost.com, NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:9 and NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:9. No environment files changed. Both crawls reuse that completed build.

Focused gift policy/backend/real-hook integration: 20 tests pass with standard Vitest config, no temporary alias. Covers calendar boundaries, one-bike scope, six-month cutoff, replay, legacy credits and revoked-source refusal. Concurrency fixtures model serialized transactions, not hosted Convex OCC.

Non-fatal existing warnings: missing TypeScript source-map file and unsupported jsdom full-document navigation. Offline crawl covers repository content, not live-only CMS data.

## Evidence and limitations

- S2-gift-visual.md/.json; screenshots ../renders/S2-gift-*: isolated production components, real CSS/local fonts, fixture props. Give/redeem/expiring/expired layouts reviewed; no external requests. Not live authentication/backend verification.
- S2-M11-email-notes.md and email-previews/checks.json: refreshed NL mobile/EN desktop M11 reviewed with correct prices.
- ../../seo-crawl-fixes/audit/crawl-s2-final.json and ../../migratie/audit/domain-migration-s2-final.json: machine-readable crawl results.
- S3's completed 200-case pricing/checkout/settings matrix remains in S3-notes.md; this pass does not change those reviewed UI sources.
- files-S2.txt lists S2 source/tests/harness, not PNGs or other owners' standalone files.

## Safety / handoff

No commits, deploys, production access, real Stripe calls, real mails or actual environment changes. Billing remains flag-off. B's documented owner appointment-content placeholders must be completed before enabling appointment sales. Candidate ready for Lead review, not automatically deployed.
