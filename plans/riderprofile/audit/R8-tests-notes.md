# R8 route test sidecar

Only the three assigned test files and this notes/manifest pair were written. No production, backend, actual advice-view, schema or other agents' files were edited. No commit, deploy or live database calls.

## Coverage

- `AdvicePageClient.test.tsx`: 46 cases. Real Convex reference names are inspected with getFunctionName while hooks are mocked; only the complex AdviceGroupsView and generic Button/Link are stubbed. Tests cover both unauthenticated query skips, independent query loading, no placeholder advice, all seven empty groups, localized calculator entry link, stale versus unknown/saved-input banner counts, exact recalculateAll({}) arguments, single in-flight request, auth-loss guard, empty results, NL/EN mixed outcome summaries, all mapped reason codes and safe unknown fallback, reason deduplication and payload/error non-disclosure.
- Existing advice, source report link, dates and staleness remain untouched for pending/updated/skipped/failed mutation results and rejected requests; only replacement reactive query data changes the displayed report. Rejected requests allow retry. No local successful-mutation freshness assumptions are made.
- Interest recording occurs only on onOpenAdvice, with exactly `{calculator}` and no measurement/record/bike ids, source URL or errors forwarded. Tests cover current fit/calculator keys, allowlisted source-path precedence (including query/fragment stripping), future output keys with known source calculators, inherited/unknown keys, and rejected optional interest writes.
- `page.test.tsx`: four cases, NL/EN metadata titles/descriptions/OpenGraph, localized canonical, noindex/nofollow, no language alternates, and forwarding request locale only to the client.
- `ProfileSectionTabs.test.tsx`: six cases, all three active sections in both locales, accessible navigation name, exact localized links and only one aria-current=page.

These route tests do not assert server authorization itself; the auth-loss guard is a frontend check and backend owner checks remain backend-test responsibility. Actual view formatting/filtering/markup remains Avicenna's test scope.

## Checks

- `npx vitest run 'src/app/(dashboard)/profile/advice/AdvicePageClient.test.tsx' 'src/app/(dashboard)/profile/advice/page.test.tsx' src/components/profile/ProfileSectionTabs.test.tsx`: **56 passed**, three files.
- Scoped ESLint for all three files: passed.
- Scoped git diff check: no errors (new test files are untracked).
- `realpath src/app/(dashboard)/profile/advice/../../../../../shared/advice/types.ts` resolves to this rider worktree's `shared/advice/types.ts`; the five-level type import is correct.
- Final resumed verification: all 56 tests and scoped ESLint passed again; full `npm run typecheck -- --incremental false` now **passes**. Earlier concurrent R10 diagnostics are resolved; no out-of-scope fixes were made by this sidecar.

The first run had three failures because parent concurrently added allowlisted source-link mapping. The tests now cover that intended precedence and still reject genuinely unknown/inherited keys without a known source. No production code was changed to satisfy tests.

## Resolved parent follow-up: pending message after replacement arrives

The initial route kept its mutation-result snapshot after reactive query data replaced the old fit report, so the original present-tense pendingHint could wrongly assert an ongoing job. Parent has changed NL/EN copy to historical “calculation has started”; verified directly in advicePage.ts. The summary can now describe the original mutation outcome without asserting that the job remains pending forever. Report/freshness data remains correctly query-driven. No production change was made by this sidecar.
