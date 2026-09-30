# Whole-app QA sweep

70 routes; 280 locale/viewport cases; 75 without failures; 205 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": null,
  "concurrency": 3,
  "label": "first-full-run",
  "limitations": [
    "Account fixtures test actual UI with mocked auth/Convex; not backend authorization or persistence.",
    "Small UI-word language detector is heuristic, not a complete translation audit.",
    "Automated axe serious/critical checks do not establish full accessibility conformance.",
    "Initial route states only; this sweep does not submit forms or exercise destructive actions.",
    "Local preview lacks Vercel analytics endpoints; resulting console errors remain failures.",
    "Expected document-404 console diagnostics are retained separately, not treated as unexpected errors.",
    "Production uses the established custom Next server; next start caused a self-redirect loop in this preview.",
    "Account HTTP status belongs to the fixture server; authentication, middleware and server metadata are not exercised.",
    "Actual account pages and dashboard shell use deterministic batch-20 Convex/auth fixtures; mutations are mocked.",
    "Next Link/Image use anchor/img adapters; image optimization and Next navigation behavior are not exercised.",
    "Production global CSS/fonts plus bundled actual CSS Modules are used; only default filled states are covered.",
    "Feedback panel provider is mocked on account tool routes; batch-20 overlay differences remain fixture limitations.",
    "Blog detail uses existing visual-article-1 CMS fixture; no published production article was available.",
    "HTTP 200 is the fixture server response, not proof of production CMS lookup or routing.",
    "Next generateMetadata is not run: canonical/hreflang and production article title remain unverified.",
    "Existing JsonLd adapter renders actual page schema without the production server nonce wrapper.",
    "Header, Footer, and article components use production CSS; Next Image/Link use existing visual adapters."
  ],
  "axe": {
    "adapter": "@axe-core/playwright",
    "version": "4.13.0",
    "impacts": [
      "serious",
      "critical"
    ]
  },
  "production": {
    "origin": "http://127.0.0.1:4321",
    "sourceHash": "c0fe299456bc3d13a0dcb644d1dc0ed0a744bbcfca92b14d00bd125fd9ab3d40",
    "buildId": "CrxsojY1bPDWAC36Ugm5L",
    "snapshot": "/tmp/bbf-final-sweep-c0fe299456bc3d13",
    "reused": false
  },
  "blog": {
    "mode": "fixture",
    "reason": "No published CMS slug available; existing visual-article-1 fixture."
  }
}
```

## Check totals

| Check | ✓ | ✗ | — |
| --- | ---: | ---: | ---: |
| status | 280 | 0 | 0 |
| errors | 104 | 176 | 0 |
| overflow | 280 | 0 | 0 |
| h1 | 276 | 0 | 4 |
| locale | 276 | 0 | 4 |
| seo | 164 | 0 | 116 |
| language | 276 | 0 | 4 |
| touchTargets | 73 | 65 | 142 |
| images | 276 | 0 | 4 |
| axe | 192 | 84 | 4 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](home-nl-1440.png) |
| / | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](home-nl-390.png) |
| / | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](home-en-1440.png) |
| / | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](home-en-390.png) |
| /pricing | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pricing-nl-1440.png) |
| /pricing | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](pricing-nl-390.png) |
| /pricing | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pricing-en-1440.png) |
| /pricing | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](pricing-en-390.png) |
| /how-it-works | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](how-it-works-nl-1440.png) |
| /how-it-works | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](how-it-works-nl-390.png) |
| /how-it-works | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](how-it-works-en-1440.png) |
| /how-it-works | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](how-it-works-en-390.png) |
| /about | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](about-nl-1440.png) |
| /about | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](about-nl-390.png) |
| /about | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](about-en-1440.png) |
| /about | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](about-en-390.png) |
| /faq | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](faq-nl-1440.png) |
| /faq | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](faq-nl-390.png) |
| /faq | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](faq-en-1440.png) |
| /faq | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](faq-en-390.png) |
| /contact | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](contact-nl-1440.png) |
| /contact | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](contact-nl-390.png) |
| /contact | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](contact-en-1440.png) |
| /contact | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](contact-en-390.png) |
| /fit-pass | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](fit-pass-nl-1440.png) |
| /fit-pass | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](fit-pass-nl-390.png) |
| /fit-pass | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](fit-pass-en-1440.png) |
| /fit-pass | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](fit-pass-en-390.png) |
| /case-study | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](case-study-nl-1440.png) |
| /case-study | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](case-study-nl-390.png) |
| /case-study | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](case-study-en-1440.png) |
| /case-study | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](case-study-en-390.png) |
| /calculators/bike-fit | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-bike-fit-nl-1440.png) |
| /calculators/bike-fit | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-bike-fit-nl-390.png) |
| /calculators/bike-fit | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-bike-fit-en-1440.png) |
| /calculators/bike-fit | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-bike-fit-en-390.png) |
| /calculators/saddle-height | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-saddle-height-nl-1440.png) |
| /calculators/saddle-height | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-saddle-height-nl-390.png) |
| /calculators/saddle-height | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-saddle-height-en-1440.png) |
| /calculators/saddle-height | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-saddle-height-en-390.png) |
| /calculators/frame-size | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-frame-size-nl-1440.png) |
| /calculators/frame-size | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-frame-size-nl-390.png) |
| /calculators/frame-size | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-frame-size-en-1440.png) |
| /calculators/frame-size | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-frame-size-en-390.png) |
| /tire-pressure-calculator | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](tire-pressure-calculator-nl-1440.png) |
| /tire-pressure-calculator | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](tire-pressure-calculator-nl-390.png) |
| /tire-pressure-calculator | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](tire-pressure-calculator-en-1440.png) |
| /tire-pressure-calculator | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](tire-pressure-calculator-en-390.png) |
| /bandenspanning-calculator | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-calculator-nl-1440.png) |
| /bandenspanning-calculator | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](bandenspanning-calculator-nl-390.png) |
| /bandenspanning-calculator | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-calculator-en-1440.png) |
| /bandenspanning-calculator | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](bandenspanning-calculator-en-390.png) |
| /calculators/gearing | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-gearing-nl-1440.png) |
| /calculators/gearing | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-gearing-nl-390.png) |
| /calculators/gearing | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-gearing-en-1440.png) |
| /calculators/gearing | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-gearing-en-390.png) |
| /calculators/crank-length | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-crank-length-nl-1440.png) |
| /calculators/crank-length | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-crank-length-nl-390.png) |
| /calculators/crank-length | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-crank-length-en-1440.png) |
| /calculators/crank-length | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-crank-length-en-390.png) |
| /calculators/saddle-width | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-saddle-width-nl-1440.png) |
| /calculators/saddle-width | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-saddle-width-nl-390.png) |
| /calculators/saddle-width | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-saddle-width-en-1440.png) |
| /calculators/saddle-width | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-saddle-width-en-390.png) |
| /calculators/ftp-wkg | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-ftp-wkg-nl-1440.png) |
| /calculators/ftp-wkg | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-ftp-wkg-nl-390.png) |
| /calculators/ftp-wkg | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-ftp-wkg-en-1440.png) |
| /calculators/ftp-wkg | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-ftp-wkg-en-390.png) |
| /calculators/power-speed | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-power-speed-nl-1440.png) |
| /calculators/power-speed | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-power-speed-nl-390.png) |
| /calculators/power-speed | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-power-speed-en-1440.png) |
| /calculators/power-speed | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-power-speed-en-390.png) |
| /calculators/fuel-hydration | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-fuel-hydration-nl-1440.png) |
| /calculators/fuel-hydration | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-fuel-hydration-nl-390.png) |
| /calculators/fuel-hydration | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-fuel-hydration-en-1440.png) |
| /calculators/fuel-hydration | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-fuel-hydration-en-390.png) |
| /calculators/climb-planner | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-climb-planner-nl-1440.png) |
| /calculators/climb-planner | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-climb-planner-nl-390.png) |
| /calculators/climb-planner | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-climb-planner-en-1440.png) |
| /calculators/climb-planner | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](calculators-climb-planner-en-390.png) |
| /bike-fitting | nl | 1440 | ✓ | ✗ | ✓ | — | — | — | — | — | — | — | [view](bike-fitting-nl-1440.png) |
| /bike-fitting | nl | 390 | ✓ | ✗ | ✓ | — | — | — | — | — | — | — | [view](bike-fitting-nl-390.png) |
| /bike-fitting | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](bike-fitting-en-1440.png) |
| /bike-fitting | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](bike-fitting-en-390.png) |
| /bikefitting | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](bikefitting-nl-1440.png) |
| /bikefitting | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](bikefitting-nl-390.png) |
| /bikefitting | en | 1440 | ✓ | ✗ | ✓ | — | — | — | — | — | — | — | [view](bikefitting-en-1440.png) |
| /bikefitting | en | 390 | ✓ | ✗ | ✓ | — | — | — | — | — | — | — | [view](bikefitting-en-390.png) |
| /fiets-afstellen | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](fiets-afstellen-nl-1440.png) |
| /fiets-afstellen | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](fiets-afstellen-nl-390.png) |
| /fiets-afstellen | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](fiets-afstellen-en-1440.png) |
| /fiets-afstellen | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](fiets-afstellen-en-390.png) |
| /why-bikefit-matters | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](why-bikefit-matters-nl-1440.png) |
| /why-bikefit-matters | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](why-bikefit-matters-nl-390.png) |
| /why-bikefit-matters | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](why-bikefit-matters-en-1440.png) |
| /why-bikefit-matters | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](why-bikefit-matters-en-390.png) |
| /measurement-guide | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](measurement-guide-nl-1440.png) |
| /measurement-guide | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](measurement-guide-nl-390.png) |
| /measurement-guide | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](measurement-guide-en-1440.png) |
| /measurement-guide | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](measurement-guide-en-390.png) |
| /pain | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pain-nl-1440.png) |
| /pain | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](pain-nl-390.png) |
| /pain | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pain-en-1440.png) |
| /pain | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](pain-en-390.png) |
| /pain/[slug] | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pain-slug-nl-1440.png) |
| /pain/[slug] | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](pain-slug-nl-390.png) |
| /pain/[slug] | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pain-slug-en-1440.png) |
| /pain/[slug] | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](pain-slug-en-390.png) |
| /guides | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](guides-nl-1440.png) |
| /guides | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](guides-nl-390.png) |
| /guides | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](guides-en-1440.png) |
| /guides | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](guides-en-390.png) |
| /guides/[slug] | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](guides-slug-nl-1440.png) |
| /guides/[slug] | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](guides-slug-nl-390.png) |
| /guides/[slug] | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](guides-slug-en-1440.png) |
| /guides/[slug] | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](guides-slug-en-390.png) |
| /use-cases | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](use-cases-nl-1440.png) |
| /use-cases | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](use-cases-nl-390.png) |
| /use-cases | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](use-cases-en-1440.png) |
| /use-cases | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](use-cases-en-390.png) |
| /use-cases/[slug] | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](use-cases-slug-nl-1440.png) |
| /use-cases/[slug] | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](use-cases-slug-nl-390.png) |
| /use-cases/[slug] | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](use-cases-slug-en-1440.png) |
| /use-cases/[slug] | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](use-cases-slug-en-390.png) |
| /blog | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](blog-nl-1440.png) |
| /blog | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](blog-nl-390.png) |
| /blog | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](blog-en-1440.png) |
| /blog | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](blog-en-390.png) |
| /blog/[slug] | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](blog-slug-nl-1440.png) |
| /blog/[slug] | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](blog-slug-nl-390.png) |
| /blog/[slug] | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](blog-slug-en-1440.png) |
| /blog/[slug] | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](blog-slug-en-390.png) |
| /science/bike-fit-methods | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](science-bike-fit-methods-nl-1440.png) |
| /science/bike-fit-methods | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](science-bike-fit-methods-nl-390.png) |
| /science/bike-fit-methods | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](science-bike-fit-methods-en-1440.png) |
| /science/bike-fit-methods | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](science-bike-fit-methods-en-390.png) |
| /science/calculation-engine | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](science-calculation-engine-nl-1440.png) |
| /science/calculation-engine | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](science-calculation-engine-nl-390.png) |
| /science/calculation-engine | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](science-calculation-engine-en-1440.png) |
| /science/calculation-engine | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](science-calculation-engine-en-390.png) |
| /science/stack-and-reach | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](science-stack-and-reach-nl-1440.png) |
| /science/stack-and-reach | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](science-stack-and-reach-nl-390.png) |
| /science/stack-and-reach | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](science-stack-and-reach-en-1440.png) |
| /science/stack-and-reach | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](science-stack-and-reach-en-390.png) |
| /privacy | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](privacy-nl-1440.png) |
| /privacy | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](privacy-nl-390.png) |
| /privacy | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](privacy-en-1440.png) |
| /privacy | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](privacy-en-390.png) |
| /terms | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](terms-nl-1440.png) |
| /terms | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](terms-nl-390.png) |
| /terms | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](terms-en-1440.png) |
| /terms | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](terms-en-390.png) |
| /bandenspanning/racefiets | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-racefiets-nl-1440.png) |
| /bandenspanning/racefiets | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](bandenspanning-racefiets-nl-390.png) |
| /bandenspanning/racefiets | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-racefiets-en-1440.png) |
| /bandenspanning/racefiets | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](bandenspanning-racefiets-en-390.png) |
| /bandenspanning/gravelbike | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-gravelbike-nl-1440.png) |
| /bandenspanning/gravelbike | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](bandenspanning-gravelbike-nl-390.png) |
| /bandenspanning/gravelbike | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-gravelbike-en-1440.png) |
| /bandenspanning/gravelbike | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](bandenspanning-gravelbike-en-390.png) |
| /bandenspanning/mtb | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-mtb-nl-1440.png) |
| /bandenspanning/mtb | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](bandenspanning-mtb-nl-390.png) |
| /bandenspanning/mtb | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-mtb-en-1440.png) |
| /bandenspanning/mtb | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | [view](bandenspanning-mtb-en-390.png) |
| /tire-pressure/[slug] | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](tire-pressure-slug-nl-1440.png) |
| /tire-pressure/[slug] | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](tire-pressure-slug-nl-390.png) |
| /tire-pressure/[slug] | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](tire-pressure-slug-en-1440.png) |
| /tire-pressure/[slug] | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](tire-pressure-slug-en-390.png) |
| /bandenspanning/[slug] | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](bandenspanning-slug-nl-1440.png) |
| /bandenspanning/[slug] | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](bandenspanning-slug-nl-390.png) |
| /bandenspanning/[slug] | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](bandenspanning-slug-en-1440.png) |
| /bandenspanning/[slug] | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | [view](bandenspanning-slug-en-390.png) |
| /login | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](login-nl-1440.png) |
| /login | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](login-nl-390.png) |
| /login | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](login-en-1440.png) |
| /login | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](login-en-390.png) |
| /dashboard | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](dashboard-nl-1440.png) |
| /dashboard | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](dashboard-nl-390.png) |
| /dashboard | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](dashboard-en-1440.png) |
| /dashboard | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](dashboard-en-390.png) |
| /profile | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](profile-nl-1440.png) |
| /profile | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✗ | [view](profile-nl-390.png) |
| /profile | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](profile-en-1440.png) |
| /profile | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✗ | [view](profile-en-390.png) |
| /profile/improve/body-measurements | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-body-measurements-nl-1440.png) |
| /profile/improve/body-measurements | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-body-measurements-nl-390.png) |
| /profile/improve/body-measurements | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-body-measurements-en-1440.png) |
| /profile/improve/body-measurements | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-body-measurements-en-390.png) |
| /profile/improve/flexibility | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-flexibility-nl-1440.png) |
| /profile/improve/flexibility | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-flexibility-nl-390.png) |
| /profile/improve/flexibility | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-flexibility-en-1440.png) |
| /profile/improve/flexibility | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-flexibility-en-390.png) |
| /profile/improve/core-stability | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-core-stability-nl-1440.png) |
| /profile/improve/core-stability | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-core-stability-nl-390.png) |
| /profile/improve/core-stability | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-core-stability-en-1440.png) |
| /profile/improve/core-stability | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-core-stability-en-390.png) |
| /profile/improve/comfort | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-comfort-nl-1440.png) |
| /profile/improve/comfort | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-comfort-nl-390.png) |
| /profile/improve/comfort | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-comfort-en-1440.png) |
| /profile/improve/comfort | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-comfort-en-390.png) |
| /bikes | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-nl-1440.png) |
| /bikes | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-nl-390.png) |
| /bikes | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-en-1440.png) |
| /bikes | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-en-390.png) |
| /bikes/new | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-nl-1440.png) |
| /bikes/new | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-new-nl-390.png) |
| /bikes/new | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-en-1440.png) |
| /bikes/new | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-new-en-390.png) |
| /bikes/new/manual | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](bikes-new-manual-nl-1440.png) |
| /bikes/new/manual | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✗ | [view](bikes-new-manual-nl-390.png) |
| /bikes/new/manual | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](bikes-new-manual-en-1440.png) |
| /bikes/new/manual | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✗ | [view](bikes-new-manual-en-390.png) |
| /bikes/import/marktplaats | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-marktplaats-nl-1440.png) |
| /bikes/import/marktplaats | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-import-marktplaats-nl-390.png) |
| /bikes/import/marktplaats | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-marktplaats-en-1440.png) |
| /bikes/import/marktplaats | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-import-marktplaats-en-390.png) |
| /bikes/import/passport | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-passport-nl-1440.png) |
| /bikes/import/passport | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-import-passport-nl-390.png) |
| /bikes/import/passport | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-passport-en-1440.png) |
| /bikes/import/passport | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-import-passport-en-390.png) |
| /bikes/[bikeId] | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](bikes-bikeId-nl-1440.png) |
| /bikes/[bikeId] | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✗ | [view](bikes-bikeId-nl-390.png) |
| /bikes/[bikeId] | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](bikes-bikeId-en-1440.png) |
| /bikes/[bikeId] | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✗ | [view](bikes-bikeId-en-390.png) |
| /bikes/[bikeId]/edit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-bikeId-edit-nl-1440.png) |
| /bikes/[bikeId]/edit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-bikeId-edit-nl-390.png) |
| /bikes/[bikeId]/edit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-bikeId-edit-en-1440.png) |
| /bikes/[bikeId]/edit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-bikeId-edit-en-390.png) |
| /bikes/compare-fit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-compare-fit-nl-1440.png) |
| /bikes/compare-fit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-compare-fit-nl-390.png) |
| /bikes/compare-fit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-compare-fit-en-1440.png) |
| /bikes/compare-fit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-compare-fit-en-390.png) |
| /fit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-nl-1440.png) |
| /fit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-nl-390.png) |
| /fit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-en-1440.png) |
| /fit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-en-390.png) |
| /fit/[sessionId]/questionnaire | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-sessionId-questionnaire-nl-1440.png) |
| /fit/[sessionId]/questionnaire | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-sessionId-questionnaire-nl-390.png) |
| /fit/[sessionId]/questionnaire | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-sessionId-questionnaire-en-1440.png) |
| /fit/[sessionId]/questionnaire | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-sessionId-questionnaire-en-390.png) |
| /fit/[sessionId]/results | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-sessionId-results-nl-1440.png) |
| /fit/[sessionId]/results | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-sessionId-results-nl-390.png) |
| /fit/[sessionId]/results | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-sessionId-results-en-1440.png) |
| /fit/[sessionId]/results | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-sessionId-results-en-390.png) |
| /fit/how-it-works | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-how-it-works-nl-1440.png) |
| /fit/how-it-works | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-how-it-works-nl-390.png) |
| /fit/how-it-works | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-how-it-works-en-1440.png) |
| /fit/how-it-works | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-how-it-works-en-390.png) |
| /fit-history | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-history-nl-1440.png) |
| /fit-history | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-history-nl-390.png) |
| /fit-history | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-history-en-1440.png) |
| /fit-history | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-history-en-390.png) |
| /pressure-calculator | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](pressure-calculator-nl-1440.png) |
| /pressure-calculator | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](pressure-calculator-nl-390.png) |
| /pressure-calculator | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](pressure-calculator-en-1440.png) |
| /pressure-calculator | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](pressure-calculator-en-390.png) |
| /gearing | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](gearing-nl-1440.png) |
| /gearing | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✗ | [view](gearing-nl-390.png) |
| /gearing | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](gearing-en-1440.png) |
| /gearing | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✗ | [view](gearing-en-390.png) |
| /saddle-selector | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](saddle-selector-nl-1440.png) |
| /saddle-selector | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](saddle-selector-nl-390.png) |
| /saddle-selector | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](saddle-selector-en-1440.png) |
| /saddle-selector | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](saddle-selector-en-390.png) |
| /shoe-cleat-fit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](shoe-cleat-fit-nl-1440.png) |
| /shoe-cleat-fit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](shoe-cleat-fit-nl-390.png) |
| /shoe-cleat-fit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](shoe-cleat-fit-en-1440.png) |
| /shoe-cleat-fit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](shoe-cleat-fit-en-390.png) |
| /settings | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](settings-nl-1440.png) |
| /settings | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✗ | [view](settings-nl-390.png) |
| /settings | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✗ | [view](settings-en-1440.png) |
| /settings | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✗ | [view](settings-en-390.png) |
| /feedback | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](feedback-nl-1440.png) |
| /feedback | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](feedback-nl-390.png) |
| /feedback | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](feedback-en-1440.png) |
| /feedback | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](feedback-en-390.png) |
| /app | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](app-nl-1440.png) |
| /app | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](app-nl-390.png) |
| /app | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](app-en-1440.png) |
| /app | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](app-en-390.png) |

## Findings and skipped checks

### / · nl · 1440

URL: http://127.0.0.1:4321/nl

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#home-inseam"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"84 cm\""
      }
    ]
  }
]
```

