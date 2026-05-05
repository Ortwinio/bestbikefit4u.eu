# Step 02 — Canonical Ownership and Hreflang Normalization

## Objective

Standardize canonical ownership, EN/NL alternates, and `x-default` behavior across public route families, with special focus on calculator and programmatic tire-pressure routes.

## Background

Read:
- `plans/feature-technical-seo-implementation/04-step-01-route-policy-and-indexability.md`
- `src/i18n/metadata.ts`
- `src/app/(public)/tire-pressure/[slug]/page.tsx`
- `src/app/(public)/bandenspanning/[slug]/page.tsx`
- relevant sitemap alternate helpers and tests

## Tasks

1. Decide canonical owners for every localized route family in scope.
2. Normalize `x-default` policy and make it consistent across route families.
3. Refactor route-local alternate logic onto shared helpers where possible.
4. Add focused tests for EN/NL reciprocity and programmatic route consistency.
5. Document any intentional exceptions such as Dutch alias families.

## Validation

- Targeted metadata tests
- `npm run test:i18n`
- Manual source inspection for canonical and alternate output

## Output

Write `output-05-step-02-canonical-and-hreflang.md`:
- route families normalized
- canonical/alternate policy decisions
- tests added
- validation results
