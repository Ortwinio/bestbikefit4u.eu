# Technical, security, registration, and performance review

## Goal
Review the current website, fix verified defects and security weaknesses, and validate the registration funnel and core functionality without deploying unreviewed changes to production.

## Scope and ownership
- Authentication agent: email code delivery, login UI, identity provisioning, regression tests.
- Security agent: API/backend authorization, payment customer binding, storage, SSRF.
- Performance agent: homepage assets, unnecessary subscriptions, client loading.
- Main agent: dependency advisories, CSP/proxy, browser validation, quality gates, integration and final report.

## Baseline (2026-09-27)
- Git base: `a2da02d`; working branch: `codex/technical-security-review`.
- TypeScript passed.
- Tests: 169 files passed / 11 failed; 628 tests passed / 12 failed (plus two import failures).
- ESLint: 12 errors and 11 warnings, preventing remaining lint checks.
- npm audit: 15 vulnerable packages, including 3 critical, 8 high, 4 moderate; these are dependency advisory counts, not proof of exploitability.
- Local browser reproduced login hydration errors and development CSP errors.

## Acceptance criteria
- Registration failure states are visible; no success without email delivery.
- Login fields hydrate consistently, input normalization and code verification have regression coverage.
- Strict production script CSP supports Next.js bootstrapping; local development works.
- Verified ownership/security defects are fixed and regression tested.
- Dependencies are upgraded to compatible patched versions, with audit results recorded.
- Core test suite, typecheck, lint, production build and representative browser flows are verified; limitations are explicitly documented.
- Real email test uses only the user-authorized address; no secrets or OTPs are persisted in review artifacts.

## Status
Local review and implementation complete, including a second independent review pass. Final integrated suite: 194 files / 742 tests pass; lint and typecheck pass; dependency audit reports zero vulnerabilities. Production build and browser/HTTP checks are recorded in [validation-report.md](validation-report.md).

Live email receipt/verification awaits the user's code and confirmation. Production deployment, Google OAuth completion, and live payment verification have not been performed. Release requirements and remaining findings are explicit in the validation report.

The coordinated frontend/backend candidate and rollout sequence are recorded in [release.md](release.md).