### / · nl · 390

URL: http://127.0.0.1:4321/nl

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "button",
    "label": "Binnenbeenlengte",
    "id": "base-ui-_R_3difeh5fknmatb_",
    "width": 20,
    "height": 20
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_1eh5fknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#home-inseam"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"84 cm\""
      }
    ]
  }
]
```

### / · en · 1440

URL: http://127.0.0.1:4321/en

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#home-inseam"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"84 cm\""
      }
    ]
  }
]
```

### / · en · 390

URL: http://127.0.0.1:4321/en

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "button",
    "label": "Inseam",
    "id": "base-ui-_R_3difeh5fknmatb_",
    "width": 20,
    "height": 20
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_1eh5fknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#home-inseam"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"84 cm\""
      }
    ]
  }
]
```

### /pricing · nl · 1440

URL: http://127.0.0.1:4321/nl/pricing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pricing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pricing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pricing · nl · 390

URL: http://127.0.0.1:4321/nl/pricing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pricing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pricing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /pricing · en · 1440

URL: http://127.0.0.1:4321/en/pricing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pricing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pricing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pricing · en · 390

URL: http://127.0.0.1:4321/en/pricing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pricing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pricing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /how-it-works · nl · 1440

URL: http://127.0.0.1:4321/nl/how-it-works

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/how-it-works",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/how-it-works",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /how-it-works · nl · 390

URL: http://127.0.0.1:4321/nl/how-it-works

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/how-it-works",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/how-it-works",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /how-it-works · en · 1440

URL: http://127.0.0.1:4321/en/how-it-works

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/how-it-works",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/how-it-works",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /how-it-works · en · 390

URL: http://127.0.0.1:4321/en/how-it-works

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/how-it-works",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/how-it-works",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /about · nl · 1440

URL: http://127.0.0.1:4321/nl/about

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/about",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/about",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /about · nl · 390

URL: http://127.0.0.1:4321/nl/about

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/about",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/about",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /about · en · 1440

URL: http://127.0.0.1:4321/en/about

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/about",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/about",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /about · en · 390

URL: http://127.0.0.1:4321/en/about

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/about",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/about",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /faq · nl · 1440

URL: http://127.0.0.1:4321/nl/faq

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/faq",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/faq",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /faq · nl · 390

URL: http://127.0.0.1:4321/nl/faq

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/faq",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/faq",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /faq · en · 1440

URL: http://127.0.0.1:4321/en/faq

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/faq",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/faq",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /faq · en · 390

URL: http://127.0.0.1:4321/en/faq

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/faq",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/faq",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /contact · nl · 1440

URL: http://127.0.0.1:4321/nl/contact

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/contact",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/contact",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /contact · nl · 390

URL: http://127.0.0.1:4321/nl/contact

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/contact",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/contact",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /contact · en · 1440

URL: http://127.0.0.1:4321/en/contact

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/contact",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/contact",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /contact · en · 390

URL: http://127.0.0.1:4321/en/contact

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/contact",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/contact",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /fit-pass · nl · 1440

URL: http://127.0.0.1:4321/nl/fit-pass

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/fit-pass",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/fit-pass",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit-pass · nl · 390

URL: http://127.0.0.1:4321/nl/fit-pass

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/fit-pass",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/fit-pass",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /fit-pass · en · 1440

URL: http://127.0.0.1:4321/en/fit-pass

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/fit-pass",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/fit-pass",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit-pass · en · 390

URL: http://127.0.0.1:4321/en/fit-pass

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/fit-pass",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/fit-pass",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /case-study · nl · 1440

URL: http://127.0.0.1:4321/nl/case-study

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/case-study",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/case-study",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /case-study · nl · 390

URL: http://127.0.0.1:4321/nl/case-study

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/case-study",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/case-study",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /case-study · en · 1440

URL: http://127.0.0.1:4321/en/case-study

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/case-study",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/case-study",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /case-study · en · 390

URL: http://127.0.0.1:4321/en/case-study

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/case-study",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/case-study",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /calculators/bike-fit · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/bike-fit

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/bike-fit",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/bike-fit",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_3ubdbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Gemiddeld\""
      },
      {
        "target": [
          "#slider-_R_4ubdbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Gemiddeld\""
      }
    ]
  },
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/bike-fit · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/bike-fit

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/bike-fit",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/bike-fit",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/calculators/bike-fit",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/calculators/bike-fit",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Home",
    "href": "/nl",
    "width": 38.2,
    "height": 20
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_atbdbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_btbdbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_bubdbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_cubdbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_3ubdbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Gemiddeld\""
      },
      {
        "target": [
          "#slider-_R_4ubdbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Gemiddeld\""
      }
    ]
  },
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/bike-fit · en · 1440

URL: http://127.0.0.1:4321/en/calculators/bike-fit

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/bike-fit",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/bike-fit",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_3ubdbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Average\""
      },
      {
        "target": [
          "#slider-_R_4ubdbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Average\""
      }
    ]
  },
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/bike-fit · en · 390

URL: http://127.0.0.1:4321/en/calculators/bike-fit

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/bike-fit",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/bike-fit",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/calculators/bike-fit",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/calculators/bike-fit",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Home",
    "href": "/en",
    "width": 38.2,
    "height": 20
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_atbdbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_btbdbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_bubdbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_cubdbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_3ubdbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Average\""
      },
      {
        "target": [
          "#slider-_R_4ubdbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Average\""
      }
    ]
  },
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/saddle-height · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/saddle-height

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/saddle-height",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/saddle-height",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_1v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Gemiddeld\""
      },
      {
        "target": [
          "#slider-_R_2f5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Gemiddeld\""
      }
    ]
  },
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/saddle-height · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/saddle-height

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/saddle-height",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/saddle-height",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/calculators/saddle-height",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/calculators/saddle-height",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_2ulpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5v5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_6f5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_1v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Gemiddeld\""
      },
      {
        "target": [
          "#slider-_R_2f5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Gemiddeld\""
      }
    ]
  },
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/saddle-height · en · 1440

URL: http://127.0.0.1:4321/en/calculators/saddle-height

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/saddle-height",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/saddle-height",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_1v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Average\""
      },
      {
        "target": [
          "#slider-_R_2f5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Average\""
      }
    ]
  },
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/saddle-height · en · 390

URL: http://127.0.0.1:4321/en/calculators/saddle-height

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/saddle-height",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/saddle-height",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/calculators/saddle-height",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/calculators/saddle-height",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_2ulpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5v5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_6f5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_1v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Average\""
      },
      {
        "target": [
          "#slider-_R_2f5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"3: Average\""
      }
    ]
  },
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/frame-size · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/frame-size

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/frame-size",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/frame-size",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/frame-size · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/frame-size

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/frame-size",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/frame-size",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/calculators/frame-size",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/calculators/frame-size",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5f5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_6f5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/frame-size · en · 1440

URL: http://127.0.0.1:4321/en/calculators/frame-size

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/frame-size",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/frame-size",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/frame-size · en · 390

URL: http://127.0.0.1:4321/en/calculators/frame-size

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/frame-size",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/frame-size",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/calculators/frame-size",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/calculators/frame-size",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5f5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_6f5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /tire-pressure-calculator · nl · 1440

URL: http://127.0.0.1:4321/nl/tire-pressure-calculator

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /tire-pressure-calculator · nl · 390

URL: http://127.0.0.1:4321/nl/tire-pressure-calculator

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/bandenspanning-calculator",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/bandenspanning-calculator",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_6tbinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_9ubinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_bubinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/nl/login?src=%2Fnl%2Fbandenspanning-calculator%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /tire-pressure-calculator · en · 1440

URL: http://127.0.0.1:4321/en/tire-pressure-calculator

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /tire-pressure-calculator · en · 390

URL: http://127.0.0.1:4321/en/tire-pressure-calculator

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/tire-pressure-calculator",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/tire-pressure-calculator",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_6tbinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_9ubinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_bubinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/en/login?src=%2Fen%2Ftire-pressure-calculator%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning-calculator · nl · 1440

URL: http://127.0.0.1:4321/nl/bandenspanning-calculator

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning-calculator · nl · 390

URL: http://127.0.0.1:4321/nl/bandenspanning-calculator

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/bandenspanning-calculator",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/bandenspanning-calculator",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_6tbinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_9ubinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_bubinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/nl/login?src=%2Fnl%2Fbandenspanning-calculator%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning-calculator · en · 1440

URL: http://127.0.0.1:4321/en/bandenspanning-calculator

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning-calculator · en · 390

URL: http://127.0.0.1:4321/en/bandenspanning-calculator

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure-calculator",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/tire-pressure-calculator",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/tire-pressure-calculator",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_6tbinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_9ubinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_bubinpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/en/login?src=%2Fen%2Ftire-pressure-calculator%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/gearing · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  },
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/gearing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/gearing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_r_3_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"50 T\""
      },
      {
        "target": [
          "#slider-_r_a_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"34 T\""
      },
      {
        "target": [
          "#slider-_r_h_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"11 T\""
      },
      {
        "target": [
          "#slider-_r_o_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"34 T\""
      },
      {
        "target": [
          "#slider-_r_10_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"2.105 mm\""
      },
      {
        "target": [
          "#slider-_r_17_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"80 rpm\""
      },
      {
        "target": [
          "#slider-_r_1f_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8 %\""
      }
    ]
  }
]
```

