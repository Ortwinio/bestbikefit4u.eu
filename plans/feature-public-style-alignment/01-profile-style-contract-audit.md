# Step 01: Profile Style Contract Audit

## Objective

Document which `My Profile` styling elements should become shared public design patterns.

## Inputs

- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/profile/page.tsx)
- public pages under `src/app/(public)`
- calculator pages under `src/app/(public)/calculators` and related public calculator routes

## Tasks

1. Audit the `My Profile` page and extract the visual contract:
   - card hierarchy
   - score bars and metric panels
   - info boxes
   - section headers
   - CTA grouping
   - spacing rhythm
2. Map those elements to public use cases:
   - hero support cards
   - explanation panels
   - result summary blocks
   - form helper panels
   - section callouts
3. Inventory current public page inconsistencies.
4. Write a concise artifact describing:
   - what to reuse directly
   - what to adapt
   - what not to reuse

## Output

- `output-01-profile-style-contract.md`

## Acceptance

- The audit identifies concrete reusable patterns, not vague style opinions.
- The output explicitly separates profile-only patterns from public-safe patterns.
- Public page inconsistencies are mapped to actual surfaces that need redesign.
