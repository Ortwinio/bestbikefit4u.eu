# P4 — pricing rebased onto BikeFitBoost

## Branch and conflict resolution

Worked only in /Users/ortwinverreck/Developer/bestbikefit4u-pricing. Fetched origin and rebased feature/pricing-v3 onto origin/main b16f970 (live rebrand PR14). Former pricing commit bf349ce is now 3c89060. origin/main is an ancestor of HEAD. The authorized rebase rewrote the pricing commit; no extra implementation commit or push was made. These final audit updates remain uncommitted.

Twelve conflicts resolved: .gitignore; email i18n tests/renderers/preview script; FAQ source/test; pricing page test; checkout/portal route tests; commercial config; Fit Pass and pricing dictionaries. Both render ignore rules survive. Pricing's catalog, default-OFF enforcement, entitlements, inert Stripe adapters/webhook and service templates remain. Rebrand's shared origin, brand configurations, assets and metadata survive. The old live-Stripe tests were replaced by pricing's authenticated inert-adapter tests, using the new origin.

UI and email subagents had disjoint ownership. Checkout's split old text wordmark (not detected by the existing brand guard) was replaced with BRAND.assets.logoPrimary and BRAND.name; contact uses BRAND.supportEmail. NL/EN regression tests cover the logo, support contact and pricing metadata/schema origin. Pricing/Fit Pass/FAQ copy uses BikeFitBoost without changing prices or access rules.

Email headers use the rebranded PNG asset from main. New pricing copy, plain-text footer and sample links use BikeFitBoost and Convex BRAND backed by shared/brand.ts. emailActionUrl uses resolveSiteOrigin to reject stale legacy SITE_URL hosts while supporting explicit preview origins; tests cover both. Existing verified support/sender addresses are retained per the rebrand policy. The P3 local preview helper now derives its Host header from shared SITE_ORIGIN instead of forcing the legacy domain.

## Full gates

All gates rerun on the rebased integrated tree:

| Gate | Result | Evidence |
| --- | --- | --- |
| Typecheck | PASS | /private/tmp/P4-typecheck.log |
| Lint | PASS, including brand guard (0 findings), contrast, CSS tokens and images | /private/tmp/P4-lint.log |
| Unit tests | 3,349 passed, 20 existing skips; 408 passing files, one skipped | /private/tmp/P4-unit.log |
| Contracts | 491 passed, 46 files | /private/tmp/P4-contracts.log |
| Convex tsc | PASS | /private/tmp/P4-convex.log |
| Production build | PASS, vVepZXYJU0HbtUvDvNCXg | /private/tmp/P4-build.log |
| Local production crawl | PASS, 875 checks, zero findings | /private/tmp/P4-crawl.log; plans/seo-crawl-fixes/audit/crawl-pricing-p4-rebrand.md |
| Email previews | 34 bilingual HTML/text pairs, 68 screenshots at 600/375; all checks pass | /private/tmp/p4-email-previews.log; renders/p4-mails/checks.json |
| Whitespace/rebase | git diff --check PASS; no unresolved files | Explicit git -C pricing-worktree checks |

Focused email233 and UI58 tests also pass; these overlap the full suites and are not additive. The NL375 renewal preview was visually inspected: BikeFitBoost logo/footer, EUR19.50 renewal and EUR5 discount remain clear. No screenshot paths are included in the file manifest.

Build used loopback offline Convex URLs. Crawl used --local --skip-build --label=pricing-p4-rebrand --delay=0 against that completed build, with shared canonical origin https://www.bikefitboost.com. Static guides render; live-only CMS data is outside this check. No fresh 200-case UI capture is claimed in P4; B's earlier full visual review is historical, while new logo behavior has focused tests. No real mail, payment, database write, deployment or push.
