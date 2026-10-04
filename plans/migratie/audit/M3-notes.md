# M3 — mail, guide-image migration and local test kit

Worktree: /Users/ortwinverreck/Developer/bestbikefit4u-migratie, branch migratie/bikefitboost. Owner decisions used: apex https://bikefitboost.com, notifications.bikefitboost.com sender, no additional brand-name edits. Three subagents handled disjoint mail, DB and checker files; root reviewed and integrated the generated API type registration.

## Implementation

Fallback sender is noreply@notifications.bikefitboost.com. Support addresses in both brand configs, contact (including the previously split markup), privacy/terms and legal baseline fixtures use support@bikefitboost.com; SECURITY contact uses security@bikefitboost.com. Four admin demo identities use example.com. ANALYTICS_ADMIN_EMAILS runtime default remains empty/deny; M1 changed its .env.example default. Actual environment values and sender overrides were not changed. Four email installation links now use the apex; wording and brand names are preserved. See M3-mail-notes.md.

Internal migrations/domainMigration:rewriteGuideImageUrls defaults dryRun=true and accepts one selected table, cursor and page size (default 25, maximum 100). Exact HTTPS legacy apex/www authorities are replaced only in guidePages.ogImageUrl or guideRevisions.snapshot.ogImageUrl. Path/query/fragment remain unchanged; other snapshot data, timestamps, brand text, audit logs, feedback, users and authAccounts stay untouched. Counts and continuation cursor are returned; malformed snapshots are counted/skipped. Patches are idempotent and bounded. No deployment or database operation was performed. M3-db-runbook.md provides operator-only backup/export, dry-run, execution, verification and scoped rollback instructions.

scripts/domain-migration-check.mjs accepts canonical and legacy origins. Local mode starts the existing production TLS server and maps logical hosts to loopback through Host headers; it does not contact the production origins. It checks exact single 301 and path/query preservation, destination 200, every guide OG JPG as image/jpeg, recursive sitemap origins, robots, canonical/OG/hreflang and mixed resource content. OAuth checks stop after the legacy domain 301 and never start or consume a provider flow. Normal HTTP navigation links are not misclassified as mixed resource content. Production mode is a future read-only serial run with a 175 ms delay; it was not used here.

## Focused evidence

- DB: 32 contract tests; scoped ESLint and Convex tsc pass. Default dry run, both fields/tables, preservation, pagination, idempotency, invalid URLs/snapshots and bounds covered.
- Checker: 11 focused tests and scoped ESLint pass. Wrong status, second redirect, query loss and spoofed destination, missing metadata, empty sitemap, stale robots Host, mixed resources and HTML masquerading as JPEG are rejected.
- Email/contact/legal/identity: 243 tests across 16 files pass. 26 bilingual HTML/text previews and 52 screenshots regenerated at 600/375; no overflow, missing assets or flex/grid. Rendered text/HTML has no legacy/www links. NL 375 px login manually inspected. Renders are ignored and absent from manifests.

## Final runtime verification

The first checker run found four privacy/terms OG URLs inheriting the site root. Both legal page modules now use their existing localized canonical as openGraph.url; all 10 legal-page tests pass. No legal prose or brand names changed. The final report supersedes those initial four findings.

Final combined M1–M4 build: `-9rVbWuZgW5CDu7Uy3-cW`. A owns shared build/gates; C executed the migration checker against that exact completed build with the canonical apex and loopback Convex endpoints. No production origin or provider was contacted.

| Gate | Final result | Evidence |
| --- | --- | --- |
| Typecheck | PASS | /private/tmp/M1-final-typecheck.log |
| Full lint, including brand guard | PASS; zero brand findings | /private/tmp/M1-final-lint.log |
| Unit | 3,079 passed; 20 existing skips | /private/tmp/M1-final-unit.log |
| Contracts | 556 passed in 50 files | /private/tmp/M1-final-contracts.log |
| Convex tsc | PASS | /private/tmp/M1-final-convex-tsc.log |
| Production build | PASS | /private/tmp/M1-final-build.log |
| Local SEO crawl | 875 checks, zero findings | plans/seo-crawl-fixes/audit/crawl-m1-final-apex.md |
| M3 local checker | 228 paths, 684 exact single-301 redirects, 170 HTML pages, all 48 guide JPEGs; zero findings | domain-migration-local.md and .json; /private/tmp/M3-domain-check-final.log |
| Email previews | 26 bilingual HTML/text pairs, 52 screenshots; all checks pass | renders/mails/checks.json; /private/tmp/M3-mail-previews-final.log |
| Diff / manifest | Whitespace check passes; all 30 manifest paths exist; no PNG entries | files-M3.txt |

Runtime checker command:

```sh
NEXT_PUBLIC_SITE_URL=https://bikefitboost.com \
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:9 \
NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:9 \
node scripts/domain-migration-check.mjs https://bikefitboost.com https://bestbikefit4u.eu --local --skip-build --label=local
```

These overrides affect only the local verification process, not environment files or deployed settings. Local servers shut down cleanly. Repository guides render using offline fallback; live-only CMS data and deployed Vercel/DNS/provider behavior are outside this local proof. OAuth destinations are intentionally not requested; their first domain hop is verified separately from the M2 provider contracts.

The earlier pre-M4 unit/contract counts are superseded by this integrated snapshot. Remaining brand-name mentions are deliberately unchanged and listed in inventory-code.md section 13. Backup/export and both mutation execution modes are documented only: no real database calls, commits, deploys, production data/environment changes or mail sends occurred. M3 is complete.
