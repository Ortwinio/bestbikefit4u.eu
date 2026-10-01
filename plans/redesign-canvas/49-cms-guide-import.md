# 49 — Rewritten guides into the CMS (editable)

Request (Ortwin, 2026-10-02): see the new guide texts in the CMS and be able to edit them.
Ortwin's go covers writing the 48 rewritten guides to the production CMS after the release.

Today: the 48 review documents in `plans/redesign-canvas/guides-import/<slug>.json` are schema-shaped
(bilingual, with og/featured/alt fields) but `convex/guides/mutations.ts` `importGuide` accepts only 29
fields and the CLI `scripts/import-guide-json.ts` expects the legacy per-locale input (see 44b-C-notes,
"Publishing handoff"). Code rewrites win over legacy CMS records; a CMS record with `importStatus=44b` wins
over the code (44b-C-notes), so after this import the CMS is the source and edits in the CMS show on the site.

## Task 49 — Codex B

1. Convex: add `importGuideRewrite` (internalMutation) that takes one review document as-is (validator for
   every field the review JSON contains that the `guidePages` schema supports, incl. featuredImageAlt,
   ogTitle/ogDescription/ogImageUrl/ogImageAlt, relatedGuides, robotsIndex, tableOfContents) and upserts by
   slug: keep `_id`, `createdAt`, `createdBy`, original `publishedAt` and existing revision history (write a
   revision entry like `updateGuide` does, so the old text can be restored via `restoreGuideRevision`);
   set `importStatus: "44b"`, `status: "published"`, `lastUpdatedAt`/`updatedAt` = now, version + 1.
   Ignore `createdAt/createdBy/version` from the file. Reject unknown slugs only if `overwrite` is false
   and the record does not exist (create is allowed). No schema change unless unavoidable (tell the lead).
2. Script `scripts/import-guide-rewrites.mjs`: reads all 48 files, validates, `--dry-run` prints per slug
   create/update + changed fields; real run calls the mutation through the Convex CLI
   (`npx convex run guides/mutations:importGuideRewrite '<json>' [--prod]`, one call per guide, CLI auth —
   no admin key in files or env output), stops on the first error, writes a run log to
   `plans/redesign-canvas/audit/49-import-log.json`.
3. Tests: Convex tests for create, update (revision kept, publishedAt kept, importStatus 44b, version+1),
   validator rejects malformed docs; a test that the rendered page uses the CMS record after import
   (CMS precedence) and that a later CMS edit shows.
4. Do **not** run against production. Run `--dry-run` against the local/dev deployment only and report.

Acceptance: focused + Convex tests, lint, typecheck; notes `audit/49-notes.md`, `files-49.txt`.
No commit. Print **DONE 49**.