### /calculators/gearing · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  },
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/gearing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/gearing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_4_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_b_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_i_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_p_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_11_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_18_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_1g_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_r_3_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"50 T\""
      },
      {
        "target": [
          "#slider-_r_a_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"34 T\""
      },
      {
        "target": [
          "#slider-_r_h_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"11 T\""
      },
      {
        "target": [
          "#slider-_r_o_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"34 T\""
      },
      {
        "target": [
          "#slider-_r_10_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"2.105 mm\""
      },
      {
        "target": [
          "#slider-_r_17_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"80 rpm\""
      },
      {
        "target": [
          "#slider-_r_1f_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8 %\""
      }
    ]
  }
]
```

### /calculators/gearing · en · 1440

URL: http://127.0.0.1:4321/en/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/gearing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/gearing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_2slpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"50 T\""
      },
      {
        "target": [
          "#slider-_R_3slpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"34 T\""
      },
      {
        "target": [
          "#slider-_R_5slpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"11 T\""
      },
      {
        "target": [
          "#slider-_R_6slpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"34 T\""
      },
      {
        "target": [
          "#slider-_R_2t5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"2,105 mm\""
      },
      {
        "target": [
          "#slider-_R_3t5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"80 rpm\""
      },
      {
        "target": [
          "#slider-_R_3tlpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8 %\""
      }
    ]
  }
]
```

### /calculators/gearing · en · 390

URL: http://127.0.0.1:4321/en/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/gearing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/gearing",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_aslpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_bslpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_dslpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_eslpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_6t5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_7t5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_7tlpbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_2slpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"50 T\""
      },
      {
        "target": [
          "#slider-_R_3slpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"34 T\""
      },
      {
        "target": [
          "#slider-_R_5slpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"11 T\""
      },
      {
        "target": [
          "#slider-_R_6slpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"34 T\""
      },
      {
        "target": [
          "#slider-_R_2t5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"2,105 mm\""
      },
      {
        "target": [
          "#slider-_R_3t5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"80 rpm\""
      },
      {
        "target": [
          "#slider-_R_3tlpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8 %\""
      }
    ]
  }
]
```

### /calculators/crank-length · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/crank-length

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/crank-length",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/crank-length",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/crank-length · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/crank-length

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/crank-length",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/crank-length",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/calculators/crank-length",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/calculators/crank-length",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_2ulpbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/crank-length · en · 1440

URL: http://127.0.0.1:4321/en/calculators/crank-length

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/crank-length",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/crank-length",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/crank-length · en · 390

URL: http://127.0.0.1:4321/en/calculators/crank-length

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/crank-length",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/crank-length",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/calculators/crank-length",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/calculators/crank-length",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_2ulpbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/saddle-width · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/saddle-width

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/saddle-width",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/saddle-width",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/saddle-width · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/saddle-width

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/saddle-width",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/saddle-width",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/calculators/saddle-width",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/calculators/saddle-width",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_lulpbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/saddle-width · en · 1440

URL: http://127.0.0.1:4321/en/calculators/saddle-width

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/saddle-width",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/saddle-width",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/saddle-width · en · 390

URL: http://127.0.0.1:4321/en/calculators/saddle-width

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/saddle-width",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/saddle-width",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/calculators/saddle-width",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/calculators/saddle-width",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_lulpbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /calculators/ftp-wkg · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/ftp-wkg

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/ftp-wkg",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/ftp-wkg",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_9ulpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      }
    ]
  }
]
```

### /calculators/ftp-wkg · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/ftp-wkg

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/ftp-wkg",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/ftp-wkg",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_pulpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_2v5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_9ulpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      }
    ]
  }
]
```

### /calculators/ftp-wkg · en · 1440

URL: http://127.0.0.1:4321/en/calculators/ftp-wkg

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/ftp-wkg",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/ftp-wkg",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_9ulpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      }
    ]
  }
]
```

### /calculators/ftp-wkg · en · 390

URL: http://127.0.0.1:4321/en/calculators/ftp-wkg

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/ftp-wkg",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/ftp-wkg",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_pulpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_2v5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_9ulpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      }
    ]
  }
]
```

### /calculators/power-speed · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  },
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/power-speed",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/power-speed",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_r_3_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_r_b_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      },
      {
        "target": [
          "#slider-_r_i_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8,5 kg\""
      },
      {
        "target": [
          "#slider-_r_q_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"0 %\""
      }
    ]
  }
]
```

