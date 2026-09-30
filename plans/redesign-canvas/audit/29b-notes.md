# 29b — Account mobile tap targets

## Changes and ownership

- Gearing cassette and refinement summaries now use `min-h-11` with vertical
  padding, preserving native details/summary behavior and disclosure markers.
- Feedback thread title buttons now use `min-h-11`, including single-line EN titles.
- Settings has no local sizing override. C's shared Input change supplies
  `h-11 min-h-11`; no settings or shared UI files were modified by B.
- Regression tests cover both gearing locales and the single-line feedback title.
- Exact owned files: `files-29b.txt`. Other agents' shared controls and sweep
  harness changes are dependencies, not part of B's manifest. No commit or push.

## Validation

Focused Vitest command:

```sh
npx vitest run 'src/app/(dashboard)/gearing' 'src/app/(dashboard)/feedback' 'src/app/(dashboard)/settings'
```

Result: **4 files / 15 tests pass**.

Requested production-CSS browser sweep:

```sh
node tests/visual/final-sweep/sweep.mjs --filter=/gearing,/feedback,/settings --port=4339 --output=plans/redesign-canvas/final-sweep/29b --label=29b
```

The existing matrix includes NL/EN at 390 and 1440; no harness filters or checks
were weakened. Account UI uses the established synthetic auth/Convex fixture;
this verifies rendered targets, not live backend authorization or persistence.
Screenshots and raw reports remain local under `final-sweep/29b/`.

Result: **16/16 cases without failures**, including all six requested account
NL/EN 390 cases. The substring filter also includes `/calculators/gearing`, so
four routes were captured at both widths. All eight mobile touch-target checks
pass; all 16 axe checks pass. Settings passes using C's shared Input default,
so no settings patch is necessary. No overflow or unexpected runtime errors.

Full `npm run lint` passes (including contrast and token-only CSS modules);
`git diff --check` passes. The sweep built a fresh production snapshot:
`35203ffa45c1454eefc720672ca1d8664cee2a02688fbb18898e8f7a72f63862`, build ID
`60ZuA_e1TQjMh56Byo0s4`. See `../final-sweep/29b/report.md`, `report.json`,
`results.jsonl` and `run-context.json` for detailed evidence. Build and sweep
finished successfully with normal server cleanup. This is a focused gate,
not a claim that the entire production release is approved.
