# Output 01: Prototyper UI Website Audit

## Objective

First concrete audit pass for the new hard rule:

- public website pages must use approved Prototyper UI patterns only
- no other UI layer is allowed on touched website surfaces

This audit covers:

- `src/app/(public)`
- `src/app/(auth)`
- shared website-facing components in `src/components/public`
- shared website-facing layout components in `src/components/layout`

## Audit Result

The website is **not currently compliant** with the new Prototyper UI-only rule.

The dominant non-compliance patterns are:

1. Public/auth surfaces import the repo-local custom UI layer from `@/components/ui` or `@/components/ui/*`.
2. Several public pages still use page-local Tailwind-built cards, sections, alerts, and CTA bands instead of approved Prototyper UI layout/display components.
3. Public calculator forms reuse dashboard/profile UI patterns such as `SliderQuestion`, which is outside the approved website UI contract.
4. Shared public primitives are built on the custom local UI layer, so pages that consume them inherit non-compliance even when the page file itself looks clean.

## Rule For This Migration

For website surfaces, the following should be treated as **non-compliant until replaced or wrapped by approved Prototyper UI components**:

- `@/components/ui/Button`
- `@/components/ui/Card`
- `@/components/ui/Input`
- `@/components/ui/Select`
- `@/components/ui/InfoBox`
- `@/components/ui/Toast`
- `@/components/ui/Tooltip`
- `@/components/profile/RidingStyleCard` `SliderQuestion`
- page-local “card”, “panel”, “hero”, “band”, or “alert” div stacks built directly from ad hoc Tailwind classes

Approved target families from Prototyper UI for this migration:

- `button`
- `card`
- `section`
- `container`
- `columns`
- `row`
- `field`
- `input`
- `textarea`
- `select`
- `number-field`
- `slider`
- `alert`
- `badge`
- `toast`
- `dialog` / `drawer`
- `menu` / `navigation-menu`
- `tooltip`
- `separator`

## Priority Checklist

### P0 Foundation: migrate shared website primitives first

These components are inherited by many public pages. They should be migrated before or together with page work.

| File | Current non-compliant usage | Prototyper UI target | Priority |
|---|---|---|---|
| [PublicPrimitives.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicPrimitives.tsx) | Built on local `Card`, `CardHeader`, `CardContent`, `CardDescription`, `CardTitle`, `InfoBox`; ad hoc chips and hero layouts | `card`, `section`, `container`, `row`, `badge`, `alert` | P0 |
| [PublicCtaBand.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicCtaBand.tsx) | Local `Card`-based CTA band | `card`, `section`, `row`, `button` | P0 |
| [PublicSurfaceCard.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicSurfaceCard.tsx) | Wrapper around local `Card` contract | Replace with Prototyper `card` wrapper or remove and use `card` directly | P0 |
| [PublicInfoPanel.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicInfoPanel.tsx) | Local `InfoBox` | `alert` | P0 |
| [PublicSection.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicSection.tsx) | Local `Card` section shell | `section`, `container`, `card` | P0 |
| [PublicIllustrationPanel.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicIllustrationPanel.tsx) | Custom public panel pattern | `card`, `row`, `badge` or `alert` depending on intent | P0 |
| [BikeQuickCheckCard.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/BikeQuickCheckCard.tsx) | Local `Button`, `Input`, `InfoBox`, custom card shell | `button`, `field`, `input`, `alert`, `card` | P0 |
| [PainPointPageTemplate.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PainPointPageTemplate.tsx) | Local `Button` plus ad hoc `dashboard-card-surface` sections | `section`, `card`, `columns`, `button`, `alert` | P0 |
| [CaseStudyRecruitmentForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/CaseStudyRecruitmentForm.tsx) | Local `Button`, `Card`, `FieldLabel`, `Input`, `Textarea`, `useToast` | `form`, `field`, `input`, `textarea`, `button`, `toast`, `card` | P0 |

### P1 High-intent website pages

These directly affect acquisition and conversion. They should not ship until they are Prototyper UI-compliant.

