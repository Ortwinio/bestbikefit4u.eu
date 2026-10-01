# Whole-app QA sweep

7 routes; 28 locale/viewport cases; 24 without failures; 4 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 73,
  "scope": "Active audited non-admin routes and account calculators; retired import and /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/bikes",
  "concurrency": 3,
  "label": "41c",
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
    "sourceHash": "3b641de743594e6c70b13e0842936c480238da80a4255b83d654fb90e695fa80",
    "buildId": "dxGCS1WGumyhbaW3eh6Go",
    "snapshot": "/tmp/bbf-final-sweep-3b641de743594e6c",
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
| status | 28 | 0 | 0 |
| errors | 28 | 0 | 0 |
| overflow | 28 | 0 | 0 |
| h1 | 28 | 0 | 0 |
| locale | 28 | 0 | 0 |
| seo | 0 | 0 | 28 |
| language | 24 | 4 | 0 |
| touchTargets | 14 | 0 | 14 |
| images | 28 | 0 | 0 |
| axe | 28 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /bikes | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](bikes-nl-1440.png) |
| /bikes | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](bikes-nl-390.png) |
| /bikes | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-en-1440.png) |
| /bikes | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-en-390.png) |
| /bikes/new | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-nl-1440.png) |
| /bikes/new | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-new-nl-390.png) |
| /bikes/new | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-en-1440.png) |
| /bikes/new | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-new-en-390.png) |
| /bikes/new/manual | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-manual-nl-1440.png) |
| /bikes/new/manual | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-new-manual-nl-390.png) |
| /bikes/new/manual | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-manual-en-1440.png) |
| /bikes/new/manual | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-new-manual-en-390.png) |
| /bikes/import/passport | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-passport-nl-1440.png) |
| /bikes/import/passport | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-import-passport-nl-390.png) |
| /bikes/import/passport | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-passport-en-1440.png) |
| /bikes/import/passport | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-import-passport-en-390.png) |
| /bikes/[bikeId] | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](bikes-bikeId-nl-1440.png) |
| /bikes/[bikeId] | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](bikes-bikeId-nl-390.png) |
| /bikes/[bikeId] | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-bikeId-en-1440.png) |
| /bikes/[bikeId] | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-bikeId-en-390.png) |
| /bikes/[bikeId]/edit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-bikeId-edit-nl-1440.png) |
| /bikes/[bikeId]/edit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-bikeId-edit-nl-390.png) |
| /bikes/[bikeId]/edit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-bikeId-edit-en-1440.png) |
| /bikes/[bikeId]/edit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-bikeId-edit-en-390.png) |
| /bikes/compare-fit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-compare-fit-nl-1440.png) |
| /bikes/compare-fit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-compare-fit-nl-390.png) |
| /bikes/compare-fit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-compare-fit-en-1440.png) |
| /bikes/compare-fit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-compare-fit-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.


## Findings and skipped checks

### /bikes · nl · 1440

URL: http://127.0.0.1:54186/nl/bikes

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
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
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

### /bikes · nl · 390

URL: http://127.0.0.1:54186/nl/bikes

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
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

### /bikes · en · 1440

URL: http://127.0.0.1:54186/en/bikes

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

URL: http://127.0.0.1:54186/en/bikes

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new · nl · 1440

URL: http://127.0.0.1:54186/nl/bikes/new

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

URL: http://127.0.0.1:54186/nl/bikes/new

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new · en · 1440

URL: http://127.0.0.1:54186/en/bikes/new

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

URL: http://127.0.0.1:54186/en/bikes/new

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new/manual · nl · 1440

URL: http://127.0.0.1:54186/nl/bikes/new/manual

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

### /bikes/new/manual · nl · 390

URL: http://127.0.0.1:54186/nl/bikes/new/manual

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new/manual · en · 1440

URL: http://127.0.0.1:54186/en/bikes/new/manual

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

### /bikes/new/manual · en · 390

URL: http://127.0.0.1:54186/en/bikes/new/manual

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/import/passport · nl · 1440

URL: http://127.0.0.1:54186/nl/bikes/import/passport

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

URL: http://127.0.0.1:54186/nl/bikes/import/passport

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/import/passport · en · 1440

URL: http://127.0.0.1:54186/en/bikes/import/passport

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

URL: http://127.0.0.1:54186/en/bikes/import/passport

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/[bikeId] · nl · 1440

URL: http://127.0.0.1:54186/nl/bikes/visual-bike

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
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > h1:nth-of-type(1)",
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
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
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

### /bikes/[bikeId] · nl · 390

URL: http://127.0.0.1:54186/nl/bikes/visual-bike

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
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > h1:nth-of-type(1)",
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
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

### /bikes/[bikeId] · en · 1440

URL: http://127.0.0.1:54186/en/bikes/visual-bike

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

### /bikes/[bikeId] · en · 390

URL: http://127.0.0.1:54186/en/bikes/visual-bike

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/[bikeId]/edit · nl · 1440

URL: http://127.0.0.1:54186/nl/bikes/visual-bike/edit

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

URL: http://127.0.0.1:54186/nl/bikes/visual-bike/edit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/[bikeId]/edit · en · 1440

URL: http://127.0.0.1:54186/en/bikes/visual-bike/edit

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

URL: http://127.0.0.1:54186/en/bikes/visual-bike/edit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/compare-fit · nl · 1440

URL: http://127.0.0.1:54186/nl/bikes/compare-fit

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

URL: http://127.0.0.1:54186/nl/bikes/compare-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/compare-fit · en · 1440

URL: http://127.0.0.1:54186/en/bikes/compare-fit

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

URL: http://127.0.0.1:54186/en/bikes/compare-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

