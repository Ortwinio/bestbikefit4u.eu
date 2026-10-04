# M3 guide image URL migration runbook

Implementation: `convex/migrations/domainMigration.ts`, internal mutation
`migrations/domainMigration:rewriteGuideImageUrls`.

Prepared and contract-tested locally only. No production query, export, mutation,
deployment, environment change or mail was performed by this task. The commands
below are an operator runbook, not authorization to execute them.

## Scope and invariants

Only `guidePages.ogImageUrl` and `guideRevisions.snapshot.ogImageUrl` change.
Only exact HTTPS legacy apex/www authorities are accepted. The target is
`https://bikefitboost.com`; path, query and fragment bytes remain unchanged.
Credentials, alternate ports, subdomains, spoof hosts, whitespace, backslashes,
relative URLs and non-HTTPS URLs are untouched. Non-object/array revision snapshots
are skipped and counted. Other snapshot content and metadata remain unchanged.
The mutation never touches users, auth accounts, audit logs, feedback or any other
table. It does not update timestamps or revision versions. It is idempotent.

Each call selects one table and one page (default 25; accepted 1–100); reads are
bounded to 100 rows and 1 MB. The output contains only counts, table, dry-run mode,
`continueCursor` and `isDone`, not row content or personal data. Counts are per page:
`scanned`, `eligible`, `updated`, `skipped`, `invalidSnapshots`.
`dryRun` defaults to true; `updated` is therefore zero during previews.

## 1. Preconditions and backup (owner action)

Confirm the deployment and the approved code version first. The inventory records
production pricing tables that are absent from this branch's schema. Reconcile the
full release schema before deploying; this migration must not be used as a reason
to remove those tables or their data. M3 itself makes no schema changes.
Schedule a short CMS
editing pause so preview totals can be compared with execution totals. Confirm all
current guide image paths return 200 with an image content type on the target;
the separate M3 domain-check report supplies local app proof. This does not prove
that the eventual production deployment serves those files.

From `/Users/ortwinverreck/Developer/bestbikefit4u-migratie`, after explicit owner
approval, create a complete backup in restricted storage outside the repository:

```sh
npx convex export --prod --path /secure/backups/bikefitboost-pre-domain-migration.zip
```

Check successful exit, archive integrity and presence of `guidePages` and
`guideRevisions` records. Retain a checksum, deployment ID and timestamp. The
archive includes personal data; never attach it to the repo or audit notes.
Deploying the reviewed mutation is a separate owner action before the next step.

## 2. Paginated dry run

```sh
npx convex run --prod migrations/domainMigration:rewriteGuideImageUrls '{"table":"guidePages","cursor":null,"numItems":25}'
npx convex run --prod migrations/domainMigration:rewriteGuideImageUrls '{"table":"guideRevisions","cursor":null,"numItems":25}'
```

For EACH table, repeat using its returned `continueCursor` until `isDone:true`.
Pass the cursor exactly as returned, properly JSON-escaped; do not infer cursor
contents or reuse a cursor for another table. Empty pages can still have
`isDone:false`: continue using their cursor. Sum the per-page counts separately.
The earlier inventory suggested 48 eligible rows in each table (96 total), but
this is historical evidence, not an assumed current count. Investigate unexpected
counts or invalid snapshots before executing. Every dry-run page must report
`updated:0`.

## 3. Explicit execution

Restart from `cursor:null` for each table; do not reuse the final dry-run cursor.

```sh
npx convex run --prod migrations/domainMigration:rewriteGuideImageUrls '{"table":"guidePages","cursor":null,"numItems":25,"dryRun":false}'
npx convex run --prod migrations/domainMigration:rewriteGuideImageUrls '{"table":"guideRevisions","cursor":null,"numItems":25,"dryRun":false}'
```

Continue each table with its own returned cursor until done. Record aggregate
counts and checkpoint cursors in restricted operator storage. Each page is an
atomic mutation. On interruption, restart at null safely; already migrated rows
become skipped. Do not assume restarted execution totals equal the initial
preview, because successfully applied earlier pages are now skipped.

## 4. Verification

Repeat the complete dry-run scans from null. Both tables must report total
`eligible:0`. Compare backup/current data by document ID: only the two authorized
fields may differ, each with the exact host substitution. Confirm untouched
invalid snapshots and all historical logs/user identifiers. Check representative
migrated images via HTTP 200 plus image content type and inspect guide OG metadata.
Any post-run new old-host entries indicate concurrent CMS writes or an old importer;
fix that source before rerunning. Re-enable CMS editing after checks.

## 5. Rollback

Do not blindly reverse the hostname: that would overwrite legitimately new target
URLs and cannot recover the original apex-versus-www authority. Use the protected
pre-migration export as the source of truth for the exact previous field values,
keyed by document ID. Prepare a separately reviewed, internal, bounded rollback
mutation that patches ONLY these fields (for revisions merge into the current
snapshot), only where the current value still equals the computed migrated value.
Preview rollback counts first, pause CMS editing, execute after explicit approval,
and verify all other fields remain unchanged. Flag concurrent edits or missing
records for manual review; never overwrite them or bulk-import the entire backup
into an active production deployment. No rollback mutation is deployed by M3.

## Local proof

`npx vitest run convex/migrations/domainMigration.contract.test.ts`: **32 passed**.
`npx eslint convex/migrations/domainMigration.ts convex/migrations/domainMigration.contract.test.ts`: **passed**.
Contracts cover both tables, internal-only exposure, default write-free dry run,
exact field preservation, idempotency, malformed/spoof/query URLs, invalid snapshot
shapes, bounded paging and invalid page sizes. No network or database is used.
