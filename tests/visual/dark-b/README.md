# Codex B dark-mode pass (23)

Run `node tests/visual/dark-b/run.mjs` with the frontend running on localhost:3000.
The runner refreshes NL light/dark captures at 1440 and 390 pixels for all B-owned
page families, reusing the account batch 1/2 and marketing batch 3 fixture harnesses.
Public About/FAQ/Contact/Case Study use live local routes. Outputs are
`plans/redesign-canvas/code-renders/b-dark-*`; the final suite JSON links each run.

Account fixtures render actual pages/shell/components with isolated synthetic
Convex/auth data. Blog filled/filter/pagination/article states likewise use isolated
CMS fixtures because the actual blog has no published posts. No backend writes,
email sends, form submissions or auth bypass occur. See the reused harness READMEs
for exact boundaries. This is presentation validation, not authentication testing.

Each run records horizontal overflow, browser errors and screenshots. Theme
inspection composites computed text/background colors and checks normal/large
text at 4.5:1/3:1 (with 0.02 rounding tolerance), samples keyboard focus indicators,
and records SVG strokes. It does not certify image contents, gradients, opacity
stacking, all possible CMS content, or every interactive state. Disabled controls
are excluded. Human screenshot review supplements these checks.

Mobile account captures also exercise both menu openers, focus containment,
Escape restoration and desktop-resize dismissal. Full-page and mobile viewport
images are retained; fixed header/tab positioning is judged from viewport images.

The existing capture scripts also accept `VISUAL_THEME`, `VISUAL_PREFIX`,
`VISUAL_OUTPUT` and `VISUAL_LOCALES` for focused reruns. Without the `b-dark-`
prefix their original behavior remains unchanged.
