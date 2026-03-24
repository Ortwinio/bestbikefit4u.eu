# Step 02 — Surface Audit Inventory

## Goal

Find every panel-like surface in the application that should follow the new rule.

## Tasks

1. Audit shared primitives:
   - `src/components/prototyper-ui/ui/dialog.tsx`
   - `src/components/ui/AccessibleDialog.tsx`
2. Audit known application surfaces:
   - feedback panel
   - dashboard mobile menu
   - dashboard mobile top bar if treated as a surface problem
   - admin popup/dialog surfaces
   - rider feedback detail dialogs
   - dashboard message modal surfaces
3. Classify each surface as:
   - uses shared primitive directly
   - wraps shared primitive
   - one-off implementation
4. Record:
   - current classes/tokens
   - transparency usage
   - likely remediation path

## Deliverable

- an inventory artifact of all audited panel surfaces

## Done When

- every relevant popup-style surface has an owner and remediation path
