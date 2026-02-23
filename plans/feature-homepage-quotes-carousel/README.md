# Homepage Quotes Carousel Plan

## Goal
Add a quotes carousel section directly under the homepage header image that shows 4 random quotes in a horizontal row on each visit.

## Scope
- Homepage only: `src/app/(public)/page.tsx`
- New reusable UI component for quotes carousel
- Use the provided 20 quotes as source data
- Randomly select 4 unique quotes per visit
- Responsive layout and accessibility

## Non-Goals
- Collecting user-generated testimonials
- Backend storage for quotes
- A/B testing framework
- Translation of quotes beyond provided source copy

## Approach
1. Define data source and randomization rules (4 unique quotes per visit).
2. Build a lightweight carousel component with horizontal row behavior.
3. Integrate the section below hero image without breaking existing homepage structure.
4. Validate with lint/tests and manual UX checks.

## Acceptance Criteria
1. A quotes section is visible directly below the hero/header image.
2. Exactly 4 quotes are shown at a time, with no duplicates in the same render.
3. Quote set is randomized per visit (refresh/new visit should produce a new random selection).
4. Desktop shows a horizontal row of 4 cards.
5. Mobile keeps horizontal behavior (scrollable row or carousel interaction) without layout breakage.
6. Page remains accessible (semantic structure, readable contrast, keyboard-usable controls if controls are added).
7. Existing homepage content and CTAs remain intact.

## Status
- Complete
- [x] Step 01: `01-define-content-and-behavior.md` (`output-01-content-and-behavior.md`)
- [x] Step 02: `02-build-carousel-component.md` (`output-02-carousel-component.md`)
- [x] Step 03: `03-integrate-homepage-section.md` (`output-03-homepage-integration.md`)
- [x] Step 04: `04-validate-and-polish.md` (`output-04-validation.md`)
