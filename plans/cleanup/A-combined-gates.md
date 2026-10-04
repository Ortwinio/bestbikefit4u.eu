# Combined cleanup gates

C1 deletions and C2/C3 frozen source changes are in the same local production build, `-hFK0YV-XcaxI2UM92pOQ`.

| Gate | Result |
| --- | --- |
| typecheck | PASS |
| lint (including brand/domain guard) | PASS; zero brand/domain findings |
| test:unit | PASS: 3,079 tests / 385 files; 20 existing skips / one skipped file |
| test:contracts | PASS: 556 tests / 50 files |
| Convex standalone tsc | PASS |
| production build | PASS |
| preserved-input/reference/PDF-board/route Node tests | PASS: 15 tests, including fresh-checkout-safe output contracts |
| local SEO crawl | PASS: 170 sitemap URLs, 875 page/user-agent checks, 1,239 GET requests, zero findings |
| local migration checker | PASS: 684 exact single-301 redirects / 228 paths, 170 HTML pages and 48 guide JPEGs; zero findings |

Logs: `/tmp/C1-{typecheck,lint,unit,contracts,convex-tsc,build,crawl,domain}.log`.
Runtime checks reuse this build, with canonical `https://bikefitboost.com` and both Convex endpoints overridden to loopback port 9 for these commands only. No production requests, commits, deployments, actual environment changes, mail sends or baseline job execution.

Historical files removed: 1,767 (55,288,872 bytes); 115 empty historical directories pruned. All pre-existing required inputs remain. Planned 18 October rider baseline operation is documented and its script/materials are retained.

Final evidence: `plans/seo-crawl-fixes/audit/crawl-c1-cleanup.md` and sibling JSON; `plans/migratie/audit/domain-migration-c1-cleanup.md` and sibling JSON; `/tmp/C1-input-tests.log`. Both loopback servers stopped cleanly. The crawl uses repository CMS fallback, not live CMS/blog data; provider OAuth destinations are not invoked. Node input checks report 24 pre-existing missing ignored/generated comparison inputs without pretending cleanup removed them. Eight persistent markers are required; six ignored output directories are validated against their retained writers' recursive creation contracts so tests work from a fresh checkout.
