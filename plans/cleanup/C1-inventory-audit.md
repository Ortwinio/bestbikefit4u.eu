# C1 inventory audit — 4 October 2026

Read-only inventory of the cleanup worktree at commit 91a4e937. No files deleted, no production commands run, no environment or source files changed. This report is an input to the parent C1 deletion audit, not deletion authorization by itself.

## Search method

- Inventoried tracked files with `git -C /Users/ortwinverreck/Developer/bestbikefit4u-migratie ls-files plans`: **1,896 files** across **110 top-level entries**. Cleanup is currently untracked and must also survive.
- Searched the working repository with `rg -n --hidden -g '!plans/**' -g '!node_modules/**' -g '!.git/**' -g '!*.tsbuildinfo' 'plans/|riderprofile-baseline' .`.
- Inspected executable matches in scripts, tests, package.json, next.config.ts, .github, src and convex; reviewed dynamic template-string paths and directory iteration.
- Compared each tracked plan helper's full path and basename against tracked external text files (binary artifacts excluded). Only 40-nl-scan-live.py has an external basename hit, which is explanatory provenance in tests/visual/nl-pressure/scan.py:7, not execution.
- Generic AGENTS/CLAUDE/CI plan conventions are folder policies, not reads of every historical plan. .tasks references are historical orchestration records and are explicitly distinguished below.
- Historical cross-plan links are not executable consumers. Absence of external readers is not proof that all historical material has no documentary value; parent should document deletion under the owner's historical-plan cleanup authorization.

## Required retention and dependencies

