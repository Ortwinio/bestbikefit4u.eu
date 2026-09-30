# 25 — Fixes from the first full QA sweep (final-sweep/report.md, first-full-run)

| # | Finding (cases) | Owner | Action |
|---|---|---|---|
| 1 | Console: 404 + "Refused to execute script … MIME text/plain" (~355) | D | Harness: serve `_next/static` correctly in the fixture server; not an app bug. |
| 2 | Console: CSP blocks `ws://…/api/…/sync` (176) | D | Harness: mock/disable the local Convex sync connection, or record it as an expected diagnostic, **only** if it truly originates from the local dev URL. |
| 3 | Minified React error (4 cases, hydration) | D → lead | Find the routes and the non-minified message (dev build) and report the file + owner; the owner fixes it. |
| 4 | axe color-contrast (44; tire-pressure pages, calculators) | C | Fix via tokens; `lint:contrast` extended if needed. |
| 5 | axe aria-allowed-attr (36; home, calculators) | C | Probably `aria-*` on the wrong role in Slider/SegmentedControl/ToolsTabBar; fix in `src/components/ui`. |
| 6 | Touch targets < 44 px: slider inputs (base-ui) (~23) | C | Hit area ≥ 44 px (thumb/track) without visual changes. |
| 7 | Touch targets < 44 px @390: logo, breadcrumb "Home", language switch, "Log in"/"Inloggen" (~100) | A | Header/Footer/Breadcrumb: min 44 px hit area (padding/min-height), visually unchanged. |
| 8 | axe label-title-only (8; /bikes/[id], /bikes/new/manual) | A | Real `<label>` or `aria-label` instead of only `title`. |
| 9 | axe aria-progressbar-name (4; /profile) | B | Give the progressbar an accessible name. |

Everyone: after the fix, run `node tests/visual/final-sweep/sweep.mjs` with a filter on your routes (see D's README) and show the before/after in your notes. Write a file list to `audit/files-25-<letter>.txt` and print `DONE 25<letter>`.
