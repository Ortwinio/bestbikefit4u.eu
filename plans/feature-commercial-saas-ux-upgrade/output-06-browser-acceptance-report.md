# Browser Acceptance Report

Date: 2026-04-08

Artifacts:

- JSON report: `.tmp/browser-acceptance-artifacts/acceptance-report.json`
- Screenshots: `.tmp/browser-acceptance-artifacts/`

## Environment

- First browser pass: `http://127.0.0.1:3000`
- Stable production-like rerun: `http://localhost:3002`
- Browser: Playwright Chromium
- Viewports:
  - mobile `390x844`
  - desktop `1440x900`
- Theme coverage:
  - light
  - dark
  - system-light
  - system-dark

## Summary

- Route/layout checks: failed
- Theme checks: passed
- Conversion/analytics checks: passed
- Closeout flip to `ready`: blocked

Latest production-backed browser summary from the acceptance harness:

- `routeFailures: 30`
- `themeFailures: 0`
- `analyticsFailures: 0`

## What Passed

### Theme and visual mode behavior

The browser pass confirmed successful light/dark/system switching on:

- `/en`
- `/en/login`
- `/en/pricing`
- `/en/calculators/bike-fit`
- `/en/faq`
- `/en/contact`

Evidence:

- `home-en-light.png`
- `home-en-dark.png`
- `home-en-system-light.png`
- `home-en-system-dark.png`
- `login-en-dark.png`
- `pricing-en-light.png`
- `bike-fit-en-dark.png`
- `faq-en-dark.png`
- `contact-en-light.png`

Assessment:

- no theme-mode failure was detected by the browser harness
- the shared public token cleanup appears to be behaving correctly on the sampled routes

### Conversion path verification

The stable production-like rerun confirmed working CTA route transitions for:

- homepage primary CTA to `/en/calculators/bike-fit`
- pricing primary CTA to `/en/login?src=%2Fen%2Fpricing%3Apricing_free_cta`
- tire-pressure primary CTA to `/en/login?src=%2Fen%2Fbandenspanning-calculator%3Apressure_cta_primary`

Assessment:

- CTA browser-path verification is no longer a blocker
- source-tagged login attribution remained intact in-browser

### Broad route rendering

All targeted routes rendered and screenshots were captured for:

- homepage
- login
- pricing
- bike-fit
- saddle-height
- frame-size
- crank-length
- tire-pressure
- FAQ
- contact
- EN and required NL spot-check routes

This means the public/auth surfaces are broadly reachable in-browser in the stable production-like environment.

## Blocking Findings

### 1. Production React runtime failures on login and calculator flows

Observed in the stable production-like rerun on:

- `/en/login`
- `/nl/login`
- `/en/calculators/bike-fit`
- `/en/calculators/saddle-height`
- `/en/calculators/frame-size`
- `/en/calculators/crank-length`
- `/en/bandenspanning-calculator`

Representative failure:

- `Minified React error #418`

Interpretation:

- this is a real production runtime blocker until decoded and fixed
- the current SSR-safe field fallback strategy still diverges enough from the mounted client tree to trigger React production hydration/runtime errors

### 2. Local production 404 noise from Vercel scripts

Observed on most public pages in the stable production-like rerun:

- `/_vercel/insights/script.js`
- `/_vercel/speed-insights/script.js`

Observed behavior:

- script requests return `404`
- the browser reports MIME-type refusal because the local production server serves HTML for those paths

Interpretation:

- this is local-environment noise rather than a product regression
- however, the current harness still counts it as route failure until explicitly filtered

### 3. Mobile horizontal overflow on login in the initial rerun

Observed on:

- `/en/login`
- `/nl/login`

Impact:

- the underlying auth-layout width issue was corrected in code
- the production-backed rerun no longer uses this as the primary blocker

## Non-Blocking Noise

The stable production-like local server still emits local-only noise for Vercel analytics/speed-insights assets because those scripts are not available on the local production host.

## Route Notes

### Homepage

- rendered in mobile and desktop
- theme checks passed
- production CTA click-path verification passed
- remaining route-level failures here are local Vercel script 404 noise

### Login

- rendered in mobile and desktop
- theme checks passed
- auth layout overflow source was fixed
- production rerun still shows a real React runtime error on login

### Pricing

- rendered in mobile and desktop
- theme checks passed
- production CTA click-path verification passed
- remaining route-level failures here are local Vercel script 404 noise

### Calculators

- bike-fit, saddle-height, frame-size, crank-length, and tire-pressure all rendered
- production CTA click-path verification passed for tire-pressure
- calculator routes still show real React production errors that block closeout

### FAQ and Contact

- rendered in mobile and desktop
- theme checks passed
- funnel links are present in both routes
- remaining route-level failures here are local Vercel script 404 noise

## Screenshots To Review

Recommended screenshots for manual inspection:

- `.tmp/browser-acceptance-artifacts/home-en-dark.png`
- `.tmp/browser-acceptance-artifacts/login-en-mobile.png`
- `.tmp/browser-acceptance-artifacts/pricing-en-light.png`
- `.tmp/browser-acceptance-artifacts/bike-fit-en-dark.png`
- `.tmp/browser-acceptance-artifacts/faq-en-dark.png`
- `.tmp/browser-acceptance-artifacts/contact-en-light.png`

## Acceptance Decision

Result: `not ready`

Reasons:

- stable production-like acceptance was executed on `http://localhost:3002`
- CTA browser-path verification passed
- the closeout is still blocked by real production React runtime errors on login and calculator routes
- local-only Vercel script 404 noise should be filtered in the harness before using route-failure counts as final gate numbers

## Required Follow-Up Before Re-evaluating

1. Decode and fix the production React `#418` errors on login and public calculator routes.
2. Filter local Vercel script 404s from the acceptance harness so local production runs do not overcount route failures.
3. Re-run the stable production-like browser acceptance harness on `http://localhost:3002`.
4. Update the closeout note only after route failures are reduced to zero real blockers.
