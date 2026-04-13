# 02 — Guided Selector UX

## Task

Design the new rider-facing selector for geometry linking on both add-bike and edit-bike screens.

## Required UX

Build the standard path as a 4-step guided picklist:

1. Brand
2. Model
3. Year
4. Size

## Design requirements

- Use rider-friendly picklists or comboboxes rather than chip-heavy selection
- Show only the next relevant step
- Disable future steps until the current step is complete
- Keep the current selection visible at all times
- Show a compact geometry preview once size is selected
- Keep the custom fallback behind a single disclosure

## Deliver

1. Component-level UX spec for:
   - brand picker
   - model picker
   - year picker
   - size picker
   - preview block
   - fallback disclosure
2. Interaction rules for:
   - changing brand after deeper selections exist
   - changing model after year/size exist
   - models with one year variant vs multiple
   - variants with no active sizes
3. Desktop and mobile behavior notes
4. Copy recommendations for headings, helper text, empty states, and fallback messaging

## Acceptance

- A rider can understand the sequence without prior product knowledge
- The UI strongly favors exact linking over manual fallback
- The design is shared between add-bike and edit-bike flows
