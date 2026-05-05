# Step 07 — Structured Data Normalization

## Objective

Normalize structured-data behavior across sitewide layout, guides, article-style pages, and calculators so schema follows one explicit template policy.

## Background

Read:
- `plans/feature-technical-seo-implementation/09-step-06-template-seo-ux.md`
- `src/lib/seo/jsonLd.ts`
- `src/components/seo/JsonLd.tsx`
- `src/app/layout.tsx`
- homepage, guide, and calculator page implementations

## Tasks

1. Add or confirm sitewide `Organization` and `WebSite` schema placement.
2. Normalize `Article`, `BreadcrumbList`, and `FAQPage` policy for article-style pages.
3. Normalize `WebApplication` or `SoftwareApplication` policy for calculators.
4. Ensure schema is emitted only when visible content justifies it.
5. Add targeted schema checks where appropriate.

## Validation

- Manual source inspection
- Schema validator spot checks
- Targeted route/schema tests if added

## Output

Write `output-10-step-07-schema-normalization.md`:
- schema policy implemented
- templates affected
- validation results
