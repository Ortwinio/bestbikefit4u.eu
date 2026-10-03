# R14 production migration preparation

Status: instructions only. No production call, export, deployment or migration was executed by this task.
Lead must approve the target deployment and each operational stage separately. Approval to ship the
frontend is not approval to run a data migration. Never use `convex dev`, `run --push` or unattended pagination.

## Preconditions and backup

- R16 advice progress adds optional embedded fields to existing outcome tables. Legacy advice defaults
  to revision zero with no performed state. No R16 backfill or migration command is needed; never
  infer performed status or better/same/worse from legacy comfort scores. Deploy its functions/schema
  before the matching frontend. Source deletion also deletes embedded progress.

- Confirm the reviewed release SHA includes `origin/main` PR9 (`e93f8c1`) and the final rider changes.
- Deploy the reviewed additive Convex schema/functions first, only after explicit deployment approval.
  Verify `profiles/migrateObservations:migrateProfiles` and `migrateBikes` exist on the intended production deployment.
- Verify project/deployment selection privately, including any `CONVEX_DEPLOY_KEY`, `CONVEX_DEPLOYMENT`
  or deployment override. A deploy key can select a target despite CLI flags. Do not print secrets.
- Before write approval, obtain a recent production backup/export in restricted storage outside the repo.
  With separate explicit export approval, the installed CLI supports:

```sh
npx convex export --prod --include-file-storage --path /approved-private-backup/rider-before-migration.zip
```

The directory is an operator-selected placeholder, not a path to create automatically. Exports contain
personal data and possibly uploaded images. Restrict access, encrypt/store according to operational policy,
verify completion/integrity and restore procedure, and record only timestamp, deployment identity and a
private backup reference in release evidence. Do not attach the archive or table dumps to this repository.

## Approved read-only dry-run

From the approved release checkout and explicitly verified production target, run the first page of each:

```sh
npx convex run --prod profiles/migrateObservations:migrateProfiles '{"paginationOpts":{"numItems":10,"cursor":null},"dryRun":true}'
npx convex run --prod profiles/migrateObservations:migrateBikes '{"paginationOpts":{"numItems":10,"cursor":null},"dryRun":true}'
```

For each function independently, use its returned `continueCursor` in the next invocation:

```sh
npx convex run --prod profiles/migrateObservations:migrateProfiles '{"paginationOpts":{"numItems":10,"cursor":"PASTE_PROFILES_CONTINUE_CURSOR"},"dryRun":true}'
npx convex run --prod profiles/migrateObservations:migrateBikes '{"paginationOpts":{"numItems":10,"cursor":"PASTE_BIKES_CONTINUE_CURSOR"},"dryRun":true}'
```

Repeat manually until that function returns `isDone: true`. Do not confuse cursors between tables or
restart from null and add duplicate counts. Cursors are operational state: keep transient/private, not in
public evidence. The source uses `paginationOptsValidator`, defaults omitted `dryRun` to true, rejects
nonpositive/noninteger page sizes, and caps pages at 10 documents / 10 rows read / 1 MB.

Record aggregates per table only: pages, `documents`, `candidates`, `planned`, `preservedCurrent`,
`invalidValues`, completion flag and error category. Do not record measurements, user IDs, emails, names,
birth dates, observations, cursors or raw production document dumps. The mutation itself returns counts
and cursor state, not records. Check `candidates = planned + preservedCurrent` per completed page.

## Review and stop criteria

- Stop on any wrong-target uncertainty, authorization/runtime error, unchanged/repeated cursor without
  completion, count inconsistency, unexpected table growth, or unsuccessful backup before a proposed write.
- Any nonzero `invalidValues` requires lead review before writes. Invalid data is skipped, not repaired;
  investigate privately with narrowly authorized access rather than adding personal data to audit logs.
- Review conservative migration classification in `shared/profileObservationMigration.ts` and its tests.
  Derived estimates must remain derived; legacy timestamps are not proof of a measurement event.
- Existing current observations win. Duplicate scopes in one page are preserved. No existing profile/bike
  values are rewritten, no email is sent and no continuation page is scheduled by these functions.
- Pagination is not a database-wide snapshot. Concurrent edits can change counts between pages and
  between dry-run and writes. Do not present the dry-run total as a guaranteed write total.

## Optional write stage — separate approval required

After aggregate review and explicit lead authorization, start a fresh pass at `cursor:null` using the same
commands with `"dryRun":false`. Follow that write pass's own cursors; do not reuse the completed dry-run
cursor. Retain aggregate-only evidence. On any stop condition, stop pagination and notify lead; each page
is a transaction but the multi-page operation is not one transaction.

After completion, run both dry-runs again from null. Already imported current scopes should contribute
to `preservedCurrent`, not `planned`. Concurrent new/edited data may leave planned candidates; review
before claiming idempotence for a live database. Contract tests establish deterministic fixture idempotence,
not completion of production data migration.

## Rollback limits

Migration only inserts `source:legacy_migration`, `status:current` observations; it has no rollback endpoint.
Do not delete every legacy-migration row blindly: later user edits/references can depend on those IDs.
A frontend rollback does not undo data or scheduled jobs. An older restrictive schema may reject new
tables/fields/union variants. Prefer retaining the compatible additive backend and rolling frontend forward
or back to a compatible build. Any targeted cleanup or whole-database restore needs a separately reviewed
plan; restoring a backup can discard legitimate changes made after it was taken.
