# 25 — Fixes from the first full QA sweep (final-sweep/report.md, first-full-run)

| # | Finding (cases) | Owner | Action |
|---|---|---|---|
| 1 | Console: 404 + "Refused to execute script … MIME text/plain" (~355) | D | Harness: serve `_next/static` correctly in the fixture server; not an app bug. |
| 2 | Console: CSP blocks `ws://…/api/…/sync` (176) | D | Harness: mock/disable the local Convex sync connection, or record it as an expected diagnostic, **only** if it truly originates from the local dev URL. |
| 3 | Minified React error (4 cases, hydration) | D → lead | Find the routes and the non-minified message (dev build) and report the file + owner; the owner fixes it. |
| 4 | axe color-contrast (44; tire-pressure pages, calculators) | C | Fix via tokens; `lint:contrast` extended if needed. |
| 5 | axe aria-allowed-attr (36; home, calculators) | C | Probably `aria-*` on the wrong role in Slider/SegmentedControl/ToolsTabBar; fix in `src/components/ui`. |
| 6 | Touch targets < 44 px: slider inputs (base-ui) (~23) | C | Hit area ≥ 44 px (thumb/track) without visual changes. |
| 7 | Touch targets < 44 px @390: logo, breadcrumb "Home", language switch, "Log in"/"Inloggen" (~100) | A | Header/Footer/Breadcrumb: min 44 px hit area (padding/min-height), visually unchanged. |
| 8 | axe label-title-only (8; /bikes/[id], /bikes/new/manual) | A | Real `<label>` or `aria-label` instead of only `title`. |
| 9 | axe aria-progressbar-name (4; /profile) | B | Give the progressbar an accessible name. |

Everyone: after the fix, run `node tests/visual/final-sweep/sweep.mjs` with a filter on your routes (see D's README) and show the before/after in your notes. Write a file list to `audit/files-25-<letter>.txt` and print `DONE 25<letter>`.


## 25d — Items 1–3: harness fixes and hydration triage (2026-09-30)

### 1. Static assets and local analytics — complete

The first-run evidence corrects the initial diagnosis: there were **zero recorded `_next/static` 404/MIME errors**.
The repeated failures came from `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`.
These Vercel platform endpoints are absent in a local Next preview.

The production, account-fixture and blog-fixture servers now serve real `_next/static` files from the
snapshot build with correct JS/CSS/font MIME types. Missing chunks still return 404 and fail the sweep.
The two exact analytics paths return an explicitly labelled JavaScript no-op **only on loopback hosts**;
analytics collection is not tested. There is no generic empty-script fallback or console suppression.
The sweep records each static response and fails non-200 responses or incorrect JS/CSS MIME types.

### 2. Local Convex CSP diagnostic — complete

`src/app/ConvexClientProvider.tsx:8` constructs its client from `NEXT_PUBLIC_CONVEX_URL`.
This run's configured backend is `http://127.0.0.1:3210`; the blocked connection is
`ws://127.0.0.1:3210/api/1.42.1/sync`. `src/lib/csp.ts` permits loopback in development but deliberately
excludes it in production. Thus a production build inheriting this local development backend produces
this preview-only diagnostic; it is not evidence that deployed Convex connections should be exempted.

Classification requires a loopback page, a configured loopback HTTP(S) backend, the exact corresponding
WS(S) origin/port, and the SDK `/api/<version>/sync` path in a `connect-src` CSP console message.
Cloud backends, LAN hosts, remote previews, other ports/paths and page errors remain failures.
Original messages remain in JSON (`consoleErrors` and `expectedLocalDiagnostics`); Markdown lists them.
No app networking, CSP, auth or backend configuration was changed.

### 3. Four hydration cases — triaged; shared UI fix belongs to Codex C

| Route | Width | Trigger | Server text | Dutch browser text | Owner |
|---|---:|---|---|---|---|
| `/nl/calculators/gearing` | 1440 | Wheel circumference, 2105 mm | `2,105` | `2.105` | C (shared Slider) |
| `/nl/calculators/gearing` | 390 | Wheel circumference, 2105 mm | `2,105` | `2.105` | C (shared Slider) |
| `/nl/calculators/power-speed` | 1440 | Bike mass, 8.5 kg | `8.5` | `8,5` | C (shared Slider) |
| `/nl/calculators/power-speed` | 390 | Bike mass, 8.5 kg | `8.5` | `8,5` | C (shared Slider) |

Non-minified development React message:

> Hydration failed because the server rendered text didn't match the client. As a result this tree will
> be regenerated on the client.

The component stack identifies `Slider → SliderRoot → SliderValue → output` with the `sr-only` class.
Source: **`src/components/ui/Slider.tsx:129`**, the empty `PrototyperSliderValue` hidden output.
The wrapper at `src/components/prototyper-ui/ui/slider.tsx:39` forwards to Base UI's `Slider.Value`, whose
formatter uses the root locale. The root receives no explicit locale, so Node's en-US formatting and
Chromium's nl-NL formatting differ. The already-localized visible `valueLabel` does not set the hidden output.

Callers (D-owned pages; not the shared-component fix owner):
- `src/app/(public)/calculators/gearing/GearingCalculatorForm.tsx:265` passes a localized `valueLabel`.
- `src/app/(public)/calculators/power-speed/PerformanceCalculator.tsx:112` does the same.

C should make the hidden output use the same explicit locale/formatted value as the visible label.
D made **no app fix**. Production still reproduces all four failures. Non-minified evidence comes from
an isolated development build of the actual shared Slider at the original route values, SSR in Node
and `hydrateRoot` in NL/EN Chromium. Both NL values reproduce; both EN controls pass. Full Next dev
attempts had local HMR/startup issues and are not claimed as a successful full-route dev reproduction.
The complete message, text diff and component stack are in `final-sweep/25d-slider-hydration.json`.
Reproduce with `node tests/visual/final-sweep/slider-hydration-repro.mjs` (optional saved-snapshot path).

### Filtered before/after verification

16 cases: gearing, power-speed, bikes/new/manual and blog/[slug], NL/EN at 1440/390.
This exercises production plus both fixture servers. Filter supports comma-separated route substrings.

| Finding | Before | After |
|---|---:|---:|
| Console/page-error cases | 8 | 4 (the hydration cases remain) |
| Analytics resource 404 events | 16 | 0 |
| Analytics MIME refusal events | 16 | 0 |
| Convex CSP events counted as failures | 8 | 0 (8 retained expected local diagnostics) |
| Hydration page errors | 4 | 4 (assigned to C) |

338 recorded static responses passed; all 16 routes/cases returned the expected status, with no overflow,
missing headings, language leaks or broken images. Seven tooling tests and scoped ESLint pass.
The filtered build also reflects concurrent A/B/C changes; their accessibility fixes are not attributed to D.
Evidence: `final-sweep/25d/report.md`, `report.json`, `results.jsonl` and `run-context.json`.
Source fingerprint: `a85233c25f07ebce5d7a423a5773e3d770f871673d2311c02e779f18b319e2ce`.
Exact D file list: `audit/files-25-d.txt`. Screenshots remain local and are excluded from the list.
No commit or push by D.
