# Guide Content Enrichment

## Goal

Every guide page on BestBikeFit4U should contain real, specific bike-fit content that a rider can act on — not boilerplate template text. Currently all guide pages are driven by `buildLeafSections()` and `buildFaqs()` in `src/lib/guides/content.ts`, which generate the same 7-section pain-template structure regardless of topic. The FAQ generates "Is [topic] always purely a fit problem?" for every guide including nutrition and power guides.

## Background

The guides system was recently rebuilt from a 6-guide `data.ts` approach into a CSV-backed backlog covering ~52 guides across 9 clusters. The CSV gives structure (slug, title, brief, links) but not body content. A template engine fills the gap — but that template is shallow, topic-agnostic, and breaks entirely for non-fit clusters (Nutrition, Power/FTP).

The old `data.ts` contains hand-written content for 6 guides (knee pain, lower back, road bike, gravel, MTB, triathlon). That content is richer than the template but currently orphaned — the live pages no longer use it.

## Scope

**In scope:**
- Design a guide content module (`src/lib/guides/guide-content.ts`) keyed by slug
- Write real, specific EN + NL content for all guides in the backlog with `status = "Existing"` or `status = "Existing + ..."` first, then "New" guides
- Migrate and upgrade the 6 orphaned `data.ts` guides into the new module
- Update `buildLeafSections()` and `buildFaqs()` to consume the content module, falling back to the template only when no content exists for a slug

**Out of scope:**
- Changing the routing, URL structure, or CSV backlog
- Adding new guide slugs or clusters not already in the CSV
- Medical advice or clinical claims beyond general bike-fit guidance

## Approach

### Step 1 — Content schema (task 037)
Define a `GuideContent` TypeScript type with:
- `intro`: `string[]` — 2–3 paragraphs
- `sections`: `Array<{ title: string; items: string[] }>` — topic-specific body sections
- `faqs`: `Array<{ q: string; a: string }>` — 2–4 real questions

Create `src/lib/guides/guide-content.ts` exporting a `GUIDE_CONTENT` record keyed by slug, and update the template engine to consume it.

### Step 2 — Write content by cluster (tasks 038–042)
Priority order follows search intent and current traffic:
1. Pain & Discomfort (039) — highest pain-point search intent
2. Ride Types (038) — broad audience, high volume
3. Setup Parameters (040) — long-tail, high conversion intent
4. Shoe/Foot/Cleat (041) — niche but high-intent
5. Bike Size & Geometry (041) — purchase-decision moments
6. Remaining clusters: Nutrition, Power, Rider Profiles, Fit Science (042)

### Step 3 — QA (task 043)
TypeScript type-check, spot-read 3 guides per cluster, verify fallback still works for any unlisted slugs.

## Acceptance criteria

- Every live leaf guide page uses authored EN + NL content rather than the generic template output
- Every guide page, including cluster landing pages, includes a quick-answer block that helps riders orient faster
- No guide FAQ asks "Is [topic] always purely a fit problem?" for nutrition or power topics
- `buildLeafSections()` returns template output for slugs with no entry in `GUIDE_CONTENT` (graceful fallback)
- `npx tsc --noEmit` passes
- NL and EN content both exist for every written guide

## Progress

- [x] Content registry and template-engine integration
- [x] Pain & Discomfort content
- [x] Ride Types content
- [x] Setup Parameters content
- [x] Shoe / Foot / Geometry content
- [x] Remaining clusters content
- [x] QA, review, and closeout

See [output-01-closeout-and-review.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/guide-content-enrichment/output-01-closeout-and-review.md).
