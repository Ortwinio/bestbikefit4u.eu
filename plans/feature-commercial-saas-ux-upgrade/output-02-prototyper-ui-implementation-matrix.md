# Output 02: Prototyper UI Implementation Matrix

## Purpose

This matrix turns the audit into direct execution ownership.

Rules:

- each audited website file group has one primary owner
- no pane should edit outside its assigned write scope without Lead approval
- shared dependencies must be migrated in the listed order to avoid overlap
- task titles are still the kanban source of truth, but this matrix is the file-ownership source of truth

## Global Ownership Rules

### Lead

Owns:

- plan artifacts in `plans/feature-commercial-saas-ux-upgrade/`
- migration audit/checklists
- acceptance review
- integration review
- final QA artifact
- conflict resolution

Does not own routine implementation writes in homepage, pricing, login, calculators, FAQ/contact, or theme files unless a worker is blocked.

### Codex B

Owns:

- homepage and homepage-only website conversion surfaces
- homepage EN/NL copy
- homepage Prototyper UI migration
- homepage tests

### Codex C

Owns:

- auth and pricing conversion surfaces
- auth/pricing EN/NL copy
- auth/pricing Prototyper UI migration
- auth/pricing tests

### Codex D

Owns:

- shared public website primitives
- calculators
- FAQ/contact
- content-heavy public pages after core conversion pages
- website layout migration pieces
- icon consistency
- theme/token migration
- cleanup and security validation across touched public surfaces

## Dependency Order

1. `Codex D` migrates shared public website primitives that other pages depend on.
2. `Codex B` migrates homepage on top of the approved primitive direction.
3. `Codex C` migrates `/login` and `/pricing`.
4. `Codex D` migrates calculators and trust/content pages.
5. `Codex D` migrates shared website layout pieces.
6. `Lead` validates cross-surface consistency and closes gaps.

## Implementation Matrix

