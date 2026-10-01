# Whole-app QA sweep

8 routes; 32 locale/viewport cases; 24 without failures; 8 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 77,
  "scope": "Active audited non-admin routes and account calculators; retired import and /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "power-speed,climb-planner,ftp-wkg,fuel-hydration",
  "concurrency": 3,
  "label": "43b",
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
    "origin": "https://127.0.0.1:4355",
    "sourceHash": "f9f8bc368e80a08b91225be09ae964d69800ed5b94769132392a83cb8c4c251f",
    "buildId": "2VhZCHqKi9Y25JGyiHgMs",
    "snapshot": "/tmp/bbf-final-sweep-f9f8bc368e80a08b",
    "reused": false,
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
| status | 32 | 0 | 0 |
| errors | 32 | 0 | 0 |
| overflow | 32 | 0 | 0 |
| h1 | 32 | 0 | 0 |
| locale | 32 | 0 | 0 |
| seo | 16 | 0 | 16 |
| language | 24 | 8 | 0 |
| touchTargets | 16 | 0 | 16 |
| images | 32 | 0 | 0 |
| axe | 32 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /calculators/ftp-wkg | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | — | ✓ | ✓ | [view](calculators-ftp-wkg-nl-1440.png) |
| /calculators/ftp-wkg | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | [view](calculators-ftp-wkg-nl-390.png) |
| /calculators/ftp-wkg | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-ftp-wkg-en-1440.png) |
| /calculators/ftp-wkg | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-ftp-wkg-en-390.png) |
| /calculators/power-speed | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-power-speed-nl-1440.png) |
| /calculators/power-speed | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-power-speed-nl-390.png) |
| /calculators/power-speed | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-power-speed-en-1440.png) |
| /calculators/power-speed | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-power-speed-en-390.png) |
| /calculators/fuel-hydration | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | — | ✓ | ✓ | [view](calculators-fuel-hydration-nl-1440.png) |
| /calculators/fuel-hydration | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | [view](calculators-fuel-hydration-nl-390.png) |
| /calculators/fuel-hydration | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-fuel-hydration-en-1440.png) |
| /calculators/fuel-hydration | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-fuel-hydration-en-390.png) |
| /calculators/climb-planner | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-climb-planner-nl-1440.png) |
| /calculators/climb-planner | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-climb-planner-nl-390.png) |
| /calculators/climb-planner | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-climb-planner-en-1440.png) |
| /calculators/climb-planner | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-climb-planner-en-390.png) |
| /tools/power-speed | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-power-speed-nl-1440.png) |
| /tools/power-speed | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-power-speed-nl-390.png) |
| /tools/power-speed | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-power-speed-en-1440.png) |
| /tools/power-speed | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-power-speed-en-390.png) |
| /tools/climb-planner | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-climb-planner-nl-1440.png) |
| /tools/climb-planner | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-climb-planner-nl-390.png) |
| /tools/climb-planner | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-climb-planner-en-1440.png) |
| /tools/climb-planner | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-climb-planner-en-390.png) |
| /tools/ftp-wkg | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](tools-ftp-wkg-nl-1440.png) |
| /tools/ftp-wkg | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](tools-ftp-wkg-nl-390.png) |
| /tools/ftp-wkg | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-ftp-wkg-en-1440.png) |
| /tools/ftp-wkg | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-ftp-wkg-en-390.png) |
| /tools/fuel-hydration | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](tools-fuel-hydration-nl-1440.png) |
| /tools/fuel-hydration | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](tools-fuel-hydration-nl-390.png) |
| /tools/fuel-hydration | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-fuel-hydration-en-1440.png) |
| /tools/fuel-hydration | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-fuel-hydration-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /calculators/ftp-wkg · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/ftp-wkg · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/ftp-wkg · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/ftp-wkg · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/power-speed · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/power-speed · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/power-speed · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/power-speed · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/fuel-hydration · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/fuel-hydration · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/fuel-hydration · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/fuel-hydration · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/climb-planner · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/climb-planner · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/climb-planner · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/climb-planner · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /calculators/ftp-wkg · nl · 1440

