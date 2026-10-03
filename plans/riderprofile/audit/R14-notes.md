# R14 — integration and release preparation complete

Worktree bestbikefit4u-rider only. No new implementation commit, push, deploy, production migration
or Convex dev. Lead checkpoint d8726c5 was rebased onto fetched origin/main e93f8c1 as 169f7fc.
All subsequent integration/R16 changes remain uncommitted.

## Integration and resolved findings

- Preserved PR9 server dashboard layout, private noindex/nofollow metadata and standalone Convex
  tsconfig. Rider interactive header/rings live in DashboardLayoutClient.
- Preserved the single rider handoff CTA and main's value-free consented analytics; NL/EN tests
  verify one trusted-click event and no measurement values or duplicate logger.
- Corrected actual bike-fit output grouping and retained supported bikeId-only calculator scope.
- On lead's instruction, fixed B/C findings on their behalf: Dutch advice filter is Rijder (EN
  unchanged), and BikeProfilePanel edit links have a 44px minimum width. Assertions updated.
- R16 closes the former performed/feedback scope blocker: authenticated embedded progress,
  explicit ride feedback, reuse of eligible ride entries and revision-safe recalculation resets.
  See R16-notes.md and R16-backend-notes.md; no fabricated historical completion.
- R16 interaction axe exposed error/pending-label contrast and mobile landmark issues. Corrected
  semantic tokens, read-only pending notes and mobile header landmark; localized count text no
  longer uses aria-label on a generic span. Regression tests added.
- Sweep fixtures match current rider/newsletter/bike/advice contracts and fail unknown queries.
  Snapshot copying includes main's imported script dependencies. Expected 308 redirects and narrow
  publication/tier language exceptions are explicit. Native browser validation diagnostics remain
  recorded separately only when customError is false; no real product finding was waived.

## Final post-R16 candidate gates — 3 October 2026

All commands exited zero after the last application-source edit:

| Gate | Result |
|---|---|
| npm run typecheck | PASS |
| npm run lint | PASS; 254 contrast checks, 27 token-only CSS Modules |
| npm run test:unit | 2848 passed, 20 existing skips |
| npm run test:contracts | 477 passed |
| npm run build | PASS |
| npx tsc -p convex/tsconfig.json --noEmit | PASS |
| node scripts/seo-crawl-check.mjs --local --skip-build --label=r14 --delay=0 | 1145 checks, zero findings |
| Full NL/EN × 1440/390 sweep | 320/320 cases; axe 320 pass, zero skip |
| Sweep Node regression tests | 33 passed |
| All RP1–RP8/sidebar render harnesses | 184 cases/flows, 231 images |
| Additional R16 interaction states | 48/48; 96 images; zero axe violations |

The local crawl follows the just-completed production build. Loopback-only Convex URLs were used;
no real backend was deployed or queried. Source snapshot hash:
0a8a3380c2be560fb136ceb953f3dce0cd7a58d54a030df695a05ab68db3d93a.
Sweep report: renders/R14-final-sweep/report.json. Crawl evidence:
plans/seo-crawl-fixes/audit/crawl-r14.json and crawl-r14.md.

Logs: /tmp/R14-typecheck.log, R14-lint.log, R14-unit.log, R14-contracts.log,
R14-convex-tsc.log, R14-final-build.log, R14-final-seo.log, R14-final-sweep.log and
R14-sweep-tests.log. Non-failing Vite config/source-map and jsdom navigation warnings remain.

## Evidence boundaries and handoff

Account/browser tests use real components with deterministic auth/Convex fixtures, not production
authorization or persistence. Six real-handler integration tests supplement backend/unit contracts.
The full sweep gates serious/critical axe findings; R16 additionally runs unfiltered axe. Incomplete
contrast reviews remain visible in R16 results and are manually assessed in R16-render-notes.md,
not suppressed. R14-board-coverage.md records all refreshed boards and fixture limitations.

R14-release-checklist.md and R14-migration-dry-run.md prepare the production handoff, including
Convex-first deployment, environment checks, explicit approvals, controlled smoke tests, compatible
rollback and aggregate-only migration evidence. R16's optional embedded progress needs no backfill.
No production migration dry-run was executed. Release authorization and operational smoke remain
lead-owned; there are no outstanding implementation/candidate-gate blockers.

Exact uncommitted non-PNG paths are in files-R14.txt; R16-specific paths are in files-R16.txt.
