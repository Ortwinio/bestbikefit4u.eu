# C3 removed files

4 October 2026. Cleanup in `chore/repo-cleanup`; no commit or deployment.
Every deletion below has its per-file evidence in the linked audit. No production, environment or email action was performed.

## Code

See [per-file evidence](C3-code-removed.md).

# C3 source removals

Status: 13 listed files removed, 4 October 2026. No application behavior replacement.

## Method

TypeScript compiler API (`createSourceFile`, `resolveModuleName`) used the repository tsconfig aliases and bundler resolution to build imports, re-exports, literal dynamic imports and require edges. All external JS/TS scripts and tests were roots, plus Next app route/layout/error/loading/metadata conventions, middleware/proxy/instrumentation. Directory imports resolve to index files. Candidates below have no reachable incoming edge. Framework special files are retained regardless of import edges.

Second pass searched the whole repository (including hidden workflow/task files, plans, docs, scripts, public data, Convex and tests) for file stems, full module paths and exported names. Generated dependency/cache directories were excluded. Exact barrel directory strings were also searched; that caught the feedback integration-test mock, so its barrel and subtree are kept. Historical plan prose and audit manifests are not executable references. No arbitrary dynamic source loader references these paths. No i18n keys are removed.

Reproduce the read-only compiler scan with `node plans/cleanup/C3-reachability.mjs`. It resolves all literal module strings, including test mocks, with TypeScript. The initial import-edge pass and whole-repository symbol searches were checked before deletion; this persistent version also incorporates conservative mock-string and complete Next metadata roots. Candidates are evidence for review, not automatic deletion instructions.

## Per-file evidence

### `src/components/auth/AuthGuard.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: `src/components/auth/index.ts`.
- Exported symbol references outside self: `src/components/auth/index.ts`.
- Historical text-only mentions: none.

### `src/components/auth/index.ts`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: none.
- Exported symbol references outside self: none.
- Directory import and mock search: no reference to `@/components/auth` or another path resolving to this barrel; direct `UserMenu` imports stay intact.
- Historical text-only mentions: none.

### `src/components/bikes/BikeNotesEditor.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: none.
- Exported symbol references outside self: none.
- Historical text-only mentions: `plans/feature-dashboard-ux-improvements/03-my-bikes-enhancements.md`, `plans/redesign-canvas/audit/files-41c.txt`, `plans/redesign-canvas/audit/41c-notes.md`, `plans/redesign-canvas/audit/20-notes.md`, `plans/redesign-canvas/audit/files-20.3.txt`.

### `src/components/campaign/CampaignAnnouncementBar.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: none.
- Exported symbol references outside self: none.
- Historical text-only mentions: `plans/design-language-v1/01-header-cta-fix.md`, `plans/homepage-redesign/01-sprint1-hero-conversion.md`, `plans/homepage-redesign/README.md`.

### `src/components/content/PublicPageIllustrations.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: `src/components/public/PainPointPageTemplate.tsx`.
- Exported symbol references outside self: `src/components/public/PainPointPageTemplate.tsx`.
- Historical text-only mentions: none.

### `src/components/public/PainPointPageTemplate.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: none.
- Exported symbol references outside self: none.
- Historical text-only mentions: `plans/seo-semrush/audit/files-S9.txt`, `plans/design-language-v1/07-other-pages.md`, `plans/seo-improvement-v1/output-03-internal-linking-and-science-crosslinks.md`, `plans/feature-seo-site-audit/output-04-roadmap.md`, `plans/feature-seo-site-audit/output-05-implementation-closeout.md`, `plans/feature-seo-site-audit/output-03-content-review.md`, `plans/feature-seo-technical-content-remediation/output-02-implemented-fixes-and-validation.md`, `plans/sprint-claim-sync-analytics-seo/release-plan.md`, `plans/feature-seo-technical-content-remediation/output-01-seo-audit-and-remediation-plan.md`, `plans/feature-commercial-saas-ux-upgrade/output-02-prototyper-ui-implementation-matrix.md`, `plans/feature-commercial-saas-ux-upgrade/output-01-prototyper-ui-website-audit.md`, `plans/feature-technical-seo-implementation/output-10-step-07-schema-normalization.md`, `plans/feature-technical-seo-implementation/output-09-step-06-template-seo-ux.md`, `plans/redesign-canvas/audit/route-map.md`, `plans/redesign-canvas/audit/12-notes.md`.

### `src/components/features/pressure/PressureCalculatorDashboard.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: none.
- Exported symbol references outside self: none.
- Historical text-only mentions: `plans/redesign-canvas/audit/20-notes.md`, `plans/redesign-canvas/audit/42-notes.md`, `plans/redesign-canvas/audit/engine-alignment.md`.

### `src/components/features/pressure/PressureWizard.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: `src/components/features/pressure/PressureCalculatorDashboard.tsx`.
- Exported symbol references outside self: `src/components/features/pressure/PressureCalculatorDashboard.tsx`.
- Historical text-only mentions: `plans/feature-dashboard-upgrade/04-weight-promotion.md`, `plans/feature-dashboard-upgrade/08-pressure-in-bikes.md`, `plans/feature-dashboard-ux-improvements/04-tire-pressure-overview.md`, `plans/feature-strava-integration/05-pressure-prefill.md`, `plans/refactor-code-quality-2026-q1/output-02-test-coverage-check.md`, `plans/feature-tire-pressure/05-dashboard-pressure-calculator.md`, `plans/review-multilingual-ux/output-04-ux-flow-review.md`, `plans/review-multilingual-ux/output-02-route-coverage-check.md`, `plans/redesign-canvas/41-autosave.md`, `plans/redesign-canvas/audit/10-notes.md`, `plans/redesign-canvas/audit/20-notes.md`, `plans/redesign-canvas/audit/engine-alignment.md`, `plans/redesign-canvas/audit/42-notes.md`.

