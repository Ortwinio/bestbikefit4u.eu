# Step 04: Shared Pages Localization

## Objective

Expand localization beyond homepage so the surrounding user experience is consistently bilingual.

## Inputs

- `plans/feature-multilingual-homepage-switch/output-03-homepage-switch-and-translation.md`
- `src/components/layout/Footer.tsx`
- `src/app/not-found.tsx`
- `src/app/(auth)/login/page.tsx`
- Public informational pages under `src/app/(public)/`

## Tasks

1. Localize shared chrome:
   - Header navigation labels.
   - Footer sections and link labels.
2. Localize high-traffic static pages:
   - About, pricing, FAQ, contact, measurement guide, privacy, terms (at minimum).
3. Localize core system pages:
   - Not-found page and any shared error/loading copy visible to users.
4. Ensure locale-aware metadata/canonical behavior:
   - Locale-specific titles/descriptions where available.
   - Add alternate/hreflang metadata strategy.
5. Identify untranslated strings with an audit command and log follow-up items.
6. Produce `plans/feature-multilingual-homepage-switch/output-04-shared-pages-localization.md`.
7. Update plan status in `plans/feature-multilingual-homepage-switch/README.md`.

## Deliverable

- Consistent EN/NL localization for shared navigation and key pages.
- Translation coverage report with any deferred items.
- Updated status row for step 04.

## Completion Checklist

- [x] Header and footer are translated in both locales.
- [x] Key public pages have EN/NL content.
- [x] Locale metadata strategy is implemented and verified.
- [x] Remaining untranslated strings are explicitly listed.
- [x] README status updated.
