# 21 — Final QA sweep (Codex D)

Goal: one repeatable script that checks the **entire** redesigned app, so the lead can run the final gate of phase 6 against a single report.

## Build `tests/visual/final-sweep/sweep.mjs`
- Start (or reuse) a production build in an isolated distDir, the way you did earlier (billing flags off, via process env only; don't touch env files).
- Routes: all 70 non-admin routes from `plans/redesign-canvas/audit/route-map.md`, in **NL and EN** (`/nl/...`, `/en/...`), with real example slugs for the dynamic routes (pain, guides, blog, tire-pressure/bandenspanning, science) from the data/CMS fixtures. Account routes use the existing visual fixture approach from the account batches. For redirect routes (`/use-cases*`), check the redirect target.
- Per route × locale × viewport (1440 and 390), check:
  1. HTTP status (200, or the expected redirect/404 for the locale-specific landings);
  2. no console errors or page errors;
  3. no horizontal overflow (`scrollWidth > innerWidth`);
  4. exactly one `<h1>`;
  5. `<html lang>` matches the locale, and there's a canonical plus hreflang alternates on public pages;
  6. **language leaks**: on NL pages, visible text contains no English UI words from a small list (e.g. `Save`, `Sign in`, `Loading`, `Settings`, `Intermediate`, `Balanced`, `hrs/week`), and vice versa for NL words on EN pages (`Opslaan`, `Inloggen`, `Instellingen`), ignoring brand/tech terms (stack, reach, drop, gravel, cleat);
  7. touch targets: interactive elements under 44×44 px (outside inline text links) at 390;
  8. images without `alt`, or broken (naturalWidth 0);
  9. the axe-core (`@axe-core/playwright`, dev dependency; ask the lead before adding it) serious/critical violations;
  10. a screenshot (viewport only, 1 per route × locale × viewport) in `plans/redesign-canvas/final-sweep/`.
- Output: `plans/redesign-canvas/final-sweep/report.md` (a table per route: status and each check ✓/✗, with details) plus `report.json`.

## Rules
- Only new files under `tests/visual/final-sweep/` and `plans/redesign-canvas/final-sweep/`. **No changes to app code**: findings go in the report, and the lead assigns the fixes.
- A dev dependency (axe) only after the lead's approval: first write in your pane which package and version, then wait.

Print `DONE 21` with the summary (number of routes, how many ✓/✗ per check).
