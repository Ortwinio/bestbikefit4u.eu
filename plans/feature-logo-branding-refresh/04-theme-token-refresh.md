# Step 04 — Theme Token Refresh

## Objective

Refresh the UX colors using the logo palette through centralized tokens, not scattered hard-coded classes.

## Tasks

1. Update `src/app/globals.css` token values for:
   - `--primary`
   - `--primary-light`
   - `--primary-middle`
   - `--primary-dark`
   - `--ring`
   - `--accent`
   - supporting neutral/border values where necessary
2. Keep a deliberate color hierarchy:
   - blue for primary actions and focus
   - orange for selective highlight, badges, progress emphasis, and key moments
   - charcoal/slate for typography and structure
3. Audit common surfaces affected by token changes:
   - buttons
   - links
   - progress bars
   - cards and borders
   - dashboard highlights
   - feedback and dialog surfaces
4. Avoid introducing hard-coded logo colors directly into page components unless there is a strong reason.

## Deliverable

Create a token mapping table with:

- old role
- new logo-derived role
- rationale

## Acceptance For This Step

- the refreshed palette is token-driven
- CTA hierarchy is clearer
- light and dark mode both remain readable
- contrast regressions are explicitly checked
