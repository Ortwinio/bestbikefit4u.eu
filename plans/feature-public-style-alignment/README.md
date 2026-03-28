# Public Style Alignment Plan

## Goal

Use the visual language of the `My Profile` page as the design reference for the public website pages and calculators, without redesigning the rest of the dashboard.

The target outcome is a clearer and more premium public experience that feels like the same product system:

- stronger section framing
- better use of cards, metric panels, and soft info boxes
- more consistent CTA styling
- more visual support on text-heavy pages
- better rhythm between dense information blocks and action areas

## Scope

In scope:

- public website pages under `src/app/(public)`
- public calculator pages
- shared public-facing components used by those pages
- illustration strategy for text-heavy public pages
- shared styling primitives needed to make this maintainable

Out of scope:

- dashboard pages other than `My Profile` as the design reference
- admin pages
- deep content rewrites unrelated to layout or presentation
- SEO/schema changes unless a page component needs minor structural changes

## Source Of Truth

Primary visual reference:

- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/profile/page.tsx)

Key visual traits to reuse:

- layered surface hierarchy with `Card` and soft neutral panels
- metric/score presentation with visual bars and chips
- icon-led helper boxes
- more expressive section headers with short explanatory copy
- strong but controlled CTA treatment
- clean spacing rhythm between content blocks

## Problem Statement

The public site currently mixes several visual styles:

- some pages use plain text stacks with minimal framing
- some calculator pages use form-heavy layouts without enough profile-style visual support
- text-only pages miss supporting visuals or illustration anchors
- section density and CTA presentation vary too much across pages

This makes the public experience feel less cohesive than the best dashboard surface.

## Design Direction

Apply the `My Profile` styling system to public surfaces in a way that fits marketing and calculator use cases.

That means:

- do not copy the profile page literally
- do reuse its surface hierarchy, component patterns, spacing, and emphasis model
- use illustrations selectively on text-heavy pages where they reduce monotony or clarify the topic

## Page Groups

### Group A: High-impact public landing and conversion pages

- `/`
- `/about`
- `/pricing`
- `/why-bikefit-matters`
- `/faq`
- `/contact`

### Group B: Core calculators

- `/calculators/bike-fit`
- `/calculators/saddle-height`
- `/calculators/frame-size`
- `/calculators/crank-length`
- `/bandenspanning-calculator`
- related public tire-pressure landing pages

### Group C: Text-heavy information pages

- guide index and guide detail pages
- use-case index and use-case detail pages
- science pages
- measurement guide

## Execution Strategy

1. Audit the profile styling contract and map it to reusable public patterns.
2. Extract or define shared public styling primitives before redesigning pages.
3. Restyle the highest-impact public entry pages first.
4. Align calculators next so public tools feel consistent.
5. Improve text-heavy informational pages with framed sections and illustrations where appropriate.
6. Validate consistency, accessibility, and mobile behavior.

## Acceptance Criteria

### Visual Consistency

- Public pages clearly reuse the profile page’s surface hierarchy and framing language.
- Cards, helper boxes, metric panels, and CTA sections feel like one shared system.
- Public pages no longer mix obviously conflicting visual treatments for similar content blocks.

### Scope Control

- No non-profile dashboard pages are redesigned as part of this work.
- Admin pages remain untouched.

### Public Page Quality

- Each Group A page has a clear hero, framed content sections, and a strong CTA block.
- Each calculator has a consistent top section, framed input/result areas, and helper/context panels.
- Text-heavy pages no longer rely on long uninterrupted text stacks where a styled section or illustration would improve scanning.

### Illustration Usage

- Text-heavy pages with little existing visual support get a corresponding illustration or visual accent.
- Illustrations are purposeful and aligned with page topic, not decorative filler.
- Illustration treatment remains consistent across public pages.

### Reuse And Maintainability

- Shared page patterns are extracted into reusable components or layout helpers where appropriate.
- Styling is token-driven and aligned with the design system.
- No hard-coded one-off styling should be introduced when a shared pattern belongs in a reusable primitive.

### UX Quality

- Layouts remain responsive on mobile and desktop.
- Contrast and hierarchy stay readable in both light and dark themes if the page supports them.
- CTA placement is clearer than in the current public pages.

## Success Criteria

### Product Success

- The public site feels visibly closer to the quality level of `My Profile`.
- Calculators feel more trustworthy and easier to use because input, output, and explanation blocks are framed more clearly.
- Informational pages become easier to scan and less text-wall heavy.

### Design-System Success

- The visual upgrade is achieved mostly by reusable page primitives rather than page-by-page styling drift.
- Future public pages can adopt the same patterns without inventing new layout styles.

### Delivery Success

- The work can be split cleanly across shared primitives, public pages, calculators, and illustration integration.
- The implementation can be validated with component/page checks and one final consistency pass.

## Implementation Tracks

- Track 1: Profile-style contract extraction
- Track 2: Shared public primitives
- Track 3: Core public page restyling
- Track 4: Calculator restyling
- Track 5: Text-heavy page enhancement and illustration rollout
- Track 6: Final QA and consistency audit

## Deliverables

- shared public styling primitives
- updated Group A public pages
- updated calculator surfaces
- updated text-heavy informational surfaces
- illustration usage contract
- validation closeout artifact

## Plan Files

- [01-profile-style-contract-audit.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-public-style-alignment/01-profile-style-contract-audit.md)
- [02-shared-public-primitives.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-public-style-alignment/02-shared-public-primitives.md)
- [03-core-public-pages.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-public-style-alignment/03-core-public-pages.md)
- [04-calculator-alignment.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-public-style-alignment/04-calculator-alignment.md)
- [05-text-pages-and-illustrations.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-public-style-alignment/05-text-pages-and-illustrations.md)
- [06-validation-and-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-public-style-alignment/06-validation-and-closeout.md)
