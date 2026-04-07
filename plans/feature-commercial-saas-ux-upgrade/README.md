# Plan: Public Acquisition and Activation UX Redesign

## Goal

Redesign and optimize the public acquisition and activation UX of BestBikeFit4U so that visitors reach value faster, understand the paid offer more clearly, and convert more often from homepage or calculator usage into account creation and paid plans.

The main product to build or fix is the public funnel: homepage, calculator entry points, pricing, login/signup entry, and trust/support surfaces.

## Background

The site already has solid foundations:

- The homepage clearly explains the value proposition
- The public calculators deliver genuine utility
- The pricing page is simple and transparent
- The measurement/trust content is substantive

The main commercial issue is that the best value surfaces are the public calculators, while the homepage's primary CTA currently sends users to a sign-in page, which adds friction before first value. Pricing is understandable, but it still needs stronger persuasion and clearer upgrade framing.

## Scope

### Included

- Homepage information hierarchy, CTA hierarchy, and above-the-fold redesign
- Public calculator positioning and conversion bridges (bike-fit, saddle-height, frame-size, crank-length, tire-pressure)
- Pricing-page conversion improvements
- Login/start flow reframing for both new and returning users
- Stronger trust surfaces using methodology, measurement guidance, support clarity, and product proof
- Public-site component consistency, readability, spacing, and light/dark-mode polish
- Measurement of conversion and activation performance across the public funnel

### Not included

- Full dashboard redesign
- Deep fit-engine logic changes
- Payment-provider rebuilds
- Multilingual content expansion beyond EN/NL
- Admin surfaces or SEO-only rewrites unrelated to conversion UX

## Approach

Use a value-first acquisition strategy:

1. Move users to meaningful first value faster, primarily through calculators and guided first steps.
2. Rework CTA hierarchy so each major screen has one dominant next action.
3. Reframe login into a clearer create-account / sign-in entry point.
4. Strengthen pricing with sharper plan differentiation, stronger reassurance, and more visible product proof.
5. Use the existing trust assets (measurement guide, science/methodology, FAQ) more strategically near signup and pricing decisions.
6. Standardize public-site design patterns so homepage, calculators, pricing, and support pages feel like one premium SaaS product.

## Dependencies

These prerequisites must be in place before implementation work starts:

| Prerequisite | Status |
|---|---|
| Agreed conversion strategy (calculator-first entry point) | Decided: calculator-first |
| Shared public design-system direction (CTA rules, spacing, token usage) | Defined in `ux-contract.md` |
| Product decision on plan positioning (Free, Pro) | Defined in `src/config/commercial.ts` |
| Analytics/event tracking for homepage CTAs, calculator engagement, pricing, login | In place via `TrackedCtaLink` and `TrackMarketingEventOnView` |
| Product proof assets (sample reports, methodology content) | Available in codebase; stronger deployment near conversion points is the work |

## Existing Surfaces

Primary public entry files:

