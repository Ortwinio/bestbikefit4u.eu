# S15 — SEO branch integration complete

Completed 3 October 2026 in the Semrush worktree, branch `fix/seo-semrush`.
Final build: `rejwcKGnhSNUclqs6ffwl`. Candidate identity/hash: S15-candidate.json.
No commits, pushes, deployments, production backend calls or rider-worktree edits.

## Final gates

- Full typecheck, full lint, production build and standalone Convex tsc pass.
- Unit: 2,149 passed, 20 skipped; 326 files passed, one skipped. Contracts: 232 passed, 35 files.
- Five Node SEO harness/validator tests pass. Skips and non-failing dependency diagnostics are documented.
- Local crawl: 875 page/user-agent checks, 170 sitemap URLs, 1,209 GETs, zero findings.
- Semrush script: six pressure pages, 65 redirects, 96 guide locales and four author/methods pages pass.
- Discovery: exact 170-URL parity in both LLM documents, four direct bike-fitting aliases, reciprocal
  canonicals and internal-link checks pass. Local sitemap XML validator passes.
- Final whitespace check and JSON artifact validation pass. Detailed commands/evidence: S15-gates.md.
  S15-semrush.json and S15-discovery.json identify the final build and link complete runtime reports.

## Owner findings resolved

1. The baseline and initial sweep showed duplicate header/footer language landmark names. Routed to C;
   C supplied S16's distinct menu/footer aria labels with no visible language-switch changes.
2. S16 tests used unsupported `exact: true` role-query options. Full typecheck/build exposed the error
   despite passing focused runtime tests. **Lead explicitly authorized B to remove only those two options
   on C's behalf** in MarketingLayout.test.tsx. String accessible-name matching preserves test intent.
   The C message is marked resolved. Full gates/build and all 84 AFTER cases were then rerun.
3. The visual worker's font fixture had a prohibited require import. Owner removed the unnecessary import;
   final full lint passes. No application change was made for this harness issue.

Earlier failed attempts and blocked notes are superseded by final-build evidence, not treated as passes.

## Visual review

84 final AFTER cases: 21 templates × NL/EN × 1440/390. All return 200 with zero page/console errors,
failed assets, broken images, document overflow or axe violations. S16 fixes the landmark issue in all cases.
68 BEFORE captures use actual base e93f8c1; sixteen new-page cases have no invented baseline.

All 84 pre-S16 full pages were manually reviewed. Final comparison: 83 PNGs are byte-identical to those
reviewed images; all recorded geometry matches. Parent reviewed the sole changed NL390 bikefitting image
and native comparison crops: two outline account CTA renderings differ slightly, but no clipping, section
movement or content change. This variation is disclosed rather than claiming pixel equality.

Existing layout is preserved subject to intentional content additions: neutral home trust copy, calculator
answers, guide provenance/descriptive anchors, contact help and the new footer Product link
`Wat is bikefitting?` / `What is bike fitting?`. The approved pressure consolidation replaces old NL
road/gravel content with tables; those pages are not claimed to be identical to the retired templates.
Full matrix, comparisons, image hashes and caveats: S15-visual-notes.md and S15-visual-manifest.txt.

Baseline footer word wrapping, crank recommendation wrapping and a floating feedback overlap were sent
to owners/lead for separate UI prioritization. They are unchanged baseline observations, not hidden or
new SEO-layout regressions. Zero axe findings does not imply universal accessibility conformance.

## Release handoff and open work

S15-release-checklist.md covers local proof and separately unchecked production work:
old tyre-pressure weight URLs/aliases, both /fiets-afstellen routes, bike-fitting locale aliases,
single-hop permanent redirects, canonical destination pages, discovery, cache/noindex and www redirect
configuration, Search Console and production CMS coverage. Login `?src=` attribution remains unchanged;
no cleanup is authorized before the 17 October baseline ends or without separate lead approval.

**Six S10 LCP follow-ups remain OPEN: PERF-after-1 through PERF-after-6.** Local after medians remain
above 2.5 seconds; CLS/TBT pass their documented budgets. No field Core Web Vitals or performance
improvement is invented. Lead owns acceptance/remediation and production release approval.

Manifest: files-S15.txt. It includes the authorized two-option test correction, QA harnesses/evidence,
notes and generated legacy-path reports refreshed by the supplied scripts; it does not claim ownership
of C's S16 implementation or other agents' application changes.