### /calculators/power-speed · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  },
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/power-speed",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/power-speed",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_4_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_c_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_j_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_r_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_r_3_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_r_b_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      },
      {
        "target": [
          "#slider-_r_i_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8,5 kg\""
      },
      {
        "target": [
          "#slider-_r_q_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"0 %\""
      }
    ]
  }
]
```

### /calculators/power-speed · en · 1440

URL: http://127.0.0.1:4321/en/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/power-speed",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/power-speed",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_8ulpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      },
      {
        "target": [
          "#slider-_R_5f5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8.5 kg\""
      },
      {
        "target": [
          "#slider-_R_3flpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"0 %\""
      }
    ]
  }
]
```

### /calculators/power-speed · en · 390

URL: http://127.0.0.1:4321/en/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/power-speed",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/power-speed",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_oulpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_2v5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_df5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_bflpbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_8ulpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      },
      {
        "target": [
          "#slider-_R_5f5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8.5 kg\""
      },
      {
        "target": [
          "#slider-_R_3flpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"0 %\""
      }
    ]
  }
]
```

### /calculators/fuel-hydration · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/fuel-hydration

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/fuel-hydration",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/fuel-hydration",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_6elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"2 uur\""
      },
      {
        "target": [
          "#slider-_R_2v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"20 °C\""
      }
    ]
  }
]
```

### /calculators/fuel-hydration · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/fuel-hydration

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/fuel-hydration",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/fuel-hydration",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_melpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_av5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_6elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"2 uur\""
      },
      {
        "target": [
          "#slider-_R_2v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"20 °C\""
      }
    ]
  }
]
```

### /calculators/fuel-hydration · en · 1440

URL: http://127.0.0.1:4321/en/calculators/fuel-hydration

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/fuel-hydration",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/fuel-hydration",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_6elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"2 hours\""
      },
      {
        "target": [
          "#slider-_R_2v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"20 °C\""
      }
    ]
  }
]
```

### /calculators/fuel-hydration · en · 390

URL: http://127.0.0.1:4321/en/calculators/fuel-hydration

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/fuel-hydration",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/fuel-hydration",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_melpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_av5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_6elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"2 hours\""
      },
      {
        "target": [
          "#slider-_R_2v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"20 °C\""
      }
    ]
  }
]
```

### /calculators/climb-planner · nl · 1440

URL: http://127.0.0.1:4321/nl/calculators/climb-planner

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/climb-planner",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/climb-planner",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_5elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"5 km\""
      },
      {
        "target": [
          "#slider-_R_9elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"7 %\""
      },
      {
        "target": [
          "#slider-_R_delpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      }
    ]
  }
]
```

