# CMS Guide Pages — Test Plan

**Version**: 1.0  
**Date**: 2026-04-11  
**Validation source of truth for tasks 048–054**

This is the canonical test plan for the CMS guide pages feature. All tasks must reference this document and record proof against it.

---

## How to use this document

Each section defines a test category. For each test, the expected result is stated. When a task is marked done, proof notes must reference which tests were run and what the outcome was.

Tests are tagged:
- `[AUTO]` — can be verified by running a command; output is the proof
- `[MANUAL]` — requires browser or curl verification; describe what you observed
- `[SCHEMA]` — TypeScript compiler verification

---

## Part 1 — Convex schema and backend (Task 048)

### S01 — Schema compiles [SCHEMA]
```
npx tsc --noEmit
```
Expected: zero errors. No `TS2339`, `TS2345`, or `TS2322` errors in convex/ files.

### S02 — `guidePages` table has required indexes [AUTO]
Verify `convex/schema.ts` defines:
- `by_slug` index on `slug`
- `by_status` index on `status`
- `by_cluster` index on `cluster`

### S03 — `createGuide` mutation enforces auth [AUTO]
Call `createGuide` without a valid session token.
Expected: `ConvexError` with auth failure message, no record created.

### S04 — `publishGuide` is admin-only [AUTO]
Call `publishGuide` using an editor token (non-admin).
Expected: `ConvexError` with authorization failure.

### S05 — `updateGuide` increments version [AUTO]
Create a guide, call `updateGuide` twice.
Expected: `version` field is 3 (1 on create, +1 per update).

### S06 — `getPublishedGuide` returns null for draft [AUTO]
Create a guide (draft). Call `getPublishedGuide({ slug })`.
Expected: `null`.

### S07 — `getPublishedGuide` returns record after publish [AUTO]
Publish the guide. Call `getPublishedGuide({ slug })`.
Expected: full guide record with `status: "published"`.

### S08 — `changeSlug` creates redirect automatically [AUTO]
Publish a guide with slug `test-slug-a`. Call `changeSlug` to `test-slug-b`.
Expected: redirect record exists with `from: "/guides/test-slug-a"`, `to: "/guides/test-slug-b"`, `statusCode: 301`.

### S09 — Seed migration script runs without errors [AUTO]
```
npx tsx scripts/seed-guides.ts --dry-run
```
Expected: logs all existing TypeScript guide slugs, no errors.

---

## Part 2 — Public route integration (Task 049)

### R01 — DB-first content rendering [MANUAL]
Import one guide to DB. Load its public URL.
Expected: page title matches `metaTitle` from DB record (not the TypeScript file).

### R02 — TypeScript fallback for un-seeded slugs [MANUAL]
Load a guide URL for a slug that exists only in TypeScript (not in DB).
Expected: page renders correctly using TypeScript content.

### R03 — SEO fields in `<head>` [AUTO]
```
curl -s https://localhost:3000/en/guides/bike-fitting-for-knee-pain | grep -A2 "<title>"
curl -s https://localhost:3000/en/guides/bike-fitting-for-knee-pain | grep "description"
```
Expected: `<title>` contains `metaTitle`; meta description matches `metaDescription`.

### R04 — Article JSON-LD present [AUTO]
```
curl -s {guideUrl} | grep -c '"@type":"Article"'
```
Expected: count ≥ 1.

### R05 — FAQPage JSON-LD present on guide with FAQs [AUTO]
```
curl -s {guideUrl} | grep -c '"@type":"FAQPage"'
```
Expected: count ≥ 1 for a guide that has FAQ entries.

### R06 — BreadcrumbList JSON-LD present [AUTO]
```
curl -s {guideUrl} | grep -c '"@type":"BreadcrumbList"'
```
Expected: count ≥ 1.

### R07 — XML sitemap includes published guides [AUTO]
```
curl -s https://localhost:3000/sitemap.xml | grep "guides"
```
Expected: guide paths present; `lastmod` values are ISO date strings.

### R08 — 301 redirect works after slug change [AUTO]
```
curl -I https://localhost:3000/en/guides/{oldSlug}
```
Expected: HTTP 301 with `Location: .../guides/{newSlug}`.

### R09 — `noindex` emitted when `robotsIndex: false` [AUTO]
Set `robotsIndex: false` on a guide. Load page.
```
curl -s {guideUrl} | grep "noindex"
```
Expected: `<meta name="robots" content="noindex">` present.

---

## Part 3 — Batch JSON import (Task 050)

### I01 — Import dry-run lists all 31 guide pairs [AUTO]
```
npx tsx scripts/import-guide-json.ts --dry-run
```
Expected: output lists 31 guide slugs; `total: 31, would_import: 31, errors: 0`.

### I02 — Full import creates 31 records [AUTO]
```
npx tsx scripts/import-guide-json.ts
```
Expected: `total: 31, imported: 31, skipped: 0, errors: 0`.

