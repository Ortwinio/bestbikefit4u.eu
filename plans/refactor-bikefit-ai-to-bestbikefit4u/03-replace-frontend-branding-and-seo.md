# Step 03: Replace Frontend Branding And SEO

## Objective

Replace BikeFit AI branding across frontend user surfaces and metadata while preserving route behavior and localization.

## Inputs

- `plans/refactor-bikefit-ai-to-bestbikefit4u/output-02-brand-replacement-spec.md`
- `src/app/layout.tsx`
- `src/app/(public)/**/*`
- `src/app/(auth)/**/*`
- `src/components/layout/**/*`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

## Tasks

1. Implement centralized brand usage in app shell and shared components (header/footer/sidebar/auth layouts).
2. Replace user-facing brand strings in:
   - landing/public pages
   - auth pages
   - dashboard navigation labels
   - FAQ/privacy/terms/contact/about content where branding appears
3. Replace SEO metadata references:
   - page titles and descriptions
   - OpenGraph/Twitter values
   - structured data `name`/`publisher`/`site` values
4. Update localized message catalogs to keep EN/NL parity.
5. Save implementation notes and changed file list to `plans/refactor-bikefit-ai-to-bestbikefit4u/output-03-frontend-rebrand.md`.
6. Update plan status in `plans/refactor-bikefit-ai-to-bestbikefit4u/README.md`.

## Deliverable

- Frontend and SEO branding replacement completed with localization parity and no route regressions.

## Completion Checklist

- [ ] Shared layouts/components use canonical brand source.
- [ ] Public/auth/dashboard copy is updated to BestBikeFit4U.
- [ ] SEO metadata and structured data reflect new identity.
- [ ] EN and NL copy remains consistent.
- [ ] Output file is created and linked in the plan README.