### /calculators/climb-planner · nl · 390

URL: http://127.0.0.1:4321/nl/calculators/climb-planner

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/climb-planner",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/calculators/climb-planner",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_lelpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_pelpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_telpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_2v5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_5elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"5 km\""
      },
      {
        "target": [
          "#slider-_R_9elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"7 %\""
      },
      {
        "target": [
          "#slider-_R_delpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      }
    ]
  }
]
```

### /calculators/climb-planner · en · 1440

URL: http://127.0.0.1:4321/en/calculators/climb-planner

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/climb-planner",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/climb-planner",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_5elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"5 km\""
      },
      {
        "target": [
          "#slider-_R_9elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"7 %\""
      },
      {
        "target": [
          "#slider-_R_delpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      }
    ]
  }
]
```

### /calculators/climb-planner · en · 390

URL: http://127.0.0.1:4321/en/calculators/climb-planner

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/climb-planner",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/calculators/climb-planner",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_lelpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_pelpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_telpbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_2v5pbsnpfknmatb_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_R_5elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"5 km\""
      },
      {
        "target": [
          "#slider-_R_9elpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"7 %\""
      },
      {
        "target": [
          "#slider-_R_delpbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"200 W\""
      },
      {
        "target": [
          "#slider-_R_v5pbsnpfknmatb_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      }
    ]
  }
]
```

### /bike-fitting · nl · 1440

URL: http://127.0.0.1:4321/nl/bike-fitting

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bike-fitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bike-fitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR",
    "location": {
      "url": "https://127.0.0.1:4321/nl/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**h1 —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**locale —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**touchTargets —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**images —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**axe —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

### /bike-fitting · nl · 390

URL: http://127.0.0.1:4321/nl/bike-fitting

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bike-fitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bike-fitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR",
    "location": {
      "url": "https://127.0.0.1:4321/nl/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**h1 —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**locale —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**touchTargets —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**images —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**axe —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

### /bike-fitting · en · 1440

URL: http://127.0.0.1:4321/en/bike-fitting

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bike-fitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bike-fitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bike-fitting · en · 390

URL: http://127.0.0.1:4321/en/bike-fitting

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bike-fitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bike-fitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /bikefitting · nl · 1440

URL: http://127.0.0.1:4321/nl/bikefitting

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bikefitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bikefitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikefitting · nl · 390

URL: http://127.0.0.1:4321/nl/bikefitting

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bikefitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bikefitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /bikefitting · en · 1440

URL: http://127.0.0.1:4321/en/bikefitting

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bikefitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bikefitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR",
    "location": {
      "url": "https://127.0.0.1:4321/en/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**h1 —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**locale —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**touchTargets —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**images —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**axe —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

### /bikefitting · en · 390

URL: http://127.0.0.1:4321/en/bikefitting

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bikefitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bikefitting",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR",
    "location": {
      "url": "https://127.0.0.1:4321/en/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**h1 —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**locale —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**touchTargets —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**images —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

**axe —**

```json
[
  "Expected locale-specific 404; content checks do not apply."
]
```

### /fiets-afstellen · nl · 1440

URL: http://127.0.0.1:4321/nl/fiets-afstellen

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/fiets-afstellen",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/fiets-afstellen",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fiets-afstellen · nl · 390

URL: http://127.0.0.1:4321/nl/fiets-afstellen

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/fiets-afstellen",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/fiets-afstellen",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/nl",
    "width": 38.2,
    "height": 20
  }
]
```

### /fiets-afstellen · en · 1440

URL: http://127.0.0.1:4321/en/fiets-afstellen

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/fiets-afstellen",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/fiets-afstellen",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fiets-afstellen · en · 390

URL: http://127.0.0.1:4321/en/fiets-afstellen

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/fiets-afstellen",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/fiets-afstellen",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/en",
    "width": 38.2,
    "height": 20
  }
]
```

### /why-bikefit-matters · nl · 1440

URL: http://127.0.0.1:4321/nl/why-bikefit-matters

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/why-bikefit-matters",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/why-bikefit-matters",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /why-bikefit-matters · nl · 390

URL: http://127.0.0.1:4321/nl/why-bikefit-matters

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/why-bikefit-matters",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/why-bikefit-matters",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /why-bikefit-matters · en · 1440

URL: http://127.0.0.1:4321/en/why-bikefit-matters

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/why-bikefit-matters",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/why-bikefit-matters",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /why-bikefit-matters · en · 390

URL: http://127.0.0.1:4321/en/why-bikefit-matters

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/why-bikefit-matters",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/why-bikefit-matters",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /measurement-guide · nl · 1440

URL: http://127.0.0.1:4321/nl/measurement-guide

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/measurement-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/measurement-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /measurement-guide · nl · 390

URL: http://127.0.0.1:4321/nl/measurement-guide

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/measurement-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/measurement-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /measurement-guide · en · 1440

URL: http://127.0.0.1:4321/en/measurement-guide

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/measurement-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/measurement-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /measurement-guide · en · 390

URL: http://127.0.0.1:4321/en/measurement-guide

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/measurement-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/measurement-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /pain · nl · 1440

URL: http://127.0.0.1:4321/nl/pain

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pain · nl · 390

URL: http://127.0.0.1:4321/nl/pain

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /pain · en · 1440

URL: http://127.0.0.1:4321/en/pain

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pain · en · 390

URL: http://127.0.0.1:4321/en/pain

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /pain/[slug] · nl · 1440

URL: http://127.0.0.1:4321/nl/pain/knee-pain-cycling

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pain/knee-pain-cycling",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pain/knee-pain-cycling",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pain/[slug] · nl · 390

URL: http://127.0.0.1:4321/nl/pain/knee-pain-cycling

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pain/knee-pain-cycling",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/pain/knee-pain-cycling",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/nl",
    "width": 38.2,
    "height": 44
  }
]
```

### /pain/[slug] · en · 1440

URL: http://127.0.0.1:4321/en/pain/knee-pain-cycling

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pain/knee-pain-cycling",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pain/knee-pain-cycling",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pain/[slug] · en · 390

URL: http://127.0.0.1:4321/en/pain/knee-pain-cycling

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pain/knee-pain-cycling",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/pain/knee-pain-cycling",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/en",
    "width": 38.2,
    "height": 44
  }
]
```

### /guides · nl · 1440

URL: http://127.0.0.1:4321/nl/guides

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /guides · nl · 390

URL: http://127.0.0.1:4321/nl/guides

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /guides · en · 1440

URL: http://127.0.0.1:4321/en/guides

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /guides · en · 390

URL: http://127.0.0.1:4321/en/guides

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /guides/[slug] · nl · 1440

URL: http://127.0.0.1:4321/nl/guides/saddle-height-guide

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides/saddle-height-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides/saddle-height-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /guides/[slug] · nl · 390

URL: http://127.0.0.1:4321/nl/guides/saddle-height-guide

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides/saddle-height-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides/saddle-height-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/nl",
    "width": 38.2,
    "height": 20
  },
  {
    "tag": "a",
    "label": "Gidsen",
    "href": "/nl/guides",
    "width": 44.1,
    "height": 20
  }
]
```

### /guides/[slug] · en · 1440

URL: http://127.0.0.1:4321/en/guides/saddle-height-guide

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides/saddle-height-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides/saddle-height-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /guides/[slug] · en · 390

URL: http://127.0.0.1:4321/en/guides/saddle-height-guide

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides/saddle-height-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides/saddle-height-guide",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/en",
    "width": 38.2,
    "height": 20
  },
  {
    "tag": "a",
    "label": "Guides",
    "href": "/en/guides",
    "width": 44.1,
    "height": 20
  }
]
```

### /use-cases · nl · 1440

URL: http://127.0.0.1:4321/nl/use-cases

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /use-cases · nl · 390

URL: http://127.0.0.1:4321/nl/use-cases

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /use-cases · en · 1440

URL: http://127.0.0.1:4321/en/use-cases

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /use-cases · en · 390

URL: http://127.0.0.1:4321/en/use-cases

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /use-cases/[slug] · nl · 1440

URL: http://127.0.0.1:4321/nl/use-cases/back-pain-cycling

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides/bike-fitting-for-lower-back-pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides/bike-fitting-for-lower-back-pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /use-cases/[slug] · nl · 390

URL: http://127.0.0.1:4321/nl/use-cases/back-pain-cycling

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides/bike-fitting-for-lower-back-pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/guides/bike-fitting-for-lower-back-pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/nl",
    "width": 38.2,
    "height": 20
  },
  {
    "tag": "a",
    "label": "Gidsen",
    "href": "/nl/guides",
    "width": 44.1,
    "height": 20
  }
]
```

### /use-cases/[slug] · en · 1440

URL: http://127.0.0.1:4321/en/use-cases/back-pain-cycling

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides/bike-fitting-for-lower-back-pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides/bike-fitting-for-lower-back-pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /use-cases/[slug] · en · 390

URL: http://127.0.0.1:4321/en/use-cases/back-pain-cycling

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides/bike-fitting-for-lower-back-pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/guides/bike-fitting-for-lower-back-pain",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/en",
    "width": 38.2,
    "height": 20
  },
  {
    "tag": "a",
    "label": "Guides",
    "href": "/en/guides",
    "width": 44.1,
    "height": 20
  }
]
```

### /blog · nl · 1440

URL: http://127.0.0.1:4321/nl/blog

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/blog",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/blog",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /blog · nl · 390

URL: http://127.0.0.1:4321/nl/blog

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/blog",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/blog",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/nl",
    "width": 38.2,
    "height": 44
  }
]
```

