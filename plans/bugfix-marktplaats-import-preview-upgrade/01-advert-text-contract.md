# Step 01: Advert Text Contract

## Objective

Define exactly how advert text should be imported, preserved, summarized, and exposed to the rider preview.

## Required Decisions

1. Preserve the full advert description on the import record.
2. Use that full advert description as the default editable bike description draft.
3. Add a derived summary payload for preview use, separate from the raw text.
4. Keep all extracted signals explicitly reviewable and non-authoritative.

## Required Derived Signals

The parser or mapping layer should extract these signals when present:

- `sizeMention`
- `componentMentions`
- `conditionMentions`
- `maintenanceMentions`
- `confidenceWarnings`

These signals should be displayed as preview aids, not permanently saved as authoritative bike fields in v1.

## Output Shape

Recommended preview payload additions:

- `rawAdvertDescription`
- `descriptionSummary`
- `sizeMention`
- `componentMentions: string[]`
- `conditionMentions: string[]`
- `maintenanceMentions: string[]`
- `previewWarnings: string[]`

## Acceptance Check

- a long advert description survives extraction
- short social/meta descriptions do not replace a fuller structured description when both exist
- uncertain extracted claims can be shown as warnings or low-confidence findings

