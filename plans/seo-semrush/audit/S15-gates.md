# S15 final integration gates — 3 October 2026

Worktree: bestbikefit4u-semrush; branch fix/seo-semrush; base e93f8c1.
Final production build ID: `rejwcKGnhSNUclqs6ffwl`, including S16 and the lead-authorized test correction.
Build and runtime checks use closed-loopback Convex URLs; no production backend calls or deployments.

| Gate | Final result | Evidence |
|---|---|---|
| `npm run typecheck -- --incremental false` | PASS, exit 0 | `/tmp/S15-release-types.log` |
| `npm run lint` | PASS, exit 0: ESLint, runtime boundaries, tooltips, contrast, CSS modules, images | `/tmp/S15-release-lint.log` |
| `npm run test:unit` | 2,149 passed, 20 skipped; 326 files passed, one skipped; exit 0 | `/tmp/S15-release-unit.log` |
| `npm run test:contracts` | 232 passed across 35 files; exit 0 | `/tmp/S15-release-contracts.log` |
| `npm run build` | PASS, exit 0; 184 static generation entries | `/tmp/S15-release-build.log` |
| `npx tsc -p convex/tsconfig.json --noEmit` | PASS, exit 0 | `/tmp/S15-release-convex.log` |
| `node --test scripts/seo-semrush-check.test.mjs scripts/seo/sitemap-lastmod.test.mjs` | Five passed; exit 0 | `/tmp/S15-release-harness.log` |
| `node scripts/seo-crawl-check.mjs --local --skip-build --label=s15 --delay=0` | 875 page/UA checks, 170 sitemap URLs, 1,209 GETs; zero findings; exit 0 | `plans/seo-crawl-fixes/audit/crawl-s15.md` and `.json` |
| `node scripts/seo-semrush-check.mjs` | Six pressure pages, 65 redirects, 96 guide locales, four author/methods pages; zero failures; exit 0 | `S15-semrush.json` links full report |
| `node scripts/seo-discovery-check.mjs` | Exact 170-URL parity in both documents, four direct 301 aliases, canonical pairs and internal links pass; exit 0 | `S15-discovery.json` links full report |
| `npm run seo:validate-sitemaps` | PASS against isolated HTTPS preview; exit 0 | `S15-sitemap-validation.log` |
| Final `npm run lint` including completed QA scripts | PASS, exit 0 | `/tmp/S15-signoff-lint.log` |
| Final `git diff --check` | PASS, exit 0 | `/tmp/S15-signoff-diff.log` |

The local crawl reuses the freshly completed final build; it does not rebuild concurrently with captures.
Runtime scripts retain their historical output paths, recorded in the S15 summaries. Those full JSON
reports carry the same final build ID. Offline CMS fallback means live-only CMS/blog data is not validated;
the release checklist assigns production verification to the lead.

## Resolved integration findings

Initial candidate `5ztwnMwqAl6O3-9ztGSal` passed gates but the sweep found pre-existing duplicate language
landmark names. C supplied S16's distinct menu/footer aria labels. Its test then blocked typecheck/build
with unsupported `exact` role-query options. Lead authorized B to remove only those two options on C's
behalf; exact string name matching preserves intent. All final gates above were rerun after that correction.

The visual worker also removed an unnecessary CommonJS require from the new baseline font mock after
ESLint flagged it. Full final lint passes. The first run's cosmetic zsh echo summary error did not affect
gate results; final invocations explicitly recorded individual exit codes.

Non-failing test diagnostics: Vite's future config-loader warning, jsdom navigation not implemented,
and a missing dependency source map (`typescript.js.map`). No failed assertions or unhandled test errors.
Skipped tests remain skipped, not counted as passes.

Six S10 LCP budget follow-ups remain OPEN. These technical gates do not claim performance budgets or field
Core Web Vitals are green. Final visual acceptance is recorded separately in S15-visual-notes.md.