### /blog · en · 1440

URL: http://127.0.0.1:4321/en/blog

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/blog",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/blog",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /blog · en · 390

URL: http://127.0.0.1:4321/en/blog

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/blog",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/blog",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/en",
    "width": 38.2,
    "height": 44
  }
]
```

### /blog/[slug] · nl · 1440

URL: http://127.0.0.1:63708/nl/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /blog/[slug] · nl · 390

URL: http://127.0.0.1:63708/nl/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/nl",
    "width": 38.2,
    "height": 44
  },
  {
    "tag": "a",
    "label": "Blog",
    "href": "/nl/blog",
    "width": 28,
    "height": 44
  },
  {
    "tag": "a",
    "label": "Bikefit",
    "href": "/nl/blog?category=bikefit",
    "width": 39.8,
    "height": 44
  }
]
```

### /blog/[slug] · en · 1440

URL: http://127.0.0.1:63708/en/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /blog/[slug] · en · 390

URL: http://127.0.0.1:63708/en/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/en",
    "width": 38.2,
    "height": 44
  },
  {
    "tag": "a",
    "label": "Blog",
    "href": "/en/blog",
    "width": 28,
    "height": 44
  },
  {
    "tag": "a",
    "label": "Bikefit",
    "href": "/en/blog?category=bikefit",
    "width": 39.8,
    "height": 44
  }
]
```

### /science/bike-fit-methods · nl · 1440

URL: http://127.0.0.1:4321/nl/science/bike-fit-methods

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/bike-fit-methods",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/bike-fit-methods",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /science/bike-fit-methods · nl · 390

URL: http://127.0.0.1:4321/nl/science/bike-fit-methods

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/bike-fit-methods",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/bike-fit-methods",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /science/bike-fit-methods · en · 1440

URL: http://127.0.0.1:4321/en/science/bike-fit-methods

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/bike-fit-methods",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/bike-fit-methods",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /science/bike-fit-methods · en · 390

URL: http://127.0.0.1:4321/en/science/bike-fit-methods

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/bike-fit-methods",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/bike-fit-methods",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /science/calculation-engine · nl · 1440

URL: http://127.0.0.1:4321/nl/science/calculation-engine

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/calculation-engine",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/calculation-engine",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /science/calculation-engine · nl · 390

URL: http://127.0.0.1:4321/nl/science/calculation-engine

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/calculation-engine",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/calculation-engine",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /science/calculation-engine · en · 1440

URL: http://127.0.0.1:4321/en/science/calculation-engine

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/calculation-engine",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/calculation-engine",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /science/calculation-engine · en · 390

URL: http://127.0.0.1:4321/en/science/calculation-engine

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/calculation-engine",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/calculation-engine",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /science/stack-and-reach · nl · 1440

URL: http://127.0.0.1:4321/nl/science/stack-and-reach

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/stack-and-reach",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/stack-and-reach",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /science/stack-and-reach · nl · 390

URL: http://127.0.0.1:4321/nl/science/stack-and-reach

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/stack-and-reach",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/science/stack-and-reach",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /science/stack-and-reach · en · 1440

URL: http://127.0.0.1:4321/en/science/stack-and-reach

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/stack-and-reach",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/stack-and-reach",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /science/stack-and-reach · en · 390

URL: http://127.0.0.1:4321/en/science/stack-and-reach

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/stack-and-reach",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/science/stack-and-reach",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /privacy · nl · 1440

URL: http://127.0.0.1:4321/nl/privacy

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/privacy",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/privacy",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /privacy · nl · 390

URL: http://127.0.0.1:4321/nl/privacy

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/privacy",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/privacy",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /privacy · en · 1440

URL: http://127.0.0.1:4321/en/privacy

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/privacy",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/privacy",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /privacy · en · 390

URL: http://127.0.0.1:4321/en/privacy

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/privacy",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/privacy",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /terms · nl · 1440

URL: http://127.0.0.1:4321/nl/terms

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/terms",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/terms",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /terms · nl · 390

URL: http://127.0.0.1:4321/nl/terms

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/terms",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/terms",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /terms · en · 1440

URL: http://127.0.0.1:4321/en/terms

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/terms",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/terms",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /terms · en · 390

URL: http://127.0.0.1:4321/en/terms

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/terms",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/terms",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

### /bandenspanning/racefiets · nl · 1440

URL: http://127.0.0.1:4321/nl/bandenspanning/racefiets

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/racefiets · nl · 390

URL: http://127.0.0.1:4321/nl/bandenspanning/racefiets

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/bandenspanning/racefiets",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/bandenspanning/racefiets",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_3ellbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_4v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/nl/login?src=%2Fnl%2Fbandenspanning%2Fracefiets%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/racefiets · en · 1440

URL: http://127.0.0.1:4321/en/bandenspanning/racefiets

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/racefiets · en · 390

URL: http://127.0.0.1:4321/en/bandenspanning/racefiets

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/bandenspanning/racefiets",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/bandenspanning/racefiets",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_3ellbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_4v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/en/login?src=%2Fen%2Fbandenspanning%2Fracefiets%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/gravelbike · nl · 1440

URL: http://127.0.0.1:4321/nl/bandenspanning/gravelbike

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/gravelbike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/gravelbike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/gravelbike · nl · 390

URL: http://127.0.0.1:4321/nl/bandenspanning/gravelbike

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/gravelbike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/gravelbike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/bandenspanning/gravelbike",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/bandenspanning/gravelbike",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_3ellbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_4v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/nl/login?src=%2Fnl%2Fbandenspanning%2Fgravelbike%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/gravelbike · en · 1440

URL: http://127.0.0.1:4321/en/bandenspanning/gravelbike

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/gravelbike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/gravelbike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/gravelbike · en · 390

URL: http://127.0.0.1:4321/en/bandenspanning/gravelbike

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/gravelbike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/gravelbike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/bandenspanning/gravelbike",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/bandenspanning/gravelbike",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_3ellbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_4v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/en/login?src=%2Fen%2Fbandenspanning%2Fgravelbike%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/mtb · nl · 1440

URL: http://127.0.0.1:4321/nl/bandenspanning/mtb

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/mtb",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/mtb",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/mtb · nl · 390

URL: http://127.0.0.1:4321/nl/bandenspanning/mtb

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/mtb",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/mtb",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/bandenspanning/mtb",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/bandenspanning/mtb",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_3ellbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_4v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/nl/login?src=%2Fnl%2Fbandenspanning%2Fmtb%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/mtb · en · 1440

URL: http://127.0.0.1:4321/en/bandenspanning/mtb

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/mtb",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/mtb",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /bandenspanning/mtb · en · 390

URL: http://127.0.0.1:4321/en/bandenspanning/mtb

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/mtb",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/mtb",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 140,
    "height": 23.5
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/bandenspanning/mtb",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/bandenspanning/mtb",
    "width": 41.7,
    "height": 30
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_3ellbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_4v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_R_5v5lbsnpfknmatb_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "a",
    "label": "Log in",
    "href": "/en/login?src=%2Fen%2Fbandenspanning%2Fmtb%3Apressure_cta_text_link",
    "width": 38.7,
    "height": 17
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /tire-pressure/[slug] · nl · 1440

URL: http://127.0.0.1:4321/nl/tire-pressure/75kg-road-bike

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/tire-pressure/75kg-road-bike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/tire-pressure/75kg-road-bike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /tire-pressure/[slug] · nl · 390

URL: http://127.0.0.1:4321/nl/tire-pressure/75kg-road-bike

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/tire-pressure/75kg-road-bike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/tire-pressure/75kg-road-bike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/en",
    "width": 38.2,
    "height": 44
  }
]
```

### /tire-pressure/[slug] · en · 1440

URL: http://127.0.0.1:4321/en/tire-pressure/75kg-road-bike

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure/75kg-road-bike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure/75kg-road-bike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /tire-pressure/[slug] · en · 390

URL: http://127.0.0.1:4321/en/tire-pressure/75kg-road-bike

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure/75kg-road-bike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/tire-pressure/75kg-road-bike",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/en",
    "width": 38.2,
    "height": 44
  }
]
```

### /bandenspanning/[slug] · nl · 1440

URL: http://127.0.0.1:4321/nl/bandenspanning/75kg-racefiets

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/75kg-racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/75kg-racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bandenspanning/[slug] · nl · 390

URL: http://127.0.0.1:4321/nl/bandenspanning/75kg-racefiets

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/75kg-racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/bandenspanning/75kg-racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/nl",
    "width": 38.2,
    "height": 44
  }
]
```

### /bandenspanning/[slug] · en · 1440

URL: http://127.0.0.1:4321/en/bandenspanning/75kg-racefiets

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/75kg-racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/75kg-racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bandenspanning/[slug] · en · 390

URL: http://127.0.0.1:4321/en/bandenspanning/75kg-racefiets

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/75kg-racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/bandenspanning/75kg-racefiets",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "Home",
    "href": "/nl",
    "width": 38.2,
    "height": 44
  }
]
```

### /login · nl · 1440

URL: http://127.0.0.1:4321/nl/login

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /login · nl · 390

URL: http://127.0.0.1:4321/nl/login

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /login · en · 1440

URL: http://127.0.0.1:4321/en/login

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /login · en · 390

URL: http://127.0.0.1:4321/en/login

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /dashboard · nl · 1440

URL: http://127.0.0.1:63706/nl/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /dashboard · nl · 390

URL: http://127.0.0.1:63706/nl/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /dashboard · en · 1440

URL: http://127.0.0.1:63706/en/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /dashboard · en · 390

URL: http://127.0.0.1:63706/en/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile · nl · 1440

URL: http://127.0.0.1:63706/nl/profile

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-progressbar-name",
    "impact": "serious",
    "description": "Ensure every ARIA progressbar node has an accessible name",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-progressbar-name?application=playwright",
    "nodes": [
      {
        "target": [
          "div[aria-valuemax=\"100\"]"
        ],
        "failureSummary": "Fix any of the following:\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Element has no title attribute"
      }
    ]
  }
]
```

