# Account dark-mode fixtures (22)

Run `node tests/visual/account-dark-c/capture.mjs` with the existing Next server on port 3000.
Optional environment filters: VISUAL_DEV_ORIGIN, VISUAL_PORT, VISUAL_FILTER, VISUAL_THEMES and VISUAL_WIDTHS.

The harness bundles the seven actual account/app route components, shared dashboard shell, ThemeProvider
and ToastProvider. App remains outside the account shell. It uses real Next CSS/fonts and bundled route
CSS. Explicit fixture users set theme_preference from the theme query; every case asserts actual html.dark
state. All mutations are simulated; unknown query names fail. Example riders/bikes are visibly labelled.

The 72 NL cases cover seven main routes plus pressure wizard result/saved gauges, loading and empty
states, all feedback tabs, settings deletion dialog, and the three App platforms, in light/dark at
1440/390. Pressure result is reached through the actual four Next actions and real pressure engine.
Keyboard focus computed styles are recorded for the first main interactive control in each case.

Contrast sampling checks actual text colors over solid ancestor backgrounds, with 4.5:1 normal and
3:1 large-text thresholds. Disabled controls, decorative punctuation, SVG, transparent elements and
gradients are excluded from text checks. SVG/lime panels receive visual inspection. This sampling is
supporting evidence, not a complete accessibility audit. The existing layout/LanguageSwitch active
locale contrast failure is reported separately as a known shared-layout issue owned outside this task.

No live authentication, database writes, Strava linking, destructive deletion or PWA installation is
validated. FeedbackPanelProvider only is stubbed to supply openPanel; submission-panel behavior is not
validated. Settings opens the real confirmation dialog without confirming account deletion.

Outputs: plans/redesign-canvas/code-renders/20-dark-account-*.png (full-page plus mobile/dialog viewport
captures) and plans/redesign-canvas/audit/22-account-browser.json (checks, contrasts, query traces and
CSS/bundle hashes). Full-page images place fixed navigation at the initial viewport position; viewport
images show actual bottom placement. No changes to the original account-batch4 harness are required.
