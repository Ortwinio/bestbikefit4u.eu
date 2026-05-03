# Prompt 02 — Section Rhythm And Color Consistency

## Context

Read:

- `plans/feature-homepage-post-redesign-upgrade/README.md`

Phase 1 should be complete first.

The current homepage is structurally better than before, but too many adjacent sections still feel visually similar.

## Task

Improve the visual rhythm of the page so users can keep their place as they move through the funnel, and clean up remaining color/label inconsistencies.

## Deliverables

### 1. Alternate section surfaces more intentionally

Review the current section sequence in `src/app/(public)/page.tsx` and related home components.

Adjust background/surface treatment so the page has clearer stage changes.

You do not need to redesign every section. Focus on the weakest run:

- stepper
- differentiators
- testimonials
- bike search

At least one additional section beyond differentiators should gain clearly different visual treatment.

### 2. Remove eyebrow-label confusion

The testimonial section and bike-search section should not feel like the same section because of repeated eyebrow copy.

Review and update section labels so adjacent sections are clearly distinct.

### 3. Align hero outline button language with the rest of the site

Review the secondary hero button styling and make sure it still reads like the same design system as outline buttons lower on the page.

If a hero-specific treatment is still needed for contrast on the dark image, keep it related enough to feel like the same system.

### 4. Align cookie-consent button styling with the site palette

Audit the current cookie banner/button treatment and bring it closer to the homepage design system.

This should be a design-system alignment task, not a full cookie-banner rewrite.

## Constraints

- Keep contrast and accessibility intact.
- Do not flatten the page into alternating stripes with no nuance.
- Avoid introducing one-off color values in component files.
- Reuse existing theme tokens and global utilities.

## Completion Checklist

- [x] The homepage has clearer visual rhythm across major sections.
- [x] At least one adjacent-section label conflict is removed.
- [x] Hero outline CTA treatment feels consistent with the broader button system.
- [x] Cookie banner/button styling no longer clashes with the main palette.
- [x] Changes preserve accessibility and design-system consistency.
