# W1 sidecar evidence

Worktree: `/Users/ortwinverreck/Developer/bikefitboost-deps`
Branch: `chore/build-warnings`

## Changes

- `scripts/performance/run.mjs`: collection and assertions now spawn `npx -y @lhci/cli@0.15.1 <phase> --config=<temporary config>` instead of the project's `node_modules/@lhci/cli/src/cli.js`.
- Temporary working directory, browser environment, preflight checks, phase logs, report generation, and exit-code behavior are retained.
- `scripts/performance/README.md`: documents the pinned on-demand CLI, npm/npx prerequisite, initial registry access/cache requirement, and unchanged configuration source.
- `scripts/performance/run.test.ts`: four offline tests cover exact pinned invocations, preserved settings and phase logs, missing-report failure, collection/assertion exit codes, and preflight failure before CLI invocation. Subprocesses, browser discovery, fetch, and asynchronous filesystem operations are mocked.
- `scripts/performance/report.mjs` and `lighthouserc.json` require no changes; reporting has no LHCI dependency.
- No nested AGENTS.md files were found under scripts, plans, or tests.

## Validation

Command (from the worktree):

```sh
/Users/ortwinverreck/Developer/bikefitboost-deps/node_modules/.bin/vitest run /Users/ortwinverreck/Developer/bikefitboost-deps/scripts/performance/run.test.ts /Users/ortwinverreck/Developer/bikefitboost-deps/scripts/performance/report.test.ts
```

Result: exit 0; 2 test files passed, 9 tests passed (4 runner tests and 5 existing report/config tests). No LHCI, browser, network requests, or npm installation commands ran.

Vitest emitted a configuration compatibility warning about ESM syntax in `vitest.config.ts` loaded as CommonJS and the future Vite native config loader; it did not affect these tests.

## Parent-owned follow-up

Dependency removal, package.json/lock/.npmrc changes, npm audit, transitive warning verification, and broader build gates remain with the parent. This sidecar did not edit those files or run installs, commits, deployments, production operations, or environment configuration changes.

DONE W1 sidecar
