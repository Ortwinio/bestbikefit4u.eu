# BikeFit AI To BestBikeFit4U Replacement Plan

## Goal

Audit the current BikeFit AI application end-to-end and replace product identity references with BestBikeFit4U without breaking functional behavior.

## Background

The codebase currently mixes brand/domain references (`BikeFit AI`, `bikefit.ai`, `bestbikefit4u.eu`). This plan assumes "replace it in BestBikeFit4U" means a controlled rebrand and environment cutover where the app remains functionally the same.

## Scope

In scope:

- Full inventory of BikeFit AI references across frontend, backend, docs, env templates, and tests.
- Replacement strategy for user-facing and system-facing identity strings.
- Implementation prompts for frontend copy/metadata, backend emails/PDF, and deployment configs.
- Validation and release checklist for safe production cutover.

Out of scope:

- New product features unrelated to naming/domain replacement.
- Algorithm changes in fit calculations.
- Pricing/business model changes.

## Approach

1. Audit the running app and codebase for all BikeFit AI references and risks.
2. Define canonical BestBikeFit4U brand constants and migration rules.
3. Replace frontend references and SEO metadata consistently.
4. Replace backend email/report identity and deployment env references.
5. Validate with automated checks + manual smoke tests, then execute cutover checklist.

## Dependencies

- Existing i18n message files: `src/i18n/messages/en.ts`, `src/i18n/messages/nl.ts`
- Global metadata/layout: `src/app/layout.tsx`
- Auth and email templates: `convex/auth.ts`, `convex/emails/actions.ts`
- PDF/report labels: `src/lib/reports/recommendationPdf.ts`, `src/lib/pdf/simplePdf.ts`
- Deployment/env docs: `.env.example`, `docs/VERCEL_DEPLOYMENT.md`

## Acceptance Criteria

- No unintended `BikeFit AI` user-facing references remain in active app surfaces.
- Domain/sender/config references are aligned with BestBikeFit4U production settings.
- Lint, typecheck, tests, and production build pass after replacements.
- Manual smoke flow confirms auth email, dashboard, calculators, and report generation still work.
- A production cutover checklist is documented and executable.

## Status

- Owner: `@codex`
- Target completion: `2026-02-27`
- Last updated: `2026-02-19`
- State: `IN_PROGRESS`

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-audit-bikefit-ai-application.md` | P0 | Done |
| 02 | `02-define-replacement-rules-and-brand-core.md` | P0 | Done |
| 03 | `03-replace-frontend-branding-and-seo.md` | P1 | Done |
| 04 | `04-replace-backend-email-pdf-and-env-branding.md` | P1 | Done |
| 05 | `05-validate-regression-and-cutover.md` | P0 | In Progress (Sender Verification Blocker) |

## Outputs

- `output-01-audit-findings.md`
- `output-02-brand-replacement-spec.md`
- `output-03-frontend-rebrand.md`
- `output-04-backend-env-rebrand.md`
- `output-05-validation-and-cutover.md`
