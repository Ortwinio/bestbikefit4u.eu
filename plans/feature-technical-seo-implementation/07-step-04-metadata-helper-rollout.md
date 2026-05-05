# Step 04 — Shared Metadata Helper Rollout

## Objective

Refactor public route families to use shared metadata contracts so titles, descriptions, canonicals, alternates, and OG fields are predictable and maintainable.

## Background

Read:
- `plans/feature-technical-seo-implementation/05-step-02-canonical-and-hreflang.md`
- `src/app/layout.tsx`
- `src/i18n/metadata.ts`
- public pages under `src/app/(public)/`
- guide metadata handling in `src/app/(public)/guides/[slug]/page.tsx`

## Tasks

1. Define or extend shared metadata helpers for:
   - static public pages
   - calculators
   - guides/article-style pages
2. Roll those helpers out across the main route families.
3. Remove route-local metadata drift where the helper can express the policy.
4. Keep guide CMS fields integrated for guide page metadata.
5. Add targeted tests where metadata behavior is fragile.

## Validation

- Targeted metadata tests
- `npm run test:i18n`
- Manual source inspection on representative pages

## Output

Write `output-07-step-04-metadata-helper-rollout.md`:
- helper structure
- route families migrated
- deviations kept intentionally
- validation results
