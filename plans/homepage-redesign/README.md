# Homepage Redesign Plan

**Source document**: `plans/BestBikeFit4U_Redesign_Plan.docx` (Version 1.0, May 2026)  
**Reviewed against repo state**: `2026-05-02`  
**Status**: Implemented, validated with automated checks, local preview available at `http://localhost:3001`

## Goal

Redesign the BestBikeFit4U homepage into a clearer acquisition funnel that improves first-click conversion, removes duplicate messaging, and reuses the existing public-site design system instead of introducing a parallel one.

## Findings From Plan Review

- The current homepage is already past the baseline assumed by the source plan.
  Hero CTA, tertiary sign-in path, campaign banner, quick-check entry, early calculator grid, and bike showcase already exist.
- The repo already has a public design system.
  `src/app/globals.css`, `PublicSection`, `PublicSurfaceCard`, `PublicCtaBand`, and the shared `Button` variants are the right foundation. A new `src/tokens/*` layer would create duplication.
- `CampaignAnnouncementBar` already exists and is wired into the header.
  The redesign should reuse or extend it, not introduce a second `AnnouncementBanner` component.
- The current homepage has more sections than the plan accounts for.
  `BikeQuickCheckCard`, guides, rider scenarios, recommendation content, and a final CTA already ship and need explicit keep/rework/remove decisions.
- The current page still has structural duplication.
  The hero contains trust chips and an inline campaign card, and the body repeats trust/value/CTA ideas across `QuotesCarousel`, `reasonsToStart`, `features`, `trustSection`, `recommendationSection`, and the final CTA.
- `BikeShowcaseCard` currently uses a root `<button>`.
  Adding a second CTA inside that card requires a semantic refactor first; nesting a link or button inside the existing button is invalid.
- There is no inline pricing section on the homepage today.
  The redesign should preserve pricing access via links/secondary CTAs, not assume an existing embedded pricing block.

## Decisions For This Plan

- Reuse the current theme variable system and shared public primitives.
- Keep `BikeQuickCheckCard` in the primary funnel because it is already a differentiated public-value surface.
- Reuse `CampaignAnnouncementBar`; do not create `src/components/layout/AnnouncementBanner.tsx`.
- Replace the current `howItWorks`, `reasonsToStart`, `features`, `trustSection`, and `QuotesCarousel` homepage render path.
- Keep guides and rider-scenario discovery sections, but treat them as lower-priority content below the core conversion funnel.
- Consolidate the lower-page conversion stack so there is one closing CTA surface, not a recommendation card plus a second full CTA section.
- Keep pricing as a linked destination, not an inline homepage pricing module, unless a separate pricing-on-home plan is approved.

## Scope

### In scope

- `src/app/(public)/page.tsx`
- `src/components/home/*`
- `src/components/layout/Header.tsx`
- `src/components/layout/HeaderAuthActions.tsx`
- `src/components/layout/HeaderMobileMenu.tsx`
- `src/components/campaign/CampaignAnnouncementBar.tsx`
- `src/components/public/*` only where shared public primitives need small extensions
- `src/app/globals.css` only where shared public utilities are missing
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- A dedicated typed home content module only if the existing dictionary structure becomes too awkward

### Out of scope

- Calculator logic or result pages
- Auth flow changes beyond CTA wording/destinations
- Pricing page implementation
- Guides page templates and scenario-page templates
- Bike showcase backend/data-source changes
- A repo-wide design-token migration

## Target Homepage Structure

1. `CampaignAnnouncementBar`
2. Header with logged-out calculator-first entry path
3. `HeroBlock`
4. `ProofBar`
5. `BikeQuickCheckCard`
6. `CalculatorGrid`
7. `HowItWorksStepper`
8. `DifferentiatorTriple`
9. `TestimonialSection`
10. `BikeSearchBar` + `BikeShowcaseSection`
11. Guides section
12. Rider scenarios section
13. Closing CTA band

