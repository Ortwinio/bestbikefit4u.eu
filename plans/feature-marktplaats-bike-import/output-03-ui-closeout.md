# Output 03 — UI Closeout

## Chosen UI Surface

- dedicated dashboard page at `/bikes/import/marktplaats`
- entry point added on the bike garage page header

## Rider States Covered

- idle URL intake
- unsupported URL validation
- preview loading
- preview error
- preview ready with editable draft
- low-confidence field cues
- photo selection and deselection
- save loading
- save success routing contract
- backend-unavailable fallback

## Copy Additions

- new `dashboard.bikeForm.marktplaatsImport` EN/NL copy block
- button labels, helper copy, preview instructions, low-confidence badge copy
- explicit note that bike name is editable
- explicit backend-unavailable fallback copy

## Known UX Tradeoffs

- preview/save currently target frontend fetch endpoints that are not implemented in this workspace yet
- because backend preview/save contracts are missing, the page can only complete the full flow once those routes exist
- photo confidence or image quality ranking is not shown yet; photos are selectable only
