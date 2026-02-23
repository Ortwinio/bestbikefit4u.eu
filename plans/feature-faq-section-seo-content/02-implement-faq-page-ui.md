# Step 02 - Implement FAQ Page UI

## Objective
Implement a UI-guideline-compliant FAQ page using native semantic accordions and improved content structure.

## Tasks
1. Update `src/app/(public)/faq/page.tsx` to render the existing FAQ content in a cleaner structure.
2. Use structure:
   - `H1` page heading
   - intro paragraph
   - grouped `H2/H3` section headings
   - FAQ items with `<details>` and `<summary><strong>Question</strong></summary>`
3. Ensure both locales are supported:
   - `/en/faq` renders EN content
   - `/nl/faq` renders NL content
4. Keep page layout aligned with current website UI guidelines:
   - consistent spacing and typography scale
   - section/card treatment consistent with other public pages
   - CTA styling consistent with existing public page patterns
5. Ensure mobile and desktop readability.

## Deliverable
- `plans/feature-faq-section-seo-content/output-02-faq-ui.md`

## Done When
- All required FAQ items from the current page remain present in both locales.
- Accordion behavior works with native `<details>` interactions.
- Section structure is clear and scan-friendly.
