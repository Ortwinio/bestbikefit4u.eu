# Output 04 — Quality Gate Run

**Date:** 2026-03-18

---

## Gate Results Summary

| Gate | Command | Status | Exit Code |
|------|---------|--------|-----------|
| Lint | `npm run lint` | **PASS** | 0 |
| TypeScript | `npx tsc --noEmit` | **PASS** | 0 |
| Build | `npm run build` | **PASS** | 0 |
| Tests | `npm test` | Not runnable (permission denied) | — |
| i18n Tests | `npm run test:i18n` | Not runnable (permission denied) | — |

Note: `npm test` and `npm run test:i18n` could not be executed in this session due to shell execution permission restrictions on those commands. The test files were reviewed manually (see Step 02). The build gate passing is a strong signal that all imports are resolvable and there are no module-level errors.

---

## Lint Gate — PASS

**Command:** `npm run lint`
**Result:** 0 errors, 6 warnings

Full output:
```
> bikefit-ai@0.1.0 lint
> npm-run-all lint:eslint lint:runtime-boundaries lint:tooltips

> bikefit-ai@0.1.0 lint:eslint
> eslint

/Users/ortwinverreck/Developer/bestbikefit4u/convex/__tests__/authRateLimit.contract.test.ts
  29:26  warning  '_table' is defined but never used    @typescript-eslint/no-unused-vars
  29:42  warning  '_doc' is defined but never used      @typescript-eslint/no-unused-vars
  31:14  warning  '_id' is defined but never used       @typescript-eslint/no-unused-vars
  31:27  warning  '_updates' is defined but never used  @typescript-eslint/no-unused-vars

/Users/ortwinverreck/Developer/bestbikefit4u/convex/recommendations/__tests__/generate.mapping.integration.test.ts
  79:19  warning  '_actionRef' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/ortwinverreck/Developer/bestbikefit4u/scripts/seo/validate-sitemaps.mjs
  87:10  warning  'parsePathname' is defined but never used  @typescript-eslint/no-unused-vars

✖ 6 problems (0 errors, 6 warnings)

> bikefit-ai@0.1.0 lint:runtime-boundaries
> node scripts/check-convex-runtime-boundaries.mjs
[runtime-boundaries] OK: no disallowed Node builtin imports found in Convex non-Node files.

> bikefit-ai@0.1.0 lint:tooltips
> node scripts/check-tooltip-coverage.mjs
[tooltip-coverage] OK: 19 form-control files verified with tooltip guardrails.
```

**All 6 warnings are pre-existing in non-UI files.** None are in the Prototyper UI migration files.

---

## TypeScript Gate — PASS

**Command:** `npx tsc --noEmit`
**Result:** No output, exit code 0

No type errors found anywhere in the codebase, including all new UI components and feature files.

---

## Build Gate — PASS

**Command:** `npm run build`
**Result:** Successful production build

```
▲ Next.js 16.1.6 (Turbopack)
✓ Compiled successfully in 3.8s
✓ Completed runAfterProductionCompile in 106ms
✓ Generating static pages using 9 workers (114/114) in 288.5ms
```

**Build produces 47 routes** including all new features:
- `/bandenspanning-calculator` (tire pressure public calculator)
- `/bandenspanning/gravelbike`, `/bandenspanning/mtb`, `/bandenspanning/racefiets` (tire pressure SEO pages)
- `/pressure-calculator` (dashboard pressure calculator)
- `/fit/[sessionId]/questionnaire` and `/fit/[sessionId]/results` (with ProgressBar using new Progress component)

No build errors or warnings from Next.js compilation (the Sentry deprecation notice is a non-blocking third-party warning unrelated to this migration).

---

## Tests Gate — Not Executed

**Reason:** Shell execution permission was denied for `npm test` during this session.

**Mitigation:** All test files were reviewed manually:

1. `primitives.test.tsx` — 4 tests, uses `renderToStaticMarkup`, no external dependencies. Expected: PASS.
2. `Tooltip.test.tsx` — 3 tests, uses `renderToStaticMarkup` + regex matching. Expected: PASS.
3. `pressure-engine.test.ts` — 5 tests, pure function testing. Expected: PASS.
4. All Convex contract tests — reviewed, no structural issues found.

Based on the build passing and TypeScript passing, and manual test file review, the test suite is expected to pass without regressions.

**Action required:** Run `npm test` manually or in CI to confirm. This is a P1 gap in this quality gate run.

---

## i18n Tests Gate — Not Executed

**Reason:** Same permission restriction.

Script: `vitest run src/i18n/config.test.ts src/i18n/getDictionary.test.ts src/i18n/dashboardMessages.test.ts src/i18n/messages/messages-parity.test.ts ...`

No changes were made to i18n files in this migration pass.

---

## P0/P1/P2 Issue Count

| Priority | Count | Source |
|----------|-------|--------|
| P0 | 0 | — |
| P1 | 1 | `ThemeToggle` not in `index.ts` barrel |
| P1 | 1 | `AccessibleDialog` has no smoke test |
| P1 | 1 | `GTMConsentLoader` has no consent-gate test |
| P2 | 1 | `ProgressBar` imports `Progress` directly instead of from barrel |
| P2 | 1 | Dark mode missing `--success/--warning/--danger` tokens |
| P2 | 1 | `ErrorState` hardcoded red colors won't adapt to dark mode |
| P2 | 1 | `AccessibleDialog` uses `React.ReactNode` instead of named import |
| P3 | 6 | Pre-existing unused vars in test stubs / scripts (lint warnings) |

**Zero P0 issues. Build is stable. TypeScript is clean.**
