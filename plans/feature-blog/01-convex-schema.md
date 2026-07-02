# Prompt 01 — Convex Schema

## Context

This is the first step in the blog feature. The project uses Convex as its backend-as-a-service. All table definitions live in `convex/schema.ts`. The `guides` feature is the reference — look at how `guidePages` and `guideRevisions` are defined there before making any changes.

Reference files to read first:
- `convex/schema.ts` — the full schema (look for `guidePages` and `guideRevisions`)
- `convex/guides/shared.ts` — the validator definitions and shared helpers used by guides

## Task

Add two new tables to `convex/schema.ts`:

### `blogPosts`

```ts
blogPosts: defineTable({
  slug: v.string(),              // URL slug, e.g. "choose-right-crm-small-business"
  status: v.union(v.literal("draft"), v.literal("published")),
  title: bilingualString,        // { en: string, nl: string }
  h1: v.optional(bilingualString),
  body: bilingualString,         // markdown prose { en, nl }
  excerpt: v.optional(bilingualString),
  category: v.string(),          // e.g. "bike-fitting", "training", "gear"
  tags: v.optional(v.array(v.string())),
  featuredImageUrl: v.optional(v.string()),
  featuredImageAlt: v.optional(bilingualString),
  authorName: v.optional(v.string()),
  author: v.optional(v.id("users")),
  publishedAt: v.optional(v.number()),   // set on first publish, never overwritten
  updatedAt: v.number(),
  createdAt: v.number(),
  version: v.number(),
  metaTitle: bilingualString,
  metaDescription: bilingualString,
  canonicalUrl: v.optional(v.string()),
  ogTitle: v.optional(bilingualString),
  ogDescription: v.optional(bilingualString),
  ogImageUrl: v.optional(v.string()),
  ogImageAlt: v.optional(bilingualString),
  robotsIndex: v.boolean(),
  relatedPostSlugs: v.optional(v.array(v.string())),
  relatedGuidePaths: v.optional(v.array(v.string())),
  tableOfContents: v.boolean(),
})
  .index("by_slug", ["slug"])
  .index("by_status_publishedAt", ["status", "publishedAt"]),
```

### `blogRevisions`

```ts
blogRevisions: defineTable({
  postId: v.id("blogPosts"),
  version: v.number(),
  snapshot: v.any(),
  savedBy: v.id("users"),
  savedAt: v.number(),
})
  .index("by_postId", ["postId"]),
```

### `bilingualString` validator

The guides module already defines this as `bilingualStringValidator` in `convex/guides/shared.ts`. Do NOT duplicate it — either import it from there or extract it to a new shared location `convex/lib/validators.ts` and update the guides module to import from there. Prefer the latter to avoid cross-module coupling.

## Create `convex/blog/shared.ts`

Create a new file `convex/blog/shared.ts` modelled on `convex/guides/shared.ts`. It should contain:

1. Import `bilingualStringValidator` from `convex/lib/validators.ts` (or wherever you placed it)
2. The full `blogPostEditableFields` object (all fields except `_id`, `_creationTime`, `createdAt`, `updatedAt`, `version`, `publishedAt`, `status`) — so mutations only accept the editable subset
3. Role guards:
   - `BLOG_EDITOR_ROLES` — same as `GUIDE_EDITOR_ROLES` in guides/shared.ts
   - `BLOG_ADMIN_ROLES` — same as `GUIDE_ADMIN_ROLES`
   - `requireBlogEditor(ctx)` / `requireBlogAdmin(ctx)` functions
4. Helper: `normalizeBlogSlug(slug: string)` — trim + lowercase
5. Helper: `buildBlogPath(slug: string)` — returns `/blog/${normalizeBlogSlug(slug)}`
6. Helper: `assertBlogSlugAvailable(ctx, slug, excludePostId?)` — query by_slug index, throw if taken
7. Helper: `saveBlogRevision(ctx, post, savedBy)` — insert into blogRevisions
8. Helper: `sortPostsByPublishedAtDesc(posts)` — sort helper for listing

## Acceptance criteria

- `npx convex dev` (or equivalent type-check) passes with no new errors
- The two new tables appear in the Convex dashboard after push
- `convex/blog/shared.ts` exports all helpers listed above
- No existing tests broken
