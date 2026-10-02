# E2 locale subtask

Completed only in /Users/ortwinverreck/Developer/bestbikefit4u-emails.

- Added optional users.locale, users.emailPreferences { service, marketing }, and lifecycleEmailLog.locale. Both preference booleans use true=enabled, false=opt-out. Optional fields preserve old records.
- Added authenticated setLocale and setLocaleIfMissing mutations with exact nl/en argument validators and null returns. Backfill never overwrites a saved locale.
- resolveEmailLocale uses saved locale, then exact request locale, then shared DEFAULT_LOCALE (en). loginEmailLocale parses explicit leading path segments or redirectTo paths, never arbitrary substrings.
- Parent contract and send-time user retrieval responsibility recorded in messages/E2-locale-to-B-contract.md.

Checks:
- npx --no-install vitest run convex/emails/locale.test.ts convex/users/locale.test.ts: 56 passed.
- npm run lint: passed.
- npm run typecheck -- --incremental false: blocked only by E1's missing convex/emails/templates/renderers import at templates/index.ts:50. Original typecheck also could not write sandboxed tsconfig.tsbuildinfo; rerunning without cache removed that error.
- git diff --check: passed.

No convex-test or other dependency changes, package/lockfile edits, sender changes, commits, deployments, or mail sends. Tests use existing fake ctx/db and _handler conventions. Parent owns mocked-Resend cron integration proving send-time locale switching.
