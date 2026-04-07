# Browser Acceptance Report

Date: 2026-04-08

Artifacts:

- JSON report: `.tmp/browser-acceptance-artifacts/acceptance-report.json`
- Screenshots: `.tmp/browser-acceptance-artifacts/`

## Environment

- Base URL: `http://127.0.0.1:3000`
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
- Conversion/analytics checks: failed
- Closeout flip to `ready`: blocked

Automated browser summary from the acceptance harness:

- `routeFailures: 8`
- `themeFailures: 0`
- `analyticsFailures: 3`

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

This means the public/auth surfaces are broadly reachable in-browser and not failing with full-page crashes.

## Blocking Findings

### 1. Hydration mismatch warnings on touched public/auth surfaces

Observed on:

- `/en`
- `/nl`
- `/en/pricing`
- `/en/calculators/saddle-height`
- `/nl/login`

Representative failure:

- Base UI generated IDs do not match between server and client on the mobile menu trigger and several form/select controls

Impact:

- this is a real browser-console acceptance failure
- it may not break visible rendering immediately, but it is still a correctness problem on touched surfaces

### 2. Mobile horizontal overflow on login

Observed on:

- `/en/login`
- `/nl/login`

Impact:

- mobile layout acceptance is not complete
- the start page still needs a responsive correction before it can be signed off as production-ready

### 3. CTA click-path verification did not complete successfully for key conversion actions

Automated click-path failures:

- homepage primary CTA
- pricing primary CTA
- tire-pressure primary CTA

Observed behavior:

- expected CTA `href` targets are present in the DOM
- automated click execution did not produce the expected route transition in the browser harness

Interpretation:

- this is not yet enough to declare the funnel broken
- but it is enough to block flipping the closeout to `ready`, because the primary conversion paths were not conclusively verified in-browser

## Non-Blocking Noise

The harness also saw repeated console noise from blocked Vercel dev scripts:

- `https://va.vercel-scripts.com/v1/script.debug.js`
- `https://va.vercel-scripts.com/v1/speed-insights/script.debug.js`

Assessment:

- this appears to be dev-environment CSP noise, not a product regression introduced by this work
- it was excluded from blocker classification in the second pass

## Route Notes

### Homepage

- rendered in mobile and desktop
- theme checks passed
- hydration mismatch warning present
- automated primary CTA click did not conclusively navigate

### Login

- rendered in mobile and desktop
- theme checks passed
- mobile horizontal overflow detected
- NL login also produced a hydration mismatch warning on field IDs

### Pricing

- rendered in mobile and desktop
- theme checks passed
- hydration mismatch warning present on desktop
- primary pricing CTA `href` was present, but automated click-path verification did not conclusively transition

### Calculators

- bike-fit rendered and passed theme checks
- saddle-height rendered but produced hydration mismatch warnings
- frame-size and crank-length rendered with no new blocker beyond the broader hydration issue class
- tire-pressure rendered, but automated primary CTA click-path verification did not conclusively transition

### FAQ and Contact

- rendered in mobile and desktop
- theme checks passed
- funnel links are present in both routes

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

- hydration mismatches remain on touched public/auth routes
- mobile overflow remains on login
- primary CTA browser-path verification is still inconclusive for key conversion actions

## Required Follow-Up Before Re-evaluating

1. Fix the hydration mismatch issues on the touched public/auth surfaces.
2. Fix login mobile overflow.
3. Re-run browser CTA verification for:
   - homepage primary CTA
   - pricing primary CTA
   - tire-pressure primary CTA
4. Re-run the browser acceptance harness and update the closeout note only if blockers clear.
