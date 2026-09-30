# Batch 1 visual fixture harness

This test-only harness imports actual current app pages, dashboard/auth layouts, shared UI components, ThemeProvider and ToastProvider. It does not import canvas drafts. No app source or production auth behavior is changed.

## Reproduce

Run the real frontend on localhost:3000 (the capture run reused the existing server). If needed, start `npm run dev:frontend` separately.

```sh
node tests/visual/account-batch1/capture.mjs
node tests/visual/account-batch1/capture.mjs --filter=profile:filled
node tests/visual/account-batch1/capture.mjs --filter=dashboard:filled
```

Optional environment: VISUAL_DEV_ORIGIN (default http://localhost:3000), VISUAL_PORT (4317), VISUAL_LOCALES (nl,en), VISUAL_FILTER (substring of route:state). The harness binds only 127.0.0.1, closes its server/browser after capture, and blocks browser requests to external hosts.

Output: `plans/redesign-canvas/audit/20-renders/`. PNG filenames are `{nl|en}-{route-with-hyphens}-{state}-{1440|390}.png`; mobile also gets `-viewport.png`. Mobile dashboard adds `-menu-header.png` and `-menu-more.png`. Full-page shots retain the fixed shell at the original viewport position; use viewport shots to judge fixed overlays.

The script prints JSON per case with document width/overflow, heading/fonts, query names, unexpected-query failures, touch-control measurements and browser errors. Its final JSON includes CSS and JS bundle SHA256 fingerprints. Source files and notes are authored using apply_patch; PNGs are binary artifacts emitted by Playwright.

## Coverage

17 cases × NL/EN × 1440×1000 / 390×844 = 68 page-state captures, 102 base PNGs. Four mobile menu PNGs bring the artifact total to 106.

- Dashboard: filled, empty, loading, missing weight.
- Profile: filled, empty first-step wizard, loading, measurements edit deep link.
- ProfileImprove: flexibility, core stability, comfort, body measurements; plus flexibility loading and body measurements missing profile.
- Login: email, code requested, send error. Real form submission drives the latter two states using mocked signIn.
- Dashboard menu: Enter on header Menu and bottom More, 35 Tab presses within the dialog, Escape restoring opener focus, resize to desktop clearing the modal. Waits allow focus guards and exit animations to settle.

## Fixtures and boundaries

- Checked existing localhost login code and env flag presence without revealing values. NEXT_PUBLIC_ENABLE_LOCALHOST_DEV_LOGIN was disabled and LOCALHOST_DEV_LOGIN_SECRET absent locally, so no dev login request or production bypass was introduced.
- Convex useQuery reads explicit test fixtures by real function-reference name; unknown active queries throw. Skip queries remain undefined. Mutations/actions are no-op promises (save-error can reject); nothing is written to Convex.
- The filled fixture has a rider, one bike, one completed session and a synthetic calculated-fit recommendation. AccountPlan receives one actual item in sessions.listByUser, rather than an invented allowance. Empty receives zero sessions. All names, identity, geometry, pressures and recommendations are synthetic test data, never live UI defaults.
- Auth hooks are mocked; email send, OAuth, cookies, authorization and real session persistence are not validated. Google visibility is explicitly enabled for the visual fixture. Localhost login is explicitly hidden.
- Both STRIPE_BILLING_ENABLED and NEXT_PUBLIC_STRIPE_BILLING_ENABLED are explicitly false (paused billing). Other unused environment values are empty; no host secrets are bundled.
- Next navigation is adapted to browser URL/path/query; Link is a native anchor and Image a native image using the actual assets. Next image optimization, prefetch, SSR/hydration and server metadata are not exercised.
- Actual compiled CSS and Next font classes come from the running frontend login response. The test bundle adds actual CSS-module output. Static assets come from public, and Next font assets are proxied from the same dev server. Root CSS is not recreated in the harness.
- Sentry captureException is a no-op. No telemetry is transmitted.
- Actual FeedbackFloatingButton plus the exact accountFeedbackPlacement helper are rendered. The full lazy FeedbackPanelProvider/dialog is excluded; the button's position is covered, its click is intentionally inert. Cookie consent UI and unrelated root analytics widgets are not mounted.

## Validation record

2026-09-29: initial full matrix completed 68/68 with no browser runtime errors or unexpected query references. All 106 resulting PNG widths match their intended 1440/390 size. All representative page families were visually inspected at desktop and mobile size.

Latest dashboard focused pass: desktop AccountPlan entirely inside viewport in NL and EN; no document overflow or undersized visible controls. Both mobile openers trap focus and restore it on Escape; resizing to 1440 clears the modal after its exit transition. Initial instantaneous focus/resize checks produced false negatives; the final checks wait 40ms for focus guards and 350ms for exit cleanup and pass.

The first raw touch scan flagged Base UI's internal native range inputs (22×22). Focused browser measurement confirms the actual shared slider controls are 543.59×44 at desktop and 284×44 at mobile, in both languages. These internal input dimensions alone are not a 44px target failure.

Scoped `npx eslint tests/visual/account-batch1` passes. No whole build/lint executed by this worker.

## Visual findings for parent

- Profile desktop initially had a large gap between Flexibility and Core Stability from the body-measurements row span. The profile owner fixed the stack; the four profile:filled captures were refreshed at 19:31:55 UTC and visually rechecked.
- Mobile menu title originally inherited ink on ink. Parent added explicit white text; dashboard/menu captures were refreshed at 19:32:24 UTC and the title is visibly readable.
- ProfileImprove desktop collapsed exercise rows initially rendered lime like the expanded row. Parent fixed this locally with explicit backgroundColor state and nativeButton=false for the Link CTA. All 24 improvement cases were refreshed at 19:34:11 UTC: zero errors/overflow/undersized controls, with paper closed rows and lime open row visually verified on desktop and mobile. Lead follow-up: shared ghost Button's hover-capable background utility can override page background classes; shared UI was not edited here.
- Existing English assessment/usage prose remains visible inside some NL Profile/Dashboard cards; the original page owners explicitly preserved legacy content. This is not fixture translation or a new live default.
- Feedback launcher clears the mobile tab bar. Like the existing fixed launcher, it can temporarily cover scrolling page text; the position itself follows the exact parent-owned helper.

Parent owns `plans/redesign-canvas/audit/20-notes.md`, full validation and final integration approval.