- `src/app/(public)/page.tsx` — homepage
- `src/app/(public)/pricing/page.tsx` — pricing
- `src/app/(auth)/login/page.tsx` — auth start page
- `src/app/(public)/calculators/bike-fit/page.tsx` — primary calculator
- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/crank-length/page.tsx`
- `src/app/(public)/bandenspanning-calculator/page.tsx` — tire-pressure calculator
- `src/app/(public)/faq/page.tsx` — FAQ
- `src/app/(public)/contact/page.tsx` — contact

Shared public components:

- `src/components/public/PublicPrimitives.tsx`
- `src/components/public/PublicCtaBand.tsx`
- `src/components/public/BikeQuickCheckCard.tsx`

Theme system:

- `src/app/globals.css`
- `src/components/providers/ThemeProvider.tsx`

## Execution Strategy

1. **Foundation** — Define the commercial UX contract before editing individual pages.
2. **Homepage** — Fix the homepage first because it is the main top-of-funnel surface.
3. **Auth + Pricing** — Rework auth and pricing next because they are the highest-intent conversion surfaces. These can run in parallel since they have no file overlap.
4. **Calculator bridges** — Standardize calculator result-to-next-step patterns so free tools feed the account and paid journey.
5. **Trust pages** — Upgrade FAQ and contact from support-only pages into trust-and-conversion pages.
6. **Visual polish** — Tighten icon consistency and theme token system so public pages feel premium and coherent.
7. **Validation** — Tests, mobile/desktop review, theme review, and analytics sanity check.

## Ownership

See `output-02-prototyper-ui-implementation-matrix.md` for file-level ownership rules.

| Owner | Scope |
|---|---|
| Lead (orchestrator) | Plan artifacts, UX contract, acceptance review, integration review, final QA artifact |
| Codex B | Homepage and homepage-only conversion surfaces, homepage EN/NL copy, homepage tests |
| Codex C | Auth and pricing conversion surfaces, auth/pricing EN/NL copy, auth/pricing tests |
| Codex D | Shared public primitives, calculators, FAQ/contact, content pages, layout, icons, theme |

## Acceptance Criteria

### Funnel

- The homepage primary CTA leads to a lower-friction first-value experience instead of forcing commitment too early
- Public calculators are surfaced earlier and more prominently in the acquisition flow
- Login/start clearly supports both new account creation and returning-user sign-in
- Pricing communicates Free and Pro more persuasively, with clearer use-case positioning and stronger purchase confidence
- Every major public page has a clear next step with low ambiguity

### Trust and Commercial Framing

- Trust assets (methodology, measurement guidance, support expectations) are more visible near conversion points
- Free vs Pro is described in rider outcome terms, not only capability lists
- Pricing includes at least one confidence mechanism grounded in live product reality
- Honest disclaimers remain, paired with practical value statements

### Visual System

- Consistent component language, spacing rhythm, readability standard, and CTA hierarchy across public pages
- Public surfaces share one color and surface language across light and dark themes
- `system` theme behavior remains correct and predictable

### Quality

- Updated public pages remain responsive on mobile and desktop
- Contrast and emphasis remain accessible in both themes
- No unsupported promises or broken conversion tracking are introduced
- The public funnel shows measurable improvement in key metrics (CTA click-through, calculator engagement, signup conversion, free-to-paid conversion)
- No major regressions in usability, clarity, or mobile responsiveness

## Plan Files

- [01-commercial-ux-contract.md](01-commercial-ux-contract.md)
- [02-homepage-value-first-funnel.md](02-homepage-value-first-funnel.md)
- [03-auth-start-page-reframe.md](03-auth-start-page-reframe.md)
- [04-pricing-proof-and-plan-framing.md](04-pricing-proof-and-plan-framing.md)
- [05-calculator-conversion-bridges.md](05-calculator-conversion-bridges.md)
- [06-icon-system-consistency.md](06-icon-system-consistency.md)
- [07-color-scheme-and-theme-contract.md](07-color-scheme-and-theme-contract.md)
- [08-faq-contact-trust-and-qa.md](08-faq-contact-trust-and-qa.md)

## Orchestration Artifacts

- [ux-contract.md](ux-contract.md) — Commercial UX contract (step 01 output)
- [output-02-prototyper-ui-implementation-matrix.md](output-02-prototyper-ui-implementation-matrix.md) — File ownership and dependency order
- [handoff-homepage-structure.md](handoff-homepage-structure.md) — Homepage structure diff intent for Codex B
- [handoff-homepage-copy.md](handoff-homepage-copy.md) — Homepage EN/NL copy diff intent for Codex B
- [handoff-homepage-acceptance-fixes.md](handoff-homepage-acceptance-fixes.md) — Minimal acceptance-fix checklist for Codex B
- [handoff-auth-reframe.md](handoff-auth-reframe.md) — Auth page diff intent for Codex C
- [handoff-pricing-upgrade.md](handoff-pricing-upgrade.md) — Pricing page diff intent for Codex C
- [handoff-calculator-faq-acceptance-fixes.md](handoff-calculator-faq-acceptance-fixes.md) — Minimal acceptance-fix checklist for Codex D
- [repo-validation-recovery-queue.md](repo-validation-recovery-queue.md) — Fastest-path-to-green repo-health queue created from the April 8 validation run
- [merge-readiness-checklist.md](merge-readiness-checklist.md) — Lead closeout gate across homepage, calculators/FAQ, auth/pricing regression, and final validation
- [output-04-final-qa-closeout.md](output-04-final-qa-closeout.md) — Final QA summary, residual risks, and merge recommendation
- [final-acceptance-note-template.md](final-acceptance-note-template.md) — Lead template for the final closeout note and merge recommendation

## Progress

- [x] 01 Foundation — UX contract written, design direction defined, ownership matrix established
- [x] 02 Homepage — value-first funnel implemented, homepage/layout render path migrated, homepage tests added
- [x] 03 Auth/login — implemented in `src/app/(auth)/login/page.tsx` with EN/NL copy pass and targeted tests
- [x] 04 Pricing — implemented in `src/app/(public)/pricing/page.tsx` and `src/config/commercial.ts` with targeted tests
- [x] 05 Calculator conversion bridges — implemented across public calculators with consistent next-step modules
- [x] 06 FAQ/contact conversion — trust-and-conversion pass implemented with targeted tests
- [x] 07 Icon system consistency — public icon treatment aligned on touched surfaces
- [x] 08 Theme token cleanup — shared public surface hierarchy defined in `globals.css`, `system` theme reactivity fixed in `ThemeProvider`
- [x] 09 Public funnel tests — funnel regression suite added and passing
- [x] 10 Final QA and closeout — final artifact saved, funnel suite revalidated, touched closeout regressions fixed

## Notes

- Reuse and extend the existing public primitives instead of creating a separate parallel design layer
- Keep conversion tracking in place when CTA destinations or labels change
- Preserve bilingual behavior for EN and NL
- Prefer outcome proof grounded in real product artifacts already available in the codebase
- The implementation matrix is the file-ownership source of truth; task titles are the kanban source of truth

## Current Closeout Path

1. Codex B clears `handoff-homepage-acceptance-fixes.md`.
2. Codex D clears `handoff-calculator-faq-acceptance-fixes.md`.
3. Lead verifies `merge-readiness-checklist.md`.
4. Lead records the final decision in `final-acceptance-note-template.md`.
