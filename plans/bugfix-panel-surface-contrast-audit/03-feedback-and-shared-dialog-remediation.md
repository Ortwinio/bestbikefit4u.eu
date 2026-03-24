# Step 03 — Feedback And Shared Dialog Remediation

## Goal

Fix the feedback panel first, then align the shared dialog system behind it.

## Tasks

1. Update the feedback panel body so it is fully opaque.
2. Align header, content, form fields, pills, and action row styling to the new contrast rule.
3. Decide whether to:
   - update `src/components/prototyper-ui/ui/dialog.tsx` globally
   - or create a dedicated panel variant/wrapper for right-side sheets
4. Validate that the feedback panel still works with:
   - Prototyper UI dialog behavior
   - focus handling
   - close button visibility
   - form-state error styling

## Constraints

- keep using Prototyper UI primitives
- do not reintroduce custom drawer logic
- do not leave the feedback panel on a token mix that contradicts the new rule

## Done When

- the feedback panel visibly follows the new surface contract
