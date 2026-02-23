# Step 04 - Validate and Polish

## Objective
Validate correctness, accessibility, and production readiness of the new FAQ implementation.

## Tasks
1. Run quality checks for changed files:
   - lint
   - relevant tests
   - production build
2. Manual checklist:
   - `/en/faq` and `/nl/faq` render expected FAQ content after structural refactor
   - accordions open/close correctly
   - metadata title/description values are correct
   - JSON-LD script appears and matches visible content
   - visual styling matches existing website UI guidelines
3. Accessibility checks:
   - heading hierarchy is valid
   - keyboard navigation for `<details>/<summary>` works
   - contrast and readability remain acceptable
4. Record final evidence:
   - commands run
   - verification notes
   - known limitations (if any)

## Deliverable
- `plans/feature-faq-section-seo-content/output-04-validation.md`

## Done When
- Acceptance criteria from plan README are satisfied or deviations documented.
- Feature is ready to commit and deploy.