### I03 — Idempotency: re-run skips all [AUTO]
```
npx tsx scripts/import-guide-json.ts
```
Expected: `total: 31, imported: 0, skipped: 31, errors: 0`.

### I04 — Bilingual fields populated for knee pain guide [AUTO]
Query `getPublishedGuide({ slug: "bike-fitting-for-knee-pain" })`.
Expected: `libraryBody.en.length > 5000`, `libraryBody.nl.length > 5000`, `h1.en != null`, `h1.nl != null`.

### I05 — `libraryBody.en` contains the FAQ section [AUTO]
Query `libraryBody.en` for knee pain guide.
Expected: string contains `## FAQ`.

### I06 — `libraryBody.en` contains a Markdown table [AUTO]
Query `libraryBody.en` for knee pain guide.
Expected: string contains `|---|---|`.

### I07 — Hero images copied correctly [AUTO]
```
npx tsx scripts/import-guide-json.ts --copy-images
ls public/guides/media/ | wc -l
```
Expected: count ≥ 31.
```
curl -I http://localhost:3000/guides/media/003--guides--bike-fitting-for-knee-pain-hero.png
```
Expected: HTTP 200.

### I08 — Single-slug import works [AUTO]
```
npx tsx scripts/import-guide-json.ts --slug bike-fitting-for-knee-pain --overwrite
```
Expected: `total: 1, imported: 1, skipped: 0, errors: 0`.

### I09 — Imported guide immediately accessible as public page [MANUAL]
After import, load `/en/guides/bike-fitting-for-knee-pain`.
Expected: page renders with correct H1, meta title, and body content from imported Markdown.

---

## Part 4 — Guide page template (Task 051)

### T01 — Hero image renders on imported guide [MANUAL]
Load `/en/guides/bike-fitting-for-knee-pain`.
Expected: hero image visible above H1, correctly sized, no broken image icon.

### T02 — Quick Answer 3-card block renders [MANUAL]
Expected: three cards visible with "Key takeaway", "Most common mistake", "Pay extra attention if..." titles.
Content must match extracted values from `## Quick answer` section in `libraryBody`.

### T03 — Markdown body renders correctly [MANUAL]
Check the following on the knee pain guide:
- Symptom matrix table visible (with columns and rows)
- Section headings (h2) styled as section titles
- h3 sub-headings styled distinctly from h2
- Bold text rendered as `<strong>`
- Unordered and ordered lists render with bullets/numbers
- Internal links (e.g. saddle height guide) are clickable and navigate correctly

### T04 — Internal Markdown links use client navigation [MANUAL]
Click an internal link in the guide body (e.g. link to saddle height guide).
Expected: Next.js client-side navigation (no full page reload — verify by watching network tab: only API calls, not full document reload).

### T05 — FAQ accordion renders [MANUAL]
Expected: FAQ section visible, items collapsed by default.
Click one question → answer expands.
Click again → answer collapses.

### T06 — Related guides section renders [MANUAL]
Expected: related guides cards visible, each with title and link. Clicking opens the related guide page.

### T07 — CTA Zone A present on saddle height guide [MANUAL]
Load `/en/guides/saddle-height-guide`.
Expected: soft tool CTA visible after Quick Answer block, with link to `/calculators/saddle-height`.

### T08 — CTA Zone A absent on hub page [MANUAL]
Load `/en/guides/pain-and-discomfort` (hub page).
Expected: no soft tool CTA card visible.

### T09 — CTA Zone A absent on guides without a matching tool [MANUAL]
Load a nutrition cluster guide.
Expected: no soft tool CTA card visible.

### T10 — CTA Zone B (mid-page) renders with funnel-appropriate copy [MANUAL]
Load knee pain guide (MOFU). Expected: mid-page CTA uses MOFU language ("Your numbers", "check your setup").
Load ride-types hub (TOFU). Expected: softer discovery language.

### T11 — CTA Zone C "Start Free Fit" link includes `?from=guide` param [MANUAL]
Inspect the href of the "Start Free Fit" button in the closing CTA band.
Expected: `/en/login?from=guide&slug=bike-fitting-for-knee-pain` (or equivalent).

### T12 — CTA Zone A fires `guide_soft_tool_cta` analytics event [MANUAL]
Open browser DevTools → Network tab → filter for analytics.
Click CTA Zone A. Expected: analytics event with `section: "guide_soft_tool_cta"` fired.

### T13 — CTA Zone B fires `guide_mid_page_cta` analytics event [MANUAL]
Click CTA Zone B. Expected: analytics event with `section: "guide_mid_page_cta"` fired.

### T14 — CTA Zone C fires `guide_closing_cta` analytics event [MANUAL]
Click CTA Zone C. Expected: analytics event with `section: "guide_closing_cta"` fired.

### T15 — NL guide page renders correctly in Dutch [MANUAL]
Load `/nl/guides/bike-fitting-for-knee-pain`.
Expected: H1, meta title, body content in Dutch (from `libraryBody.nl`). Zone A/B/C CTA labels in Dutch.

