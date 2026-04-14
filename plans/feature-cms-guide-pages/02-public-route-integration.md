# Prompt 02 — Public route integration: DB-first with TypeScript fallback

## Context

Prompt 01 added the Convex schema, mutations, queries, and the seed script. This prompt wires the public guide pages to read from the database first, falling back to the existing TypeScript content modules for any slugs not yet in the DB.

Read the plan README before starting. Complete Prompt 01 first.

## Goal

Update the public-facing guide rendering pipeline so that:
1. Guide pages are served from Convex when a published record exists
2. The existing TypeScript content is used as a fallback (so nothing breaks before all guides are migrated)
3. SEO metadata (title, meta description, OG fields) is served from the DB record when available
4. XML sitemap includes all published guides from Convex
5. Redirects are served from Next.js middleware using the `redirects` table

## What to implement

### 1. Update `src/lib/guides/content.ts`

Add a server-side function `getGuideFromDb(slug: string, locale: Locale)` that:
- Calls the Convex `getPublishedGuide({ slug })` query using the server-side Convex client
- Returns a normalized `GuideContent` object (same shape the existing TypeScript functions return)
- Returns `null` if not found

Update `getGuideContent(slug, locale)` to:
```
1. Try getGuideFromDb(slug, locale)
2. If found: return DB content
3. If not found: fall back to existing guide-content.ts module
4. If still not found: return null
```

The existing TypeScript content modules must not be deleted. They are the fallback.

### 2. Update `src/app/(public)/guides/[slug]/page.tsx`

Update `generateMetadata()` to:
- Use SEO fields from the DB guide record when available
- Fall back to the existing backlog.ts fields for slugs not yet in DB
- Render: `metaTitle`, `metaDescription`, `ogTitle`, `ogDescription`, `ogImageUrl`, canonical URL, `robotsIndex` (`noindex` robots meta when false)
- Render JSON-LD structured data:
  - `Article` schema (always when guide is present)
  - `FAQPage` schema (when guide has at least one FAQ)
  - `BreadcrumbList` schema (always, from guide path)

### 3. Update XML sitemap

In `src/app/sitemap.ts` (or wherever sitemap is generated):
- Query all published guides from Convex using `listGuides({ status: "published" })`
- Include each as a sitemap entry with `lastmod: new Date(guide.lastUpdatedAt).toISOString()`
- The sitemap must include all published DB guides plus any TypeScript-only guides not yet seeded
- No duplicate entries for guides that exist in both

### 4. Redirect middleware (`src/proxy.ts` or `src/middleware.ts`)

- On each request, check if the path matches a record in the `redirects` table
- If matched: return `NextResponse.redirect(record.to, { status: record.statusCode })`
- Use a cached/edge-compatible Convex fetch (not a full Convex client) or preload redirects at startup
- Do not add redirect check latency to non-redirect paths (skip check if path starts with `/api`, `/_next`, `/static`)

**Implementation note:** Querying Convex on every middleware request may add latency. Preferred approach: use a Convex HTTP action (`/api/redirects`) that returns all active redirects as JSON, cache in memory with a 60-second TTL, and check against the cached map.

### 5. robots.txt

Ensure that guides with `robotsIndex: false` return `<meta name="robots" content="noindex, follow">` in the page `<head>` via `generateMetadata()`.

## Validation

- Load at least 5 existing guide URLs and verify they render correctly
- Verify `<title>`, `<meta name="description">`, OG tags are present in page HTML
- Verify Article and FAQ JSON-LD blocks are present in page HTML for a guide with FAQs
- Verify XML sitemap includes all published guides
- Manually change a guide slug via `changeSlug` mutation and verify 301 redirect works
- `npx tsc --noEmit` must pass
- All existing guide tests must pass
