# Calculator dark-mode captures

Run `node tests/visual/public-dark-c/capture.mjs` with the Next development server on localhost:3000.
The harness visits the ten calculator routes, both public pressure aliases and the protected playground
at 1440 and 390 pixels in light and dark mode. It sets the real theme preference before navigation,
blocks external network requests, dismisses consent with the real essential-only control, and hides
only the Next development badge.

Screenshots: `plans/redesign-canvas/code-renders/20-dark-*.png`.
Results: `plans/redesign-canvas/audit/22-public-browser.json`.

Checks include HTTP status, actual theme, horizontal overflow, runtime errors and computed text contrast
inside main content. Contrast sampling skips disabled, hidden and partially transparent elements; it
composites ancestor background colors and uses WCAG AA size-dependent thresholds. Suspects require
visual review because images and gradients cannot be inferred from background-color alone. The generic
focus sample is diagnostic; the opt-in calculator browser regression separately checks keyboard focus
and meaningful SVG strokes. Header/footer remain owned by Codex A.
