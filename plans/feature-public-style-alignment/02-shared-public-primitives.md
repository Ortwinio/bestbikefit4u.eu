# Step 02: Shared Public Primitives

## Objective

Create or standardize reusable public-facing styling primitives based on the profile page contract.

## Tasks

1. Define the public equivalents of the profile page patterns, for example:
   - section shell
   - content card
   - icon helper/info box
   - metric highlight panel
   - CTA band
   - illustration block
2. Prefer shared components over repeated page-local class strings.
3. Ensure these primitives respect the existing design tokens and branding work.
4. Keep the primitives public-safe:
   - no dashboard-specific assumptions
   - no profile-specific copy or behavior

## Suggested Surfaces

- `src/components/`
- shared layout or marketing component folders

## Acceptance

- Shared primitives exist for the main page patterns needed by Groups A-C.
- New page styling work can consume those primitives instead of re-implementing structure.
- Styling remains token-driven and consistent with existing UI primitives.