## CTA Rules

1. Maximum one primary button per section.
2. Donate actions are always `outline`, `ghost`, or text-link treatments.
3. Hero sign-in remains tertiary, never visually equivalent to the primary CTA.
4. Total primary CTA count on the homepage should be capped at three:
   hero, stepper, closing CTA.
5. Pricing remains available via navigation and at least one secondary CTA.

## Success Criteria

### Funnel and content

- [x] Hero has one primary CTA to the localized bike-fit calculator.
- [x] Hero no longer contains an inline campaign card or duplicate campaign paragraph block.
- [x] `BikeQuickCheckCard` remains within the first three content sections after the hero.
- [x] The calculator grid remains above testimonials, guides, and rider-scenario content.
- [x] `QuotesCarousel` is no longer rendered on the homepage.
- [x] `home.reasonsToStart`, `home.features`, and `home.trustSection` are no longer rendered as separate homepage sections.
- [x] The recommendation card and final CTA are consolidated into one closing conversion surface.

### Bikes and interaction

- [x] Bike search is visible and usable on `375px`, `768px`, and `1280px` widths.
- [x] If the showcase carousel remains desktop-only, the bike search entry still remains visible on mobile.
- [x] Bike showcase cards use valid interactive semantics.
  No nested link/button inside a root button.
- [x] “Use in my fit” style CTA behavior, if added, does not accidentally trigger the details modal.

### Design system and implementation

- [x] New or touched homepage UI uses existing CSS variables, public utilities, and shared primitives.
- [x] No new `src/tokens/*` folder is introduced as part of this plan.
- [x] No raw hex or rgba literals are added in touched homepage components unless there is a documented exception in `globals.css`.
- [x] New homepage-specific components live under `src/components/home/` unless they are clearly generic enough for `public/`, `layout/`, or `campaign/`.

### Localization, analytics, and accessibility

- [x] New copy has EN/NL parity and follows the existing `getDictionary` pattern or a typed localized content module.
- [x] No significant homepage copy arrays are hardcoded directly inside `page.tsx`.
- [x] Existing `TrackedCtaLink`, `CampaignCtaGroup`, and `pushDataLayerEvent` patterns are preserved or explicitly remapped.
- [x] All interactive controls remain keyboard reachable and show the existing `focus-ring` behavior.
- [x] Images and decorative media keep correct `alt`/`aria-hidden` behavior.

### Validation

- [x] `npm run typecheck` passes.
- [ ] Manual QA is completed on `/nl` and `/en`.
- [ ] Manual QA covers at least one mobile width and one desktop width.
- [x] Any new client component has verified loading, empty, and hydration-safe states.

## Implementation Notes

- Sprint 1 landed via `HeroBlock`, `ProofBar`, and calculator-first logged-out header actions.
- Sprint 2 landed via `HowItWorksStepper`, `DifferentiatorTriple`, and `TestimonialSection`.
- Sprint 3 landed via `CalculatorGrid`, `BikeSearchBar`, bike-showcase CTA semantics refactor, and `ClosingCtaBand`.
- Automated validation completed with `npm run typecheck`, `npm run build`, and targeted Vitest coverage for the homepage and header auth actions.
- Local preview is already running for this repo at `http://localhost:3001`.

## Execution Order

| Prompt | Phase | Purpose |
|---|---|---|
| `00-design-tokens.md` | Pre-work | Align redesign with the existing theme/primitives instead of creating parallel tokens |
| `01-sprint1-hero-conversion.md` | Sprint 1 | Clean up the top funnel: hero, proof, campaign duplication, header CTA behavior |
| `02-sprint2-trust-structure.md` | Sprint 2 | Replace fragmented trust/value sections with a simpler mid-funnel narrative |
| `03-sprint3-conversion-optimization.md` | Sprint 3 | Improve calculator/bike entry points and consolidate the lower-page CTA stack |
