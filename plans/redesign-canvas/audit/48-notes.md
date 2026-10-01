# Task 48 — PR 4 CodeQL fixes

Fetched all 33 open PR alerts from the GitHub API on 2026-10-02. No alerts were suppressed or dismissed.
The set contains 11 error-exposure, 8 request-forgery, 7 incomplete multi-character sanitization,
4 bad-tag-filter, 2 incomplete sanitization and 1 pre-existing avatar DOM-XSS finding.

## Changes

- Fixture exceptions retain full diagnostics in stderr. HTTP responses contain only generic messages.
- Incoming asset requests never determine a network fetch URL. Static assets come from bounded local build
  directories; the blog fixture also reads bounded public assets. Startup fetches still use the configured preview origin.
- HTML helpers use the existing JSDOM dependency, without script execution or external resource loading.
  Board syntax checks blank parsed script/style ranges while preserving source offsets and malformed-tag diagnostics.
  PDF board rendering extracts the trusted DC script and removes actual script elements through the parser.
- Markdown cells escape backslashes before pipes, including already escaped input.
- The pre-existing avatar finding received the small scheme allowlist fix: HTTPS/blob accepted; other schemes
  fall back to the default avatar. Upload behavior and storage resolution are unchanged.

## Alert coverage

| Alert | Rule | File | Fix |
| --- | --- | --- | --- |
| #43 | js/stack-trace-exposure | tests/visual/pressure-account/capture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #42 | js/stack-trace-exposure | tests/visual/gearing-saddle-account/capture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #41 | js/stack-trace-exposure | tests/visual/bike-deletion/capture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #40 | js/incomplete-multi-character-sanitization | src/lib/guides/content/batch-a/batch-a.test.ts | Inert JSDOM parsing replaces HTML-stripping regex. |
| #39 | js/stack-trace-exposure | tests/visual/marketing-batch3/capture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #38 | js/stack-trace-exposure | tests/visual/final-sweep/account-fixture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #37 | js/stack-trace-exposure | tests/visual/final-sweep/blog-fixture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #36 | js/stack-trace-exposure | tests/visual/dark-a2/fixture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #35 | js/stack-trace-exposure | tests/visual/account-dark-c/capture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #34 | js/stack-trace-exposure | tests/visual/account-batch4/capture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #33 | js/stack-trace-exposure | tests/visual/account-batch2/capture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #32 | js/stack-trace-exposure | tests/visual/account-batch1/capture.mjs | Shared generic HTTP 404/500 response; diagnostic error logged to stderr. |
| #31 | js/incomplete-sanitization | tests/visual/final-sweep/report.mjs | Escape backslashes before Markdown pipes; normalize cell newlines. |
| #30 | js/incomplete-multi-character-sanitization | tests/visual/pdf-report/board.mjs | Inert JSDOM parsing replaces HTML-stripping regex. |
| #29 | js/incomplete-multi-character-sanitization | src/components/dashboard/DashboardFitRange.test.tsx | Inert JSDOM parsing replaces HTML-stripping regex. |
| #28 | js/incomplete-multi-character-sanitization | plans/redesign-canvas/check-board.mjs | Inert JSDOM parsing replaces HTML-stripping regex. |
| #27 | js/incomplete-multi-character-sanitization | plans/redesign-canvas/check-board.mjs | Inert JSDOM parsing replaces HTML-stripping regex. |
| #26 | js/incomplete-multi-character-sanitization | plans/redesign-canvas/check-board.mjs | Inert JSDOM parsing replaces HTML-stripping regex. |
| #25 | js/incomplete-multi-character-sanitization | plans/redesign-canvas/check-board.mjs | Inert JSDOM parsing replaces HTML-stripping regex. |
| #24 | js/bad-tag-filter | tests/visual/pdf-report/board.mjs | Inert JSDOM parsing replaces script/style/tag filtering regex. |
| #23 | js/bad-tag-filter | tests/visual/pdf-report/board.mjs | Inert JSDOM parsing replaces script/style/tag filtering regex. |
| #22 | js/bad-tag-filter | plans/redesign-canvas/check-board.mjs | Inert JSDOM parsing replaces script/style/tag filtering regex. |
| #21 | js/bad-tag-filter | plans/redesign-canvas/check-board.mjs | Inert JSDOM parsing replaces script/style/tag filtering regex. |
| #20 | js/request-forgery | tests/visual/marketing-batch3/capture.mjs | Removed request-driven fetch proxy; bounded local build/public asset reads. |
| #19 | js/request-forgery | tests/visual/final-sweep/account-fixture.mjs | Removed request-driven fetch proxy; bounded local build/public asset reads. |
| #18 | js/request-forgery | tests/visual/final-sweep/blog-fixture.mjs | Removed request-driven fetch proxy; bounded local build/public asset reads. |
| #17 | js/request-forgery | tests/visual/dark-a2/fixture.mjs | Removed request-driven fetch proxy; bounded local build/public asset reads. |
| #16 | js/request-forgery | tests/visual/account-dark-c/capture.mjs | Removed request-driven fetch proxy; bounded local build/public asset reads. |
| #15 | js/request-forgery | tests/visual/account-batch4/capture.mjs | Removed request-driven fetch proxy; bounded local build/public asset reads. |
| #14 | js/request-forgery | tests/visual/account-batch2/capture.mjs | Removed request-driven fetch proxy; bounded local build/public asset reads. |
| #13 | js/request-forgery | tests/visual/account-batch1/capture.mjs | Removed request-driven fetch proxy; bounded local build/public asset reads. |
| #10 | js/incomplete-sanitization | scripts/seed-guides.ts | Escape backslashes before Markdown pipes; normalize cell newlines. |
| #8 | js/xss-through-dom | src/components/profile/ProfilePhotoUpload.tsx | Allow only HTTPS storage or blob preview URLs; otherwise default avatar. |

## Verification

- Focused Vitest: 62 tests pass across six files (HTML/Markdown helpers, HTTP errors, avatar, range and guide tests).
- Final-sweep Node helper suite: 20 tests pass, including local asset reads, encoded traversal rejection,
  no network fetch during asset handling, TLS and source contracts.
- Chromium board regression: all six FitRapport boards render with no unresolved bindings.
- check-board on FitRapport1: passes; only two existing palette warnings (#9FB2AC and #1F3A34).
- Full npm run lint passes, including contrast, CSS token and image-weight checks.
- Full npm run typecheck passes. Initial errors in the concurrent guide-import tests were resolved by their owner.
- git diff --check passes.

Local sandbox restrictions required rerunning the TLS test server and Chromium check with approved permissions.
GitHub CodeQL has not been rerun: no local CodeQL CLI is installed, and this task does not authorize a commit/push.
The next PR scan must confirm alert closure. No suppression directives, database writes, commits or pushes.
Concurrent task-49 guide-import changes are excluded from this task’s file list.
