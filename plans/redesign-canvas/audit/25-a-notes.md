# 25a — Sweep items 7–8

## Changes

- Linked BrandLogo and MarketingLogo guarantee 44px minimum hit areas while retaining image dimensions, including the mobile-menu logo and standalone app header.
- Shared language choices and public breadcrumb links have 44px minimum height/width. Pain, blog and pressure landing breadcrumb overrides retain that minimum.
- The pressure CTA's inline Log in link now has a 44px hit area. This is the item-7 target, not calculator logic work.
- Bike description and manual-bike notes textareas now have explicit localized aria-labels matching their visible labels. Shared UI files and frozen dictionaries are untouched.
- Marketing Header/Footer links already had compliant sizing; the filtered pricing sweep verifies them without unnecessary changes.

## Before / after

Baseline: `plans/redesign-canvas/final-sweep/report.json` (first full run, unchanged).
After: the `final-sweep/25-a-*/report.json` files listed in `files-25-a.txt`.

| Assigned finding | Before | After |
| --- | ---: | ---: |
| Mobile anchor targets below 44px | 102 individual targets | 0 |
| Bike-form axe label-title-only | 8 locale/viewport cases | 0 |

37 distinct routes, 148 unique NL/EN × 1440/390 cases checked. There are 152 stored cases because the tire-pressure filters overlap on four cases. All baseline failing-anchor routes are covered. The updated fixture also exposed the Dutch programmatic pressure Home link at 38.2×44; this was fixed and its family rerun.

## Validation

- `node tests/visual/final-sweep/sweep.mjs --filter=/<filter> --output=plans/redesign-canvas/final-sweep/25-a-<filter> --port=<port> --label=25a-<filter>`
- Filters: bikes (4326); calculators, tire-pressure-calculator, pain, guides, blog, app, settings, pricing, fiets-afstellen, use-cases, tire-pressure (4327); final bandenspanning run (4328).
- Bike axe: 32/32 pass, including both assigned forms in both languages and widths.
- Every checked mobile anchor passes; no horizontal overflow in any of the 148 unique cases.
- 20 focused unit tests pass: MarketingLogo, ConfiguratorHeaderSwitch, MarketingLayout.
- ESLint on all nine changed TS/TSX files passes; `lint:contrast` 254/254; `lint:css-modules` passes; `git diff --check` passes.
- Inspected mobile calculator and pricing screenshots. Screenshots stay local and are excluded from the file list.
- One pressure rebuild hit a transient Next Google-font-loader TypeError; retry completed successfully. Production snapshots d1b4740762fe and e9bfedc69202 record exact inputs per report. No repository build configuration was changed.

## Remaining findings, not claimed as passed

- Sweep still exits nonzero where C/D-owned findings remain: calculator/pressure/settings contrast (including the shared active language-link channel-token issue), local Convex CSP diagnostics, and two desktop app console cases. These are preserved in the reports, not suppressed.
- Eight mobile cases still flag existing 36px input/select controls: manual-bike form, both bike imports, and settings display name. These are not the links assigned in item 7; no shared UI changes made.
- C coordination note: `messages/20260930-25a-to-c-touch-label-coordination.md`. PressureCalculatorCta and PressureLanding changes are limited to the explicitly assigned Log in/Home targets; preserve these when applying C's contrast fixes. LanguageSwitch contrast follow-up is identified there.
- No commit or push. Source/test files plus audit/evidence files are enumerated in `files-25-a.txt`; no PNGs, logs, or other agents' changes are included.
