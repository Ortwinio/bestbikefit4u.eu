# Step 03 — Internal Linking And Science Cross-Links

## Context

Read:

- `plans/seo-improvement-v1/README.md`
- `plans/seo-improvement-v1/01-landing-pages.md`
- `plans/seo-improvement-v1/02-sitemap-and-guide-keywords.md`

The point of this step is to strengthen route relationships that already have commercial value.

## Goal

Improve internal linking between homepage, landing pages, guides, pain pages, calculators, and science pages without degrading readability.

## Task

Implement intentional, topic-matched internal links rather than broad, generic SEO scatter.

Use the route-level source of truth in:

- `plans/seo-improvement-v1/output-03-page-by-page-implementation-matrix.md`

## Deliverables

### 1. Homepage → landing page links

Add natural homepage body links to the new landing-page cluster where they help users:

- `/nl/fiets-afstellen`
- `/nl/bikefitting`
- `/en/bike-fitting`

Do not keyword-stuff the hero.

Good candidates:

- guide discovery section
- educational/explainer sections
- lower-funnel reference text where relevant

### 2. Dutch pain pages → `/nl/fiets-afstellen`

Add contextual inline links from the Dutch pain pages to `/nl/fiets-afstellen`, but only where the sentence reads naturally.

Do not force awkward exact-match insertions.

### 3. Guide-page calculator anchor improvement

Audit the highest-value guide pages and improve their calculator-link anchor text so it is more topic-specific.

This work should target the real guide linking layer:

- guide content / fallback guide data
- guide route label resolution
- guide backlog/internal-link targets where applicable

Do not assume `src/lib/seo/relatedLinks.ts` is the only or primary guide-linking source.

### 4. Science cross-links

Add selective trust/transparency links from high-relevance surfaces to:

- `/science/bike-fit-methods`
- `/science/stack-and-reach`
- `/science/calculation-engine`

Only add links where they improve trust or understanding.

### 5. Route-level implementation

Execute the matrix for the current public routes, especially:

- homepage and hub pages
- science pages
- core calculators
- existing guide pages
- existing use-case pages

Do not stop at high-level “related links” work. This step is only complete when the route-level matrix has been applied to the current public content layer.

### 6. Clear success criteria

Success for this step means:

- homepage links into the core calculator + guide + science cluster
- `/calculators/bike-fit` is reinforced by homepage, science, guide, and use-case pages
- `/calculators/saddle-height` is reinforced by symptom and measurement pages
- `/science/stack-and-reach`, `/calculators/frame-size`, and `/guides/road-bike-fit-guide` form a coherent cockpit/reach cluster
- primary contextual anchors are descriptive and localized

## Constraints

- Keep links natural and readable.
- Prioritize the highest-intent pages rather than mass-editing everything.
- Avoid boilerplate “SEO links” blocks that feel detached from the page content.
- Avoid generic anchors like `read more`, `learn more`, `open guide`, or `bekijk hier`.

## Completion Checklist

- [x] Homepage links intentionally into the new landing pages.
- [x] Dutch pain pages include natural links to `/nl/fiets-afstellen`.
- [x] Selected guides use stronger calculator anchor text.
- [x] Science pages are cross-linked from relevant funnel pages.
- [x] The route-level matrix has been applied to current public pages.
- [x] Success criteria in `output-03-page-by-page-implementation-matrix.md` are satisfied.