| File | Current non-compliant usage | Prototyper UI target | Priority |
|---|---|---|---|
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/page.tsx) | Local `Button`; heavy page-local hero/trust/card patterns | `section`, `container`, `card`, `button`, `badge`, `columns`, `row` | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/pricing/page.tsx) | Local `Button`; ad hoc plan-card and proof layouts | `section`, `card`, `columns`, `button`, `badge`, `alert`, `separator` | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(auth)/login/page.tsx) | Local `Button`, `Input`, `Card`, `CardHeader`, `CardTitle`, `CardContent`; inline custom form layout | `card`, `form`, `field`, `input`, `button`, `alert`, `separator` | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/contact/page.tsx) | Local `Button` plus inherited shared non-compliance | `section`, `card`, `button`, `alert` | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/faq/page.tsx) | Local `Button`, custom FAQ CTA and page framing | `section`, `card`, `accordion`, `button`, `alert` | P1 |

### P1 Calculators

Calculator surfaces are a separate migration cluster because they combine layout, forms, and conversion modules.

| File | Current non-compliant usage | Prototyper UI target | Priority |
|---|---|---|---|
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/bike-fit/page.tsx) | Local `Button`, custom hero/result sections | `section`, `card`, `button`, `alert` | P1 |
| [BikeFitCalculatorForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/bike-fit/BikeFitCalculatorForm.tsx) | `SliderQuestion` from dashboard/profile UI | `form`, `field`, `slider`, `radio-group` or `segmented-control` where appropriate | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/saddle-height/page.tsx) | Local `Button`, custom result layout | `section`, `card`, `button`, `alert` | P1 |
| [SaddleHeightCalculatorForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.tsx) | `SliderQuestion` from dashboard/profile UI | `form`, `field`, `slider`, `radio-group` or `segmented-control` | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/frame-size/page.tsx) | Local `Button`, custom result layout | `section`, `card`, `button`, `alert` | P1 |
| [FrameSizeCalculatorForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/frame-size/FrameSizeCalculatorForm.tsx) | `SliderQuestion` from dashboard/profile UI | `form`, `field`, `slider`, `radio-group` or `segmented-control` | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/crank-length/page.tsx) | Local `Button`, `Input`, `Select`; ad hoc form/result panels | `form`, `field`, `input`, `select`, `button`, `card`, `alert` | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/bandenspanning-calculator/page.tsx) | Requires full check through shared/public calculator surface contract | `form`, `field`, `input`/`number-field`, `select`, `button`, `card`, `alert` | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/tire-pressure/[slug]/page.tsx) | Local `Button`, custom conversion CTA layout | `section`, `card`, `button`, `alert` | P1 |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/bandenspanning/[slug]/page.tsx) | Local `Button`, custom conversion CTA layout | `section`, `card`, `button`, `alert` | P1 |

### P2 Content-heavy public pages

These are lower purchase-intent than homepage/pricing, but still must converge on the same UI system.

