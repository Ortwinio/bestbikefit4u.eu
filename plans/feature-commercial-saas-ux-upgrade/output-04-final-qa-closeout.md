# Final QA Closeout

Date: 2026-04-08

## Scope

This closeout covers the public acquisition and activation redesign across:

- homepage
- auth start page
- pricing
- public calculators
- FAQ and contact
- shared public/layout/theme surfaces used by those pages

Dashboard-only follow-up work remains out of scope.

## Files Changed By Lane

### Homepage / shared homepage funnel

- `src/app/(public)/page.tsx`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- `src/components/public/BikeQuickCheckCard.tsx`
- `src/components/public/BikeQuickCheckCard.test.tsx`
- `src/app/(public)/page.test.tsx`

### Auth / pricing

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/login/page.test.tsx`
- `src/app/(public)/pricing/page.tsx`
- `src/app/(public)/pricing/page.test.tsx`
- `src/config/commercial.ts`

### Calculators / FAQ / contact / shared website shell

- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/calculators/bike-fit/page.test.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/frame-size/page.test.tsx`
- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/saddle-height/page.test.tsx`
- `src/app/(public)/calculators/crank-length/page.tsx`
- `src/app/(public)/calculators/crank-length/page.test.tsx`
- `src/components/features/pressure/PressureCalculatorCta.tsx`
- `src/components/features/pressure/PressureCalculatorCta.test.tsx`
- `src/app/(public)/faq/page.tsx`
- `src/app/(public)/faq/page.test.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/contact/page.test.tsx`
- `src/components/layout/HeaderAuthActions.tsx`
- `src/components/layout/HeaderAuthActions.test.tsx`
- `src/components/layout/HeaderMobileMenu.tsx`
- `src/components/layout/CookieConsentBanner.tsx`
- `src/components/auth/UserMenu.tsx`

### Theme / provider / closeout fixes

- `src/app/globals.css`
- `src/components/providers/ThemeProvider.tsx`
- `src/components/providers/ThemeProvider.test.tsx`
- `src/components/feedback/FeedbackDialog.tsx`

## Validation Performed

### Regression suites

```bash
npm test -- 'src/app/(public)/page.test.tsx' 'src/app/(auth)/login/page.test.tsx' 'src/app/(public)/pricing/page.test.tsx' 'src/app/(public)/faq/page.test.tsx' 'src/app/(public)/contact/page.test.tsx' 'src/app/(public)/calculators/bike-fit/page.test.tsx' 'src/app/(public)/calculators/frame-size/page.test.tsx' 'src/app/(public)/calculators/saddle-height/page.test.tsx' 'src/app/(public)/calculators/crank-length/page.test.tsx' 'src/components/features/pressure/PressureCalculatorCta.test.tsx' 'src/components/layout/HeaderAuthActions.test.tsx' 'src/components/providers/ThemeProvider.test.tsx' src/components/public/BikeQuickCheckCard.test.tsx src/i18n/messages/messages-parity.test.ts
```

Result:

- 15 test files passed
- 31 tests passed

Focused follow-up after compile-fix pass:

```bash
npm test -- 'src/app/(auth)/login/page.test.tsx' 'src/components/providers/ThemeProvider.test.tsx' 'src/components/feedback/FeedbackFloatingButton.test.tsx'
```

Result:

- passed

### Typecheck

```bash
npm run typecheck
```

Result:

- still fails, but only on pre-existing unrelated test typing issues:
  - `convex/authLocalDev.test.ts`
  - `src/lib/rateLimiter.test.ts`
  - `src/lib/reports/pdfLayoutTemplate.test.ts`

The touched public/auth/theme files no longer contribute typecheck failures.

### Analytics / CTA route sanity

Reviewed by source inspection with:

```bash
rg -n 'TrackMarketingEventOnView|TrackedCtaLink|conversionKey|section=' 'src/app/(public)' 'src/app/(auth)' 'src/components/public' 'src/components/features/pressure' 'src/components/layout'
```

Confirmed:

- homepage keeps tracked `hero_primary`, `hero_secondary`, `hero_tertiary`, `recommendation_card`, `final_cta_primary`, `final_cta_secondary`
- pricing keeps tracked plan CTAs and footer CTAs with `pricing_signup`
- login preserves `sourceTag` propagation and funnel/login event logging
- calculators keep tracked result and upgrade paths
- FAQ/contact keep tracked conversion/support links

### Theme review

Reviewed by source inspection plus tests:

- shared public surface hierarchy now lives in `src/app/globals.css`
- `system` mode now updates `resolvedTheme` in `src/components/providers/ThemeProvider.tsx`
- light/dark/system behavior verified by `src/components/providers/ThemeProvider.test.tsx`

### Mobile / desktop / usability review

Reviewed by source inspection of touched public/auth surfaces and their responsive class structure:

- homepage
- login
- pricing
- bike-fit, frame-size, saddle-height, crank-length, tire-pressure calculator CTA paths
- FAQ
- contact

Assessment:

- no obvious responsive-class regressions introduced in the touched pages
- CTA hierarchy remains single-primary on the key funnel surfaces
- public/layout/auth touched surfaces remain on approved Prototyper-facing primitives

## Security / policy notes

- `localhost` dev login messaging and gating remain explicit in `src/app/(auth)/login/page.tsx`
- structured-data `dangerouslySetInnerHTML` usage remains limited to JSON-LD injection on static public pages
- no new unsupported commercial claims were introduced during this closeout pass

## Residual Risks

- `npm run typecheck` still fails on unrelated baseline test typing issues outside this redesign slice.
- The local test runner is also discovering mirrored `.tmp` worktree test files, which can inflate file counts in Vitest output without changing pass/fail status for the real source tree.
- This closeout used targeted automated checks and source inspection; it did not include a browser-based visual pass with screenshots on physical mobile and desktop devices.

## Deferred Follow-Ups

- Fix the pre-existing test typing failures in `convex/authLocalDev.test.ts`, `src/lib/rateLimiter.test.ts`, and `src/lib/reports/pdfLayoutTemplate.test.ts`.
- Exclude `.tmp/` worktrees from Vitest discovery so regression counts reflect only the active repo tree.
- If the Prototyper-only standard is expanded beyond the website, migrate remaining dashboard-only legacy UI usage separately.

## Merge Recommendation

Ready for scoped merge.

Rationale:

- All board tasks for this plan are complete.
- Public funnel regression coverage is in place and passing.
- Touched auth/theme compile regressions found during closeout were fixed.
- Remaining typecheck failures are pre-existing and outside the public acquisition/auth/theme slice covered by this board.