URL: https://127.0.0.1:4355/nl/calculators/ftp-wkg

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Allen H, Coggan A. Training and Racing with a Power Meter. 2e editie. VeloPress, 2010. FTP-niveaus zoals gepubliceerd door Garmin.",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(1) > a:nth-of-type(1)",
    "englishWords": [
      "and",
      "racing",
      "with",
      "power"
    ],
    "ratio": 0.267,
    "wordCount": 19,
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

### /calculators/ftp-wkg · nl · 390

URL: https://127.0.0.1:4355/nl/calculators/ftp-wkg

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Allen H, Coggan A. Training and Racing with a Power Meter. 2e editie. VeloPress, 2010. FTP-niveaus zoals gepubliceerd door Garmin.",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(1) > a:nth-of-type(1)",
    "englishWords": [
      "and",
      "racing",
      "with",
      "power"
    ],
    "ratio": 0.267,
    "wordCount": 19,
    "reason": "unambiguous-english-word"
  }
]
```

### /calculators/ftp-wkg · en · 1440

URL: https://127.0.0.1:4355/en/calculators/ftp-wkg

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/power-speed · nl · 1440

URL: https://127.0.0.1:4355/nl/calculators/power-speed

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/power-speed · en · 1440

URL: https://127.0.0.1:4355/en/calculators/power-speed

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/fuel-hydration · nl · 1440

URL: https://127.0.0.1:4355/nl/calculators/fuel-hydration

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Jeukendrup A. A Step Towards Personalized Sports Nutrition: Carbohydrate Intake During Exercise. Sports Med. 2014;44(Suppl 1):25–33, figuur 1. doi:10.1007/s40279-014-0148-z.",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(1) > a:nth-of-type(1)",
    "englishWords": [
      "step",
      "nutrition",
      "carbohydrate"
    ],
    "ratio": 0.167,
    "wordCount": 19,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Sawka MN et al. American College of Sports Medicine position stand. Exercise and fluid replacement. Med Sci Sports Exerc. 2007;39(2):377–390. Pagina 384: vocht als startpunt voor marathonlopers. Pagina 385: 20–30 mEq/L natrium in sportdrank bij langdurige inspanning. Deze tool toont de concentratie voor ritten langer dan een uur.",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(2) > a:nth-of-type(1)",
    "englishWords": [
      "position",
      "and",
      "fluid"
    ],
    "ratio": 0.07,
    "wordCount": 45,
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

### /calculators/fuel-hydration · nl · 390

URL: https://127.0.0.1:4355/nl/calculators/fuel-hydration

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Jeukendrup A. A Step Towards Personalized Sports Nutrition: Carbohydrate Intake During Exercise. Sports Med. 2014;44(Suppl 1):25–33, figuur 1. doi:10.1007/s40279-014-0148-z.",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(1) > a:nth-of-type(1)",
    "englishWords": [
      "step",
      "nutrition",
      "carbohydrate"
    ],
    "ratio": 0.167,
    "wordCount": 19,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Sawka MN et al. American College of Sports Medicine position stand. Exercise and fluid replacement. Med Sci Sports Exerc. 2007;39(2):377–390. Pagina 384: vocht als startpunt voor marathonlopers. Pagina 385: 20–30 mEq/L natrium in sportdrank bij langdurige inspanning. Deze tool toont de concentratie voor ritten langer dan een uur.",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(2) > a:nth-of-type(1)",
    "englishWords": [
      "position",
      "and",
      "fluid"
    ],
    "ratio": 0.07,
    "wordCount": 45,
    "reason": "unambiguous-english-word"
  }
]
```

### /calculators/fuel-hydration · en · 1440

URL: https://127.0.0.1:4355/en/calculators/fuel-hydration

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/climb-planner · nl · 1440

URL: https://127.0.0.1:4355/nl/calculators/climb-planner

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/climb-planner · en · 1440

URL: https://127.0.0.1:4355/en/calculators/climb-planner

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /tools/power-speed · nl · 1440

URL: http://127.0.0.1:56250/nl/tools/power-speed

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

### /tools/power-speed · nl · 390

URL: http://127.0.0.1:56250/nl/tools/power-speed

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/power-speed · en · 1440

URL: http://127.0.0.1:56250/en/tools/power-speed

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

### /tools/power-speed · en · 390

URL: http://127.0.0.1:56250/en/tools/power-speed

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/climb-planner · nl · 1440

