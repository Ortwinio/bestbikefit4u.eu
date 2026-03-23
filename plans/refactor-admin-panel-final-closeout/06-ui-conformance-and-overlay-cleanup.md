# Step 06: UI Conformance And Overlay Cleanup

## Objective

Finish the UI-system cleanup so the admin panel aligns with the stricter Prototyper and UX constraints.

## Tasks

1. Remove or replace popup-capable message types from admin composition flows if modal messaging is not allowed.
2. Replace custom translucent admin overlays where required by product policy.
3. Remove hard-coded black overlay/shadow values from admin-facing surfaces where tokenized equivalents are expected.
4. Fix invalid shared admin table row markup.
5. Standardize admin overlays on approved shared primitives, or explicitly document exceptions.
6. Re-audit for:
   - raw black transparency in admin panel
   - custom overlay markup
   - modal message type exposure
   - `asChild`/Radix regressions

## Done When

- admin UI is consistently tokenized
- popup/transparency policy is satisfied or explicitly documented
- shared admin table markup is valid
