# Prompt 01 — Convex schema, mutations, queries, and migration seed

## Context

This is Phase 1 of the lightweight CMS extension for guide pages. Read the plan README before starting.

The current guide content lives in TypeScript files under `src/lib/guides/`. We are moving this to a Convex-backed database so non-technical editors can manage content from an admin panel.

## Goal

Define all Convex schema tables, implement the required mutations and queries, and write a one-time migration seed script that imports all existing guide content from TypeScript into the new tables without breaking any public routes.

## What to implement

### 1. Convex schema additions (`convex/schema.ts`)

Add three new tables:

**`guidePages`** — the main content table (see content model in README):
- All fields from the content model table
- Indexes: `by_slug`, `by_status`, `by_cluster`, `by_status_and_cluster`
- Bilingual fields as nested objects: `{ en: string, nl: string }`

**`guideRevisions`** — snapshot per save:
- `guideId`: Id<"guidePages">
- `version`: number
- `snapshot`: any (full guidePages record snapshot)
- `savedBy`: string (userId)
- `savedAt`: number (timestamp)
- Index: `by_guideId`

**`redirects`** — URL redirects:
- `from`: string (path, e.g. `/guides/saddle/old-slug`)
- `to`: string (path)
- `statusCode`: number (301 or 302)
- `reason`: optional string
- `createdBy`: string (userId)
- `createdAt`: number (timestamp)
- Index: `by_from`

### 2. Convex mutations (`convex/guides/mutations.ts`)

- `createGuide(args)` — creates a draft record; requires admin role
- `updateGuide(args)` — updates fields; increments version; writes revision snapshot; requires admin or editor role
- `publishGuide(args)` — sets status to `published`, sets `publishedAt` if first publish, sets `lastUpdatedAt`; requires admin role
- `unpublishGuide(args)` — sets status to `unpublished`; requires admin role
- `changeSlug(args)` — changes slug on a published guide; auto-creates a 301 redirect from old path to new path; requires admin role

All mutations must:
- Use `requireUserId()` from `convex/lib/authz.ts`
- Use `v.` validators for all args
- Write an audit log entry to the existing audit log table (or create a `guideAuditLog` table if no general one exists)

### 3. Convex queries (`convex/guides/queries.ts`)

- `getPublishedGuide({ slug })` — returns guide with `status === "published"` or null; public
- `getDraftGuide({ id })` — returns any guide by ID; requires admin/editor role
- `listGuides({ status?, cluster?, locale? })` — paginated list for admin; requires admin/editor role
- `getGuideBySlug({ slug })` — returns any status; requires admin/editor role (used for edit form)
- `listRedirects()` — returns all redirects; requires admin role

### 4. Migration seed script (`scripts/seed-guides.ts`)

Write a Node.js script (using the Convex client) that:
1. Imports all guide entries from `src/lib/guides/backlog.ts`
2. Imports guide content from `src/lib/guides/guide-content.ts`
3. Maps fields to the new schema (bilingual fields become `{ en: ..., nl: ... }` objects)
4. Sets `status: "published"` for all existing guides
5. Sets `publishedAt` and `lastUpdatedAt` to current timestamp
6. Checks for existing records (idempotent — safe to re-run)
7. Prints a summary: `{total, created, skipped, errors}`

## Validation

- `npx tsc --noEmit` must pass after all changes
- Run `node scripts/seed-guides.ts` and verify all guides seed without errors
- Query `getPublishedGuide` for at least 3 existing slugs and verify they return correct data