URL: http://127.0.0.1:56250/nl/tools/climb-planner

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

### /tools/climb-planner · nl · 390

URL: http://127.0.0.1:56250/nl/tools/climb-planner

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/climb-planner · en · 1440

URL: http://127.0.0.1:56250/en/tools/climb-planner

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

### /tools/climb-planner · en · 390

URL: http://127.0.0.1:56250/en/tools/climb-planner

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/ftp-wkg · nl · 1440

URL: http://127.0.0.1:56250/nl/tools/ftp-wkg

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
    "text": "Allen H, Coggan A. Training and Racing with a Power Meter. 2e editie. VeloPress, 2010. FTP-niveaus zoals gepubliceerd door Garmin.",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(1) > a:nth-of-type(1)",
    "englishWords": [
      "and",
      "racing",
      "with",
      "power"
    ],
    "ratio": 0.267,
    "wordCount": 19,
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

### /tools/ftp-wkg · nl · 390

URL: http://127.0.0.1:56250/nl/tools/ftp-wkg

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
    "text": "Allen H, Coggan A. Training and Racing with a Power Meter. 2e editie. VeloPress, 2010. FTP-niveaus zoals gepubliceerd door Garmin.",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(1) > a:nth-of-type(1)",
    "englishWords": [
      "and",
      "racing",
      "with",
      "power"
    ],
    "ratio": 0.267,
    "wordCount": 19,
    "reason": "unambiguous-english-word"
  }
]
```

### /tools/ftp-wkg · en · 1440

URL: http://127.0.0.1:56250/en/tools/ftp-wkg

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

### /tools/ftp-wkg · en · 390

URL: http://127.0.0.1:56250/en/tools/ftp-wkg

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/fuel-hydration · nl · 1440

URL: http://127.0.0.1:56250/nl/tools/fuel-hydration

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
    "text": "Jeukendrup A. A Step Towards Personalized Sports Nutrition: Carbohydrate Intake During Exercise. Sports Med. 2014;44(Suppl 1):25–33, figuur 1. doi:10.1007/s40279-014-0148-z.",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(1) > a:nth-of-type(1)",
    "englishWords": [
      "step",
      "nutrition",
      "carbohydrate"
    ],
    "ratio": 0.167,
    "wordCount": 19,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Sawka MN et al. American College of Sports Medicine position stand. Exercise and fluid replacement. Med Sci Sports Exerc. 2007;39(2):377–390. Pagina 384: vocht als startpunt voor marathonlopers. Pagina 385: 20–30 mEq/L natrium in sportdrank bij langdurige inspanning. Deze tool toont de concentratie voor ritten langer dan een uur.",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(2) > a:nth-of-type(1)",
    "englishWords": [
      "position",
      "and",
      "fluid"
    ],
    "ratio": 0.07,
    "wordCount": 45,
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

### /tools/fuel-hydration · nl · 390

URL: http://127.0.0.1:56250/nl/tools/fuel-hydration

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
    "text": "Jeukendrup A. A Step Towards Personalized Sports Nutrition: Carbohydrate Intake During Exercise. Sports Med. 2014;44(Suppl 1):25–33, figuur 1. doi:10.1007/s40279-014-0148-z.",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(1) > a:nth-of-type(1)",
    "englishWords": [
      "step",
      "nutrition",
      "carbohydrate"
    ],
    "ratio": 0.167,
    "wordCount": 19,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Sawka MN et al. American College of Sports Medicine position stand. Exercise and fluid replacement. Med Sci Sports Exerc. 2007;39(2):377–390. Pagina 384: vocht als startpunt voor marathonlopers. Pagina 385: 20–30 mEq/L natrium in sportdrank bij langdurige inspanning. Deze tool toont de concentratie voor ritten langer dan een uur.",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(2) > ul:nth-of-type(1) > li:nth-of-type(2) > a:nth-of-type(1)",
    "englishWords": [
      "position",
      "and",
      "fluid"
    ],
    "ratio": 0.07,
    "wordCount": 45,
    "reason": "unambiguous-english-word"
  }
]
```

### /tools/fuel-hydration · en · 1440

URL: http://127.0.0.1:56250/en/tools/fuel-hydration

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

### /tools/fuel-hydration · en · 390

URL: http://127.0.0.1:56250/en/tools/fuel-hydration

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

