# Step 02 — Favicon And Metadata Plan

## Objective

Wire the new branding into browser and metadata entry points.

## Tasks

1. Audit current icon handling in `src/app/layout.tsx` and any existing `icon.png` behavior.
2. Decide the favicon and app-icon source strategy:
   - direct SVG where supported
   - PNG export for compatibility if needed
3. Plan updates for:
   - root metadata icons
   - apple touch icon if needed
   - manifest-related assets if present or required
   - social preview image direction if a branded OG image is in scope
4. Confirm naming and placement in `public/` so Next.js can serve them cleanly.

## Deliverable

Document:

- exact files to add or replace
- metadata fields to update
- compatibility assumptions

## Acceptance For This Step

- favicon/app icon implementation path is unambiguous
- metadata changes are scoped and compatible with Next.js app routing
