# Step 04 — CMS Hardening And Validation

## Context

Read:

- `plans/seo-improvement-v1/README.md`
- `plans/seo-improvement-v1/01-landing-pages.md`
- `plans/seo-improvement-v1/02-sitemap-and-guide-keywords.md`
- `plans/seo-improvement-v1/03-internal-linking-and-science-crosslinks.md`

This step is only necessary after the landing-page and fallback-keyword work is complete.

## Goal

Decide whether guide SEO metadata should remain fallback-driven or become CMS-first, then validate the whole SEO improvement slice.

## Task

Harden the guide SEO metadata model if needed, and verify the implemented work technically.

## Deliverables

### 1. Decide the long-term guide keyword source of truth

Choose one:

- keep fallback guide `seoKeywords` as the effective source of truth for now
- or extend the guide CMS schema with localized keyword arrays

Document the decision in the output file for this step.

### 2. If needed, extend the CMS schema

Only if the repo now needs CMS-managed keyword control:

- add localized keyword array support to the guide schema
- expose it through relevant guide queries/mutations
- define fallback behavior when CMS keywords are absent

If this is not needed yet, explicitly document why it was deferred.

### 3. Validate technical SEO behavior

Run the relevant checks for the implemented changes, such as:

- `npm run typecheck`
- targeted tests for routes/metadata if they exist
- sitemap validation if touched

### 4. Record implementation outputs

Create step output records that summarize:

- what shipped
- what was intentionally deferred
- what still needs performance monitoring after launch

## Constraints

- Do not add speculative schema or content expansion here.
- Avoid turning this step into a broad CMS refactor unless the release truly depends on it.

## Completion Checklist

- [x] The guide keyword source-of-truth decision is explicit.
- [x] CMS keyword support is implemented only if truly needed.
- [x] Technical validation is complete.
- [x] Output records document what shipped and what was deferred.