| File group | Primary owner | Why | Depends on | Done criteria |
|---|---|---|---|---|
| [PublicPrimitives.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicPrimitives.tsx) | `Codex D` | Shared public foundation used by many public pages | none | Local `@/components/ui` usage removed or replaced by approved Prototyper UI patterns; no dead wrapper code left |
| [PublicCtaBand.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicCtaBand.tsx) | `Codex D` | Shared CTA band affects multiple surfaces | none | Rebuilt on Prototyper `card`/layout/button contract |
| [PublicSurfaceCard.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicSurfaceCard.tsx) | `Codex D` | Shared abstraction around non-compliant card layer | none | Replaced by approved Prototyper wrapper or removed |
| [PublicInfoPanel.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicInfoPanel.tsx) | `Codex D` | Shared notice/alert abstraction | none | Uses Prototyper `alert`; local `InfoBox` dependency removed |
| [PublicSection.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicSection.tsx) | `Codex D` | Shared section layout | none | Uses Prototyper `section`/`container`/`card` patterns |
| [BikeQuickCheckCard.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/BikeQuickCheckCard.tsx) | `Codex D` | Shared homepage/public acquisition block | primitive migration direction | Uses Prototyper `field`, `input`, `button`, `alert`, `card`; no local UI imports |
| [PainPointPageTemplate.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PainPointPageTemplate.tsx) | `Codex D` | Shared template for pain surfaces | primitive migration direction | Template uses Prototyper layout/display/action patterns only |
| [CaseStudyRecruitmentForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/CaseStudyRecruitmentForm.tsx) | `Codex D` | Shared website form pattern | primitive migration direction | Uses Prototyper `form`/`field`/`input`/`textarea`/`button`/`toast`; dead code removed |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/page.tsx) | `Codex B` | Highest-impact acquisition surface | shared public primitives stable enough to build on | Homepage uses approved Prototyper UI patterns only; hero/value-first funnel done; EN/NL aligned; homepage tests updated |
| Homepage locale strings in [en.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/messages/en.ts) and [nl.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/messages/nl.ts) | `Codex B` | Homepage copy ownership should stay with homepage owner | homepage changes | Homepage copy sharpened in EN/NL with semantic parity |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(auth)/login/page.tsx) | `Codex C` | Highest-intent auth surface | none, but must respect final Prototyper direction | Uses approved Prototyper form/card/button patterns only; auth behavior intact; tests updated |
| Login locale/copy in [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(auth)/login/page.tsx) | `Codex C` | Auth copy and behavior are coupled | auth implementation | EN/NL copy aligned; support/passwordless/proof clearer |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/pricing/page.tsx) | `Codex C` | Highest-intent commercial page | none, but must respect final Prototyper direction | Uses approved Prototyper layout/display/action patterns only; proof + Free/Pro framing done; tests updated |
| Pricing copy/config touch points under [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/pricing/page.tsx) and related live commercial copy sources | `Codex C` | Pricing copy should stay with pricing owner | pricing implementation | EN/NL parity maintained; no unsupported claims |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/bike-fit/page.tsx) | `Codex D` | Calculator cluster is one system | primitive migration direction | Uses Prototyper sections/cards/buttons only |
| [BikeFitCalculatorForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/bike-fit/BikeFitCalculatorForm.tsx) | `Codex D` | Must remove dashboard `SliderQuestion` dependency | calculator migration direction | Rebuilt with Prototyper `form`/`field`/`slider`; no dashboard UI dependency |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/saddle-height/page.tsx) | `Codex D` | Calculator cluster | primitive migration direction | Prototyper-only website patterns |
| [SaddleHeightCalculatorForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.tsx) | `Codex D` | Must remove `SliderQuestion` | calculator migration direction | Prototyper-only form controls |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/frame-size/page.tsx) | `Codex D` | Calculator cluster | primitive migration direction | Prototyper-only website patterns |
| [FrameSizeCalculatorForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/frame-size/FrameSizeCalculatorForm.tsx) | `Codex D` | Must remove `SliderQuestion` | calculator migration direction | Prototyper-only form controls |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/crank-length/page.tsx) | `Codex D` | Calculator cluster with current local `Input`/`Select` usage | primitive migration direction | Uses Prototyper `form`/`field`/`input`/`select`/`button`/`alert` |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/bandenspanning-calculator/page.tsx) and pressure landing variants | `Codex D` | Same calculator/product-bridge cluster | calculator migration direction | Consistent Prototyper calculator contract |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/faq/page.tsx) | `Codex D` | Trust page and content migration cluster | primitive migration direction | Uses Prototyper `accordion`/`card`/`button`/`alert`; EN/NL conversion copy aligned |
| [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/contact/page.tsx) | `Codex D` | Trust page and content migration cluster | primitive migration direction | Uses Prototyper `section`/`card`/`button`/`alert`; EN/NL conversion copy aligned |
| [about/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/about/page.tsx), [case-study/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/case-study/page.tsx), [how-it-works/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/how-it-works/page.tsx), [measurement-guide/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/measurement-guide/page.tsx), [why-bikefit-matters/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/why-bikefit-matters/page.tsx) | `Codex D` | Content-heavy public migration cluster | primitive migration direction | Prototyper-only layout/actions; dead code removed in touched areas |
| [guides/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/page.tsx) and [guides/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx) | `Codex D` | Content-heavy public migration cluster | primitive migration direction | Prototyper-only cards/sections/buttons; icon treatment consistent |
| [use-cases/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/use-cases/page.tsx) and [use-cases/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/use-cases/[slug]/page.tsx) | `Codex D` | Content-heavy public migration cluster | primitive migration direction | Prototyper-only cards/sections/buttons; icon treatment consistent |
| [pain/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/pain/page.tsx) and [pain/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/pain/[slug]/page.tsx) | `Codex D` | Template/content migration cluster | `PainPointPageTemplate` migration | Prototyper-only template consumption |
| [science/bike-fit-methods/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/science/bike-fit-methods/page.tsx), [science/calculation-engine/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/science/calculation-engine/page.tsx), [science/stack-and-reach/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/science/stack-and-reach/page.tsx) | `Codex D` | Content-heavy public migration cluster | primitive migration direction | Prototyper-only sections/cards/accordion patterns |
| [HeaderAuthActions.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/HeaderAuthActions.tsx), [HeaderMobileMenu.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/HeaderMobileMenu.tsx), [LanguageSwitch.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/LanguageSwitch.tsx), [CookieConsentBanner.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/CookieConsentBanner.tsx), [Header.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/Header.tsx), [Footer.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/Footer.tsx) | `Codex D` | Shared website layout cluster | primitive migration direction and core page visual direction stable enough | Uses approved Prototyper layout/navigation/action patterns only |

## Non-Ownership Rules

### Codex B must not edit

- `/pricing`
- `/login`
- calculator internals
- FAQ/contact
- website layout shared files
- `src/app/globals.css`
- shared public primitives owned by `Codex D`, unless Lead explicitly approves coordination

### Codex C must not edit

- homepage
- calculator pages/forms
- FAQ/contact
- guides/use-cases/pain/science pages
- website layout shared files
- `src/app/globals.css`
- shared public primitives owned by `Codex D`, unless Lead explicitly approves coordination

### Codex D must not edit

- homepage primary content/copy decisions owned by `Codex B`
- `/login` and `/pricing` core implementation/copy owned by `Codex C`

### Lead must not edit

- production implementation files in any of the owned clusters above unless a worker is blocked or reassigned

## Test And Validation Ownership

| Validation area | Owner |
|---|---|
| Homepage tests | `Codex B` |
| Auth tests | `Codex C` |
| Pricing tests | `Codex C` |
| Calculator tests | `Codex D` |
| FAQ/contact tests | `Codex D` |
| Theme/provider tests | `Codex D` |
| Dead-code review across touched files | primary owner of each cluster, reviewed by `Lead` |
| Security review note for touched public/auth flows | `Codex D` for public flows, `Codex C` for auth/pricing specifics, consolidated by `Lead` |
| Final integration review and closeout artifact | `Lead` |

## Acceptance Gate Before Merge

- touched website surfaces use approved Prototyper UI patterns only
- no touched website surface still imports the non-approved local website UI layer
- no touched public calculator still uses `SliderQuestion`
- dead code introduced or exposed by migration is removed
- tests pass for each owned cluster
- written security review exists
- final integration review confirms consistency across homepage, login, pricing, calculators, FAQ/contact, header/footer, and theme behavior
