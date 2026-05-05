# Output 08 — Guide CMS SEO Validation

## Validation rules added

- Publish/review flows now require complete EN and NL guide content.
- Canonical overrides must be valid absolute `bestbikefit4u.eu` URLs without query strings or fragments.
- Guides with a featured image or hero image must include English and Dutch image alt text before review/publish.
- Blank optional SEO/image fields are normalized to `undefined` on write rather than stored as whitespace strings.

## UI changes

- Added helper text in the guide editor for:
  - featured image alt requirements
  - canonical URL safety expectations

## Files changed

- `convex/guides/mutations.ts`
- `convex/guides/__tests__/mutations.contract.test.ts`
- `src/components/admin/guides/GuideEditView.tsx`

## Validation results

- Added contract tests for:
  - blank optional SEO field normalization
  - unsafe canonical override rejection
  - required localized image alt text on publish
- Guide mutation contract suite passed in the SEO-focused run.