### T16 — TypeScript-only guide still renders with legacy template [MANUAL]
Load a guide whose slug exists only in TypeScript (not yet imported to DB).
Expected: page renders using `buildLeafSections` fallback, no errors, same visual template.

---

## Part 5 — Admin panel (Tasks 052, 053)

### A01 — Guide list page loads [MANUAL]
Navigate to `/admin/guides` (or equivalent admin route).
Expected: list of guides with status badges, filter bar, "New guide" button.

### A02 — Create guide form — all fields present [MANUAL]
Open "New guide" form.
Expected: Content tab shows pageTitle, h1, pageBrief, body sections, FAQs in EN/NL tabs. SEO tab shows metaTitle, metaDescription, OG fields, SEO checklist. Settings tab shows slug, tableOfContents toggle.

### A03 — Slug auto-generates from title [MANUAL]
Type a title in the "Internal title" field.
Expected: slug field auto-populates with a URL-safe version of the title.

### A04 — Slug shows full URL preview [MANUAL]
Expected: below the slug input, text shows `bestbikefit4u.eu/guides/{cluster}/{slug}` updating live.

### A05 — SEO checklist updates live [MANUAL]
Clear the H1 field while the SEO checklist is visible.
Expected: H1 row changes to ⚠ warn state without saving.

### A06 — Publish button absent for editor role [MANUAL]
Log in as an editor (non-admin). Open any guide.
Expected: no publish button, no unpublish button visible.

### A07 — Publish blocked without H1 [MANUAL]
Log in as admin. Clear H1 fields. Click Publish.
Expected: error message shown, guide not published.

### A08 — Preview opens draft content [MANUAL]
Create a draft guide with specific H1. Do not publish. Click Preview.
Expected: new tab opens showing the guide page with the draft H1, not any previously published content.

### A09 — Slug change on published guide shows confirmation dialog [MANUAL]
Change the slug of a published guide in the edit form.
Expected: confirmation dialog appears with old and new URL. On confirm: redirect created, slug updated, page redirects.

### A10 — Redirect manager shows auto-created redirect [MANUAL]
Navigate to the redirects list.
Expected: redirect from A09 is visible with reason "Auto-created: slug changed from {oldSlug}".

---

## Part 6 — Audit log and roles (Task 054)

### G01 — Publish action recorded in audit log [MANUAL]
Publish a guide. Open the audit log for that guide.
Expected: entry with `action: "publish"`, correct user email, and timestamp.

### G02 — Field update recorded with old and new values [MANUAL]
Change the `h1.en` field and save. Open audit log.
Expected: entry with `action: "update"`, `fieldChanges: [{ field: "h1.en", oldValue: "...", newValue: "..." }]`.

### G03 — `publishGuide` mutation rejects editor token at DB level [AUTO]
Attempt to call `publishGuide` using a Convex client with an editor session (not admin).
Expected: `ConvexError` thrown, not just a UI-level block.

### G04 — `changeSlug` on published guide rejects editor token [AUTO]
Attempt to call `changeSlug` using an editor session.
Expected: `ConvexError` thrown.

### G05 — SEO checklist passes for a fully-filled guide [MANUAL]
Fill all SEO fields correctly (H1, metaTitle ≤ 60 chars, metaDescription 50–160 chars, slug set, alt text if image set).
Expected: all checklist rows show ✓ pass.

---

## Part 7 — Type safety and build [SCHEMA + AUTO]

### B01 — `npx tsc --noEmit` after each task [AUTO]
Run after each task completion. Expected: zero errors.

### B02 — `pnpm run build` succeeds [AUTO]
Run full production build.
Expected: no build errors. No new `ESLint` errors introduced.

### B03 — Existing test suite passes [AUTO]
```
npx vitest run
```
Expected: all pre-existing tests pass. New tests added in tasks 048, 051 pass.

### B04 — `extractQuickAnswer` unit tests cover edge cases [AUTO]
Tests in `src/lib/guides/markdown-utils.test.ts` must cover:
- Section found and correctly parsed
- Section missing → returns `null`
- Section with bold labels in different whitespace formats
- NL guide body (Dutch "## Kort antwoord" or "## Quick answer" — check actual NL files)

### B05 — `extractFaqs` unit tests cover edge cases [AUTO]
Tests in `src/lib/guides/markdown-utils.test.ts` must cover:
- FAQ section found with multiple items
- FAQ section missing → returns `[]`
- FAQ answer spanning multiple paragraphs
- Last FAQ item (no following section heading)

---

## Proof requirements per task

| Task | Required proof artifacts |
|---|---|
| 048 | `npx tsc --noEmit` pass, S01–S09 results |
| 049 | R01–R09 results, sitemap screenshot or curl output |
| 050 | I01–I09 results, script run output log |
| 051 | T01–T16 results, `npx tsc --noEmit` pass, B03–B05 unit test pass |
| 052 | A01–A06 results |
| 053 | A07–A10 results, redirect curl proof |
| 054 | G01–G05 results, B01–B03 results |
