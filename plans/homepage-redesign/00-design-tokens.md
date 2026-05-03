# Prompt 00 — Align With The Existing Design System

## Context

Read `plans/homepage-redesign/README.md` before starting.

This repo already has an active public-site theme system:

- `src/app/globals.css`
- `src/components/public/PublicSection.tsx`
- `src/components/public/PublicSurfaceCard.tsx`
- `src/components/public/PublicCtaBand.tsx`
- `src/components/prototyper-ui/ui/button.tsx`

The homepage redesign should extend that system only where needed. Do not introduce a second token layer unless a separate repo-wide migration is explicitly approved.

## Task

Audit the current public-site styling primitives and add only the missing reusable utilities needed for the homepage redesign.

## Deliverables

1. Review the existing public-site primitives and identify which ones already cover:
   section shells, cards, CTA surfaces, focus states, and button variants.
2. Add small shared utilities to `src/app/globals.css` only if the redesign needs patterns that do not already exist.
   Example categories: a hero overlay helper, a proof-strip surface, or a repeated homepage spacing utility.
3. If a new reusable wrapper is clearly needed, prefer extending `public/` primitives rather than creating one-off style blocks in `page.tsx`.
4. Record any intentional design-system gaps in the plan output for later follow-up.

## Constraints

- Do not create `src/tokens/` as part of this plan.
- Do not hardcode new hex or rgba values inside touched homepage components.
- Reuse existing CSS variables and utilities such as:
  `focus-ring`, `public-card-surface`, `public-card-surface-subtle`, `public-cta-surface`.
- Keep additions small and homepage-driven.
- Do not change Tailwind config unless absolutely necessary.

## Completion Checklist

- [x] Existing public-site primitives were reviewed before adding new utilities.
- [x] No parallel token system was introduced.
- [x] Any new utility is generic enough to justify living in shared theme code.
- [x] Touched homepage styling uses the same visual language as the rest of the public site.
