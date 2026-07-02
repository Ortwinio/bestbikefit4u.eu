# Plan: Blog Feature

## Goal

Add a fully SEO-optimised blog to BestBikeFit4U that non-technical users can manage entirely through the existing admin panel — no code changes required to publish an article.

## Background

The project already has a `guides` system (Convex `guidePages` table, admin CRUD at `/admin/guides`, public pages at `/guides/[slug]`). The blog will follow the exact same architectural pattern but with a prose-centric content model suited to long-form articles rather than structured how-to sections.

Key infrastructure that already exists and will be re-used:
- `buildArticleSchema`, `buildBreadcrumbListSchema`, `buildFaqPageSchema` in `src/lib/seo/jsonLd.ts`
- `<JsonLd>`, `<RelatedLinksSection>`, breadcrumb components in `src/components/seo/`
- Bilingual support (en/nl) via `src/i18n/`
- Admin auth pattern (`requireAdminSession`, `requireAnyRole`)
- Revision history pattern from `guideRevisions`
- Sitemap infrastructure — `sitemap-blog.xml` route already exists; `BLOG_ROUTE_SEEDS` is currently an empty array

## Scope

**In scope:**
- `blogPosts` and `blogRevisions` Convex tables + full backend (queries, mutations, auth)
- Admin panel: list, create, edit, preview, publish/unpublish
- Markdown body editor with toolbar for non-technical users
- Public `/blog` index page (paginated, category filter)
- Public `/blog/[slug]` article page with all required SEO elements
- Wire up `sitemap-blog.xml` to real data
- `BlogPosting` JSON-LD on each article
- Breadcrumb JSON-LD: Home → Blog → [Category] → Title
- OG / Twitter card metadata
- Responsive images with descriptive alt text

**Out of scope:**
- Comments / community features
- Newsletter subscription
- Author profile pages
- AI-assisted draft generation
- Multi-author bylines (one author per post, optional)

## Content model (`blogPosts` table)

| Field | Type | Notes |
|---|---|---|
| `slug` | `string` | URL-safe, indexed, unique |
| `status` | `"draft" \| "published"` | Controls public visibility |
| `title` | `{ en, nl }` | Shown in listings and as default H1 |
| `h1` | `{ en, nl }` | Override for the rendered H1 |
| `body` | `{ en: string, nl: string }` | Markdown prose |
| `excerpt` | `{ en, nl }` | Short summary for listing cards |
| `category` | `string` | Breadcrumb segment, e.g. `"bike-fitting"` |
| `tags` | `string[]` | Flat tag list |
| `featuredImageUrl` | `string?` | Cover image |
| `featuredImageAlt` | `{ en, nl }?` | Alt text |
| `authorName` | `string?` | Freeform, used in JSON-LD |
| `author` | `Id<"users">?` | Optional link to admin user |
| `publishedAt` | `number?` | Timestamp, set on first publish |
| `updatedAt` | `number` | Timestamp, updated on every save |
| `createdAt` | `number` | Immutable |
| `version` | `number` | Incremented on every save |
| `metaTitle` | `{ en, nl }` | `<title>` tag |
| `metaDescription` | `{ en, nl }` | Meta description |
| `canonicalUrl` | `string?` | Override (default: self-referencing) |
| `ogTitle` | `{ en, nl }?` | Open Graph title |
| `ogDescription` | `{ en, nl }?` | Open Graph description |
| `ogImageUrl` | `string?` | OG image |
| `ogImageAlt` | `{ en, nl }?` | OG image alt |
| `robotsIndex` | `boolean` | Default true |
| `relatedPostSlugs` | `string[]?` | Internal links to other posts |
| `relatedGuidePaths` | `string[]?` | Internal links to guides |
| `tableOfContents` | `boolean` | Auto-generate TOC from H2s |

## Approach

Five sequential prompts, each independently executable:

1. **Convex schema** — add tables to `schema.ts`, create `convex/blog/` module with shared validators
2. **Convex backend** — queries and mutations (CRUD, publish/unpublish, revision save)
3. **Admin UI** — list page, create form, edit form with markdown editor + preview tab
4. **Public pages** — `/blog` index and `/blog/[slug]` article page with full SEO stack
5. **Sitemap & wiring** — replace `BLOG_ROUTE_SEEDS` with real data, update sitemap index

## Acceptance criteria

- [x] Non-technical admin can create, edit, preview, and publish a blog post without touching code.
- [x] Admins can manage content, SEO, publishing status, markdown preview, related links, and revision history from `/admin/blog`.
- [x] Each published article has a unique URL, one H1, SEO title and meta description, canonical URL, Open Graph metadata, `BlogPosting` JSON-LD, breadcrumb JSON-LD, and bilingual EN/NL content fields.
- [x] `/blog` lists published posts only, supports category filtering, and paginates the listing.
- [x] `/blog/[slug]` returns 200 for published posts and 404 for missing or draft posts.
- [x] `sitemap-blog.xml` is generated from published Convex blog posts and includes localized alternates with correct `lastmod`.
- [x] Revision history is saved on create, edit, publish, and unpublish.
- [x] Featured images render through `next/image` with explicit dimensions and localized alt text.
- [x] Blog links are discoverable from the admin navigation, homepage, guides hub, guide pages, sitemap index, route policy, and `llms.txt`.

## Success criteria

- A content editor can publish the first complete EN/NL article in under 15 minutes using only `/admin/blog`.
- A published post appears on `/blog`, its detail page, `/sitemap-blog.xml`, and `/sitemap.xml` within the 15 minute ISR window.
- Draft posts never appear in public listings, related article sections, or the blog sitemap.
- Google-compatible structured data is present on article pages: `BlogPosting` and `BreadcrumbList`.
- SEO metadata can be controlled per locale, with canonical and robots overrides available when needed.
- Production build and TypeScript checks pass with the blog feature enabled.

## First article

The first CMS-ready article is defined in `plans/feature-blog/output-06-first-article.md`.

## Progress

- [x] 01 — Convex schema
- [x] 02 — Convex backend
- [x] 03 — Admin UI
- [x] 04 — Public pages
- [x] 05 — Sitemap & wiring

## Implementation status

Completed on 2026-07-02.

Verification:
- `npm run typecheck`
- `npm run build`
- `npx vitest run src/lib/seo/sitemap/sources.test.ts src/lib/seo/jsonLd.test.ts`
- `npx eslint convex/blog convex/schema.ts 'src/components/admin/blog/**/*.{ts,tsx}' 'src/app/(dashboard)/admin/blog/**/*.tsx' 'src/app/(public)/blog/**/*.tsx' src/components/content/BlogArticleCard.tsx src/components/content/BlogBodyMarkdown.tsx src/components/content/BlogTableOfContents.tsx src/lib/seo/jsonLd.ts src/lib/seo/sitemap/sources.ts src/app/sitemap-blog.xml/route.ts src/app/sitemap.xml/route.ts src/components/admin/layout/admin-navigation.ts`
