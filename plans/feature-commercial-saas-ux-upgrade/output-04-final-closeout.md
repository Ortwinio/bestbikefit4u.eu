# Final Closeout

Date: 2026-04-08

## Scope Summary

This closeout covers the public acquisition and activation redesign for:

- homepage
- login/start page
- pricing
- public calculators
- FAQ and contact
- shared public UI primitives
- public icon treatment
- theme token and light/dark/system behavior
- website-facing feedback/layout/security validation

## Completed Work

### Homepage

Completed:

- homepage funnel restructured toward first value
- shared homepage/public surfaces migrated onto Prototyper-facing primitives
- homepage trust/proof surfaces and quotes section aligned with the public surface system
- homepage EN/NL copy and CTA structure covered by tests

Primary files:

- `src/app/(public)/page.tsx`
- `src/components/home/QuotesCarousel.tsx`
- `src/components/public/PublicPrimitives.tsx`
- `src/components/public/PublicSurfaceCard.tsx`
- `src/components/public/BikeQuickCheckCard.tsx`

### Login and Pricing

Completed:

- login reframed as a create-account/sign-in start page without changing auth mechanics
- pricing upgraded with clearer Free vs Pro outcome framing and proof modules
- legacy website UI imports removed from touched auth/pricing surfaces

Primary files:

- `src/app/(auth)/login/page.tsx`
- `src/app/(public)/pricing/page.tsx`
- `src/config/commercial.ts`

### Calculators, FAQ, Contact

Completed:

- bike-fit, saddle-height, frame-size, crank-length, and tire-pressure now use a consistent next-step CTA bridge pattern
- crank-length calculator migrated to public/prototyper form primitives
- FAQ and contact converted from support-only pages into trust-and-conversion surfaces

Primary files:

- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/crank-length/page.tsx`
- `src/app/(public)/calculators/crank-length/CrankLengthCalculatorForm.tsx`
- `src/app/(public)/bandenspanning-calculator/page.tsx`
- `src/components/features/pressure/PressureCalculatorCta.tsx`
- `src/app/(public)/faq/page.tsx`
- `src/app/(public)/contact/page.tsx`

### Icons and Theme

Completed:

- public icon treatment now uses a shared badge contract instead of repeated ad hoc wrappers
- public surface tokens in `globals.css` now define clearer base/subtle/strong public surfaces
- shared public primitives consume those utilities for hero/card/CTA consistency
- theme reactivity for light/dark/system remains covered by tests

Primary files:

- `src/components/public/PublicIconBadge.tsx`
- `src/components/public/PublicPrimitives.tsx`
- `src/components/public/PublicSurfaceCard.tsx`
- `src/components/public/PublicCtaBand.tsx`
- `src/app/globals.css`
- `src/components/providers/ThemeProvider.test.tsx`

### Website UI and Security Gate

Completed:

- website-facing feedback/layout surfaces moved to Prototyper-facing imports
- security note recorded for website/auth surfaces
- allowed `dangerouslySetInnerHTML` usage documented as static JSON-LD only

Primary files:

- `src/components/feedback/FeedbackDialog.tsx`
- `src/components/feedback/FeedbackDetailDialog.tsx`
- `src/components/feedback/FeedbackHubPage.tsx`
- `src/components/layout/HeaderMobileMenu.tsx`
- `src/components/layout/HeaderAuthActions.tsx`
- `src/components/layout/CookieConsentBanner.tsx`
- `src/app/layout.tsx`
- `plans/feature-commercial-saas-ux-upgrade/output-03-gate-e-validation.md`

## Validation Performed

Automated checks run during closeout:

```bash
npx vitest run \
  'src/components/feedback/FeedbackFloatingButton.test.tsx' \
  'src/components/providers/ThemeProvider.test.tsx' \
  'src/app/(auth)/login/page.test.tsx' \
  'src/app/(public)/pricing/page.test.tsx' \
  'src/app/(public)/page.test.tsx' \
  'src/app/(public)/calculators/crank-length/page.test.tsx' \
  'src/app/(public)/faq/page.test.tsx' \
  'src/app/(public)/contact/page.test.tsx'
