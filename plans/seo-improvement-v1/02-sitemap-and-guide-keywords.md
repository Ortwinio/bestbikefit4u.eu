# Step 02 — Sitemap Registration And Guide Keyword Wiring

## Context

Read:

- `plans/seo-improvement-v1/README.md`
- `plans/seo-improvement-v1/01-landing-pages.md`

The audit already confirmed:

- breadcrumb schema is already implemented on guides and pain pages
- FAQ schema is already implemented on guides and pain pages
- empty blog sitemap sections are already excluded from the sitemap index

This step should only address the real metadata gaps.

## Goal

Expose the new landing pages to the sitemap system and wire guide-page `keywords` metadata from the current source of truth.

## Task

Implement the SEO plumbing that should accompany the landing pages, without forcing a CMS migration yet.

## Deliverables

### 1. Add the new landing pages to sitemap sources

Update the sitemap source definitions so the three new pages appear in the public sitemap output:

- `/nl/fiets-afstellen`
- `/nl/bikefitting`
- `/en/bike-fitting`

Use priorities and change frequencies that are consistent with nearby public pages.

### 2. Wire guide-page `keywords` metadata

Guide fallback content already contains `seoKeywords`, but guide `generateMetadata()` does not currently surface them.

Implement the smallest correct version:

- add `keywords` to guide-page metadata
- source them from the existing fallback guide data first
- preserve current precedence for title/description/canonical/OG

If a draft/CMS guide lacks keyword data, document the fallback behavior in code or plan output.

### 3. Keep the source-of-truth model explicit

Do not silently hardcode a second keyword system.

The route logic should make it clear that:

- fallback guide content currently provides keyword coverage
- CMS keyword support is a later enhancement, not a prerequisite for this release

## Constraints

- Do not add or remove breadcrumb schema here.
- Do not add or remove FAQ schema here.
- Do not modify the blog sitemap behavior unless you discover a real regression.
- Avoid schema churn unrelated to the new landing pages and guide keywords.

## Completion Checklist

- [x] New landing pages appear in sitemap sources.
- [x] Guide pages now emit `keywords` metadata.
- [x] Guide keyword wiring uses the current repo source of truth.
- [x] No already-implemented SEO systems were reworked unnecessarily.
