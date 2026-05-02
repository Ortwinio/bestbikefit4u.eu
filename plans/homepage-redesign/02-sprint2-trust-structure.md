# Prompt 02 — Sprint 2: Mid-Funnel Simplification

## Context

Read `plans/homepage-redesign/README.md` before starting.

Sprint 1 must be complete first.

The current homepage still renders multiple overlapping trust/value sections:

- `howItWorks`
- `reasonsToStart`
- `features`
- `trustSection`
- `QuotesCarousel`

This sprint reduces that fragmentation into a smaller number of clearer sections.

## Task

Replace the current mid-page trust/value stack with a more focused structure that is easier to scan and easier to maintain.

## Deliverables

### 1. `HowItWorksStepper`

Create a reusable stepper component under `src/components/home/`.

Requirements:

- three steps only
- one primary CTA in the whole section
- stronger visual hierarchy than the current numbered cards
- copy grounded in the real product flow

### 2. `DifferentiatorTriple`

Create a three-card differentiator section under `src/components/home/`.

This component replaces the current spread across:

- `home.reasonsToStart`
- `home.features`
- `home.trustSection`

The final three cards should cover distinct ideas, not reword the same claim three times.

### 3. `TestimonialSection`

Replace `QuotesCarousel` with a named testimonial section that includes:

- rider identity or initials
- bike context
- a concrete outcome/result

Anonymous one-line quotes are not enough for this redesign.

## Content rules

- Do not hardcode large localized content arrays inside `src/app/(public)/page.tsx`.
- Prefer the existing dictionary pattern in `src/i18n/messages/*.ts`.
- If the content becomes too structured for the dictionary, create a typed localized content module and document the reason.
- EN and NL must stay semantically aligned.

## Integration

Update `src/app/(public)/page.tsx` so that:

1. the current how-it-works card grid is replaced
2. the separate reasons/features/trust sections are removed from the render tree
3. `QuotesCarousel` is removed from the render tree
4. the new mid-funnel sections render in a simpler sequence

## Constraints

- No new npm packages.
- Keep server components by default.
- Reuse `lucide-react` icons already in the project where possible.
- The stepper CTA is the only primary CTA in its section.
- Testimonials must describe plausible product outcomes, not inflated marketing claims.

## Completion Checklist

- [x] `HowItWorksStepper` replaces the current numbered cards.
- [x] The legacy `reasonsToStart`, `features`, and `trustSection` sections no longer render separately.
- [x] `QuotesCarousel` no longer renders on the homepage.
- [x] The new testimonial content is identifiable and concrete.
- [x] Mid-funnel content is shorter, more focused, and less repetitive than before.

## Shipped Output

- `src/components/home/HowItWorksStepper.tsx`
- `src/components/home/DifferentiatorTriple.tsx`
- `src/components/home/TestimonialSection.tsx`
- `src/components/home/QuotesCarousel.tsx`
- `src/app/(public)/page.tsx`
