# 22 — Codex C dark-mode pass

Completed the owned dark-mode pass without committing. Exact review/commit manifest:
`files-dark-c.txt`. Three workers handled shared UI, calculator pages and account tools;
parent integration covered public pressure gauges, full browser review and validation.

## Scope and changes

- All twelve public calculator URLs: saddle-height, frame-size, crank-length, saddle-width,
  bike-fit, gearing, power-speed, climb-planner, ftp-wkg, fuel-hydration, English
  tire-pressure-calculator and Dutch bandenspanning-calculator. Both pressure aliases share the form.
- Shared UI and design-system playground: semantic field/status colors, visible segmented selections,
  theme-aware gauges, inherited ink on fixed lime panels, valid borders and keyboard focus rings.
- Seven account tools: pressure-calculator, gearing, saddle-selector, shoe-cleat-fit, settings,
  feedback and standalone app. Fixed lime/mint contrast, warning copy and saved gauge arcs.
- Changes use existing semantic/brand colors. Full-color token aliases allow the account pressure
  route adapter to correct legacy shared-feature classes without editing other owners' components.
- Engines, data, frozen root dictionaries, account shell and shared Header/Footer remain untouched by C.
  Saddle-selector, shoe-cleat-fit and app needed no local source changes; all were captured and checked.

Detailed source changes and exact subsets: `22-ui-notes.md`, `22-calculators-notes.md`,
`22-account-notes.md`. Source, tests, harness scripts and notes are listed in the manifest. Screenshots remain local review evidence
and are excluded from version control and the file list.

## Evidence and validation

- 52 public browser cases: twelve URLs plus playground, light/dark at 1440/390.
  No runtime errors, incorrect theme, HTTP failures or horizontal overflow.
  5,184 computed text samples; final run has zero contrast suspects.
  `22-public-browser.json` records each result. All 24 dark calculator full-page images were reviewed.
- 72 account fixture cases: all seven main routes and pressure result/saved gauges, loading/empty,
  feedback tabs, settings dialog and app platform states in both themes and widths.
  No runtime/query/theme failures, horizontal overflow or unexpected text-contrast failures.
  Saved active gauge arcs: petrol/lime 4.60:1; lime/ink 12.80:1.
  `22-account-browser.json` preserves the eight occurrences of the external language-switch issue below.
- 162 PNGs in `code-renders/20-dark-*.png`, including full-page and account mobile/dialog viewports.
  Actual public frontend; account harness bundles actual route components with deterministic fixtures
  and the unchanged shell. No live authentication, backend save, deletion or PWA-install claim.
- 20 real-browser regressions pass: 16 calculator SVG/text contrast cases and four genuine Tab-key
  focus cases for slider/input/button, both themes at both widths. Rings disappear on blur.
- 1,145 unit tests pass; 72 shared UI tests pass after the final error-text token adjustment.
- Typecheck passes. Full lint passes: ESLint, runtime boundaries, tooltip guard, 254/254 contrast
  pairs and CSS-module token check (18 modules, zero raw-color lines).
- Production build passes. Browser harnesses and regression tests are included for reproduction.

## Route to other owners

1. **A — LanguageSwitch:** `src/components/layout/LanguageSwitch.tsx` uses an unwrapped tuple for
   selected text color. Settings language NL has 2.78:1 contrast in light and 1.98:1 in dark.
   Replace the selected foreground utility with `text-primary-foreground`; fix its remaining tuple
   color expressions through semantic tokens. Eight main/dialog × theme/width occurrences are recorded.
2. **A — configurator logo:** the older configurator header wordmark is mostly invisible on dark ink;
   only the bike icon and trailing 4U remain visible in calculator captures. Marketing header logo is
   readable. Apply the existing dark logo treatment to the configurator header, preserving ownership.
3. **B — account shell:** the active Settings sidebar strip can be partially covered by the lower
   account block at desktop viewport height. See account Settings screenshots. No shell edits by C.

These external findings remain open for the lead to route. No other agent's files were included in
C's change list, and no commit was created.
