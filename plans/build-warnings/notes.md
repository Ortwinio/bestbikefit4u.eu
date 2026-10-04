# W — build warning remediation

Completed 4 October 2026 in `/Users/ortwinverreck/Developer/bikefitboost-deps`, branch
`chore/build-warnings`, baseline `521cd999`. No commits, deployments, production access,
environment-file changes or mail sends. Installation commands were approved and scoped to this
worktree, including its isolated `.tmp/build-warnings/clean` directory.

## Before and after

| Warning | Before | After / decision |
| --- | --- | --- |
| npm audit | 19 findings: 16 high, 1 moderate, 2 low | 5 high findings, all the single braces advisory's dev-only lint dependency chain. Production-only audit: **0**. |
| Deprecated rimraf 2/3, inflight, glob 7, uuid 8 | Present in the LHCI lockfile graph | Removed with LHCI. Complete `npm ls --all` and lock inspection confirm absence. Modern `glob@13.0.6` remains through Sentry. No speculative overrides. |
| Deprecated `lucia@3.2.2` | Through `@convex-dev/auth@0.0.95` | Still emitted by clean install. Upstream dependency, explicitly accepted in brief. Auth was not changed or optionally upgraded merely to retain the same warning. |
| Unreviewed install scripts: Sentry CLI, esbuild, unrs-resolver | Three packages identified by `npm install-scripts ls` | Exactly these three approved at locked versions. Final clean install emits **no install-script approval warning**. |
| Unreviewed fsevents scripts | First clean macOS install exposed versions 2.3.2 and 2.3.3 | Explicitly denied, not additionally approved; preserves npm 11's prior blocked behavior. Both bundled native modules still load. |
| Next.js telemetry notice | Default build behavior | Both build commands set `NEXT_TELEMETRY_DISABLED=1`. No telemetry notice in the successful `build:vercel` log. |
| `Experiments: clientTraceMetadata` | Sentry-generated configuration information | Remains intentionally; not an error or a warning to suppress. |

The brief anticipated four remaining audit findings. npm 11.19.1 actually reports **five packages**:
`eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces@3.0.3`.
They are propagation of one advisory, not five independent runtime vulnerabilities:
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), stack exhaustion with deeply
nested patterns. The audit proposes a semver-major downgrade to eslint-config-next 14.2.35 rather
than a compatible patched braces release. No `npm audit fix --force`, unsafe override, audit
suppression or framework downgrade was applied. The whole chain is dev-only in the lockfile;
`npm audit --omit=dev --json` exits 0 with zero vulnerabilities. Full audit appropriately exits 1.

## W1 and W2: isolate Lighthouse

- Removed `@lhci/cli` from devDependencies and lockfile using the approved worktree-only uninstall.
- Lock comparison: **264 package entries removed, zero added, zero retained package versions changed**.
- `/Users/ortwinverreck/Developer/bikefitboost-deps/scripts/performance/run.mjs` now runs
  `npx -y @lhci/cli@0.15.1 collect|assert --config=...` on demand in its temporary working directory.
  Browser selection, local-only origin preflight, collection settings, budgets, logs and exit codes
  are preserved. The performance README explains the first-run registry/cache requirement.
- `report.mjs` is a pure report summarizer and has no LHCI import/process invocation. It and
  `lighthouserc.json` are unchanged; their existing tests pass. No unnecessary CLI invocation was
  added to report formatting.
- On-demand LHCI still brings its upstream dependency risks into that optional execution/cache.
  This change removes them from normal repository/Vercel installs; it does not claim to fix LHCI
  upstream. No real Lighthouse scan or on-demand download was needed for the mocked regression tests.
- The initially populated node_modules already lacked LHCI despite the manifest/lock containing it.
  The baseline audit therefore uses the original lockfile, not a misleading installed-tree count.

## W3: npm 11 supported approvals

Read the installed `npm help install-scripts` documentation on npm **11.19.1**, Node **24.4.0**.
Used the supported commands with the absolute worktree prefix:

```sh
npm --prefix /Users/ortwinverreck/Developer/bikefitboost-deps install-scripts approve @sentry/cli esbuild unrs-resolver
npm --prefix /Users/ortwinverreck/Developer/bikefitboost-deps install-scripts deny fsevents
```

Repository configuration lives in the package.json `allowScripts` field, not global npm configuration:

```json
{
  "@sentry/cli": true,
  "esbuild": true,
  "unrs-resolver": true,
  "fsevents": false
}
```

No blanket wildcard/`--all`, unpinned approval, `.npmrc` change or disabling of script checks.
Future upgrades of the three approved packages require renewed version review/approval.
Fsevents is optional, macOS-only and ships its native binary. Its scripts were already skipped;
the explicit denial makes that existing policy visible and removes the warning without running
additional code. Clean-copy checks load both versions and expose their `watch` functions.

Clean `npm ci --foreground-scripts` in a fresh manifest/lock-only copy under
`/Users/ortwinverreck/Developer/bikefitboost-deps/.tmp/build-warnings/clean` passes, installs 761
packages, and shows execution of exactly the three approved postinstall hooks. A final clean rerun
after the denial also passes. `npm install-scripts ls` says no unreviewed scripts in both copies.
Esbuild 0.27.0, sentry-cli 2.58.6 and the unrs-resolver native binding load from the clean copy.
Only Lucia's deprecation and the five dev audit findings remain in the installation output.
This is local macOS verification, not a claimed Vercel/Linux deployment test.

## W4 and build safety

Both `build` and `build:vercel` prefix the Next invocation with `NEXT_TELEMETRY_DISABLED=1`.
Vercel's existing preflight remains first and unchanged. No `.env` file was added or modified.
The production build gate used process-only loopback Convex URLs (`http://127.0.0.1:9`), the apex
site origin, preview/local Vercel flags, disabled billing and blank Sentry/mail credentials.
The preflight and production webpack build pass. No Convex deploy, remote query, upload or mail action
was invoked. The remaining Sentry `clientTraceMetadata` informational output is documented above.

## Gates

| Gate | Result |
| --- | --- |
| Clean temporary-copy `npm ci --foreground-scripts` | PASS; no unreviewed-script warnings |
| Full npm audit | 5 high, dev-only lint chain; expected nonzero exit, no compatible fix applied |
| Production-only npm audit | PASS, zero findings |
| Typecheck | PASS, including post-build rerun |
| Full lint | PASS, brand guard zero findings |
| Unit suite | PASS: 3,087 tests / 387 files; 20 existing skips / 1 skipped file |
| Contract suite | PASS: 556 tests / 50 files |
| Standalone Convex tsc | PASS |
| `npm run build:vercel` | PASS with dummy-safe process environment |
| Final focused policy + performance tests | PASS: 13 tests / 3 files |
| Diff whitespace check | PASS |

Tests preserve the pinned invocation, report/config behavior, phase failures, preflight failure,
exact approval policy, deprecated-version removal, telemetry setting and Vercel preflight.
Existing Vitest output includes its future native-config-loader compatibility notice and expected
negative-test/jsdom diagnostics; these are not Vercel deployment warnings and were not suppressed.

Raw local gate evidence is under
`/Users/ortwinverreck/Developer/bikefitboost-deps/.tmp/build-warnings/`:
`clean-ci-final.log`, `audit-production.json`, `npm-ls-all.txt`, `typecheck-final.log`, `lint.log`,
`unit.log`, `contracts.log`, `convex-tsc.log`, `build.log`. Parallel runner evidence is in
`/Users/ortwinverreck/Developer/bikefitboost-deps/plans/build-warnings/W1-notes.md`.

## Changed files

- `/Users/ortwinverreck/Developer/bikefitboost-deps/package.json`
- `/Users/ortwinverreck/Developer/bikefitboost-deps/package-lock.json`
- `/Users/ortwinverreck/Developer/bikefitboost-deps/scripts/build-warnings.test.ts`
- `/Users/ortwinverreck/Developer/bikefitboost-deps/scripts/performance/run.mjs`
- `/Users/ortwinverreck/Developer/bikefitboost-deps/scripts/performance/run.test.ts`
- `/Users/ortwinverreck/Developer/bikefitboost-deps/scripts/performance/README.md`
- `/Users/ortwinverreck/Developer/bikefitboost-deps/plans/build-warnings/README.md`
- `/Users/ortwinverreck/Developer/bikefitboost-deps/plans/build-warnings/W1-notes.md`
- `/Users/ortwinverreck/Developer/bikefitboost-deps/plans/build-warnings/notes.md`

Lead review: approvals are by package name (not version) so dependency bumps keep running the reviewed install scripts; verified with a clean npm ci (no install-script warning, sentry-cli 2.58.6 works).
