# Step 01: i18n Architecture

## Objective

Define and document the concrete multilingual architecture (EN/NL) before moving files or changing routes.

## Inputs

- `plans/feature-multilingual-homepage-switch/README.md`
- `src/app/layout.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/proxy.ts`

## Tasks

1. Choose and document routing strategy:
   - Locale-prefixed routes (`/en/...`, `/nl/...`) vs non-prefixed strategy.
   - Explicit default-route behavior from `/`.
2. Define locale negotiation order and persistence:
   - `cookie -> Accept-Language -> en`.
   - Cookie name, max-age, and update rules.
3. Define message catalog structure:
   - Base namespaces (for example: `common`, `home`, `auth`, `dashboard`).
   - Type-safe key strategy and fallback behavior.
4. Map migration impact:
   - Which route groups/components move or become locale-aware first.
   - Any auth/proxy edge cases introduced by locale prefixes.
5. Record decisions in `plans/feature-multilingual-homepage-switch/output-01-i18n-architecture.md`.
6. Update plan status in `plans/feature-multilingual-homepage-switch/README.md`.

## Deliverable

- Architecture decision document with routing, dictionary, and fallback rules.
- Updated status row for step 01.

## Completion Checklist

- [x] Locale routing decision is explicit and justified.
- [x] Cookie and Accept-Language fallback logic is documented.
- [x] Translation namespace structure is finalized.
- [x] Proxy/auth interaction risks are identified with mitigations.
- [x] README status updated.
