# S17 gates — 3 October 2026

Rebased head da723fbf21c8fae41f2191427b04d851ee73d42d includes origin/main
4b22da007d7aba290174c789a600d144595993b7. Build: F-yLf373Lqu2IKKHBS4al.
No production backend calls: build/runtime servers use closed-loopback Convex endpoints.

| Gate | Result | Evidence |
|---|---|---|
| `npm run typecheck -- --incremental false` | PASS, exit 0 | `/tmp/S17-final-types.log` |
| `npm run lint` | PASS, exit 0, all configured checks | `/tmp/S17-final-lint.log` |
| `npm run test:unit` | 2,966 passed, 20 skipped; 378 files passed, one skipped; exit 0 | `/tmp/S17-final-unit.log` |
| `npm run test:contracts` | 477 passed across 44 files; exit 0 | `/tmp/S17-final-contracts.log` |
| `npm run build` | PASS, exit 0 | `/tmp/S17-build.log` |
| `npx tsc -p convex/tsconfig.json --noEmit` | PASS, exit 0 | `/tmp/S17-final-convex.log` |
| `node scripts/seo-crawl-check.mjs --local --skip-build --label=s17 --delay=0` | 875 checks, 170 sitemap URLs, 1,239 GETs, zero findings; exit 0 | `plans/seo-crawl-fixes/audit/crawl-s17.md` and JSON |
| `node scripts/seo-semrush-check.mjs` | Six pressure pages, 65 redirects, 96 guide locales, four author/methods pages, zero failures; exit 0 | `S17-semrush.json` links full report |
| `node scripts/seo-discovery-check.mjs` | Exact 170-URL parity in both documents; four direct 301 aliases and canonical/inlink checks pass; exit 0 | `S17-discovery.json` links full report |
| Final `npm run lint` including S17 harness files | PASS, exit 0 | `/tmp/S17-signoff-lint.log` |
| Node Semrush checker and lastmod validator tests | Five passed, exit 0 | `/tmp/S17-harness.log` |

The fresh production build contains all rebased application code. A new test-only integration file was
then added uncommitted; full typecheck/lint/unit/contracts/Convex checks were rerun including it. No app
source changed after this build. Twenty-two new tests render all eleven real public calculators in NL/EN,
assert SEO answers, live controls, exactly one handoff link, and no persistence of untouched defaults.

Initial focused conflict checks: 18 pass. Initial full unit run before the new test: 2,944 pass/20 skip.
Final totals above include the new tests; do not add the overlapping initial and final totals.
Non-failing diagnostics include the existing Vite configuration warning, jsdom navigation warning and
missing dependency source map. Skipped tests are not represented as passed.

Runtime checks use static/offline CMS fallback; production-only CMS/blog data is not verified.
The six S10 LCP follow-ups remain open; this is not a claim of green LCP budgets or field Core Web Vitals.
Visual verification is recorded separately in S17-visual-notes.md.