| File group | Current non-compliant usage | Prototyper UI target | Priority |
|---|---|---|---|
| [about/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/about/page.tsx), [case-study/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/case-study/page.tsx), [how-it-works/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/how-it-works/page.tsx), [why-bikefit-matters/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/why-bikefit-matters/page.tsx), [measurement-guide/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/measurement-guide/page.tsx) | Local `Button` and inherited public primitive non-compliance | `section`, `container`, `card`, `button`, `alert`, `separator` | P2 |
| [guides/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/page.tsx), [guides/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx) | Local `Button`, `Card`, `CardContent`, multiple ad hoc `dashboard-card-surface` blocks | `section`, `card`, `columns`, `button`, `badge` | P2 |
| [use-cases/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/use-cases/page.tsx), [use-cases/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/use-cases/[slug]/page.tsx) | Local `Button`, `Card`, `CardContent`, ad hoc CTA/card compositions | `section`, `card`, `columns`, `button`, `badge`, `alert` | P2 |
| [pain/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/pain/page.tsx), [pain/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/pain/[slug]/page.tsx) | Local `Button`, `Card`, `CardContent`, template-level ad hoc blocks | `section`, `card`, `columns`, `button`, `alert` | P2 |
| [science/*](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/science/bike-fit-methods/page.tsx), [science/*](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/science/calculation-engine/page.tsx), [science/*](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/science/stack-and-reach/page.tsx) | Inherited public primitive non-compliance and local content framing | `section`, `card`, `accordion`, `separator`, `badge` | P2 |
| [fit-pass/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/fit-pass/page.tsx) | Needs explicit UI compliance pass due to icon-led marketing card patterns | `section`, `card`, `badge`, `button` | P2 |

### P2 Shared website layout

These are globally visible website surfaces and must align with the same system.

| File | Current non-compliant usage | Prototyper UI target | Priority |
|---|---|---|---|
| [HeaderAuthActions.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/HeaderAuthActions.tsx) | Local `Button` | `button` | P2 |
| [HeaderMobileMenu.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/HeaderMobileMenu.tsx) | Local `Button`, ad hoc mobile menu | `button`, `dialog` or `drawer`, `navigation-menu` or `menu` | P2 |
| [LanguageSwitch.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/LanguageSwitch.tsx) | Custom segmented control styling | `segmented-control` | P2 |
| [CookieConsentBanner.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/CookieConsentBanner.tsx) | Local `Button`, `useToast`, custom banner shell | `card`, `button`, `toast`, `dialog` or `alert` depending final pattern | P2 |
| [Header.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/Header.tsx) | Custom nav markup and styling | `navigation-menu`, `button`, `container` | P2 |
| [Footer.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/Footer.tsx) | Custom footer layout and link grouping | `section`, `container`, `columns`, `separator` | P2 |

## Concrete Non-Prototyper UI Usage Checklist

Use this as the first working migration checklist.

### Foundation

- [ ] Replace the public shared primitives layer so website pages no longer depend on local `Card`/`InfoBox`/custom CTA wrappers.
- [ ] Replace `BikeQuickCheckCard` form controls and notices with Prototyper `field`, `input`, `button`, and `alert`.
- [ ] Replace `PublicSurfaceCard` with a Prototyper `card`-based wrapper or remove it entirely.

### Homepage and conversion

- [ ] Migrate homepage hero, trust strip, calculator teaser, and CTA modules to Prototyper `section`, `card`, `button`, `badge`, and layout primitives.
- [ ] Migrate `/pricing` plan cards, comparison framing, and proof modules to Prototyper `card`/`section`/`button`/`alert`.
- [ ] Migrate `/login` card/form flow to Prototyper `form`, `field`, `input`, `button`, and `card`.

### Calculators

- [ ] Remove `SliderQuestion` usage from public calculators.
- [ ] Rebuild public calculator forms with Prototyper `form`, `field`, `input`, `number-field`, `select`, and `slider`.
- [ ] Rebuild calculator result/next-step modules with Prototyper `card`, `alert`, `button`, and layout primitives.

### Content pages

- [ ] Replace ad hoc `dashboard-card-surface` marketing blocks on guides/use-cases/pain/science pages with Prototyper `card` and `section` compositions.
- [ ] Replace page-local CTA bands and trust boxes with Prototyper `card`, `alert`, and `button` patterns.

### Layout

- [ ] Replace website header navigation with Prototyper navigation primitives where appropriate.
- [ ] Replace mobile menu with Prototyper `drawer` or `dialog` plus `navigation-menu`/`menu`.
- [ ] Replace language switch with Prototyper `segmented-control`.
- [ ] Replace consent banner actions/notices with Prototyper `card`, `button`, and `toast`/`alert`.

### Cleanup and validation

- [ ] Remove obsolete website-facing wrappers from `src/components/ui` usage in touched files.
- [ ] Remove dead public UI helpers once their Prototyper replacements are in place.
- [ ] Add tests that fail if touched website pages regress to non-approved UI usage patterns.
- [ ] Complete a security review of touched public/auth flows after migration.

## Immediate Recommended Sequence

1. Migrate shared public primitives.
2. Migrate homepage, pricing, and login.
3. Migrate calculators and calculator forms.
4. Migrate FAQ, contact, guides, use-cases, pain, science, and other content pages.
5. Migrate header/mobile menu/language switch/cookie banner/footer.
6. Remove dead code, run tests, and perform security review.

## Notes

- This is a first focused pass, not the final exhaustive migration proof.
- Some pages may appear clean locally but still inherit non-compliance through shared public components.
- Under the new rule, using the repo-local `@/components/ui` website layer is not sufficient. Website surfaces must converge on approved Prototyper UI patterns.
