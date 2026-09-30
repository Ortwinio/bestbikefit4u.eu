# 19.6 — Marketing dark-mode pass

## Scope and implementation

- Header, mobile dialog, navigation and language controls use theme-aware semantic tokens.
- The header and mobile logo use CSS-selected primary/negative assets, so dark rendering is correct
  before hydration as well as after a theme change. One accessible home link; decorative images.
- Footer retains the approved ink treatment in light mode and uses the dark secondary surface in
  dark mode, with the negative logo and readable on-dark text in both modes.
- Pricing, How It Works, Measurement Guide, Fit Pass and pain index/detail styles compose shared
  marketing theme aliases. Cards, soft surfaces, headings, body copy, links, borders and focus colors
  adapt to the theme. Lime panels keep ink text and contrasting hover states.
- Illustrations no longer multiply into dark backgrounds. Measurement diagrams retain their
  intentionally light drawing surfaces. Fit Pass loading labels remain readable without opacity loss.
- Home was checked in both themes; its previously approved page styles needed no further changes.
- No copy, billing/auth behavior, frozen dictionaries, shared UI, globals, account or calculator files
  changed. No commit. Exact 13-file source/test/harness list: `files-19.dark.txt`.

## Browser evidence

`tests/visual/marketing-dark/render.mjs` runs against the actual local Next app, not page fixtures.
Run from the repository root with `node tests/visual/marketing-dark/render.mjs` (optional
`RENDER_BASE_URL` override). External HTTPS requests are blocked to keep captures local; Fit Pass
therefore shows its authentic account-loading state. The existing dev server's billing configuration
is preserved. No checkout or auth actions are performed.

Screenshots: `plans/redesign-canvas/code-renders/19-dark-*.png`:
- Home, pricing, how-it-works, measurement-guide, fit-pass, pain index and all five pain slugs.
- Each route at 1440 and 390 pixels, in light and dark mode: 44 full-page captures.
- Open mobile menu in both themes: two additional captures (46 PNGs total).

Results: `code-renders/19-dark-results.json`, 118 checks including open disclosures and secondary-link
hover states; 11,540 rendered text contrast checks. All page responses HTTP 200, no horizontal overflow,
no broken visible images, correct theme and visible logo asset, and no measured contrast failures.
Text checks use 4.5:1 for normal text and 3:1 for large text, with disabled controls excluded.
The checker samples solid computed ancestor backgrounds; illustration contrast is reviewed visually.
Dark desktop/mobile page-family visuals and the active mobile menu were inspected manually.

## Validation

- Targeted unit tests: 8 files / 46 tests PASS (layout/logo, home and all five page families).
- `npm run typecheck`: PASS.
- Separate `npm run lint:contrast`: 254/254 token contrast pairs PASS.
- Owned diff whitespace check: PASS.
- `npm run lint`: ESLint and runtime boundaries PASS; stops at an unrelated tooltip coverage failure
  for `src/app/(public)/design-system/Playground.tsx`.
- Separate `npm run lint:css-modules`: no violations in owned files; shared gate currently reports
  nine `oklch()` lines in `src/app/(dashboard)/pressure-calculator/PressureDashboard.module.css`.
  Both concurrent owners' files are left untouched.
- Logs: `/private/tmp/bbf19-dark-{render,tests,lint,css,types,contrast}.log`.

An initial concurrent guides CSS compilation error was fixed by its owner; its blocker message was
removed. Final captures use the shared app on port 3000. The unused isolated preview was stopped.
