# Step 01 — Build The New SEO Landing Pages

## Context

Read:

- `plans/seo-improvement-v1/README.md`

This plan is intentionally focused on repo-verified gaps. Do not re-open already-solved breadcrumb/FAQ/schema work unless a page created in this step actually needs it.

## Goal

Create the three new intent-targeted landing pages that the current public funnel is missing:

- `/nl/fiets-afstellen`
- `/nl/bikefitting`
- `/en/bike-fitting`

## Task

Implement the first version of the three landing pages using existing public-site primitives and current SEO conventions.

## Deliverables

### 1. Create `/nl/fiets-afstellen`

Add:

- route file under `src/app/(public)/fiets-afstellen/page.tsx`
- metadata with `title`, `description`, `keywords`, `alternates`, and canonical
- body content that serves DIY/search intent rather than product-only intent
- strong internal links to the most relevant calculators
- CTA path into at least:
  - saddle height calculator
  - bike fit calculator
  - frame size calculator

### 2. Create `/nl/bikefitting`

Add:

- route file under `src/app/(public)/bikefitting/page.tsx`
- metadata with `title`, `description`, `keywords`, `alternates`, and canonical
- body content that is more product-oriented than `/nl/fiets-afstellen`
- a CTA path centered on the bike-fit calculator and signup journey

### 3. Create `/en/bike-fitting`

Add:

- route file under `src/app/(public)/bike-fitting/page.tsx`
- metadata with `title`, `description`, `keywords`, `alternates`, and canonical
- English-language framing around online / at-home bike fitting
- strong calculator handoff, especially to `/en/calculators/bike-fit`

### 4. Add schema only where needed for the new pages

For these new pages only, add the schema that fits the content:

- `BreadcrumbList`
- `FAQPage` if the page contains real FAQ entries
- other schema only if justified by the page structure

Do not add speculative schema just because it exists elsewhere in the app.

### 5. Reuse existing public primitives

Prefer the current system:

- `PublicPageShell`
- `PublicHero`
- `PublicSection`
- `PublicSurfaceCard`
- `PublicCtaBand`
- `RelatedLinksSection`
- `JsonLd`

## Constraints

- Keep the three pages distinct in intent and copy.
- Do not treat `/nl/fiets-afstellen` and `/nl/bikefitting` as hreflang alternates of each other.
- Do not invent a new design system for these pages.
- Do not add a CMS dependency just to launch these first versions.

## Completion Checklist

- [x] `/nl/fiets-afstellen` exists and routes correctly.
- [x] `/nl/bikefitting` exists and routes correctly.
- [x] `/en/bike-fitting` exists and routes correctly.
- [x] Each page has complete metadata and a clear calculator handoff.
- [x] New pages use the existing public-site primitives.
