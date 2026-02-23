# Output 02 - FAQ UI Implementation

## Implemented
- Updated `src/app/(public)/faq/page.tsx` to render FAQ items using native accordion semantics:
  - `<details>`
  - `<summary><strong>Question</strong></summary>`
  - answer text in paragraph body
- Preserved existing EN/NL FAQ content while improving structure and maintainability.

## Structural Refactor
- Introduced normalized internal model:
  - `RawFAQCopy` / `RawFAQSection` / `RawFAQItem`
  - `FAQCopy` / `FAQSection` / `FAQItem` with stable `id` fields
- Added normalization pipeline:
  - `normalizeFAQCopy(...)`
  - generated section/item IDs via `toId(...)`
- Result:
  - cleaner render layer (`section.items`) independent from raw `q/a` data shape
  - easier schema synchronization for Step 03

## UI Guidelines Alignment
- Kept current page shell, spacing, and typography consistent with other public pages:
  - `max-w-4xl`, section rhythm, card-like borders, and existing CTA/guide blocks
- Accordion cards use white background + border styling consistent with site cards.

## Locale Behavior
- `/en/faq` and `/nl/faq` remain supported.
- Existing localized content remains intact and mapped through normalized structure.

## Validation
- `npm run lint:eslint -- 'src/app/(public)/faq/page.tsx'` passed.

