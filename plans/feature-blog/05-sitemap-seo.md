# Prompt 05 — Sitemap & Final SEO Wiring

## Prerequisites

Prompts 01–04 must be complete and at least one post must be published.

## Context

The sitemap infrastructure is in `src/lib/seo/sitemap/`. The relevant files are:
- `src/lib/seo/sitemap/sources.ts` — defines `BLOG_ROUTE_SEEDS` (currently `[]`) and the `getSitemapEntries("blog")` function
- `src/lib/seo/sitemap/types.ts` — `SitemapSection` type, `SitemapEntry` interface
- `src/app/sitemap-blog.xml/route.ts` — the actual sitemap route (already wired up, just needs data)

The sitemap route calls `getSitemapNodes("blog")` at request time. The sitemap is already in the sitemap index when entries are present.

---

## Task 1 — Replace static seeds with dynamic blog data

The blog sitemap must reflect published posts dynamically. Because the sitemap route uses `export const dynamic = "force-static"` with `revalidate = 900`, we can fetch from Convex at build/revalidate time using server-side query helpers.

**Option A (recommended):** Add a `getBlogSitemapEntries()` function to `src/lib/seo/sitemap/sources.ts` that calls `api.blog.queries.listPublishedSlugs` via the Convex server fetch helper. Replace `BLOG_ROUTE_SEEDS.map(toEntry)` with a call to this function.

This mirrors how the guides sitemap is built. Read `getSitemapEntries` for the "guides" case to understand the exact pattern used for Convex-backed sections.

Each entry should be:
```ts
{
  loc: `/blog/${slug}`,
  lastmod: new Date(updatedAt).toISOString().split("T")[0],  // YYYY-MM-DD
  changefreq: "weekly",
  priority: 0.6,
}
```

**Note on i18n:** If the site serves bilingual URLs (e.g. `/blog/slug` for EN and `/nl/blog/slug` for NL), add `<xhtml:link>` hreflang alternates for each entry. Check how the guides sitemap handles this and replicate.

---

## Task 2 — Verify sitemap index includes blog section

`src/app/sitemap.xml/route.ts` (the index sitemap) already calls `getSitemapIndexNodes()` which includes `"blog"` only when `getSitemapEntries("blog").length > 0`. Once Task 1 is done and a post is published, the index will automatically include the blog sitemap. Verify this manually.

---

## Task 3 — Internal links from existing pages

For discoverability and internal link equity, add a "From the blog" or "Latest articles" section to the following pages:

1. **Homepage** (`src/app/(public)/page.tsx` or the public layout) — show 2–3 most recent published posts as cards. Fetch using `listPublishedPosts` with `numItems: 3`.

2. **Guides hub** (`src/app/(public)/guides/page.tsx`) — add a "Related blog articles" link section at the bottom, if any posts have `relatedGuidePaths` pointing to guides.

3. **Individual guide pages** (`src/app/(public)/guides/[slug]/page.tsx`) — if any published blog posts have `relatedGuidePaths` containing this guide's path, surface them in a "Related articles" block below the guide content. This requires a new query: `listPublishedPostsByRelatedGuidePath(path)`.

Only add these if they add genuine value; if no posts exist, the sections should not render (conditional on data).

---

## Task 4 — `robots.txt` review

Open `src/app/robots.ts` and verify:
- `/blog` and `/blog/*` are **not** disallowed
- The blog sitemap URL is not accidentally blocked
- If the robots file has an explicit allowlist pattern, add `/blog` and `/blog/*`

Read the current file before making any changes.

---

## Task 5 — `llms.txt` review (if present)

The project has an `llms.txt` (added in a recent commit). If this file references the site's content sections, add a "Blog" entry pointing to `/blog`. Read the file first.

---

## Acceptance criteria

- `GET /sitemap-blog.xml` returns valid XML listing all published posts (verify with curl or browser)
- Each entry has correct `loc`, `lastmod`, and hreflang alternates (if applicable)
- The sitemap index (`/sitemap.xml`) includes a `<sitemap>` entry pointing to `/sitemap-blog.xml`
- Homepage and/or guides pages show blog post links when posts exist
- `robots.txt` does not block `/blog`
- All new URLs return 200 (no broken internal links)
