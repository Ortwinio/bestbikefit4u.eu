# S17 — SEO rebase and integration

Complete, 3 October 2026. Work only in the Semrush worktree; no pushes/deployments.

Fetched origin. Clean SEO checkpoint ea5e37ce71a0262ce532ea44b9d2e27a14afb086 was rebased onto
origin/main 4b22da007d7aba290174c789a600d144595993b7. Rewritten checkpoint: da723fb.
The requested rebase rewrites the checkpoint with necessary conflict resolutions; no separate fix
commit was created. Follow-up tests/harnesses/fixes remain uncommitted on top.

Six conflicts resolved:
- .gitignore: retain both rider and SEO review-evidence exclusions.
- PressureCalculatorPageContent.tsx: retain main's removal of the redundant signup band and existing
  rider-aware form, plus SEO answer section, visible FAQ schema and rating-free application schema.
- pressure calculator page.test.tsx: retain no-duplicate-signup regression and SEO schema/FAQ tests.
- NL racefiets/gravelbike routes: use canonical consolidated engine-backed pressure pages; do not
  restore the retired standalone landing/duplicate CTA.
- NL mtb alias: retain direct proxy 301 to mountainbike; no competing rendered/indexable page.

Auto-merged dashboard server/client split remains intact: server layout keeps noindex; client layout
and sidebar retain rider behavior, with only SEO's redundant logo aria-label removal. Header/footer
retain distinct language navigation names and direct canonical bike-fitting links. No rating constant
or production aggregateRating remains. Main's pressure handoff/personalize block is preserved in its form.

Initial focused merge checks: 18 tests pass (pressure page and marketing layout).
Added 22 integration cases rendering all 11 real calculator pages in NL/EN. They verify one SEO answer,
one localized handoff link, accessible sliders and no saved handoff values from untouched defaults.
These follow-up tests and evidence remain unstaged and uncommitted; the index is clean.

## Final validation

- Production build `F-yLf373Lqu2IKKHBS4al` passes; no application source changed afterward.
- Full typecheck (incremental disabled), lint and standalone Convex tsc pass.
- Unit suite: 2,966 passed, 20 skipped; contracts: 477 passed. Five SEO harness tests also pass.
- Local crawl: 875 page/user-agent checks, 170 sitemap URLs, 1,239 GETs, zero findings.
- Semrush: six pressure pages, 65 redirects, 96 guide locales, four author/method pages; zero failures.
- Discovery: both llms documents match all 170 sitemap URLs; four bike-fitting aliases redirect directly.
- Changed-template sweep: 84 NL/EN 1440/390 cases, all HTTP 200, zero recorded runtime, asset,
  overflow or axe findings. All 44 calculator cases retain exactly one personalize and SEO-answer block.
- All 45 changed fullpages visually reviewed; 39 byte-identical images reuse the completed S15 review.
  Rider-profile cards/controls and their page-height changes are intentional main changes, not reverted.

Exact candidate, logs and evidence: `S17-candidate.json`, `S17-gates.md`, `S17-semrush.json`,
`S17-discovery.json`, `S17-visual-notes.md`, `S17-visual-manifest.txt`, and
`../../seo-crawl-fixes/audit/crawl-s17.md`. Task manifest: `files-S17.txt`.
The supplied runtime scripts refreshed S12/S13 and S8/S9 evidence in place; S15 captures were not overwritten.

## Release boundaries

No new blocking rebase finding. The preview uses a closed-loopback backend, not production. Live-only
CMS data and authenticated browser persistence are not certified by this offline sweep; backend/unit
contracts passed. Retain the S15 release checklist for post-deploy verification, especially old tyre-pressure
weight URLs, `/fiets-afstellen`, bike-fitting aliases, locale preservation and direct single-hop redirects.
Six S10 LCP follow-ups remain open; no performance-budget or production-release claim is made.
