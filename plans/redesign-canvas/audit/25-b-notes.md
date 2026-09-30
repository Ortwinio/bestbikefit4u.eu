# 25b — Profile progressbar accessible name

Item 9 is fixed in `src/components/profile/FlexibilityScale.tsx`. The shared
Progress receives the existing localized `profile.sections.flexibility` label.
Both profile and measurement-wizard uses inherit the fix. No new copy, shared UI,
visual styling, scoring, backend or persistence behavior changes.

## Before / after

| Evidence | NL 1440 | NL 390 | EN 1440 | EN 390 |
| --- | --- | --- | --- | --- |
| First full sweep: `/profile`, `aria-progressbar-name` | fail | fail | fail | fail |
| 25b filtered sweep: `/profile`, axe | pass | pass | pass | pass |

Before: `plans/redesign-canvas/final-sweep/report.json`, four `/profile` entries.
After: `plans/redesign-canvas/code-renders/25-b/report.json` and `report.md`.
The latter directory also contains all screenshots and isolated-build logs.

Command:

```sh
node tests/visual/final-sweep/sweep.mjs --filter=/profile --output=plans/redesign-canvas/code-renders/25-b --port=4325 --label=25b-progressbar
```

The substring filter includes `/profile` and all four improvement pages:
5 routes × NL/EN × 1440/390 = 20 cases, all passing applicable checks, exit 0.
Axe passes 20/20; mobile target checks pass 10/10. Account SEO is intentionally
skipped, as are desktop touch-target checks. These are actual-component fixtures
with mocked auth/Convex, not a production authentication or persistence test.

## Regression validation

- New real-component unit test covers all five scores in both locales: 10 pass.
- Accessible names use the locale dictionary; min/max/current values remain intact.
- Scoped ESLint passes for the source and test.
- The isolated production build, including TypeScript validation, passes.

No git commit, push or Vercel command was run for 25b. The lead's concurrent
checkpoint `8979cc7` already includes the source fix; the new test and these audit
files remain for lead review. Exact task file list: `files-25-b.txt`.

## Follow-up: distinguish wizard completion from flexibility score

The wizard completion bar now uses the existing localized step counter as its
accessible name: `Stap 3 van 6` / `Step 3 of 6`. The flexibility scale keeps
`Flexibiliteit` / `Flexibility`. Both remain exposed with their original values.
No new translation strings or visual changes are needed.

The wizard tests still traverse all six steps, check completion percentages and
submission fields, and reject incomplete required measurements. They additionally
assert that step 3 exposes two separately named bars, with the score value at 80.

`npx vitest run src/components/measurements src/components/profile`: **7 files,
39 tests pass**, including both NL/EN wizard cases and the owned scale regression
test. The earlier browser evidence above predates this naming-only follow-up.
