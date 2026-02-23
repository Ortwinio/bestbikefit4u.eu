# Step 01 - Structure Content Model

## Objective
Transform the current EN/NL FAQ implementation into a cleaner, implementation-ready, typed structure without introducing raw content dump workflows.

## Tasks
1. Audit current FAQ implementation in:
   - `src/app/(public)/faq/page.tsx`
2. Define content model for:
   - page metadata (title, description)
   - intro copy
   - grouped FAQ sections (e.g. Getting started, Measurements, etc.)
   - FAQ items (question + answer)
3. Map existing EN FAQ content into the model and remove structural duplication.
4. Map existing NL FAQ content into the model and align section parity with EN where relevant.
5. Define JSON-LD source mapping strategy:
   - reuse same FAQ item source as visible content where possible
   - ensure schema and visible text stay synchronized

## Deliverable
- `plans/feature-faq-section-seo-content/output-01-content-model.md`

## Done When
- Content model is finalized.
- EN/NL mapping is structurally consistent and maintainable.
- JSON-LD mapping strategy is clear and implementation-ready.
