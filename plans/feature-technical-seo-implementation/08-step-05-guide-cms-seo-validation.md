# Step 05 — Guide CMS SEO Validation

## Objective

Enforce the minimum SEO field contract for published guide pages and prevent broken canonical, robots, and metadata states from being published.

## Background

Read:
- `plans/feature-technical-seo-implementation/07-step-04-metadata-helper-rollout.md`
- `convex/guides/mutations.ts`
- `convex/guides/queries.ts`
- `src/components/admin/guides/GuideEditView.tsx`
- `src/lib/guides/content.ts`

## Tasks

1. Define the required SEO fields for published guides.
2. Add validation in mutations/publish flows for:
   - meta title
   - meta description
   - H1
   - body content
   - image alt when needed
   - canonical override safety
3. Improve the guide editor UI so missing required SEO fields are obvious.
4. Add or extend contract tests for guide publishing validation.

## Validation

- Guide mutation contract tests
- Editor validation checks
- Manual publish-flow test

## Output

Write `output-08-step-05-guide-cms-seo-validation.md`:
- validation rules added
- UI changes
- tests added
- validation results
