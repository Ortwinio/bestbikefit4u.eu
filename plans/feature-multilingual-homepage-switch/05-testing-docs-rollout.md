# Step 05: Testing, Docs, and Rollout

## Objective

Harden multilingual behavior with automated tests, manual QA, and maintenance documentation.

## Inputs

- `plans/feature-multilingual-homepage-switch/output-04-shared-pages-localization.md`
- Existing test setup in `vitest.config.ts` and `tests/`
- `README.md`

## Tasks

1. Add unit tests:
   - Locale parsing/validation helpers.
   - Dictionary loading and fallback behavior.
2. Add integration tests:
   - `/` locale redirect and cookie precedence.
   - Locale-preserving switch behavior.
   - Auth route behavior for localized paths.
3. Add E2E smoke checks for EN/NL homepage flow and language switching.
4. Add a lightweight untranslated-key guard (test or lint script) to prevent regressions.
5. Update docs:
   - i18n architecture summary and how to add new translation keys.
   - QA checklist for multilingual verification.
6. Update plan status to complete in `plans/feature-multilingual-homepage-switch/README.md`.

## Deliverable

- Test coverage for key multilingual paths.
- Updated documentation for i18n maintenance.
- Plan marked complete.

## Completion Checklist

- [x] Unit, integration, and E2E multilingual checks are added and passing.
- [x] Locale switch and redirect rules are test-covered.
- [x] Untranslated-key guard is in place.
- [x] Documentation explains how to extend/maintain EN/NL translations.
- [x] README status updated to `COMPLETE`.
