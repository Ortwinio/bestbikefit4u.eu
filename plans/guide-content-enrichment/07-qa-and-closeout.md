# Prompt 07 — QA and Closeout

## Context

Read `plans/guide-content-enrichment/README.md`. All content tasks (01–06) must be complete.

## Task

### 1. Type-check

Run `npx tsc --noEmit` from the project root. Fix any type errors.

### 2. Spot-check content quality

For each cluster, verify at least one guide renders correctly in the browser or review the content output:
- Check that `buildLeafSections()` returns real content sections (not the template) for a written guide
- Check that `buildFaqs()` returns the real FAQs for a written guide
- Check that a slug with no entry in `GUIDE_CONTENT` still returns the template (fallback test)

### 3. Verify the old `data.ts` is either migrated or confirmed unused

Check if `src/app/(public)/guides/data.ts` is imported anywhere in the active page routes. If it is truly unused, do not delete it — just confirm the status. If any page still imports from it, ensure content parity with what was written in `guide-content.ts`.

### 4. NL content completeness check

Verify that every slug with EN content also has NL content in `GUIDE_CONTENT`. If any entry has EN but missing or empty NL arrays, flag it by adding a `// TODO: NL content` comment on that entry.

### 5. Acceptance criteria check

- `npx tsc --noEmit` passes
- At least 3 guides per cluster have real content (non-template output)
- Fallback to template still works for slugs not in `GUIDE_CONTENT`
- No guide FAQ for a nutrition or power guide contains bike-fit pain language
