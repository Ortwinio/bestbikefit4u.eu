# Fix Vercel build warnings (owner, 4 Oct)

Worktree `/Users/ortwinverreck/Developer/bikefitboost-deps`, branch `chore/build-warnings` (from main @ 521cd99).
Absolute paths only; git only as `git -C /Users/ortwinverreck/Developer/bikefitboost-deps`. No commits/deploys/prod/env.
`npm install`/`npm uninstall` are allowed **only in this worktree** (the lead approves them by hand).

Lead's analysis (npm 11.19.1 on Vercel and locally):
| Warning | Source | Task |
|---|---|---|
| 19 vulnerabilities (16 high) | ~15 come from devDependency `@lhci/cli` (lighthouse, puppeteer, proxy-agent, tmp, uuid…); 4 from `eslint-config-next` → fast-glob → micromatch → `braces@3.0.3` (no patched release exists) | **W1:** remove `@lhci/cli` from devDependencies; `scripts/performance/run.mjs`/`report.mjs` must call it on demand instead (`npx -y @lhci/cli@0.15.1 …`), keep `lighthouserc.json` and the tests working. Re-run `npm audit` and record the remaining findings (expected: braces chain only, dev-only lint tooling). |
| deprecated rimraf@2/3, inflight, glob@7, uuid@8 | transitive via `@lhci/cli` (verify with `npm ls --all` after W1) | **W2:** confirm they are gone after W1; for any that remain, add a safe `overrides` entry only if the newer major is API-compatible for that consumer, else document. |
| deprecated lucia@3.2.2 | `@convex-dev/auth` (also in latest 0.0.96) | Not fixable here; document. Optionally bump `@convex-dev/auth` 0.0.95 → 0.0.96 ONLY if its changelog shows no breaking change and all auth tests pass; otherwise leave. |
| `install-scripts … not yet covered by allowScripts`: @sentry/cli, esbuild, unrs-resolver | npm 11 install-script approvals | **W3:** approve exactly these three via the supported npm 11 mechanism (`npm help install-scripts`; e.g. `npm install-scripts approve <pkg>`), so the config is committed in the repo (package.json/.npmrc) and Vercel's `npm ci` shows no warning. Verify with a clean `npm ci` in a temp copy. |
| Next.js telemetry notice | default | **W4:** set `NEXT_TELEMETRY_DISABLED=1` for builds in the repo (e.g. in the `build`/`build:vercel` script or `.env` committed defaults) without affecting anything else. |
| "Experiments: clientTraceMetadata" | Sentry Next.js config | Informational; leave, but note it. |

Gates: clean `npm ci` (temp copy, record remaining warnings), `npm audit`, typecheck, lint, test:unit, test:contracts, Convex tsc, `npm run build:vercel` with dummy-safe env (`scripts/check-vercel-env.mjs` may need the usual vars — use offline values, never real secrets).
Notes `plans/build-warnings/notes.md` with before/after warning list. Print `DONE W`.

## Status (4 Oct)

W1–W4 complete. LHCI is pinned on demand; normal install audit drops from 19 to five findings in
the dev-only braces chain (production audit zero). Three exact-version script approvals and an
explicit denial of already-blocked macOS fsevents scripts make clean npm ci free of approval warnings.
Build telemetry is disabled. Lucia's upstream deprecation and Sentry's experiment information remain
documented. Clean install, typecheck, lint, unit/contracts, Convex tsc and dummy-safe build:vercel pass.
Full evidence, caveats and changed files: `/Users/ortwinverreck/Developer/bikefitboost-deps/plans/build-warnings/notes.md`.
No commits, deployments, production or environment-file changes.
