# Prompt 06 — Batch JSON import from docs/cms-import

## Context

62 production-ready guide JSON files are in `docs/cms-import/en/` (31 files) and `docs/cms-import/nl/` (31 files). This prompt implements the import script that reads all files, pairs EN/NL by slug, and writes them as published records to the Convex `guidePages` table.

Read the full "Batch JSON Import" section in the plan README before starting. Complete Prompt 01 (Convex schema) first — the `guidePages` table must exist.

This import replaces the seed script from Prompt 01 for the JSON-file content. The Prompt 01 seed handled the existing TypeScript content; this script handles the `docs/cms-import` JSON content. Run both. Slug collision handling (idempotency) covers any overlap.

## Source file structure

Each JSON file has these fields (see README for full field map):
```
backlogOrder, slug, path, locale, cluster, status, pageTitle, metaTitle, h1,
pageBrief, primaryCtaLabel, primaryCtaTarget, internalLinkTargets,
notesOrRedirects, libraryBody, metaDescription, relatedKeywords,
alternateLocalePath, backlogSeoHints, heroImageFileName, heroImagePublicPath
```

- `slug` includes a locale path prefix segment (`guides/bike-fitting-for-knee-pain`) — **strip the leading `guides/` to get the bare slug**
- `primaryCtaTarget` includes a locale prefix (`/en/login`) — **strip the locale to get `/login`**
- `internalLinkTargets` are full locale paths (`/en/guides/saddle-height-guide`) — **strip locale prefix to get `/guides/saddle-height-guide`**
- `libraryBody` is a full Markdown string — **store as-is**

## What to implement

### 1. Convex schema additions (if not already added in Prompt 01)

Ensure the `guidePages` schema includes these fields added for import:

```ts
backlogOrder: v.optional(v.number()),
importStatus: v.optional(v.string()),     // "Existing", "Existing + expand", etc.
importNotes: v.optional(v.string()),
heroImageFileName: v.optional(v.string()),
heroImagePublicPath: v.optional(v.string()),
relatedGuidePaths: v.optional(v.array(v.string())),
relatedKeywords: v.optional(v.array(v.string())),
seoHints: v.optional(v.any()),
libraryBody: v.optional(v.object({ en: v.string(), nl: v.string() })),
```

The `libraryBody` field is separate from the structured `body` sections array (which is used for manually created guides in the admin panel). Imported guides use `libraryBody`; manually created guides use `body`. The template reads `libraryBody` first and falls back to `body`.

### 2. Import script (`scripts/import-guide-json.ts`)

Create a script using the Convex Node.js client (`ConvexHttpClient` from `convex/browser`).

**Algorithm:**

```
1. Read all files from docs/cms-import/en/ → enFiles: Map<slug, data>
2. Read all files from docs/cms-import/nl/ → nlFiles: Map<slug, data>
3. Build a union of all slugs
4. For each slug:
   a. Read EN file (may be missing)
   b. Read NL file (may be missing)
   c. Merge into a single record (bilingual fields as { en: ..., nl: ... })
   d. Transform fields:
      - strip locale prefix from slug: "guides/x" → "x"  
      - strip locale prefix from primaryCtaTarget: "/en/login" → "/login"
      - strip locale prefixes from internalLinkTargets
      - set status: "published"
      - set publishedAt: Date.now()
      - set lastUpdatedAt: Date.now()
      - set createdBy: "import-json"
      - set version: 1
   e. Check if record with same slug already exists in DB
   f. If exists and --overwrite not set: skip (log "skipped: {slug}")
   g. If exists and --overwrite set: call updateGuide mutation
   h. If not exists: call createGuide mutation
5. Print summary
```

**Field merging rules:**

| Schema field | Source |
|---|---|
| `slug` | en.slug, stripped of "guides/" prefix |
| `cluster` | en.cluster (or nl.cluster — they match) |
| `backlogOrder` | en.backlogOrder |
| `importStatus` | en.status |
| `importNotes` | en.notesOrRedirects |
| `pageTitle.en` | en.pageTitle |
| `pageTitle.nl` | nl.pageTitle |
| `metaTitle.en` | en.metaTitle |
| `metaTitle.nl` | nl.metaTitle |
| `h1.en` | en.h1 |
| `h1.nl` | nl.h1 |
| `pageBrief.en` | en.pageBrief |
| `pageBrief.nl` | nl.pageBrief |
| `primaryCtaLabel.en` | en.primaryCtaLabel |
| `primaryCtaLabel.nl` | nl.primaryCtaLabel |
| `primaryCtaTarget` | en.primaryCtaTarget, locale stripped |
| `relatedGuidePaths` | en.internalLinkTargets, locale stripped |
| `libraryBody.en` | en.libraryBody |
| `libraryBody.nl` | nl.libraryBody |
| `metaDescription.en` | en.metaDescription |
| `metaDescription.nl` | nl.metaDescription |
| `relatedKeywords` | en.relatedKeywords |
| `seoHints` | en.backlogSeoHints |
| `heroImageFileName` | en.heroImageFileName |
| `heroImagePublicPath` | en.heroImagePublicPath |
| `robotsIndex` | true (all imported guides are indexable) |
| `tableOfContents` | false |
| `status` | "published" |

**Script flags:**
```
--dry-run             log what would be imported without writing to DB
--slug {slug}         import only one guide (bare slug, e.g. "bike-fitting-for-knee-pain")
--overwrite           overwrite existing DB records
--copy-images         copy images from docs/cms-import/images/ to public/guides/media/
--verbose             log each record's fields on import
```

**Example invocation:**
```bash
npx tsx scripts/import-guide-json.ts --dry-run
npx tsx scripts/import-guide-json.ts
npx tsx scripts/import-guide-json.ts --copy-images
npx tsx scripts/import-guide-json.ts --slug bike-fitting-for-knee-pain --overwrite
```

### 3. Image copy utility (within the script, `--copy-images` flag)

```
source: docs/cms-import/images/*.png
target: public/guides/media/*.png
```

- Use `fs.copyFileSync`
- Skip if file already exists (unless --overwrite)
- Log: "Copied {n} images to public/guides/media/"

The `public/guides/media/` directory must exist or be created by the script.

### 4. Validation step in the script

After import, the script should run a smoke-check:
- Query 5 random slugs from the DB and verify they return non-null records
- Verify at least one has `libraryBody.en` populated
- Verify at least one has `heroImagePublicPath` set
- Print: "Smoke check: passed / failed"

### 5. Locale stripping utility (`scripts/lib/locale-strip.ts`)

Small shared utility:
```ts
export function stripLocalePrefix(path: string): string {
  return path.replace(/^\/(en|nl)/, "");
}

export function stripGuidePrefix(slug: string): string {
  return slug.replace(/^guides\//, "");
}
```

## Validation

- Run `npx tsx scripts/import-guide-json.ts --dry-run` and verify output lists all 31 guide pairs
- Run `npx tsx scripts/import-guide-json.ts` and verify 31 records are created
- Run the script again without `--overwrite` and verify all 31 are skipped (idempotent)
- Query a known slug (`bike-fitting-for-knee-pain`) and verify all bilingual fields are populated
- Verify `libraryBody.en` contains the full Markdown string (not truncated)
- Verify `heroImagePublicPath` is set to a path without locale prefix
- Run `--copy-images` and verify images are in `public/guides/media/`
- `npx tsc --noEmit` must pass
