# P2 shared gates

Worktree: feature/pricing-v3, main baseline 2ef7a79. No commit/deploy. Shared app sources frozen before build.

## Final v3 gates

The final mobile pinned-action selector correction and regression test are included in these results:

| Gate | Final result | Evidence |
| --- | --- | --- |
| Typecheck | PASS | /tmp/P2-typecheck-v3.log |
| Lint | PASS,254/254 contrast;28 token-only CSS Modules | /tmp/P2-lint-v3.log |
| Unit | **3,323 passed,20 skipped;402 files passed,one skipped** | /tmp/P2-unit-v3.log |
| Contracts |490 passed,46 files; backend unchanged | /tmp/P1-contracts-final.log |
| Convex standalone tsc | PASS; backend unchanged | /tmp/P1-convex-final.log |
| Production build | **6KW82hm49ljNYI1ddtwmm**,PASS | /tmp/P2-build-v3.log |
| Local crawl |875 checks,zero findings,PASS | /tmp/P2-crawl-v3.log; crawl-pricing-p2-final.json |

B explicitly took over the last shared build/crawl after C completed P3; no concurrent build ran.
Final200 capture includes fixed-button bounds assertions. Its first local preview lacked the offline Convex
environment value, so the harness explicitly read the same build's compiled CSS manifest from disk (not dev
CSS). Parent restarted the preview with the crawler's safe loopback Convex URL: login200 at49975 and fetched
CSS byte-identical to the capture's disk CSS. Proof: P2-css-provenance.json. No app patch/rebuild was needed.
its manual review/provenance is recorded separately. Intermediate v2/initial evidence below is historical,
not an additional test total or substitute for the final source snapshot.

## Visual-remediation v2

After the initial manual review, frontend-only fixes were completed and source frozen again.
`npm run typecheck`, `npm run lint`, `npm run test:unit` all pass (one sequential command, exit0).
Logs: /tmp/P2-typecheck-v2.log, /tmp/P2-lint-v2.log, /tmp/P2-unit-v2.log.
Unit: **3,322 passed,20 skipped;402 files passed,one skipped**. Lint:254/254 contrast;28 CSS Modules,
zero raw colors. Contracts490 and standalone Convex tsc below remain applicable: backend source unchanged.
C's v2 production rebuild passes: **0Dw9Uq506jBKvW5c7Uwwh**, /tmp/P3-shared-build-v2.log.
Fresh production-CSS proxy: http://127.0.0.1:60620. Final local crawl passes875 checks with zero findings
(/tmp/P3-shared-crawl-v2.log). The200-case capture/manual acceptance is being completed on this build,
not the superseded first-build proxy.

## Initial shared build

| Gate | Result | Evidence / owner |
|---|---|---|
| Typecheck | PASS | /tmp/P1-typecheck-final.log (A); /tmp/P2-types-2.log (B, incremental false) |
| Lint | PASS, including contrast 254/254 and token-only CSS | /tmp/P1-lint-final.log (A); /tmp/P2-lint-2.log (B) |
| Unit | 3,300 passed, 20 skipped; 401 files passed, one skipped | /tmp/P2-unit-final.log (B) |
| Contracts | 490 passed, 46 files | /tmp/P1-contracts-final.log (A) |
| Convex standalone tsc | PASS | /tmp/P1-convex-final.log (A) |
| Production build | PASS, UYxIkN6xXxBU0VSr0nQh7 | /tmp/P3-shared-build.log (C) |
| Local crawl | PASS, 875 page/user-agent checks, zero findings | /tmp/P3-shared-crawl.log (C), label pricing-p3 |

C also ran the same final unit snapshot (3,300/20); do not add overlapping counts. A/C coordinated one shared
production build; B did not run another. The old two assertions requiring Pro in PDF error messages were
updated to latest-free-PDF/single/annual terms; final full unit runs include that correction.

Additional focused proof: P2 pricing9, checkout29, FitPass43, Settings37, account183 plus expanded53,
parent report39 and notification18. These overlap the full suite and are not additive totals.
Existing non-failing diagnostics: Vite config-loader notice, jsdom navigation, missing typescript.js.map.

Visual matrix/review is recorded separately; this file does not claim live authentication, payment,
mail delivery, real CMS data, or actual backend lifecycle transitions from synthetic browser fixtures.