```

Result:

- 9 files passed
- 16 tests passed

```bash
npx vitest run \
  'src/app/(public)/calculators/bike-fit/page.test.tsx' \
  'src/app/(public)/calculators/frame-size/page.test.tsx' \
  'src/app/(public)/calculators/saddle-height/page.test.tsx' \
  'src/components/features/pressure/PressureCalculatorCta.test.tsx' \
  'src/components/layout/HeaderAuthActions.test.tsx'
```

Result:

- 5 files passed
- 6 tests passed

```bash
npx vitest run \
  'src/app/(public)/page.test.tsx' \
  'src/app/(public)/pricing/page.test.tsx' \
  'src/app/(auth)/login/page.test.tsx' \
  'src/app/(public)/calculators/bike-fit/page.test.tsx' \
  'src/app/(public)/calculators/frame-size/page.test.tsx' \
  'src/app/(public)/calculators/saddle-height/page.test.tsx' \
  'src/app/(public)/calculators/crank-length/page.test.tsx' \
  'src/app/(public)/faq/page.test.tsx' \
  'src/app/(public)/contact/page.test.tsx' \
  'src/components/public/BikeQuickCheckCard.test.tsx' \
  'src/components/providers/ThemeProvider.test.tsx'
```

Result:

- 11 files passed
- 24 tests passed

Compliance checks run:

```bash
rg -n "@/components/ui|InfoBox|SliderQuestion|variant=\"bordered\"" \
  src/components/feedback src/components/public 'src/app/(public)' 'src/app/(auth)'
```

Result:

- no matches on website-facing reviewed surfaces

## Acceptance Status

### Met

- homepage, login, pricing, calculator, FAQ, and contact code paths are implemented and covered by targeted regression tests
- touched website surfaces use approved Prototyper-facing UI imports
- icon treatment is consistent on shared public card/icon surfaces
- public theme token contract is clearer and centralized in `globals.css`
- light/dark/system behavior is covered by automated tests
- website security note exists and documents the JSON-LD exception

### Not Fully Closed

- browser-based acceptance was executed and recorded in `output-06-browser-acceptance-report.md`
- a stable production-like rerun was completed on `http://localhost:3002`
- CTA browser-path verification now passes for homepage, pricing, and tire-pressure
- the closeout still cannot move to `ready` because the production-backed browser pass found blockers:
  - real React production runtime errors (`#418`) on login and calculator routes
  - local-only Vercel script 404 noise still inflates raw route-failure counts until filtered from the harness
- kanban task registry remains inconsistent for some non-zero-padded task IDs, so board state is less reliable than workspace state

## Residual Risks

- some public content pages still use the older `dashboard-card-surface` utility name even though the touched website UI layer is Prototyper-compliant; this is now naming debt more than structural debt
- dashboard-only surfaces still contain legacy UI imports outside this website scope
- manual visual QA could still expose spacing or contrast issues that are not visible in unit tests
- browser acceptance already exposed real runtime issues that still need correction before merge closeout
- the production-like rerun narrowed the remaining real blocker class to runtime React issues on auth/calculator surfaces rather than CTA routing

## Deferred Follow-Ups

- rename remaining public uses of `dashboard-card-surface` to a website-specific utility to remove naming ambiguity
- fix the production React runtime blockers documented in `output-06-browser-acceptance-report.md`
- re-run browser-based mobile and desktop route checks for homepage, login, pricing, calculators, FAQ, and contact
- re-run explicit analytics sanity verification for primary CTA paths in a local browser session
- extend the Prototyper-only migration into dashboard surfaces if that rule is intended repo-wide rather than website-only

## Merge Recommendation

Recommendation: `not ready` for final merge.

Reason:

- engineering acceptance for the touched website funnel is strong and automated checks are green
- browser-based QA is now executed, but it found blockers that prevent signoff

Operationally, this is ready for code review and final manual acceptance, but not yet ready for an unconditional merge closeout.
