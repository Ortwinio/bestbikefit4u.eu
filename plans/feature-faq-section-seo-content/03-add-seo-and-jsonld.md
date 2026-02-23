# Step 03 - Add SEO and JSON-LD

## Objective
Apply SEO-optimized metadata and embed locale-correct FAQPage JSON-LD tied to visible FAQ content.

## Tasks
1. Set metadata per locale exactly as provided:
   - EN title + description
   - NL title + description
2. Keep `alternates` metadata aligned with locale routing (`/faq`).
3. Add FAQPage JSON-LD script to the page output:
   - EN schema for EN locale
   - NL schema for NL locale
4. Ensure schema content reflects visible FAQ entries exactly (question/answer consistency).
5. Validate output format is valid JSON and safe in `application/ld+json`.

## Deliverable
- `plans/feature-faq-section-seo-content/output-03-seo-jsonld.md`

## Done When
- Locale metadata matches user-provided copy exactly.
- JSON-LD appears in page source for each locale.
- Schema remains synchronized with rendered FAQ content after structural refactor.
