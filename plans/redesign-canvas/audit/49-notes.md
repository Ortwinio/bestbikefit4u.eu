# 49 — Editable CMS guide import

2026-10-02, Codex B. Implementation complete; deployment and CMS publishing remain lead-owned.
No production command, database write, deployment, commit or push was performed.

## Import contract

- `guides/mutations:importGuideRewrite` accepts the review document fields directly, plus
  `actorId` and optional `overwrite`. Its validators reuse `guideEditableFields`; every field
  in the 48 JSON files, including bilingual featured/OG alt text and SEO flags, is covered.
- Canonical slug/path and complete bilingual publication content are checked before writes.
- Creates missing records. Existing records require `overwrite: true`, as confirmed by the lead.
- Keeps the existing ID, creation provenance, original publication timestamp and revision history.
  Saves the pre-import snapshot and the imported snapshot through `saveGuideRevision`, and records
  field changes in the guide audit log. `restoreGuideRevision` restores the old text.
- Sets published/44b, current update timestamps, and increments the existing version (new record: 1).
  File creation provenance, update provenance and version are never trusted. Unspecified optional
  editorial metadata is retained from the existing record.
- Revision `savedBy` requires a real user. The lead approved requiring `--actor-id` for real imports;
  the mutation checks that user has a CMS publishing role. No schema change was needed.
  CLI login authorizes the internal call; actor ID records attribution, not independent authentication.

## Script and safety

`scripts/import-guide-rewrites.mjs` validates all 48 files before processing any guide.
It bundles the same Convex document validator, checks nested types/unknown fields, and verifies
canonical slug/path and filename correspondence. Convex still validates IDs and arguments server-side.

Online preview prints create/update, changed editorial fields, and whether overwrite is needed.
System timestamps/version are deliberately omitted from the changed-field list: those always advance
on a real import. Real runs invoke one internal mutation per guide through CLI login, stop at the
first error and retain per-guide results in `49-import-log.json`.

`--dry-run --prod` is strictly query-only: the processing loop cannot enter the mutation branch,
and the CLI wrapper separately rejects every function except `getGuideImportRecord` during a dry-run.
It does not push code or enable code generation. Tests exercise the production-preview flag with
an injected CLI stub and verify that only query calls occur. No production connection was made.
Real production writes additionally require `--confirm-production`, `--overwrite` for existing
records, and `--actor-id`. Deployment/admin-key environments are rejected; no credentials are logged.

Lead release commands, **not executed here**:

```sh
node scripts/import-guide-rewrites.mjs --dry-run --prod --overwrite
node scripts/import-guide-rewrites.mjs --prod --confirm-production --overwrite --actor-id USER_ID
```

Deploy the new Convex mutation first. Inspect the preview and preserve its log before a real import
(each invocation replaces the run log). Stop on a failed import; already completed guide mutations
are individually atomic, not rolled back as a batch. Re-running with overwrite adds new revisions.

## Validation and environment

The configured local deployment does not exist. The CLI reported `No local deployment found`.
The lead explicitly waived deployment dry-run and requested offline validation instead.
No replacement deployment was created and no production fallback was used.

Executed `node scripts/import-guide-rewrites.mjs --dry-run --offline`:
**48/48 documents validated**, per-slug evidence in `49-import-log.json`.
Offline entries accurately say `unknown-offline`: create/update and current changed fields cannot
be determined without querying a deployment. The offline mode makes no Convex call.

- Convex suite: **313 tests across 63 files passed**, including 17 guide contract tests.
- New coverage: create, update, old revision restoration, provenance/publication preservation,
  version advancement, malformed documents, actor/path/overwrite guards, preview query-only behavior,
  first-error stopping, and real guide HTML using imported CMS copy and subsequent CMS edits.
- `npm run typecheck`: passed.
- `npm run lint`: passed, including runtime boundaries, tooltips, contrast, CSS and image checks.
- `git diff --check`: passed.

No C-owned tooling, shared guide renderer, schema, generated API files or review JSON was edited.
Manifest: `files-49.txt`.
