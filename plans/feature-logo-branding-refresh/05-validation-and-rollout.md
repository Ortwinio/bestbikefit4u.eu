# Step 05 — Validation And Rollout

## Objective

Validate that the branding refresh is coherent, accessible, and production-safe.

## Tasks

1. Validate favicon and logo rendering on:
   - desktop browser tab
   - public header
   - mobile menu
   - dashboard layout
2. Validate color usage across:
   - light mode
   - dark mode
   - public marketing pages
   - dashboard pages
   - dialogs and feedback panel surfaces
3. Run technical checks:
   - typecheck/build
   - targeted component tests if branding wrappers are added
4. Create a closeout note documenting:
   - files changed
   - token changes
   - acceptance status
   - any deferred items

## Deliverable

Create `plans/feature-logo-branding-refresh/output-02-closeout.md`.

## Acceptance For This Step

- favicon works in production build output
- major logo surfaces render correctly
- no major contrast regression is introduced
- the branding refresh can be shipped without reopening the design system
