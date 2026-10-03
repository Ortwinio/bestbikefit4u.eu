# S10 — performance baseline

Lighthouse CI measures six production-build templates (home, saddle-height calculator, guide, knee-pain page, pricing and login), three mobile simulated runs each. Budgets are strict median LCP < 2,500 ms, CLS < 0.1 and TBT < 200 ms. `npm run perf:baseline -- --label=baseline` runs the local HTTPS harness after `npm run build`. It never uploads reports or deploys. `CHROME_PATH` can select a compatible installed Chromium. Full raw reports are local; compact checked-in evidence excludes screenshot payloads.

Before metrics: all six LCP medians exceed budget (4,994–5,775 ms); all CLS values are zero and median TBT is 29.5–87.2 ms. Per-template follow-up tickets are in the report, not dismissed or reported as passing. See `S10-before/summary.md` and `S10-after/summary.md` / `S10-comparison.md`. After LCP medians remain above budget (5,042–5,519 ms); CLS stays zero and TBT medians are 28–50 ms. All 36 samples completed; six LCP follow-up tickets remain. These are local lab measurements, not field Core Web Vitals. The build uses offline Convex data and static guide content.

Changes: explicit responsive `sizes` for guide and pain illustrations using their existing CSS widths. Existing font preload/swap and hero priorities were retained: measured LCP elements include headings, so adding speculative image priorities is unsupported. Speed Insights now groups the six public templates with fixed route/URL labels, stripping queries, hashes and dynamic slugs. Account routes are not sent by this classifier. Real field data requires deployment and traffic; none is claimed here.

Chrome 145 produced Lighthouse NO_FCP while normal Playwright navigation painted. A compatible cached Chromium completed all baseline samples; the report records its actual version. TLS is required because Next 16 loopback HTTP produced redirects. The throwaway local certificate is never trusted system-wide. Initial failed collection/build attempts were corrected before final validation.

76 combined focused tests, full lint/typecheck, production build and 1,145 local crawl checks pass. Lighthouse assertions intentionally remain red for the documented LCP violations. Final after measurements include S11 content as well as S10 changes; there is no causal before/after optimization claim. Remaining LCP work exceeds the brief’s image/font loading scope and is captured as tickets.

No commit, deploy, analytics-value fabrication or production write.
