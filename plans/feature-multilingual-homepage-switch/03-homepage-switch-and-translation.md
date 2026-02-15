# Step 03: Homepage Switch and Translation

## Objective

Deliver the user-visible milestone: translated homepage (EN/NL) plus a working language switch on the homepage.

## Inputs

- `plans/feature-multilingual-homepage-switch/output-02-i18n-foundation.md`
- `src/app/(public)/page.tsx`
- `src/components/layout/Header.tsx`
- `src/app/(public)/layout.tsx`

## Tasks

1. Extract homepage copy into dictionaries:
   - Hero, feature cards, how-it-works, recommendation list, CTAs.
2. Implement locale-aware homepage rendering:
   - Replace hard-coded English strings with dictionary keys.
3. Build language switch UI in homepage header:
   - Toggle between `EN` and `NL`.
   - Preserve current path/query when switching.
   - Indicate active locale accessibly.
4. Ensure locale-aware links on homepage and header:
   - Prevent navigation from dropping locale segment.
5. Verify responsive behavior for switch on mobile and desktop.
6. Produce `plans/feature-multilingual-homepage-switch/output-03-homepage-switch-and-translation.md`.
7. Update plan status in `plans/feature-multilingual-homepage-switch/README.md`.

## Deliverable

- Homepage fully translated for EN/NL.
- Language switch visible and functional on homepage.
- Updated status row for step 03.

## Completion Checklist

- [x] Homepage renders complete copy in both languages.
- [x] Switch toggles locale without broken routes.
- [x] Switch is keyboard accessible and has proper labels.
- [x] Locale persists after refresh/new navigation.
- [x] README status updated.
