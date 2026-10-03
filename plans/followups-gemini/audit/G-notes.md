# G1 + G2

Worktree: bestbikefit4u-gemini; branch chore/seo-hardening-convex-tsconfig, based on 9094481.
Independent G1 and G2 subagents had disjoint files; root reviewed integration and owns final gates.
No commits, pushes, deployments, Convex dev or production data access.

## G1

Reproduced 95 errors with `npx tsc -p convex/tsconfig.json --noEmit`. Convex's separate compiler
configuration lacked the frontend alias used by shared imports, ES2022 Object.hasOwn declarations,
and Next's real CSS-module declarations reached by guide contract tests.

Added `@/* -> ../src/*`, ES2022 lib and the installed Next global declarations. Strict checks and
existing include/exclude rules otherwise remain intact: backend tests are still checked, not hidden
by exclusions. No ambient replacement-any declarations or typecheck-disable workaround.
Three configuration regression tests verify strict checking, test inclusion, alias resolution and
the required platform declarations. This changes type resolution only, not deployed runtime code.

## G2

The dashboard route-group layout is now a synchronous server metadata wrapper with noindex/nofollow.
Its existing client UI moved unchanged (except function name) into DashboardLayoutClient.tsx. This
covers all dashboard descendants and both locales, including bikes, account tools, feedback, fit
history and profile; no public title/copy/style changes. Existing client layout integration tests still
run through the wrapper. Parent metadata inheritance also covers EN children returning empty metadata.

PDF GET adds X-Robots-Tag once after its response generator; all success and handled error branches
receive it. Tests cover rich/simple/fallback PDF responses, authentication/authorization, rate limits,
missing report data, misconfiguration and generation failures. Existing auth, headers and body preserved.

Route policy explicitly registers /tools as private (including localized descendants and robots/sitemap
exclusions), and /email-preferences as a public noindex utility. Crawling email preferences remains
allowed so crawlers can read its existing noindex. Prefix boundaries are regression-tested.

## Validation

- Convex standalone typecheck passes.
- Combined focused Vitest: 8 files / 73 tests pass. Installed TypeScript sourcemap and jsdom navigation
  warnings are non-failing test-environment warnings.
- Root typecheck passes.
- Client layout content is byte-identical to HEAD after substituting its function name; no visual change.
- Full `npm run lint` passes, including tooltip, runtime boundary, 254 contrast checks, CSS tokens and image weight.
- `npm run build` passes (238 static pages generated), with dummy localhost Convex URLs and no live backend.
- Optional full crawl not run: public source is unchanged; additional root metadata, sitemap and locale-routing
  regression tests were run instead. Private authenticated HTML remains protected by the existing proxy;
  shared metadata inheritance is covered by layout tests and the production Next build.
- `git diff --check` passes.
