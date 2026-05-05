# Step 08 — Image SEO, CWV, and Release QA

## Objective

Finish the technical SEO rollout by tightening image SEO behavior, measuring template-level Core Web Vitals, and formalizing release QA.

## Background

Read:
- `plans/feature-technical-seo-implementation/10-step-07-schema-normalization.md`
- public page templates
- guide editor/image fields
- `scripts/seo/validate-sitemaps.mjs`
- current package scripts related to tests and validation

## Tasks

1. Enforce image SEO expectations for public templates and guides.
2. Measure homepage, one guide page, and one calculator for CWV/Lighthouse baseline.
3. Implement high-leverage image/CWV fixes where they are clear and bounded.
4. Document the SEO QA checklist and release-gate commands.
5. Add any final targeted validation needed for handoff.

## Validation

- `npm run seo:validate-sitemaps`
- `npm run test:i18n`
- targeted template/SEO tests
- documented CWV checks

## Output

Write `output-11-step-08-image-seo-cwv-and-qa.md`:
- image SEO changes
- CWV findings and fixes
- QA checklist
- validation results
