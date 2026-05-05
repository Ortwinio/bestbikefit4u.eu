# Output 05 — Canonical and Hreflang

## Route families normalized

- Static localized routes continue to use shared locale alternates through `buildLocaleAlternates`.
- Programmatic tire-pressure pages now use the shared `buildLocalizedAlternates` helper instead of route-local absolute URL assembly.
- `x-default` stays English for the EN/NL tire-pressure pair.

## Canonical and alternate policy decisions

- Standard localized public routes use same-locale canonical URLs plus EN/NL alternates and English `x-default`.
- Dutch alias landing pages such as `/bikefitting` and `/fiets-afstellen` keep selective alternates by design; they are separate localized landing pages rather than one-to-one translations of English routes.
- Guide pages still allow a CMS canonical override, but only after hostname/query safety validation in the publish/update flow.

## Files changed

- `src/i18n/metadata.ts`
- `src/i18n/metadata.test.ts`
- `src/lib/seo/programmatic/tirePressure.ts`
- `src/lib/seo/programmatic/tirePressure.test.ts`

## Validation results

- Added tests for default-locale `x-default` behavior on normal localized routes.
- Added tests confirming tire-pressure programmatic routes keep the English page as `x-default`.
- `npm run test:i18n` passed.
