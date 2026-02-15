# Step 05 Output: Testing, Docs, and Rollout

## Summary

Completed Step 05 with automated validation, guardrails, and documentation for multilingual maintenance.

Delivered in this step:

1. Unit tests for locale parsing/selection and dictionary loading/fallback.
2. Integration tests for locale redirect, cookie precedence, localized auth redirect, and query-preserving language switching.
3. E2E smoke tests for EN/NL homepage locale flow and language switching.
4. Untranslated-key guard via translation catalog parity tests.
5. i18n architecture + QA documentation.

## Test Coverage Added

### Unit tests

- `src/i18n/config.test.ts`
  - locale normalization
  - `Accept-Language` q-weight handling
  - cookie precedence behavior
- `src/i18n/getDictionary.test.ts`
  - EN/NL dictionary loading
  - fallback to default locale on unsupported/empty locale
- `src/i18n/messages/messages-parity.test.ts`
  - translation key-path parity between `en` and `nl`
  - value-shape compatibility guard

### Integration tests

- `tests/integration/locale-routing.integration.test.ts`
  - `/` redirect from `Accept-Language`
  - cookie precedence over `Accept-Language`
  - localized public rewrite behavior
  - localized dashboard unauth redirect to localized login
  - query-preserving language switch href behavior

### E2E smoke tests

- `tests/e2e/homepage-language-switch.e2e.test.ts`
  - first-visit Dutch flow (`/` -> `/nl`) + switch to English
  - cookie-driven subsequent unprefixed navigation (`/pricing` -> `/en/pricing`)

## Runtime/Testability Refactor

Added pure routing decision helper to make middleware behavior directly testable:

- `src/i18n/proxyDecision.ts` (new)
- `src/proxy.ts` updated to consume `decideProxyAction`

Added pure switch href helper for query-preserving locale toggles:

- `src/i18n/switchHref.ts` (new)
- `src/components/layout/LanguageSwitch.tsx` updated to use helper

## Guardrails and Scripts

`package.json` scripts added:

- `test:i18n`
- `test:e2e:i18n`

These support fast multilingual regression checks in CI and local development.

## Documentation Updates

- Added `docs/I18N.md`:
  - architecture summary
  - core file map
  - request lifecycle
  - how to add translation keys safely
  - multilingual QA checklist
- Updated `README.md` with a concise internationalization section pointing to `docs/I18N.md`.

## Validation Run

Commands executed:

```bash
npm run test:i18n
npm run test:e2e:i18n
npm run typecheck
npx eslint src/proxy.ts src/i18n/*.ts src/i18n/messages/*.ts tests/integration/locale-routing.integration.test.ts tests/e2e/homepage-language-switch.e2e.test.ts
npm test
```

Result: all passing.

## Residual Localization Gaps

Known deferred locale-link gaps remain outside this step scope (already tracked in Step 04 output):

- calculator cross-links in `src/app/(public)/calculators/*`
- dashboard sidebar links in `src/components/layout/DashboardSidebar.tsx`
