# Step 02: i18n Foundation

## Objective

Implement the i18n core primitives and locale routing behavior without yet translating all pages.

## Inputs

- `plans/feature-multilingual-homepage-switch/output-01-i18n-architecture.md`
- `src/app/layout.tsx`
- `src/proxy.ts`
- `next.config.ts`

## Tasks

1. Add locale config/constants:
   - Supported locales: `en`, `nl`.
   - Default locale and helper guards.
2. Add dictionary loading utilities:
   - Server-safe loader for locale namespaces.
   - Type-safe translation access API.
3. Implement locale routing behavior:
   - Handle `/` redirect to preferred locale.
   - Ensure existing auth behavior remains correct for localized routes.
4. Add locale persistence:
   - Set/update locale cookie when user changes language.
5. Wire locale into root rendering:
   - Ensure active locale drives `<html lang>` and route params.
6. Produce `plans/feature-multilingual-homepage-switch/output-02-i18n-foundation.md` with changed files and validation notes.
7. Update plan status in `plans/feature-multilingual-homepage-switch/README.md`.

## Deliverable

- Working locale infrastructure and route negotiation.
- Foundation output document.
- Updated status row for step 02.

## Completion Checklist

- [x] `/` resolves to locale-aware URL using defined fallback order.
- [x] Locale cookie is read/written correctly.
- [x] No regression in protected route redirect behavior.
- [x] `<html lang>` reflects active locale.
- [x] README status updated.