### `src/components/features/pressure/wizard/StepBikeSelect.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: `src/components/features/pressure/PressureWizard.tsx`.
- Exported symbol references outside self: `src/components/features/pressure/PressureWizard.tsx`.
- Historical text-only mentions: `plans/feature-tire-pressure/05-dashboard-pressure-calculator.md`, `plans/refactor-code-quality-2026-q1/output-02-test-coverage-check.md`.

### `src/components/questionnaire/QuestionnaireProgressBar.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: `src/components/features/pressure/PressureWizard.tsx`.
- Exported symbol references outside self: `src/components/features/pressure/PressureWizard.tsx`.
- Historical text-only mentions: `plans/profile-wizard-redesign/01-wizard-shell.md`, `plans/profile-wizard-redesign/README.md`, `plans/security-audit/findings/04-csp-and-frontend.md`, `plans/redesign-canvas/output-20-batch2-questionnaire.md`, `plans/redesign-canvas/audit/20-notes.md`.

### `src/components/layout/BikePassportFooterLogo.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: none.
- Exported symbol references outside self: none.
- Historical text-only mentions: none.

### `src/components/home/QuotesCarousel.tsx`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: none.
- Exported symbol references outside self: none.
- Historical text-only mentions: `.tasks/events.log`, `.tasks/tasks/010-activity-gate-b-homepage-migration-and-tests-valid.json`, `plans/homepage-redesign/02-sprint2-trust-structure.md`, `plans/homepage-redesign/README.md`, `plans/homepage-redesign/output-02-sprint2-trust-structure.md`, `plans/feature-homepage-quotes-carousel/output-02-carousel-component.md`, `plans/feature-homepage-quotes-carousel/output-04-validation.md`, `plans/feature-homepage-quotes-carousel/output-03-homepage-integration.md`, `plans/feature-homepage-quotes-carousel/02-build-carousel-component.md`, `plans/feature-why-bikefit-matters-page/output-04-validation.md`, `plans/feature-why-bikefit-matters-page/output-02-homepage-link.md`, `plans/feature-why-bikefit-matters-page/output-03-page-implementation.md`, `plans/homepage-bike-showcase-slider/README.md`, `plans/review-multilingual-ux/output-04-ux-flow-review.md`, `plans/sprint-claim-sync-analytics-seo/release-plan.md`, `plans/feature-commercial-saas-ux-upgrade/output-04-final-closeout.md`, `plans/feature-commercial-saas-ux-upgrade/handoff-homepage-structure.md`.

### `src/lib/publicCalculatorCatalog.ts`

- Reason: orphaned prior implementation; no application, test, tooling or public-data consumer.
- Compiler incoming edges: none.
- Exported symbol references outside self: none.
- Historical text-only mentions: none.

## Verification after removal

- `npm run typecheck`: PASS (`/private/tmp/C3-code-typecheck.log`).
- Focused Vitest on homepage, pain index, dashboard pressure, pressure components, feedback components and dashboard message locale integration: **14 files, 69 tests passed** (`/private/tmp/C3-code-tests.log`).
- `node plans/cleanup/C3-reachability.mjs`: PASS; read-only scan completed after removal.
- `npx eslint plans/cleanup/C3-reachability.mjs`: PASS.
- Shared full gates remain owned by A on the combined cleanup tree.


## Scripts

See [per-file evidence](C3-scripts-removed.md).

# C3 script deletion evidence

4 October 2026. Only `scripts/rebrand-assets-capture.mjs` is removed.

Reason: finished rebrand B1 capture helper explicitly covered by cleanup scope. Whole-repository hidden-file searches for its filename and RB_VISUAL_ORIGIN (excluding dependencies, build and Git internals) found its own implementation and historical rebrand/migration inventories only. Separate package.json, .github, scripts, tests, src, convex and shared search found no executable caller. Inspected source: it reads no plan input, writes RB screenshots and B1-render-checks.json only, and captures existing pages via retained final-sweep helpers. Current brand generator, brand guard, asset tests, sweep and crawl remain. Historical inventory mentions are provenance, not runtime dependencies.

No tests or executable callers were removed to justify this deletion. C1 owns historical plan removal. Other scripts still write under plans/rebrand, so this removal releases only its own B1 capture output dependency. Combined gates belong to C1 after source freeze.


## Docs

See [per-file evidence](C3-docs-removed.md).

# C3 documentation removals

| Path | Reason | Unused evidence |
| --- | --- | --- |
| `docs/SEO_BASELINE_2026-02-19.md` | Completed February pre-release zero-data snapshot; current KPI runbook retained. | Worker scanned tracked files and hidden whole-repository text for full basename and stem: no incoming reference. Package/workflow/script readers do not open it. |
| `docs/SEO_MONTHLY_REVIEW_2026-02.md` | Completed February zero-data review; current reporting instructions retained. | Same whole-repository full-basename/stem scan: no incoming reference or executable reader. |

The final-sweep production helper generically hashes/copies docs into a fixture snapshot; it does not consume these reports or require their presence. Active docs readers use guide CMS imports/backlog, all retained. No database access or report refresh was attempted.


## Validation

- `npm run typecheck`: passed.
- Focused homepage, pain index, dashboard pressure, pressure components, feedback and locale integration: 14 files / 69 tests passed.
- Persistent read-only compiler audit `node plans/cleanup/C3-reachability.mjs`: passed.
- Audit script ESLint: passed.
- A owns full combined-tree gates/build/crawl after source freeze; C has not run a competing build.

- Scoped `git diff --check` for all C3 source/scripts/docs: passed.
