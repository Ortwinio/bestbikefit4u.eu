# Step 01 — Brand Audit And Asset Contract

## Objective

Define exactly which logo asset is used where and establish the canonical brand palette before touching UI code.

## Tasks

1. Inventory all user-facing brand surfaces:
   - public header
   - dashboard header/sidebar
   - auth pages
   - favicon/app icon
   - metadata/social preview candidates
2. Define the logo usage contract:
   - `bestbikefit4u_logo_primary.*` for light backgrounds
   - `bestbikefit4u_logo_dark.*` for dark backgrounds
   - `bestbikefit4u_mark.*` for compact marks
   - `bestbikefit4u_icon_app.*` for favicon/app-icon derivations if needed
3. Define the core palette contract:
   - primary interaction blue
   - accent orange
   - charcoal/surface neutrals
   - slate support tone
4. Decide which current tokens in `globals.css` must change and which should stay stable.

## Deliverable

Create `plans/feature-logo-branding-refresh/output-01-brand-contract.md` with:

- asset-to-surface mapping
- exact color roles
- surfaces that must be updated
- surfaces intentionally deferred

## Acceptance For This Step

- every major brand surface has an assigned logo asset
- the palette roles are explicit
- there is no ambiguity about when to use full logo vs mark vs app icon
