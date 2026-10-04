# C3 script deletion evidence

4 October 2026. Only `scripts/rebrand-assets-capture.mjs` is removed.

Reason: finished rebrand B1 capture helper explicitly covered by cleanup scope. Whole-repository hidden-file searches for its filename and RB_VISUAL_ORIGIN (excluding dependencies, build and Git internals) found its own implementation and historical rebrand/migration inventories only. Separate package.json, .github, scripts, tests, src, convex and shared search found no executable caller. Inspected source: it reads no plan input, writes RB screenshots and B1-render-checks.json only, and captures existing pages via retained final-sweep helpers. Current brand generator, brand guard, asset tests, sweep and crawl remain. Historical inventory mentions are provenance, not runtime dependencies.

No tests or executable callers were removed to justify this deletion. C1 owns historical plan removal. Other scripts still write under plans/rebrand, so this removal releases only its own B1 capture output dependency. Combined gates belong to C1 after source freeze.
