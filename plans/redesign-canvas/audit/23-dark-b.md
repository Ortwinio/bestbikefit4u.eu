# 23 — Codex B dark-mode pass

## Scope and fixes

- Account shell/sidebar/mobile menu and tabs; Dashboard; Profile, its wizard and all four improvement pages;
  Login; fit start/questionnaire/results/method/history; Guides/index/hub/leaf; Blog/index/article;
  About, FAQ, Contact and Case Study.
- Public page CSS uses semantic surface/card/border/foreground tokens in both themes.
  Lime panels retain ink text and ink focus outlines; illustrations no longer multiply into dark surfaces.
- Account tabs adapt to theme. Profile display colors use complete color tokens rather than raw OKLCH channels.
  Improvement closed rows adapt to theme; open rows and lime hero headings retain ink.
- Fit selected-bike text, border and icon adapt together. Questionnaire guidance and selected-answer summaries
  use semantic secondary surfaces. Result-bike SVG accents and label use paired semantic tokens.
- Existing ink sidebar stays sticky/full-height with readable active/idle items in both themes.
  Sidebar and account layout implementations did not need changes.
- Shared UI/global tokens, marketing Header/Footer, engine/backend/auth/CMS/SEO and dictionaries were not edited.
  Existing form behavior and copy are unchanged. No commits.

## Validation and evidence

- Exact source/test/harness commit list: `files-dark-b.txt`; excludes other agents' files and screenshots.
- Reproduce: `node tests/visual/dark-b/run.mjs` with localhost frontend running.
  Paired light/dark captures at 1440 and 390: `code-renders/b-dark-*`.
  Suite summary: `code-renders/b-dark-suite.json`; run logs, theme metrics, full-page and
  mobile viewport captures sit alongside it.
- Matrix: 34 account batch-1 + 46 fit-flow + 18 guides/blog cases per theme, plus 16 public cases:
  212 executions / 208 unique page-state-theme-width combinations (Dashboard intentionally repeats).
  316 PNGs include full-page/mobile viewport captures and both account-menu openers.
- Actual account components use isolated synthetic auth/Convex fixtures. Published blog is empty, so populated
  index/filter/pagination/article states use isolated CMS fixtures. Other public captures use real local routes.
  No backend writes, emails, live form submissions or auth bypass.
- Computed normal/large text contrast (4.5:1/3:1), keyboard-focus samples and SVG stroke records supplement
  screenshot review of every page family at both widths. Lime text, selected states, borders, drawing,
  input focus and both mobile menus were inspected. No overflow or runtime errors in the final matrix.
  This does not certify all possible CMS content, image text or every interaction.
- Menu checks cover both openers, focus containment, Escape restoration and desktop-resize dismissal.
  Inherited small shared dialog/help controls remain reported rather than changed outside ownership.
- Focused tests: 20 files / 183 tests pass. Typecheck and full lint pass.
  Required gates: `lint:contrast` 254/254; `lint:css-modules` 18 modules, zero raw-color lines.
  Logs: `/tmp/b-dark-tests-final.log`, `/tmp/b-dark-typecheck-final.log`, `/tmp/b-dark-lint-final.log`.
- A post-pass screenshot refresh encountered an unresponsive shared Next dev server. With approval,
  the hung process was stopped and the frontend restarted; no application workaround was introduced.
  The recovered run refreshes the same evidence paths. Final per-page theme metrics report zero
  low-contrast text samples and zero missing visible focus indicators among the sampled controls.