| Plan path | Evidence and decision |
| --- | --- |
| plans/README.md, plans/cleanup/**, plans/migratie/** | Explicit owner keep list. Migration checker writes migratie/audit; migration docs link it. |
| plans/riderprofile-baseline/** | Keep all six tracked files and future baseline outputs. scripts/riderprofile-baseline.mjs:92 writes dynamic baseline-${from}-${to}.json/.md; mkdir is recursive. README/R0-owner/R0-notes explain operation; script and unit test outside plans also survive. The owner requires the 18 October baseline report. Do not execute the runner: it invokes production Convex. |
| plans/redesign-canvas/guides-import/*.json | Keep all **48** JSON records. scripts/import-guide-rewrites.mjs:129 iterates directory; export scripts write it. src/lib/guides/rewrites.test.ts, src/lib/seo/social-image.test.ts, batch-a/b/d tests read slug-derived filenames; convex/guides/__tests__/mutations.contract.test.ts:182 iterates every JSON. These are live import source data and test fixtures, not disposable report JSON. |
| plans/redesign-canvas/canvas/FitRapport1.dc.html through FitRapport6.dc.html | Keep six files: tests/visual/pdf-report/board.test.mjs:11 and render.mjs:163 loop 1–6 and read each board dynamically. |
| plans/redesign-canvas/audit/route-map.md | Keep: tests/visual/final-sweep/routes.test.mjs:20 reads inventory and compares routes. sweep.mjs records its provenance. |
| plans/redesign-canvas/audit/47-optimized.json | Keep: tests/visual/image-weight/capture.mjs:13 reads JSON then dynamically reads illustration-sources/originals/${row.original}. |
| plans/redesign-canvas/illustration-sources/** | Dynamic image-weight input; scripts/convert-hero-video.sh reads originals/bestbikefit4u-home.gif. No tracked files found here; ignored local source archives must not be recursively deleted as collateral. Existing absence is not introduced by C1. |
| plans/redesign-canvas/drafts/_renders/** | Dynamic copy input in marketing-batch3/capture.mjs:150 and marketing-batch5a/capture.mjs:101. No tracked files found; preserve any ignored local inputs. |
| plans/seo-semrush/audit/S9-internal-links.json | Keep: scripts/seo-discovery-check.mjs:87 reads locale contextualSourcePages from this inventory. |
| plans/seo-semrush/audit/S10-before/summary.json and S10-after/summary.json | scripts/performance/compare.mjs:4–5 dynamically resolves these input files. They are ignored/untracked in this snapshot, so C1 must not remove local directories indiscriminately. |
| plans/tmux-ide-minimal-operating-convention.md | Root README.md:40 explicitly links policy. Relocate convention/update link before deleting; not evidence-free dead prose. |
| plans/emails-bilingual/SPEC.md | convex/emails/i18n/en.ts:3 and nl.ts:1 cite source-copy provenance only. No executable read. Parent can delete historical specification under owner scope, acknowledging source-comment links. |
| plans/rebrand/canvas/bikefitboost-merkblad.md and canvas/project/mail/N14Dag14.dc.html | public/brand/LEESMIJ.md and scripts/email-assets/README.md cite these. Check actual tracked presence; preserve existing targets or update citations as part of parent work. |

### Output-only paths

Writers do not require old reports to remain, but removal of parent directories can break writers that lack recursive mkdir. Preserve minimal directory markers, or migrate the output paths and test the writer.

- scripts/seo-crawl-check.mjs:115 → plans/seo-crawl-fixes/audit (mandatory combined local gate).
- scripts/domain-migration-check.mjs:113 → plans/migratie/audit (explicit keep).
- scripts/seo-semrush-check.mjs and scripts/performance/{run,check-answers,compare}.mjs → seo-semrush/audit and renders.
- scripts/{generate-example-report,render-email-previews,rebrand-assets,rebrand-assets-capture}.mjs → rebrand/renders and audit.
- Many tests/visual capture scripts → redesign-canvas/{audit,code-renders,final-sweep}; scripts/images/optimize-public.mjs also writes audit JSON.
- scripts/import-guide-rewrites.mjs writes audit/49-import-log.json and recursively creates audit; retain import JSON regardless of log cleanup.
- Tests may accept user-selected baselines/output folders; do not interpret those options as evidence to delete ignored local evidence.

## Tracked plan-local executable helpers

No helper listed below is imported or invoked by tracked files outside plans. The one basename hit (40-nl-scan-live.py) is a provenance comment, not a dependency. Preserve baseline verify-events.mjs under explicit keep; other helpers are candidates with their historical plans. Relative imports from a helper into live source do not make the helper a live entry point.

- `plans/rebrand/audit/B4-inventory.mjs`
- `plans/rebrand/audit/RB-http-check.mjs`
- `plans/rebrand/audit/RB2-contact-check.mjs`
- `plans/redesign-canvas/audit/40-nl-scan-live.py`
- `plans/redesign-canvas/check-board.mjs`
- `plans/redesign-canvas/check-runtime.mjs`
- `plans/riderprofile-baseline/audit/verify-events.mjs`
- `plans/riderprofile/audit/R1-capture.mjs`
- `plans/riderprofile/audit/R10-capture.mjs`
- `plans/riderprofile/audit/R10-forms-capture.mjs`
- `plans/riderprofile/audit/R11-login-capture.mjs`
- `plans/riderprofile/audit/R11-ui-capture.mjs`
- `plans/riderprofile/audit/R12-capture.mjs`
- `plans/riderprofile/audit/R13-ui-capture.mjs`
- `plans/riderprofile/audit/R15-gearing-capture.mjs`
- `plans/riderprofile/audit/R2-ftp-public-only.ts`
- `plans/riderprofile/audit/R2-ftp-visual.mjs`
- `plans/riderprofile/audit/R2-ftp-vitest.config.ts`
- `plans/riderprofile/audit/R2-login-capture.mjs`
- `plans/riderprofile/audit/R2-partial-visual.mjs`
- `plans/riderprofile/audit/R2-welcome-capture.mjs`
- `plans/riderprofile/audit/R3-render.mjs`
- `plans/riderprofile/audit/R4-capture.mjs`
- `plans/riderprofile/audit/R5-profile-capture.mjs`
- `plans/riderprofile/audit/R6-render.mjs`
- `plans/riderprofile/audit/R7-dashboard-capture.mjs`
- `plans/riderprofile/audit/R8-advice-capture.mjs`
- `plans/seo-crawl-fixes/audit/measure-metadata.mjs`
- `plans/seo-semrush/audit/S15-sitemap-validation.mjs`
- `plans/seo-semrush/audit/S15-visual-compare.mjs`
- `plans/seo-semrush/audit/S15-visual-difference.mjs`
- `plans/seo-semrush/audit/S15-visual-fonts.cjs`
- `plans/seo-semrush/audit/S15-visual-review.mjs`
- `plans/seo-semrush/audit/S15-visual-server.mjs`
- `plans/seo-semrush/audit/S15-visual.mjs`
- `plans/seo-semrush/audit/S17-visual-compare.mjs`
- `plans/seo-semrush/audit/S17-visual-review.mjs`
- `plans/seo-semrush/audit/S17-visual-server.mjs`
- `plans/seo-semrush/audit/S17-visual.mjs`
- `plans/seo-semrush/audit/S5-home-capture.mjs`
- `plans/seo-semrush/audit/S8-runtime.mjs`

## Top-level inventory

“Historical candidate” means no specific tracked external plan-path consumer was found beyond generic plan policy; references originating in other historical plans do not establish current execution. Other external references and exceptions are called out explicitly. The full per-file deletion evidence belongs in C1-removed.md after the parent settles retention.

| Top-level plans entry | Tracked files | Classification |
| --- | ---: | --- |
| `BestBikeFit4U_Redesign_Plan.docx` | 1 | Historical candidate; no specific external plan-path reader found. |
| `bugfix-convex-auth-runtime` | 9 | Historical candidate; no specific external plan-path reader found. |
| `bugfix-convex-frontend-stability` | 13 | Historical candidate; no specific external plan-path reader found. |
| `bugfix-dashboard-tire-pressure-runtime` | 1 | Historical candidate; no specific external plan-path reader found. |
| `bugfix-feedback-audit-closeout` | 7 | Historical candidate; no specific external plan-path reader found. |
| `bugfix-marktplaats-import-preview-upgrade` | 9 | Historical candidate; no specific external plan-path reader found. |
| `bugfix-panel-surface-contrast-audit` | 8 | Historical candidate; no specific external plan-path reader found. |
| `bugfix-robots-internal-blocked` | 7 | Historical candidate; no specific external plan-path reader found. |
| `calculator-schema` | 4 | Historical candidate; no specific external plan-path reader found. |
| `design-language-v1` | 8 | Historical candidate; no specific external plan-path reader found. |
| `design-system-consistency` | 8 | Historical candidate; no specific external plan-path reader found. |
| `emails-bilingual` | 25 | Source comments reference SPEC.md; documentation-only provenance, not runtime read. |
| `engine-upgrade` | 1 | Historical candidate; no specific external plan-path reader found. |
| `engine-v2-migration` | 21 | Historical candidate; no specific external plan-path reader found. |
| `feature-admin-dashboard-integration` | 4 | Historical candidate; no specific external plan-path reader found. |
| `feature-admin-panel` | 14 | Historical candidate; no specific external plan-path reader found. |
| `feature-bike-geometry-guided-picklist` | 5 | Historical candidate; no specific external plan-path reader found. |
| `feature-bike-geometry-linking` | 13 | Historical candidate; no specific external plan-path reader found. |
| `feature-bike-geometry-linking-ux` | 4 | Historical candidate; no specific external plan-path reader found. |
| `feature-bike-page-upgrade` | 13 | Historical candidate; no specific external plan-path reader found. |
| `feature-bike-passport-fit-check` | 13 | Historical candidate; no specific external plan-path reader found. |
| `feature-bike-passport-import` | 5 | Historical candidate; no specific external plan-path reader found. |
| `feature-bike-session-bike-attribute-consolidation` | 6 | Historical candidate; no specific external plan-path reader found. |
| `feature-blog` | 7 | Historical candidate; no specific external plan-path reader found. |
| `feature-climbing-profile` | 5 | Historical candidate; no specific external plan-path reader found. |
| `feature-cms-guide-pages` | 10 | Historical .tasks references outside plans; no runtime reader found. |
| `feature-comfort-discomfort-card` | 9 | Historical candidate; no specific external plan-path reader found. |
| `feature-commercial-claim-sync-seo-sprint` | 2 | Historical candidate; no specific external plan-path reader found. |
| `feature-commercial-saas-ux-upgrade` | 27 | Historical .tasks references outside plans; no runtime reader found. |
| `feature-dashboard-language-switch` | 9 | Historical candidate; no specific external plan-path reader found. |
| `feature-dashboard-look-and-feel-harmony` | 11 | Historical .tasks references outside plans; no runtime reader found. |
| `feature-dashboard-upgrade` | 14 | Historical candidate; no specific external plan-path reader found. |
| `feature-dashboard-ux-improvements` | 7 | Historical candidate; no specific external plan-path reader found. |
| `feature-faq-section-seo-content` | 9 | Historical candidate; no specific external plan-path reader found. |
| `feature-feedback-panel-redesign` | 15 | Historical candidate; no specific external plan-path reader found. |
| `feature-gearing-calculator` | 12 | Historical candidate; no specific external plan-path reader found. |
| `feature-google-sign-in` | 6 | Historical candidate; no specific external plan-path reader found. |
| `feature-homepage-post-redesign-upgrade` | 9 | Historical candidate; no specific external plan-path reader found. |
| `feature-homepage-quotes-carousel` | 9 | Historical candidate; no specific external plan-path reader found. |
| `feature-input-tooltips` | 13 | Historical candidate; no specific external plan-path reader found. |
| `feature-logo-branding-refresh` | 8 | Historical candidate; no specific external plan-path reader found. |
| `feature-marktplaats-bike-import` | 18 | Historical candidate; no specific external plan-path reader found. |
| `feature-multilingual-homepage-switch` | 11 | Historical candidate; no specific external plan-path reader found. |
| `feature-my-bikes-ux-upgrade` | 6 | Historical candidate; no specific external plan-path reader found. |
| `feature-pdf-layout-upgrade` | 11 | Historical candidate; no specific external plan-path reader found. |
| `feature-profile-ux-improvements` | 7 | Historical candidate; no specific external plan-path reader found. |
| `feature-profile-wizard-measurement-illustrations` | 8 | Historical candidate; no specific external plan-path reader found. |
| `feature-prototyper-ui-full-cleanup` | 1 | Historical candidate; no specific external plan-path reader found. |
| `feature-prototyper-ui-migration` | 13 | Historical candidate; no specific external plan-path reader found. |
| `feature-prototyper-ui-verification-and-ux` | 7 | Historical candidate; no specific external plan-path reader found. |
| `feature-public-calculator-dashboard-parity` | 11 | Historical candidate; no specific external plan-path reader found. |
| `feature-public-calculator-logic-standardization` | 13 | Historical candidate; no specific external plan-path reader found. |
| `feature-public-style-alignment` | 7 | Historical candidate; no specific external plan-path reader found. |
| `feature-report-redesign` | 16 | Historical candidate; no specific external plan-path reader found. |
| `feature-report-view-alignment` | 5 | Historical candidate; no specific external plan-path reader found. |
| `feature-resend-operational-validation` | 9 | Historical candidate; no specific external plan-path reader found. |
| `feature-rider-profile-questions` | 6 | Historical candidate; no specific external plan-path reader found. |
| `feature-saddle-width-calculator` | 9 | Historical .tasks references outside plans; no runtime reader found. |
| `feature-seo-site-audit` | 10 | Historical candidate; no specific external plan-path reader found. |
| `feature-seo-technical-content-remediation` | 6 | Historical candidate; no specific external plan-path reader found. |
| `feature-strava-bike-import` | 7 | Historical candidate; no specific external plan-path reader found. |
| `feature-strava-integration` | 6 | Historical candidate; no specific external plan-path reader found. |
| `feature-strava-integration-remediation` | 8 | Historical candidate; no specific external plan-path reader found. |
| `feature-stripe-integration` | 10 | Historical candidate; no specific external plan-path reader found. |
| `feature-technical-seo-implementation` | 20 | Historical candidate; no specific external plan-path reader found. |
| `feature-tire pressure` | 1 | Historical candidate; no specific external plan-path reader found. |
| `feature-tire-pressure` | 9 | Historical candidate; no specific external plan-path reader found. |
| `feature-user-feedback-portal` | 6 | Historical candidate; no specific external plan-path reader found. |
| `feature-website-content-seo-multilingual-growth` | 12 | Historical candidate; no specific external plan-path reader found. |
| `feature-why-bikefit-matters-page` | 9 | Historical candidate; no specific external plan-path reader found. |
| `followups-gemini` | 3 | Historical candidate; no specific external plan-path reader found. |
| `guide-content-enrichment` | 9 | Historical .tasks references outside plans; no runtime reader found. |
| `guide-guideline-alignment` | 6 | Historical .tasks references outside plans; no runtime reader found. |
| `homepage-bike-showcase-slider` | 1 | Historical candidate; no specific external plan-path reader found. |
| `homepage-improvements-v1` | 8 | Historical candidate; no specific external plan-path reader found. |
| `homepage-redesign` | 9 | Historical candidate; no specific external plan-path reader found. |
| `improve-experience-question` | 4 | Historical candidate; no specific external plan-path reader found. |
| `migratie` | 67 | Keep all; active manual migration runbooks. |
| `next-steps` | 11 | Stale context/INDEX.md reference; no executable reader. |
| `profile-wizard-redesign` | 6 | Historical candidate; no specific external plan-path reader found. |
| `public-pages-design-v1` | 8 | Historical candidate; no specific external plan-path reader found. |
| `README.md` | 1 | Keep; update convention. |
| `rebrand` | 37 | Output dirs used by scripts; two documentation provenance links require retention or updates. |
| `redesign-canvas` | 551 | Partial retention required: guide JSON, six PDF boards, route-map, image-weight inputs. Other artifacts candidate only after reader/write-dir checks. |
| `refactor-admin-panel-acceptance-remediation` | 12 | Historical candidate; no specific external plan-path reader found. |
| `refactor-admin-panel-final-closeout` | 9 | Historical candidate; no specific external plan-path reader found. |
| `refactor-bikefit-ai-to-bestbikefit4u` | 11 | Historical candidate; no specific external plan-path reader found. |
| `refactor-bikefit-correctness-audit` | 11 | Historical candidate; no specific external plan-path reader found. |
| `refactor-code-quality-2026-q1` | 11 | Historical candidate; no specific external plan-path reader found. |
| `refactor-code-quality-improvement` | 11 | Historical candidate; no specific external plan-path reader found. |
| `refactor-prototyper-ui-audit-remediation` | 7 | Historical candidate; no specific external plan-path reader found. |
| `refactor-technical-security-review` | 6 | Historical candidate; no specific external plan-path reader found. |
| `report-v2` | 17 | Historical candidate; no specific external plan-path reader found. |
| `review-multilingual-ux` | 12 | Historical candidate; no specific external plan-path reader found. |
| `riderprofile` | 189 | Only external .gitignore output pattern; baseline folder is distinct. Candidate historical plan. |
| `riderprofile-baseline` | 6 | Keep all six tracked files and script output contract; owner requires 18 October report. |
| `screenshots` | 1 | Historical candidate; no specific external plan-path reader found. |
| `security-audit` | 14 | Historical candidate; no specific external plan-path reader found. |
| `security-audit-2026-q1` | 11 | Historical candidate; no specific external plan-path reader found. |
| `security-website-security-audit-hardening` | 13 | Historical candidate; no specific external plan-path reader found. |
| `seo-crawl-fixes` | 45 | Output dir required by local gate; historical files candidate after preserving writable audit location. |
| `seo-growth-engine` | 11 | Historical candidate; no specific external plan-path reader found. |
| `seo-improvement-v1` | 11 | Historical candidate; no specific external plan-path reader found. |
| `seo-semrush` | 99 | Partial retention required: S9-internal-links.json; retain output dirs or migrate writers. |
| `server-auth-control` | 5 | Stale context/INDEX.md reference; no executable reader. |
| `sprint-claim-sync-analytics-seo` | 11 | Historical candidate; no specific external plan-path reader found. |
| `test-strategy` | 5 | Stale context/INDEX.md reference; no executable reader. |
| `tire-pressure-calculator` | 2 | Historical candidate; no specific external plan-path reader found. |
| `tmux-ide-minimal-operating-convention.md` | 1 | README.md links policy; retain until parent migrates link/convention. |
| `xml-sitemap-implementation-plan.md` | 1 | Historical candidate; no specific external plan-path reader found. |

## Limits and handoff

The inventory does not run browser capture, production access or migration commands. It does not delete sources, fixtures or evidence. Parent should rescan retained code after combining C2/C3 changes, retain minimal live inputs and output directory contracts, and run the planned gates. A full-path/basename search cannot prove arbitrary user-selected CLI inputs are unused; the conservative explicit keeps above cover known dynamic consumers.

