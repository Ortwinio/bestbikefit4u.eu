# Batch 1 actual-component visual capture handoff

Completed 2026-09-29. This document supplements the parent-owned 20-notes.md.

## Artifacts and coverage

**106 PNG files** in `plans/redesign-canvas/audit/20-renders/`: 68 full-page captures, 34 mobile viewport captures, four mobile menu captures.

| Route family | States | Locales and widths |
| --- | --- | --- |
| /dashboard | filled, empty, loading, missing-weight | NL + EN, 1440 + 390 |
| /profile | filled, empty wizard, loading, edit deep link | NL + EN, 1440 + 390 |
| /profile/improve/flexibility | filled, loading | NL + EN, 1440 + 390 |
| /profile/improve/core-stability | filled | NL + EN, 1440 + 390 |
| /profile/improve/comfort | filled | NL + EN, 1440 + 390 |
| /profile/improve/body-measurements | filled, empty | NL + EN, 1440 + 390 |
| /login | email, code, error | NL + EN, 1440 + 390 |
| Dashboard mobile menu | header Menu, bottom More | NL + EN, 390 |

Filenames: `{locale}-{route-with-hyphens}-{state}-{width}.png`. Mobile adds `-viewport.png`; dashboard adds `-menu-header.png` and `-menu-more.png`.

Representative exact paths relative to this audit folder:

- `20-renders/nl-dashboard-filled-1440.png`
- `20-renders/nl-dashboard-filled-390-viewport.png`
- `20-renders/nl-profile-filled-1440.png`
- `20-renders/nl-profile-filled-390-viewport.png`
- `20-renders/nl-profile-improve-flexibility-filled-1440.png`
- `20-renders/nl-profile-improve-core-stability-filled-390-viewport.png`
- `20-renders/nl-profile-improve-comfort-filled-1440.png`
- `20-renders/nl-profile-improve-body-measurements-filled-390-viewport.png`
- `20-renders/nl-login-email-1440.png`
- `20-renders/en-login-code-390-viewport.png`
- `20-renders/nl-dashboard-filled-390-menu-more.png`

Every route family was visually inspected in NL at desktop and mobile; EN login code was also visually checked. Parent independently reviewed the dashboard, profile, login and improvement captures.

## Results

- Full matrix: **68/68 cases rendered, zero browser runtime errors, zero missing fixture-query references**.
- All 106 PNG widths match 1440/390; captured pages report no horizontal overflow.
- Correct Figtree body and Bricolage Grotesque heading font families loaded from actual Next font CSS. Actual app CSS and page CSS modules are used.
- Desktop sidebar plan entirely visible in both languages at 1440×1000. It uses one raw fixture session, no allowance/cap.
- Mobile feedback button clears the bottom tabs using the exact accountFeedbackPlacement helper.
- No undersized visible controls found in representative filled dashboard/profile/login/improvement pages. Raw wizard scan found internal 22×22 native range inputs; actual slider interaction surfaces measured **543.59×44 desktop / 284×44 mobile**, NL and EN. No shared slider change requested.
- Menu tests pass for both header and More openers: Enter opens, 35 Tab presses remain inside, Escape restores opener focus. Resizing to desktop clears dialog/scroll lock after the close transition. Initial no-wait checks raced focus guards/exit cleanup; settled checks pass in both locales.
- Profile's large desktop gap was corrected by its owner and the existing filled captures refreshed. Final profile filled pass: zero errors/overflow/undersized controls.
- Parent's mobile menu title fix is captured and visually verified: white text is readable on ink.
- Scoped harness ESLint and whitespace checks pass. No app code edits or commits by this harness task.

## Remaining visual observations

ProfileImprove's collapsed exercise rows initially appeared lime on desktop. Parent fixed their local backgroundColor state and Link CTA nativeButton setting. All 24 improvement cases were refreshed at 19:34:11 UTC: zero errors, overflow or undersized controls. Desktop NL flexibility and mobile EN core were visually rechecked: closed rows are paper and the expanded row is lime.

Shared UI follow-up for lead: ghost Button's hover-capable background utility can override local background classes even without hovering a particular row. The page fix avoids that collision; shared UI remains unchanged by this worker.

Some existing NL Profile/Dashboard assessment/usage prose remains English, as documented by the page owners. The floating feedback launcher can overlap scrolling body text but clears the mobile fixed navigation. These observations do not indicate missing assets, overflow, or fixture data leaking into production.

The Profile/ProfileImprove published canvas snapshot was stale. Earlier implementation used the explicitly approved task17 drafts; no ProfileImprove mobile draft exists. Login uses approved desktop/mobile draft equivalents. These captures use actual source components, never those drafts.

## Reproduction and limitations

See `tests/visual/account-batch1/README.md` for complete fixture and adapter details.

```sh
node tests/visual/account-batch1/capture.mjs
node tests/visual/account-batch1/capture.mjs --filter=profile:filled
node tests/visual/account-batch1/capture.mjs --filter=dashboard:filled
```

Requires the running localhost frontend (reused :3000), local esbuild and Playwright Chromium. Local dev-login flag was disabled and secret absent; no auth bypass or production call was made. Isolated query/auth fixtures render real components and real layouts with CSS/fonts retrieved from the running frontend. Browser external requests are blocked.

Filled data is synthetic: user, profile, bike, session, fit recommendation and pressures. Both billing flags explicitly false; Google explicitly visible; dev-login explicitly hidden. Real auth delivery/OAuth/cookies/authz, uploads, saves, live subscriptions, reports, feedback submission, Next SSR/hydration/prefetch and root cookie-consent UI are not validated. FeedbackFloatingButton plus its actual placement helper are included; its click is inert and the full lazy feedback dialog is excluded.

Source files owned by harness: `tests/visual/account-batch1/{capture.mjs,entry.jsx,runtime.jsx,link.jsx,image.jsx,README.md}`, this handoff, and emitted PNG artifacts. No shared dictionaries, app pages, UI components, auth or Convex code changed.

## Capture fingerprints

Initial full matrix finished 19:28:17 UTC:

- CSS SHA256 `d1347f82b90c270e81871f5d1ad72003ae8b1deb9ad90bc72ab76ed6a3309f82`
- Bundle SHA256 `fb0b606a1cbb26a6c6915edea78a39fcb495490b5793509059ed4e56533d69fb`

Final focused profile refresh 19:31:55 UTC and dashboard/menu refresh 19:32:24 UTC:

- CSS SHA256 `c2423771b2e2c9a2a2330214971ad0a14bdbac1046e7d2b2249295183cbe4294`
- Bundle SHA256 `810a6c4cbd706e8ac1811be087e62e881a7237f260f9c974620f4c6833b41167`

Other captures are the prior full-matrix snapshot; all app page changes had landed before that run. Focused rerenders overwrite existing filenames and do not add new state breadth.

Final improvement refresh 19:34:11 UTC (24 cases / 36 existing PNGs overwritten):

- CSS SHA256 `c2423771b2e2c9a2a2330214971ad0a14bdbac1046e7d2b2249295183cbe4294`
- Bundle SHA256 `9fbd3adbf3f3e2e322bbb67c360d293e1d615ad6d72c1d3c760dd75a307b2fbb`

Final total remains **106 PNGs**. Profile spacing, menu title and improvement row-state findings are resolved in the corresponding refreshed screenshots.
