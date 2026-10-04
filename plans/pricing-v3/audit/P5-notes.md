# P5 — pricing v3 rebased onto migration, cleanup and build fixes

Worktree: /Users/ortwinverreck/Developer/bikefitboost-pricing, feature/pricing-v3.
Fetched origin; rebased former f32a61c onto origin/main 3f3112d6. Rewritten pricing commit: aad9be0d.
Main is an ancestor of HEAD. The authorized rebase rewrote the pricing commit; no extra implementation commit or push. Final integration fixes and these notes remain uncommitted.

## Integration

- Resolved 16 conflicts. Main wins apex domain, shared resolveSiteOrigin, redirects/OAuth proxy, migrated mail, Strava retirement, cleanup and package/build configuration. Pricing wins entitlements, default-OFF enforcement, checkout, service mails and inert Stripe adapters. Both render ignore rules remain. plans/pricing-v3 is retained.
- Main's shared/brand.ts, next.config.ts, src/proxy.ts, package.json, package-lock.json and .npmrc are unchanged versus origin/main. allowScripts remains; @lhci/cli is absent. A file comparison against main's deletions since b16f970 found zero resurrected paths.
- Stripe provider creation and return-URL construction remain absent in the stub release. No raw SITE_URL is used by a Stripe adapter. Shared-origin rejection/alias tests remain after removing the obsolete live Stripe factory. Mail action links call resolveSiteOrigin; all addresses and assets follow migrated main.
- Removed a semantic merge regression: pricing's bike refinements reintroduced Strava UI and score points. Five remaining refinements total20 (6/6/2/2/4), preserving enforced free80/paid100; un-enforced rules and historical import provenance remain unchanged. NL/EN locked/unlocked UI tests and all-access-mode score tests prevent recurrence. No historical database fields/data removed.
- Cron contract asserts exactly the five retained email jobs plus pricing expiry; Strava routes, jobs and integration modules stay removed. Retained main's day7/day14 mails alongside pricing mail additions.

## Final gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Typecheck | PASS | /private/tmp/P5-typecheck-final.log |
| Lint incl. brand/domain guard | PASS, zero findings | /private/tmp/P5-lint-final.log |
| Unit | 3453 passed, 20 existing skips; 412 passing files | /private/tmp/P5-unit-final.log |
| Contracts | 569 passed, 52 files | /private/tmp/P5-contracts-final.log |
| Convex tsc | PASS | /private/tmp/P5-convex-final.log |
| Production build | PASS, SENEn5PVVtanT5WLjdncV | /private/tmp/P5-build-final.log |
| Local SEO crawl | PASS, 875 checks / zero findings; P5-crawl.md | /private/tmp/P5-crawl.log |
| Local domain migration | PASS, 684 redirects / 228 paths / 170 HTML / 48 JPGs; P5-domain.md | /private/tmp/P5-domain.log |
| Email previews | 38 NL/EN HTML/text, 76 screenshots, zero failures | /private/tmp/P5-email-previews.log; renders/p5-mails/checks.json |

Build/crawlers use NEXT_PUBLIC_SITE_URL=SITE_URL=https://bikefitboost.com and loopback offline Convex URLs http://127.0.0.1:9. Crawlers use --local --skip-build against the final production build; no production requests or live CMS claims. Previews block remote resources, and NL375 renewal / EN600 purchase were visually checked.

The first integrated gates exposed and fixed the orphaned Stripe test import, strict cron expectation and forbidden legacy test literals. One parallel unit rerun timed out in the five-second whole-repo brand scanner; rerunning the full suite without competing gates passed unchanged. Existing nonfatal Vite config/source-map and jsdom navigation notices remain; production build status is recorded above.

No deploy, production data/environment changes, Stripe calls, real mails or push.
