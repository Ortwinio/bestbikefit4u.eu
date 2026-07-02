# Prompt 02 — Convex Backend (queries & mutations)

## Prerequisites

Prompt 01 must be complete: `convex/schema.ts` has `blogPosts` and `blogRevisions` tables, and `convex/blog/shared.ts` exists with all helpers.

## Context

The guides module is the reference. Read these files before writing anything:
- `convex/guides/queries.ts`
- `convex/guides/mutations.ts`
- `convex/guides/audit.ts`

The blog backend lives in `convex/blog/`. Create the following files.

---

## `convex/blog/queries.ts`

All queries require appropriate auth. Model on `convex/guides/queries.ts`.

| Query | Auth | Description |
|---|---|---|
| `listPublishedPosts` | public | Returns all `status === "published"` posts, sorted by `publishedAt` desc. Accepts optional `category` filter and basic pagination (`cursor`, `numItems`). |
| `getPublishedPost` | public | Fetch one published post by slug. Returns `null` if not found or not published. Used by the public article page. |
| `listAllPosts` | admin editor | Returns all posts (draft + published), sorted by `updatedAt` desc. Used by admin list view. Accepts optional `status` and `category` filters. |
| `getDraftPost` | admin editor | Fetch one post by `Id<"blogPosts">` regardless of status. Used by admin edit page. |
| `listBlogRevisions` | admin editor | Fetch revision history for a given `postId`, sorted newest first. |
| `listPublishedSlugs` | public | Returns `{ slug, updatedAt, publishedAt }[]` for all published posts. Used by the sitemap. |

---

## `convex/blog/mutations.ts`

All mutations require appropriate auth. Always increment `version`, set `updatedAt`, and call `saveBlogRevision` before returning.

| Mutation | Auth | Description |
|---|---|---|
| `createPost` | blog editor | Insert a new `blogPosts` doc with `status: "draft"`, `version: 1`, `createdAt: Date.now()`, `updatedAt: Date.now()`, `publishedAt: undefined`. Validate slug availability with `assertBlogSlugAvailable`. Return the new `Id<"blogPosts">`. |
| `updatePost` | blog editor | Update editable fields on an existing post. Slug change: re-validate availability excluding current post. Always `saveBlogRevision` before applying changes. |
| `publishPost` | blog admin | Set `status: "published"`. Set `publishedAt: Date.now()` only if not already set (first publish). Save revision. |
| `unpublishPost` | blog admin | Set `status: "draft"`. Do NOT clear `publishedAt` (preserves original publish date for JSON-LD). Save revision. |
| `deletePost` | blog admin | Hard delete the post doc and all its revisions. Only allowed on draft posts — throw if status is published. |

---

## `convex/blog/index.ts` (or `convex/blog.ts`)

Export all queries and mutations so they are accessible via `api.blog.*`. Follow the same barrel export pattern used in `convex/guides/`.

---

## Register in `convex/http.ts` (if needed)

The guides module does not add HTTP routes. Blog does not need any either — skip this unless you find a need.

---

## Acceptance criteria

- All five queries callable from the admin UI (run `npx convex dev` to confirm no type errors)
- `createPost` → `publishPost` → `getPublishedPost` flow works end to end in Convex dashboard
- Slug uniqueness is enforced (duplicate slug throws)
- `deletePost` throws when called on a published post
- Each save creates a revision row
- `listPublishedSlugs` returns correct data for sitemap use
