# S19 — remove SoftwareApplication markup from calculator pages

Semrush (3 Oct, 18:49 UTC) flags 11 calculator pages: "Software App: A value for the aggregateRating or review field is required."
Cause: PR #11 removed the self-declared rating but kept WebApplication/SoftwareApplication JSON-LD. Ortwin chose the honest fix: no ratings without real reviews.

- Remove the WebApplication/SoftwareApplication JSON-LD (and buildWebApplicationSchema if then unused) from all public calculator pages incl. tyre-pressure, power-speed, climb planner, ftp-wkg, fuel-hydration (EN+NL), and any shared helper/llms references to it.
- Keep WebPage, BreadcrumbList and FAQPage (the S11 answers), Organization/Person site-wide, everything else unchanged. No visual or copy change.
- Tests: no page emits SoftwareApplication/WebApplication or aggregateRating; FAQPage/BreadcrumbList still present on every calculator; update scripts/seo-semrush-check.mjs accordingly.
- Gates: focused vitest, npm run typecheck, npm run lint, npm run build, node scripts/seo-crawl-check.mjs --local, node scripts/seo-semrush-check.mjs.
- Branch fix/calculator-schema in this worktree only; no commits/deploys. Notes plans/calculator-schema/S19-notes.md + files-S19.txt. Print DONE S19.

## Completed — 3 October 2026

S19 implemented and verified: 60 focused Vitest tests, three checker tests, full typecheck/lint/build, 875 crawl checks and all 22 calculator schema checks pass. Existing FAQ/HowTo and site schemas preserved; no visible changes. See `S19-notes.md`, `S19-runtime.json` and `files-S19.txt`. No commit/deploy.