### /profile · nl · 390

URL: http://127.0.0.1:63706/nl/profile

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-progressbar-name",
    "impact": "serious",
    "description": "Ensure every ARIA progressbar node has an accessible name",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-progressbar-name?application=playwright",
    "nodes": [
      {
        "target": [
          "div[aria-valuemax=\"100\"]"
        ],
        "failureSummary": "Fix any of the following:\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Element has no title attribute"
      }
    ]
  }
]
```

### /profile · en · 1440

URL: http://127.0.0.1:63706/en/profile

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-progressbar-name",
    "impact": "serious",
    "description": "Ensure every ARIA progressbar node has an accessible name",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-progressbar-name?application=playwright",
    "nodes": [
      {
        "target": [
          "div[aria-valuemax=\"100\"]"
        ],
        "failureSummary": "Fix any of the following:\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Element has no title attribute"
      }
    ]
  }
]
```

### /profile · en · 390

URL: http://127.0.0.1:63706/en/profile

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-progressbar-name",
    "impact": "serious",
    "description": "Ensure every ARIA progressbar node has an accessible name",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-progressbar-name?application=playwright",
    "nodes": [
      {
        "target": [
          "div[aria-valuemax=\"100\"]"
        ],
        "failureSummary": "Fix any of the following:\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Element has no title attribute"
      }
    ]
  }
]
```

### /profile/improve/body-measurements · nl · 1440

URL: http://127.0.0.1:63706/nl/profile/improve/body-measurements

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/body-measurements · nl · 390

URL: http://127.0.0.1:63706/nl/profile/improve/body-measurements

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/body-measurements · en · 1440

URL: http://127.0.0.1:63706/en/profile/improve/body-measurements

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/body-measurements · en · 390

URL: http://127.0.0.1:63706/en/profile/improve/body-measurements

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/flexibility · nl · 1440

URL: http://127.0.0.1:63706/nl/profile/improve/flexibility

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/flexibility · nl · 390

URL: http://127.0.0.1:63706/nl/profile/improve/flexibility

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/flexibility · en · 1440

URL: http://127.0.0.1:63706/en/profile/improve/flexibility

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/flexibility · en · 390

URL: http://127.0.0.1:63706/en/profile/improve/flexibility

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/core-stability · nl · 1440

URL: http://127.0.0.1:63706/nl/profile/improve/core-stability

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/core-stability · nl · 390

URL: http://127.0.0.1:63706/nl/profile/improve/core-stability

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/core-stability · en · 1440

URL: http://127.0.0.1:63706/en/profile/improve/core-stability

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/core-stability · en · 390

URL: http://127.0.0.1:63706/en/profile/improve/core-stability

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/comfort · nl · 1440

URL: http://127.0.0.1:63706/nl/profile/improve/comfort

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/comfort · nl · 390

URL: http://127.0.0.1:63706/nl/profile/improve/comfort

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/comfort · en · 1440

URL: http://127.0.0.1:63706/en/profile/improve/comfort

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/comfort · en · 390

URL: http://127.0.0.1:63706/en/profile/improve/comfort

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes · nl · 1440

URL: http://127.0.0.1:63706/nl/bikes

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes · nl · 390

URL: http://127.0.0.1:63706/nl/bikes

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes · en · 1440

URL: http://127.0.0.1:63706/en/bikes

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes · en · 390

URL: http://127.0.0.1:63706/en/bikes

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new · nl · 1440

URL: http://127.0.0.1:63706/nl/bikes/new

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/new · nl · 390

URL: http://127.0.0.1:63706/nl/bikes/new

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new · en · 1440

URL: http://127.0.0.1:63706/en/bikes/new

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/new · en · 390

URL: http://127.0.0.1:63706/en/bikes/new

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new/manual · nl · 1440

URL: http://127.0.0.1:63706/nl/bikes/new/manual

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "label-title-only",
    "impact": "serious",
    "description": "Ensure that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/label-title-only?application=playwright",
    "nodes": [
      {
        "target": [
          "#mijn-notities"
        ],
        "failureSummary": "Fix all of the following:\n  Only title used to generate label for form element"
      }
    ]
  }
]
```

### /bikes/new/manual · nl · 390

URL: http://127.0.0.1:63706/nl/bikes/new/manual

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "fietsnaam",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "Fitness",
    "id": "base-ui-_r_h_",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "Gebalanceerd",
    "id": "base-ui-_r_n_",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "2x",
    "id": "base-ui-_r_t_",
    "width": 274,
    "height": 36
  },
  {
    "tag": "input",
    "label": "",
    "id": "groupset",
    "width": 274,
    "height": 36
  }
]
```

**axe ✗**

```json
[
  {
    "id": "label-title-only",
    "impact": "serious",
    "description": "Ensure that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/label-title-only?application=playwright",
    "nodes": [
      {
        "target": [
          "#mijn-notities"
        ],
        "failureSummary": "Fix all of the following:\n  Only title used to generate label for form element"
      }
    ]
  }
]
```

### /bikes/new/manual · en · 1440

URL: http://127.0.0.1:63706/en/bikes/new/manual

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "label-title-only",
    "impact": "serious",
    "description": "Ensure that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/label-title-only?application=playwright",
    "nodes": [
      {
        "target": [
          "#my-notes"
        ],
        "failureSummary": "Fix all of the following:\n  Only title used to generate label for form element"
      }
    ]
  }
]
```

### /bikes/new/manual · en · 390

URL: http://127.0.0.1:63706/en/bikes/new/manual

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "bike-name",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "Fitness",
    "id": "base-ui-_r_h_",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "Balanced",
    "id": "base-ui-_r_n_",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "2x",
    "id": "base-ui-_r_t_",
    "width": 274,
    "height": 36
  },
  {
    "tag": "input",
    "label": "",
    "id": "groupset",
    "width": 274,
    "height": 36
  }
]
```

**axe ✗**

```json
[
  {
    "id": "label-title-only",
    "impact": "serious",
    "description": "Ensure that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/label-title-only?application=playwright",
    "nodes": [
      {
        "target": [
          "#my-notes"
        ],
        "failureSummary": "Fix all of the following:\n  Only title used to generate label for form element"
      }
    ]
  }
]
```

### /bikes/import/marktplaats · nl · 1440

URL: http://127.0.0.1:63706/nl/bikes/import/marktplaats

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/import/marktplaats · nl · 390

URL: http://127.0.0.1:63706/nl/bikes/import/marktplaats

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "marktplaats-url",
    "width": 324,
    "height": 36
  }
]
```

### /bikes/import/marktplaats · en · 1440

URL: http://127.0.0.1:63706/en/bikes/import/marktplaats

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/import/marktplaats · en · 390

URL: http://127.0.0.1:63706/en/bikes/import/marktplaats

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "marktplaats-url",
    "width": 324,
    "height": 36
  }
]
```

### /bikes/import/passport · nl · 1440

URL: http://127.0.0.1:63706/nl/bikes/import/passport

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/import/passport · nl · 390

URL: http://127.0.0.1:63706/nl/bikes/import/passport

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "bike-passport-id",
    "width": 324,
    "height": 36
  }
]
```

### /bikes/import/passport · en · 1440

URL: http://127.0.0.1:63706/en/bikes/import/passport

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/import/passport · en · 390

URL: http://127.0.0.1:63706/en/bikes/import/passport

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "bike-passport-id",
    "width": 324,
    "height": 36
  }
]
```

### /bikes/[bikeId] · nl · 1440

URL: http://127.0.0.1:63706/nl/bikes/visual-bike

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "label-title-only",
    "impact": "serious",
    "description": "Ensure that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/label-title-only?application=playwright",
    "nodes": [
      {
        "target": [
          "#fietsbeschrijving"
        ],
        "failureSummary": "Fix all of the following:\n  Only title used to generate label for form element"
      }
    ]
  }
]
```

### /bikes/[bikeId] · nl · 390

URL: http://127.0.0.1:63706/nl/bikes/visual-bike

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_3_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_a_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_h_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "label-title-only",
    "impact": "serious",
    "description": "Ensure that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/label-title-only?application=playwright",
    "nodes": [
      {
        "target": [
          "#fietsbeschrijving"
        ],
        "failureSummary": "Fix all of the following:\n  Only title used to generate label for form element"
      }
    ]
  }
]
```

### /bikes/[bikeId] · en · 1440

URL: http://127.0.0.1:63706/en/bikes/visual-bike

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "label-title-only",
    "impact": "serious",
    "description": "Ensure that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/label-title-only?application=playwright",
    "nodes": [
      {
        "target": [
          "#bike-description"
        ],
        "failureSummary": "Fix all of the following:\n  Only title used to generate label for form element"
      }
    ]
  }
]
```

### /bikes/[bikeId] · en · 390

