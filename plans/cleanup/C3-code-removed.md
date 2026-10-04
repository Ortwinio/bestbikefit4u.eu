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
