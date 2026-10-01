# Whole-app QA sweep

14 routes; 56 locale/viewport cases; 28 without failures; 28 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/dashboard,/profile,/fit,/settings,/feedback",
  "concurrency": 3,
  "label": "40d",
  "limitations": [
    "Account fixtures test actual UI with mocked auth/Convex; not backend authorization or persistence.",
    "Small UI-word language detector is heuristic, not a complete translation audit.",
    "Automated axe serious/critical checks do not establish full accessibility conformance.",
    "Initial route states only; this sweep does not submit forms or exercise destructive actions.",
    "The two local Vercel analytics scripts are explicit QA no-ops; analytics delivery is not tested.",
    "Expected document-404 console diagnostics are retained separately, not treated as unexpected errors.",
    "Production uses the established custom Next server; next start caused a self-redirect loop in this preview.",
    "Account HTTP status belongs to the fixture server; authentication, middleware and server metadata are not exercised.",
    "Actual account pages and dashboard shell use deterministic batch-20 Convex/auth fixtures; mutations are mocked.",
    "Next Link/Image use anchor/img adapters; image optimization and Next navigation behavior are not exercised.",
    "Production global CSS/fonts plus bundled actual CSS Modules are used; only default filled states are covered.",
    "Feedback panel provider is mocked on account tool routes; batch-20 overlay differences remain fixture limitations."
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
    "origin": "https://127.0.0.1:4349",
    "sourceHash": "e240c5120c5f2abb5d8c3854b9dc7d7e552bfcf29cfc3972dddf5a692f257f0e",
    "buildId": "MzVS8aqeCngM6FyASv_i6",
    "snapshot": "/tmp/bbf-final-sweep-e240c5120c5f2abb",
    "reused": true,
    "tls": "Throwaway loopback certificate; production browser contexts ignore certificate errors only."
  },
  "localDiagnostics": {
    "convexSyncOrigin": "ws://127.0.0.1:3210",
    "analyticsNoopPaths": [
      "/_vercel/insights/script.js",
      "/_vercel/speed-insights/script.js"
    ]
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
| status | 56 | 0 | 0 |
| errors | 56 | 0 | 0 |
| overflow | 56 | 0 | 0 |
| h1 | 56 | 0 | 0 |
| locale | 56 | 0 | 0 |
| seo | 4 | 0 | 52 |
| language | 28 | 28 | 0 |
| touchTargets | 28 | 0 | 28 |
| images | 56 | 0 | 0 |
| axe | 56 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /fit-pass | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | — | ✓ | ✓ | [view](fit-pass-nl-1440.png) |
| /fit-pass | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | [view](fit-pass-nl-390.png) |
| /fit-pass | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](fit-pass-en-1440.png) |
| /fit-pass | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](fit-pass-en-390.png) |
| /dashboard | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](dashboard-nl-1440.png) |
| /dashboard | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](dashboard-nl-390.png) |
| /dashboard | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](dashboard-en-1440.png) |
| /dashboard | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](dashboard-en-390.png) |
| /profile | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](profile-nl-1440.png) |
| /profile | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](profile-nl-390.png) |
| /profile | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-en-1440.png) |
| /profile | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-en-390.png) |
| /profile/improve/body-measurements | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](profile-improve-body-measurements-nl-1440.png) |
| /profile/improve/body-measurements | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](profile-improve-body-measurements-nl-390.png) |
| /profile/improve/body-measurements | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-body-measurements-en-1440.png) |
| /profile/improve/body-measurements | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-body-measurements-en-390.png) |
| /profile/improve/flexibility | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](profile-improve-flexibility-nl-1440.png) |
| /profile/improve/flexibility | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](profile-improve-flexibility-nl-390.png) |
| /profile/improve/flexibility | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-flexibility-en-1440.png) |
| /profile/improve/flexibility | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-flexibility-en-390.png) |
| /profile/improve/core-stability | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](profile-improve-core-stability-nl-1440.png) |
| /profile/improve/core-stability | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](profile-improve-core-stability-nl-390.png) |
| /profile/improve/core-stability | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-core-stability-en-1440.png) |
| /profile/improve/core-stability | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-core-stability-en-390.png) |
| /profile/improve/comfort | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](profile-improve-comfort-nl-1440.png) |
| /profile/improve/comfort | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](profile-improve-comfort-nl-390.png) |
| /profile/improve/comfort | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-comfort-en-1440.png) |
| /profile/improve/comfort | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-comfort-en-390.png) |
| /fit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](fit-nl-1440.png) |
| /fit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](fit-nl-390.png) |
| /fit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-en-1440.png) |
| /fit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-en-390.png) |
| /fit/[sessionId]/questionnaire | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](fit-sessionId-questionnaire-nl-1440.png) |
| /fit/[sessionId]/questionnaire | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](fit-sessionId-questionnaire-nl-390.png) |
| /fit/[sessionId]/questionnaire | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-sessionId-questionnaire-en-1440.png) |
| /fit/[sessionId]/questionnaire | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-sessionId-questionnaire-en-390.png) |
| /fit/[sessionId]/results | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](fit-sessionId-results-nl-1440.png) |
| /fit/[sessionId]/results | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](fit-sessionId-results-nl-390.png) |
| /fit/[sessionId]/results | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-sessionId-results-en-1440.png) |
| /fit/[sessionId]/results | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-sessionId-results-en-390.png) |
| /fit/how-it-works | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](fit-how-it-works-nl-1440.png) |
| /fit/how-it-works | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](fit-how-it-works-nl-390.png) |
| /fit/how-it-works | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-how-it-works-en-1440.png) |
| /fit/how-it-works | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-how-it-works-en-390.png) |
| /fit-history | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](fit-history-nl-1440.png) |
| /fit-history | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](fit-history-nl-390.png) |
| /fit-history | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-history-en-1440.png) |
| /fit-history | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-history-en-390.png) |
| /settings | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](settings-nl-1440.png) |
| /settings | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](settings-nl-390.png) |
| /settings | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](settings-en-1440.png) |
| /settings | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](settings-en-390.png) |
| /feedback | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](feedback-nl-1440.png) |
| /feedback | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](feedback-nl-390.png) |
| /feedback | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](feedback-en-1440.png) |
| /feedback | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](feedback-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /fit-pass · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /fit-pass · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /fit-pass · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /fit-pass · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /fit-pass · nl · 1440

URL: https://127.0.0.1:4349/nl/fit-pass

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(3) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
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

URL: https://127.0.0.1:4349/nl/fit-pass

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(3) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /fit-pass · en · 1440

URL: https://127.0.0.1:4349/en/fit-pass

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /dashboard · nl · 1440

URL: http://127.0.0.1:55752/nl/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > section:nth-of-type(1) > div:nth-of-type(2) > article:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > section:nth-of-type(1) > div:nth-of-type(2) > article:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /dashboard · nl · 390

URL: http://127.0.0.1:55752/nl/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > section:nth-of-type(1) > div:nth-of-type(2) > article:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > section:nth-of-type(1) > div:nth-of-type(2) > article:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /dashboard · en · 1440

URL: http://127.0.0.1:55752/en/dashboard

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

URL: http://127.0.0.1:55752/en/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile · nl · 1440

URL: http://127.0.0.1:55752/nl/profile

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Zelfs licht ongemak wijst meestal op een fitprobleem, niet op gewone vermoeidheid. Door bij te houden welke gebieden last geven en hoe ernstig, kunnen we gerichte aanpassingen doen aan reikwijdte, stuurhoogte en zadelstand — en van terugkerend ongemak een oplosbaar probleem maken.",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(2) > p:nth-of-type(1)",
    "englishWords": [
      "last"
    ],
    "ratio": 0.024,
    "wordCount": 41,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Beginner",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(4) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > span:nth-of-type(1)",
    "englishWords": [
      "beginner"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile · nl · 390

URL: http://127.0.0.1:55752/nl/profile

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Zelfs licht ongemak wijst meestal op een fitprobleem, niet op gewone vermoeidheid. Door bij te houden welke gebieden last geven en hoe ernstig, kunnen we gerichte aanpassingen doen aan reikwijdte, stuurhoogte en zadelstand — en van terugkerend ongemak een oplosbaar probleem maken.",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(2) > p:nth-of-type(1)",
    "englishWords": [
      "last"
    ],
    "ratio": 0.024,
    "wordCount": 41,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Beginner",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(4) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > span:nth-of-type(1)",
    "englishWords": [
      "beginner"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /profile · en · 1440

URL: http://127.0.0.1:55752/en/profile

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

### /profile · en · 390

URL: http://127.0.0.1:55752/en/profile

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/body-measurements · nl · 1440

URL: http://127.0.0.1:55752/nl/profile/improve/body-measurements

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/body-measurements · nl · 390

URL: http://127.0.0.1:55752/nl/profile/improve/body-measurements

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /profile/improve/body-measurements · en · 1440

URL: http://127.0.0.1:55752/en/profile/improve/body-measurements

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

URL: http://127.0.0.1:55752/en/profile/improve/body-measurements

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/flexibility · nl · 1440

URL: http://127.0.0.1:55752/nl/profile/improve/flexibility

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/flexibility · nl · 390

URL: http://127.0.0.1:55752/nl/profile/improve/flexibility

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /profile/improve/flexibility · en · 1440

URL: http://127.0.0.1:55752/en/profile/improve/flexibility

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

URL: http://127.0.0.1:55752/en/profile/improve/flexibility

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/core-stability · nl · 1440

URL: http://127.0.0.1:55752/nl/profile/improve/core-stability

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/core-stability · nl · 390

URL: http://127.0.0.1:55752/nl/profile/improve/core-stability

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /profile/improve/core-stability · en · 1440

URL: http://127.0.0.1:55752/en/profile/improve/core-stability

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

URL: http://127.0.0.1:55752/en/profile/improve/core-stability

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/comfort · nl · 1440

URL: http://127.0.0.1:55752/nl/profile/improve/comfort

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /profile/improve/comfort · nl · 390

URL: http://127.0.0.1:55752/nl/profile/improve/comfort

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /profile/improve/comfort · en · 1440

URL: http://127.0.0.1:55752/en/profile/improve/comfort

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

URL: http://127.0.0.1:55752/en/profile/improve/comfort

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit · nl · 1440

URL: http://127.0.0.1:55752/nl/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > span:nth-of-type(1) > span:nth-of-type(2) > span:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit · nl · 390

URL: http://127.0.0.1:55752/nl/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > span:nth-of-type(1) > span:nth-of-type(2) > span:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /fit · en · 1440

URL: http://127.0.0.1:55752/en/fit

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

URL: http://127.0.0.1:55752/en/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/[sessionId]/questionnaire · nl · 1440

URL: http://127.0.0.1:55752/nl/fit/visual-session/questionnaire

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/[sessionId]/questionnaire · nl · 390

URL: http://127.0.0.1:55752/nl/fit/visual-session/questionnaire

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /fit/[sessionId]/questionnaire · en · 1440

URL: http://127.0.0.1:55752/en/fit/visual-session/questionnaire

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

URL: http://127.0.0.1:55752/en/fit/visual-session/questionnaire

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/[sessionId]/results · nl · 1440

URL: http://127.0.0.1:55752/nl/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > header:nth-of-type(1) > div:nth-of-type(1) > p:nth-of-type(2)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > details:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > h3:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/[sessionId]/results · nl · 390

URL: http://127.0.0.1:55752/nl/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > header:nth-of-type(1) > div:nth-of-type(1) > p:nth-of-type(2)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > details:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > h3:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /fit/[sessionId]/results · en · 1440

URL: http://127.0.0.1:55752/en/fit/visual-session/results

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

URL: http://127.0.0.1:55752/en/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/how-it-works · nl · 1440

URL: http://127.0.0.1:55752/nl/fit/how-it-works

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/how-it-works · nl · 390

URL: http://127.0.0.1:55752/nl/fit/how-it-works

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /fit/how-it-works · en · 1440

URL: http://127.0.0.1:55752/en/fit/how-it-works

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

URL: http://127.0.0.1:55752/en/fit/how-it-works

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit-history · nl · 1440

URL: http://127.0.0.1:55752/nl/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit-history · nl · 390

URL: http://127.0.0.1:55752/nl/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /fit-history · en · 1440

URL: http://127.0.0.1:55752/en/fit-history

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

URL: http://127.0.0.1:55752/en/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /settings · nl · 1440

URL: http://127.0.0.1:55752/nl/settings

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Theme selection",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1)",
    "englishWords": [
      "theme",
      "selection"
    ],
    "ratio": 1,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /settings · nl · 390

URL: http://127.0.0.1:55752/nl/settings

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Theme selection",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1)",
    "englishWords": [
      "theme",
      "selection"
    ],
    "ratio": 1,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /settings · en · 1440

URL: http://127.0.0.1:55752/en/settings

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

### /settings · en · 390

URL: http://127.0.0.1:55752/en/settings

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /feedback · nl · 1440

URL: http://127.0.0.1:55752/nl/feedback

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /feedback · nl · 390

URL: http://127.0.0.1:55752/nl/feedback

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Notifications",
    "selector": "body > div:nth-of-type(2) > div:nth-of-type(1)",
    "englishWords": [
      "notifications"
    ],
    "ratio": 1,
    "wordCount": 1,
    "reason": "unambiguous-english-word"
  }
]
```

### /feedback · en · 1440

URL: http://127.0.0.1:55752/en/feedback

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

URL: http://127.0.0.1:55752/en/feedback

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

