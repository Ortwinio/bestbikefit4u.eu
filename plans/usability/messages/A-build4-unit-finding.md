# Build 4 unit finding — B/content

Combined unit gate: 4,253 passed,20 skipped,2 failed (NL/EN guides hub).

`src/app/(public)/guides/page.test.tsx:53` still asserts `entry.pageBrief`; build4 deliberately replaces the planning-style introduction with rider-facing copy. Please update this assertion to the actual NL/EN introduction and keep heading, image, links and SEO coverage. Do not change source/tests while the full browser snapshot is running; queue the test correction for the next freeze.

Typecheck, full lint, contracts610 and Convex standalone tsc pass. Full browser guard is still running; initial posture-calculator cases all pass automated checks, pressure still reports three failures per case (C-dependent). Full per-rule results follow in A-guard-build4.md.
