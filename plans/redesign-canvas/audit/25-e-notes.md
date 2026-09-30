# 25e — Deterministic Slider output

## Fix

The hidden Base UI Slider.Value now uses a children callback returning the same explicit display value and unit as the visible label. This bypasses runtime-default-locale formatting; the fallback remains `String(value)`. A callback is necessary because this installed Base UI version uses its formatter for non-function children.

No hydration warning suppression, locale guesses, caller changes or wrapper changes. Existing labels, aria-valuetext override/fallback, description wiring, keyboard behavior and 44px hit-area classes are unchanged. App changes are limited to Slider.tsx and Slider.test.tsx. A read-only subagent independently checked the Base UI behavior and regression cases.

## Verification

- Both Slider test files: 7 tests pass. Five new cases cover Dutch thousands (`2.105 mm`), decimals (`8,5 kg`), embedded units, and deterministic numeric fallbacks (`2105`, `8.5`), while asserting unchanged aria-valuetext.
- `node tests/visual/final-sweep/slider-hydration-repro.mjs`: all four value/locale combinations pass, NL and EN, identical SSR/client output and no recoverable errors. Before: both NL cases failed. After evidence: `25-e-hydration.json`.
- The repro always writes D's baseline path. Passing evidence was saved separately, then the original saved snapshot was rerun to restore its pre-fix evidence. No repro-tool modification.
- Production sweep command: `node tests/visual/final-sweep/sweep.mjs --filter=/calculators/gearing,/calculators/power-speed --output=plans/redesign-canvas/code-renders/25e-sweep --port=4338 --label=25e-hydration`.
- Production sweep: **8/8 cases pass**, NL/EN × 1440/390 on both routes. The four previous hydration failures drop to zero; no unexpected console/page errors, axe failures, mobile target failures or overflow. The existing harness's explicitly classified local Convex diagnostics remain retained, not hidden. Full local report: `code-renders/25e-sweep/report.json`; portable evidence: `25-e-sweep.json`.
- `npm run lint` and `npm run typecheck` both exit 0; `git diff --check` passes. No unrelated source fixes were needed for these gates.

## Temporary build prerequisite

The initial isolated production build could not resolve `tests/fixtures/reportPdf.ts`, imported by concurrent PDF tests under src. The harness copies src but not tests/fixtures. Added an identical copy of that existing fixture only to `/tmp/bbf-final-sweep-0ead00b838237112/tests/fixtures/reportPdf.ts` and retried. No repository harness, PDF code, config or fixture was modified. The harness owner should include imported test fixtures in future snapshot builds.

No commit or push. No PNGs in the file list.
