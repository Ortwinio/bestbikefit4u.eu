# Homepage Post-Redesign Upgrade Plan

**Source inputs**:
- `plans/homepage-redesign/README.md`
- User audit feedback from `2026-05-03`

**Status**: Implemented, validated with automated checks and homepage browser captures

## Goal

Improve the redesigned homepage without undoing the cleaner funnel that already shipped. This plan focuses on visual hierarchy, CTA discipline, trust density, section rhythm, and reliability of the bike showcase in live conditions.

## What Improved Since The Last Audit

These items are already considered shipped and should be preserved:

- The hero is cleaner and no longer duplicates campaign messaging.
- Testimonials now use named riders, bike context, and concrete outcomes.
- Differentiators were reduced from a scattered set of cards to three focused ideas.
- Calculator cards now include one-line value statements.
- Bike showcase cards use valid `article` + nested `button` semantics with a separate fit CTA.
- The lower-page recommendation and CTA stack is consolidated into one closing conversion section.

## Remaining Problems To Solve

### 1. ProofBar is too weak after the hero

- The transition from the dark hero into the body is abrupt.
- `ProofBar` currently reads like a thin footnote rather than a confidence-building moment.
- `BikeQuickCheckCard` also feels visually light immediately after the hero.

### 2. CTA hierarchy still needs protection

- The homepage should keep three primary CTAs total:
  hero, stepper, closing CTA.
- Utility actions such as bike search should not compete visually with conversion actions.

### 3. Section rhythm is too flat

- Too many consecutive white/light sections reduce page orientation.
- The current sequence from stepper through bike search lacks enough surface contrast.

### 4. Hero trust cards need stronger identity

- The three proof cards at the bottom of the hero contain useful content.
- Visually they blend into the hero glass surface and feel like an afterthought.

### 5. Hero secondary CTA copy is weak

- `Vergelijk Free vs Pro` / equivalent EN wording reads like a pricing link, not a benefit-driven action.
- The secondary CTA should create curiosity about value, not just comparison.

### 6. Bike showcase visibility/reliability needs live verification

- The showcase did not appear in the reviewed desktop screenshot.
- We need to verify whether this is a loading, rendering, data, or visibility issue.

### 7. Closing CTA eyebrow duplicates

- The same eyebrow appears in both the left content block and the right CTA card inside `ClosingCtaBand`.
- This creates visual stutter at the point where the page should feel most decisive.

### 8. Color consistency still has gaps

- The cookie consent button color does not match the site’s primary design system.
- Hero outline button treatment does not fully match outline button language elsewhere.
- Adjacent sections reuse the same eyebrow label around the testimonial/bike-search area.

### 9. Trust can still be stronger near decision moments

- There is no review aggregate near the hero.
- All testimonial identities are initials only.
- There is no media/logo trust strip.
- The hero CTA lacks “no credit card / cancel anytime” style hesitation-reduction microcopy.
- The stepper CTA is not reinforced with social proof at the exact decision moment.

## Scope

### In scope

- `src/app/(public)/page.tsx`
- `src/components/home/*`
- `src/components/campaign/*` only if campaign CTA presentation needs small alignment work
- `src/components/layout/*` only if the hero CTA copy or public header interaction must change
- `src/components/cookies/*` or the current cookie banner integration point
- `src/app/globals.css`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- Browser/manual QA assets and plan outputs

### Out of scope

- Calculator algorithms
- Pricing-page redesign
- New backend data models unless required to diagnose the bike showcase rendering issue
- Full testimonial CMS/photo pipeline unless a very small existing-field enhancement is possible
- New third-party trust widgets

## Success Criteria

### Visual hierarchy

- `ProofBar` has enough spacing, scale, and contrast to read as a meaningful trust moment.
- The transition from hero to body feels intentional rather than abrupt.
- Hero trust cards have distinct visual identity through iconography, typography, or both.

### CTA system

- The homepage contains exactly three clearly primary CTAs:
  hero, stepper, closing CTA.
- Utility actions are secondary or tertiary in styling.
- Hero secondary CTA copy is benefit-driven and stronger than a plain comparison label.

### Page rhythm

- Surface/background changes are intentional enough that users can visually track major funnel stages.
- No run of 4 consecutive sections feels visually identical.

### Trust and persuasion

- The hero or immediate post-hero area contains at least one stronger confidence signal beyond the current stat row.
- At least one hesitation-reduction microcopy line appears near a key CTA.
- The stepper or immediately adjacent area reinforces social proof at decision time.

### Reliability and consistency

- Bike showcase visibility is verified in a live browser on desktop.
- If the showcase fails because of loading/data state, the homepage has a graceful fallback that still preserves the section.
- Cookie banner controls match the site design system more closely.
- Adjacent sections do not reuse confusingly similar eyebrow labels.
- `ClosingCtaBand` does not repeat the same eyebrow text twice in the same visual block.

### Validation

- `npm run typecheck` passes.
- Any touched homepage tests are updated and passing.
- Manual QA is completed on `/en` and `/nl` for at least one mobile and one desktop width.
- Manual QA explicitly verifies the bike showcase section on desktop.

## Execution Order

| Prompt | Phase | Purpose |
|---|---|---|
| `01-proof-and-hero-refinement.md` | Phase 1 | Strengthen the hero follow-through, trust cards, and secondary CTA framing |
| `02-section-rhythm-and-color-consistency.md` | Phase 2 | Improve surface alternation, eyebrow clarity, and color-system alignment |
| `03-bike-showcase-and-closing-cta.md` | Phase 3 | Fix showcase visibility/reliability and remove closing CTA duplication |
| `04-trust-boost-and-final-qa.md` | Phase 4 | Add final trust reinforcements and complete browser validation/closeout |

## Implementation Notes

- Phase 1 landed through stronger `ProofBar` hierarchy, a clearer hero proof row with icons, better secondary CTA copy, and hesitation-reduction microcopy near the hero CTA cluster.
- Phase 2 landed through more deliberate section alternation, distinct testimonial and bike-search framing, and cookie banner button styling aligned to the site palette.
- Phase 3 landed through a stable bike-showcase loading/empty fallback and removal of the duplicated eyebrow inside `ClosingCtaBand`.
- Phase 4 landed through stronger social proof near the hero and stepper CTA, plus browser-level homepage QA captures for EN/NL and mobile/desktop.

## Validation

- `npm run typecheck`
- `npx vitest run 'src/app/(public)/page.test.tsx' src/components/layout/HeaderAuthActions.test.tsx`
- Browser/manual QA reviewed from:
  - `.tmp/browser-acceptance-artifacts/home-en-desktop.png`
  - `.tmp/browser-acceptance-artifacts/home-en-mobile.png`
  - `.tmp/browser-acceptance-artifacts/home-nl-desktop.png`
  - `.tmp/browser-acceptance-artifacts/home-nl-mobile.png`

## QA Notes

- The hero/proof transition is stronger and the secondary hero CTA no longer reads like a plain pricing comparison.
- The bike-showcase section now remains visible even before live bike data resolves.
  In the reviewed desktop captures it appeared as a loading/fallback surface instead of disappearing silently.
- The closing CTA no longer repeats the same eyebrow copy in both columns.
- No approved rider-photo assets were available in the repository, so testimonial identity was improved through stronger avatar treatment and verified-story labeling instead of adding a real face.

## Outputs

- `output-01-proof-and-hero-refinement.md`
- `output-02-section-rhythm-and-color-consistency.md`
- `output-03-bike-showcase-and-closing-cta.md`
- `output-04-trust-boost-and-final-qa.md`
