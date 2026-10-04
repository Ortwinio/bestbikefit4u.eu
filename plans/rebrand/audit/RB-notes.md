# RB — integration and release handoff

Worktree: `bestbikefit4u-rebrand`, branch `feature/rebrand-bikefitboost`, baseline `369a8d0`.
No commits, deploys, production reads/writes, sent mail or persistent environment changes.
Independent workers owned assets, site/CMS/PDF copy, and email/canvas audit; root owns domain/head,
redirects/CSP, regression guard and final integration gates.

## Scope delivered

- B1: selected Badge 1.3.6 and favicon F, outlined Bricolage wordmarks, all SVG/PNG/icon/manifest/OG
  variants and reproducible generators. Compatibility logo URLs serve the new art; the conflicting
  app favicon route is removed. Header/footer/sidebar/login use the prescribed variants and sizes.
- B2: bilingual site copy and metadata, PDF downloads and six-page reports, checked-in guide imports
  and CMS presentation boundaries. Legacy-owned canonical and JSON-LD image overrides map to the new
  origin without changing production records or foreign URLs. Embedded email addresses stay unchanged.
- B3: every current email renderer and auth mail rebranded; sender display name changes, addresses do
  not. 22 HTML/text previews and 44 desktop/mobile screenshots checked. No delivery was performed.
- B4: current 109-board inventory, explicit exclusions, missing references and non-brand gaps recorded
  in B4-canvas-gaps.md. Canvas review is an audit, not authorization to rebuild unrelated features.
- B5: source/i18n/email/metadata/CMS guard included in lint, runtime browser brand check and regressions.

## Domain and head

`shared/brand.ts` is the sole runtime origin default, `https://www.bikefitboost.com`, with public/server
environment overrides. Both old hosts permanently redirect, preserving paths and query strings.
Metadata, canonicals, alternates, JSON-LD, sitemap/robots/LLM discovery, email images and report links
use the new origin. Root head advertises the brand-set manifest, icons, ink theme and OG site name.
Legacy image hosts remain allowed by CSP. Script execution policy is not widened.

The first crawl exposed an externally supplied `.env.local` symlink with a local site-origin override.
No RB agent created, inspected its contents or modified it. Release checks explicitly set the new public
origin and inert loopback Convex URLs for their processes. Persistent environment changes remain the
lead's responsibility; see RB-env-switch.md. Earlier localhost-canonical crawl evidence is superseded.

## Visual evidence and limits

Full final-layout sweep: 80 routes × NL/EN × 1440/390 = 320 cases. All pass runtime, image, horizontal
overflow, h1, locale, available SEO, axe serious/critical and rendered-brand checks. 315 cases pass
every heuristic check; five do not: Dutch `professional` and `Endurance` are flagged by the language
heuristic (four cases), and the existing English contact measurement-guide link is 22px tall (one).
These non-brand findings are listed, not silently fixed or claimed green. The new logo's calculator
header overflow was fixed and all 320 final overflow checks pass. Old redirect expectations in the
harness were updated to the existing main-branch 301 consolidation contract, not changed in the app.

Targeted evidence: 16 home/login/guide/dashboard cases, header/footer crops and mobile sidebar views;
four final calculator screenshots; all 44 email previews; all twelve actual NL/EN PDF raster pages.
Account and blog browser fixtures use real components with synthetic data, not live authorization or
persistence. Board comparisons cover captured viewports, not a claim of every below-fold interactive
state. Screenshots are local under renders/ and are not included in the file manifest.

## Operator follow-up

Ortwin must confirm the legal provider/controller identity; no legal entity facts were invented.
Production CMS old-brand count/IDs cannot be supplied without separately authorized production access.
The 124 checked-in source records/slugs are inventoried with database IDs explicitly unknown, and
runtime display normalization protects the public presentation boundary meanwhile. Historical emails
already sent and cross-domain browser sessions are not migrated. Pricing-v3 and gifts remain separate.

## Final gates — 4 October 2026

| Gate | Result | Evidence |
|---|---|---|
| Typecheck | PASS | `/tmp/RB-types-release-final.log` |
| Lint, including brand guard | PASS, zero brand findings | `/tmp/RB-lint-release.log` |
| Unit | 2,986 PASS; 20 existing skips; 383 passing files | `/tmp/RB-unit-release.log` |
| Contracts | 478 PASS in 44 files | `/tmp/RB-contracts-final.log` |
| Standalone Convex tsc | PASS | `/tmp/RB-convex-release.log` |
| Production build | PASS, `UVZIndeVjtShDM0girzs9` | `/tmp/RB-build-release.log` |
| Local crawl | PASS, 875 checks across five user agents, zero findings | `plans/seo-crawl-fixes/audit/crawl-rebrand-release.json` |
| HTTP redirects/head/PWA/assets | 23 PASS on final build | `RB-http-check.json` |
| Asset and route Node tests | 6 PASS | `/tmp/RB-node-tests.log` |
| Final-layout browser sweep | 320 captured; zero brand/runtime/axe/image/overflow findings; five non-brand heuristic/target findings documented above | `../renders/sweep-final/report.json` |
| Targeted branding renders | 16 PASS plus four calculator captures reviewed | `B1-render-checks.json` |

The layout sweep uses build `t9738pJypC-ujidFnHvnM`; subsequent changes are CMS display/metadata URL
hardening and test fixtures, not layout. Those are verified by 53 focused regressions, the final full
unit run, production build and crawl. No claim is made that earlier PNGs were generated by the later
build ID. Final HTTP checks were rerun on `UVZIndeVjtShDM0girzs9` and the temporary server stopped.

Two preliminary unit runs stalled for 16–17 minutes and timed out in different unchanged workers.
The bounded four-worker run with temporary idle-sleep prevention completed in 49 seconds with no
failures; no product code or test timeout was altered to conceal those environment interruptions.
An intermediate typecheck caught two new partial test-fixture casts; these were fixed and final
typecheck/build pass. Earlier red logs are superseded, not counted as successful runs.

`audit/files-rebrand.txt` lists changed source, tests, generated shipping assets and audit artifacts.
It excludes local renders, provided canvas references and the pre-existing `.gitignore` modification.