URL: http://127.0.0.1:63706/en/bikes/visual-bike

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_3_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_a_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_h_",
    "width": 22,
    "height": 22
  }
]
```

**axe ✗**

```json
[
  {
    "id": "label-title-only",
    "impact": "serious",
    "description": "Ensure that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/label-title-only?application=playwright",
    "nodes": [
      {
        "target": [
          "#bike-description"
        ],
        "failureSummary": "Fix all of the following:\n  Only title used to generate label for form element"
      }
    ]
  }
]
```

### /bikes/[bikeId]/edit · nl · 1440

URL: http://127.0.0.1:63706/nl/bikes/visual-bike/edit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/[bikeId]/edit · nl · 390

URL: http://127.0.0.1:63706/nl/bikes/visual-bike/edit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/[bikeId]/edit · en · 1440

URL: http://127.0.0.1:63706/en/bikes/visual-bike/edit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/[bikeId]/edit · en · 390

URL: http://127.0.0.1:63706/en/bikes/visual-bike/edit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/compare-fit · nl · 1440

URL: http://127.0.0.1:63706/nl/bikes/compare-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/compare-fit · nl · 390

URL: http://127.0.0.1:63706/nl/bikes/compare-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/compare-fit · en · 1440

URL: http://127.0.0.1:63706/en/bikes/compare-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikes/compare-fit · en · 390

URL: http://127.0.0.1:63706/en/bikes/compare-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit · nl · 1440

URL: http://127.0.0.1:63706/nl/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit · nl · 390

URL: http://127.0.0.1:63706/nl/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit · en · 1440

URL: http://127.0.0.1:63706/en/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit · en · 390

URL: http://127.0.0.1:63706/en/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/[sessionId]/questionnaire · nl · 1440

URL: http://127.0.0.1:63706/nl/fit/visual-session/questionnaire

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/[sessionId]/questionnaire · nl · 390

URL: http://127.0.0.1:63706/nl/fit/visual-session/questionnaire

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/[sessionId]/questionnaire · en · 1440

URL: http://127.0.0.1:63706/en/fit/visual-session/questionnaire

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/[sessionId]/questionnaire · en · 390

URL: http://127.0.0.1:63706/en/fit/visual-session/questionnaire

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/[sessionId]/results · nl · 1440

URL: http://127.0.0.1:63706/nl/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/[sessionId]/results · nl · 390

URL: http://127.0.0.1:63706/nl/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/[sessionId]/results · en · 1440

URL: http://127.0.0.1:63706/en/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/[sessionId]/results · en · 390

URL: http://127.0.0.1:63706/en/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/how-it-works · nl · 1440

URL: http://127.0.0.1:63706/nl/fit/how-it-works

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/how-it-works · nl · 390

URL: http://127.0.0.1:63706/nl/fit/how-it-works

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/how-it-works · en · 1440

URL: http://127.0.0.1:63706/en/fit/how-it-works

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/how-it-works · en · 390

URL: http://127.0.0.1:63706/en/fit/how-it-works

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit-history · nl · 1440

URL: http://127.0.0.1:63706/nl/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit-history · nl · 390

URL: http://127.0.0.1:63706/nl/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit-history · en · 1440

URL: http://127.0.0.1:63706/en/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit-history · en · 390

URL: http://127.0.0.1:63706/en/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /pressure-calculator · nl · 1440

URL: http://127.0.0.1:63706/nl/pressure-calculator

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pressure-calculator · nl · 390

URL: http://127.0.0.1:63706/nl/pressure-calculator

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /pressure-calculator · en · 1440

URL: http://127.0.0.1:63706/en/pressure-calculator

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pressure-calculator · en · 390

URL: http://127.0.0.1:63706/en/pressure-calculator

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /gearing · nl · 1440

URL: http://127.0.0.1:63706/nl/gearing

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_r_1_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      },
      {
        "target": [
          "#slider-_r_8_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_f_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_u_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_15_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_1c_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_1j_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_1r_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8 %\""
      },
      {
        "target": [
          "#slider-_r_23_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"85 rpm\""
      }
    ]
  }
]
```

### /gearing · nl · 390

URL: http://127.0.0.1:63706/nl/gearing

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_2_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_9_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_g_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_v_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_16_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_1d_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_1k_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "summary",
    "label": "Alle kransen bewerken · 0",
    "width": 250,
    "height": 24
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_1s_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_24_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "summary",
    "label": "Verfijn je setup",
    "width": 276,
    "height": 28
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_r_1_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      },
      {
        "target": [
          "#slider-_r_8_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_f_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_u_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_15_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_1c_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_1j_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Niet ingevuld\""
      },
      {
        "target": [
          "#slider-_r_1r_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8 %\""
      },
      {
        "target": [
          "#slider-_r_23_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"85 rpm\""
      }
    ]
  }
]
```

### /gearing · en · 1440

URL: http://127.0.0.1:63706/en/gearing

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_r_1_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      },
      {
        "target": [
          "#slider-_r_8_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_f_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_u_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_15_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_1c_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_1j_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_1r_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8 %\""
      },
      {
        "target": [
          "#slider-_r_23_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"85 rpm\""
      }
    ]
  }
]
```

### /gearing · en · 390

URL: http://127.0.0.1:63706/en/gearing

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_2_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_9_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_g_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_v_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_16_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_1d_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_1k_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "summary",
    "label": "Edit all sprockets · 0",
    "width": 250,
    "height": 24
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_1s_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_24_",
    "width": 22,
    "height": 22
  },
  {
    "tag": "summary",
    "label": "Refine your setup",
    "width": 276,
    "height": 28
  }
]
```

**axe ✗**

```json
[
  {
    "id": "aria-allowed-attr",
    "impact": "critical",
    "description": "Ensure an element's role supports its ARIA attributes",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-allowed-attr?application=playwright",
    "nodes": [
      {
        "target": [
          "#slider-_r_1_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"75 kg\""
      },
      {
        "target": [
          "#slider-_r_8_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_f_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_u_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_15_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_1c_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_1j_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"Not entered\""
      },
      {
        "target": [
          "#slider-_r_1r_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"8 %\""
      },
      {
        "target": [
          "#slider-_r_23_"
        ],
        "failureSummary": "Fix all of the following:\n  ARIA attribute is not allowed: aria-valuetext=\"85 rpm\""
      }
    ]
  }
]
```

### /saddle-selector · nl · 1440

URL: http://127.0.0.1:63706/nl/saddle-selector

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /saddle-selector · nl · 390

URL: http://127.0.0.1:63706/nl/saddle-selector

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_19_",
    "width": 22,
    "height": 22
  }
]
```

### /saddle-selector · en · 1440

URL: http://127.0.0.1:63706/en/saddle-selector

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /saddle-selector · en · 390

URL: http://127.0.0.1:63706/en/saddle-selector

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "base-ui-_r_19_",
    "width": 22,
    "height": 22
  }
]
```

### /shoe-cleat-fit · nl · 1440

URL: http://127.0.0.1:63706/nl/shoe-cleat-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /shoe-cleat-fit · nl · 390

URL: http://127.0.0.1:63706/nl/shoe-cleat-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /shoe-cleat-fit · en · 1440

URL: http://127.0.0.1:63706/en/shoe-cleat-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /shoe-cleat-fit · en · 390

URL: http://127.0.0.1:63706/en/shoe-cleat-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /settings · nl · 1440

URL: http://127.0.0.1:63706/nl/settings

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /settings · nl · 390

URL: http://127.0.0.1:63706/nl/settings

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "weergavenaam",
    "width": 324,
    "height": 36
  },
  {
    "tag": "a",
    "label": "Engels",
    "href": "/en/settings",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Nederlands",
    "href": "/nl/settings",
    "width": 41.7,
    "height": 30
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /settings · en · 1440

URL: http://127.0.0.1:63706/en/settings

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /settings · en · 390

URL: http://127.0.0.1:63706/en/settings

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "display-name",
    "width": 324,
    "height": 36
  },
  {
    "tag": "a",
    "label": "English",
    "href": "/en/settings",
    "width": 42.4,
    "height": 30
  },
  {
    "tag": "a",
    "label": "Dutch",
    "href": "/nl/settings",
    "width": 41.7,
    "height": 30
  }
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /feedback · nl · 1440

URL: http://127.0.0.1:63706/nl/feedback

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /feedback · nl · 390

URL: http://127.0.0.1:63706/nl/feedback

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /feedback · en · 1440

URL: http://127.0.0.1:63706/en/feedback

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /feedback · en · 390

URL: http://127.0.0.1:63706/en/feedback

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "button",
    "label": "Example: compare settings",
    "width": 318.5,
    "height": 32
  }
]
```

### /app · nl · 1440

URL: http://127.0.0.1:4321/nl/app

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/app",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/app",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR",
    "location": {
      "url": "https://127.0.0.1:4321/nl/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /app · nl · 390

URL: http://127.0.0.1:4321/nl/app

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/app",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/nl/app",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/nl",
    "width": 176,
    "height": 29.6
  }
]
```

### /app · en · 1440

URL: http://127.0.0.1:4321/en/app

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/app",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/app",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR",
    "location": {
      "url": "https://127.0.0.1:4321/en/login",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /app · en · 390

URL: http://127.0.0.1:4321/en/app

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4321/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/app",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "location": {
      "url": "http://127.0.0.1:4321/_vercel/speed-insights/script.js",
      "lineNumber": 0,
      "columnNumber": 0
    }
  },
  {
    "type": "console",
    "message": "Refused to execute script from 'http://127.0.0.1:4321/_vercel/speed-insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
    "location": {
      "url": "http://127.0.0.1:4321/en/app",
      "lineNumber": 0,
      "columnNumber": 0
    }
  }
]
```

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "a",
    "label": "BestBikeFit4U",
    "href": "/en",
    "width": 176,
    "height": 29.6
  }
]
```

