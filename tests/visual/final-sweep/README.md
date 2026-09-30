# Final redesign QA sweep

Run from the repository root:

```sh
node tests/visual/final-sweep/sweep.mjs
```

The default matrix contains the exact 70 non-admin source routes from
`plans/redesign-canvas/audit/route-map.md`, each in NL and EN at 1440×1000 and 390×844: 280 captures.
The later `/design-system` route is outside that audited inventory. Dynamic examples and their sources
are declared in `routes.mjs`. Both locale-specific landing 404s and legacy redirects are checked.

The axe adapter is `@axe-core/playwright@4.13.0`, an exact-pinned dev dependency approved by the lead.
Only this dev dependency was added to the package manifest. The runner fails clearly if it is absent.
`--without-axe` is available for tooling smoke tests or a lead-approved reduced sweep; every accessibility check is then marked skipped.

## Production isolation

`production.mjs` loads existing environment values into the process, sets both Stripe billing flags to
false, and builds a copied source tree under the OS temporary directory. Only the copied Next config
receives `distDir: ".next-final-sweep"`; repository app/config/env files and `.next` are not changed.
The source and public build-environment fingerprint determines the cache directory.
Matching successful builds are reused.
Production startup uses the established custom Next server and a dedicated local port (4321).
The same snapshot produced a self-redirect loop with `next start`; the custom server returned 200.
This harness validates that preview topology, not a deployed router or CDN. Fixture imports resolve
from the same copied source tree as the production build.
The child server and fixture servers close after the run, including failures.

The build needs normal Next font/backend connectivity. Chromium and loopback access must be allowed
by the execution environment. Package dependencies are resolved from the existing `node_modules`.
Build/server logs and build identity are included beside the report. No deployment is performed.

## Rendering modes and limits

- Public/auth/install routes use the isolated production server.
- Account routes render actual route components, account shell, UI and production CSS using the
  established batch-20 deterministic fixtures. Auth, Convex data and mutations are mocked. Fixture
  HTTP 200 is a harness response, not proof of protected-route authentication or backend behavior.
- The production blog sitemap supplies a real article slug when available. If it is empty, the existing
  batch-19.3 article fixture renders actual components. Its production metadata check is explicitly
  skipped; no canonical/hreflang tags are fabricated.
- Browser console/page errors are retained, including external service failures. Consent is dismissed
  through its actual essential-only button. No forms are submitted and no account data is changed.
- All images are requested before measurement, including lazy images below the viewport. Each saved
  PNG is viewport-only, at scroll position zero. The full DOM is inspected for content/layout checks.
- Translation detection uses a small, explicit word list, not a complete semantic translation audit.
  Technical cycling vocabulary such as stack, reach, drop, gravel and cleat is not treated as a leak.
- Mobile interactive targets must be at least 44×44 pixels. Inline prose links are exempt; associated
  labels can provide radio/checkbox hit areas. Disabled/hidden controls are excluded.
- Axe reports serious/critical violations. Automated accessibility checks cannot certify accessibility.
- This is a baseline route-state sweep, not exhaustive interaction, authorization or engine testing.

## Output and exit codes

`plans/redesign-canvas/final-sweep/report.md` and `report.json` contain per-case check results, details,
pass/fail/skip totals, rendering provenance and links to each of the 280 PNGs. Skips never count as passes.
Expected locale 404s skip inapplicable content checks. Desktop touch targets are not evaluated.
Exit code 0 means no failed checks, 1 means findings, and 2 means infrastructure/setup failure.
App findings belong in the report; this tooling never repairs app code.

Options:

```sh
node tests/visual/final-sweep/sweep.mjs --workers=3 --port=4321
node tests/visual/final-sweep/sweep.mjs --filter=science --output=plans/redesign-canvas/final-sweep/smoke
node --test tests/visual/final-sweep/*.test.mjs
```

A filtered run is labelled as partial in the report. Use a separate output directory for smoke tests.


## 25d: local assets and diagnostics

Production and fixture servers serve `/_next/static/*` from the copied build with JS/CSS/font MIME types.
Missing chunks remain real 404 failures. The two exact local `/_vercel/*/script.js` analytics endpoints
are explicit JavaScript no-ops, labelled `x-qa-diagnostic: local-vercel-analytics-disabled`; analytics
collection is not under test. The first run's 404/MIME errors came from these endpoints, not Next chunks.

A Convex CSP console message is an expected diagnostic only when the page origin is loopback and the
blocked WebSocket exactly matches the configured loopback `NEXT_PUBLIC_CONVEX_URL` origin and SDK sync path.
Remote backends, Vercel previews, changed ports, other CSP failures and page errors never qualify.
The original error and classification remain in JSON; Markdown lists the expected local diagnostics.
No CSP, authentication or application networking code is changed.

Filters accept comma-separated route substrings, for example:

```sh
node tests/visual/final-sweep/sweep.mjs --filter=/calculators/gearing,/calculators/power-speed
node tests/visual/final-sweep/slider-hydration-repro.mjs
```

The second command builds the actual shared Slider with development React and compares server-rendered
and hydrated text in NL/EN browsers using the original failing route defaults (2105 mm, 8.5 kg).
It writes `25d-slider-hydration.json`, including the full non-minified message and component stack.
An optional positional repository/saved-snapshot path reproduces an earlier source version.
