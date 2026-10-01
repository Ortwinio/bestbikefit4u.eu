# Whole-app QA sweep

3 routes; 12 locale/viewport cases; 8 without failures; 4 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 73,
  "scope": "Active audited non-admin routes and account calculators; retired import and /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/pressure-calculator,/bandenspanning-calculator,/tire-pressure-calculator",
  "concurrency": 2,
  "label": null,
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
    "origin": "https://127.0.0.1:4342",
    "sourceHash": "594941ba615a15283b190229ecf274e34fd37f2cf83c0057fbd96f4d9321d3f5",
    "buildId": "SXsqtw68zqqV5JQH3Ni35",
    "snapshot": "/tmp/bbf-final-sweep-594941ba615a1528",
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
| status | 12 | 0 | 0 |
| errors | 12 | 0 | 0 |
| overflow | 12 | 0 | 0 |
| h1 | 12 | 0 | 0 |
| locale | 12 | 0 | 0 |
| seo | 8 | 0 | 4 |
| language | 8 | 4 | 0 |
| touchTargets | 6 | 0 | 6 |
| images | 12 | 0 | 0 |
| axe | 12 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /tire-pressure-calculator | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | — | ✓ | ✓ | [view](tire-pressure-calculator-nl-1440.png) |
| /tire-pressure-calculator | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | [view](tire-pressure-calculator-nl-390.png) |
| /tire-pressure-calculator | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](tire-pressure-calculator-en-1440.png) |
| /tire-pressure-calculator | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](tire-pressure-calculator-en-390.png) |
| /bandenspanning-calculator | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | — | ✓ | ✓ | [view](bandenspanning-calculator-nl-1440.png) |
| /bandenspanning-calculator | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | [view](bandenspanning-calculator-nl-390.png) |
| /bandenspanning-calculator | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](bandenspanning-calculator-en-1440.png) |
| /bandenspanning-calculator | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](bandenspanning-calculator-en-390.png) |
| /pressure-calculator | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](pressure-calculator-nl-1440.png) |
| /pressure-calculator | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](pressure-calculator-nl-390.png) |
| /pressure-calculator | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](pressure-calculator-en-1440.png) |
| /pressure-calculator | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](pressure-calculator-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /tire-pressure-calculator · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure-calculator · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure-calculator · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure-calculator · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning-calculator · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning-calculator · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning-calculator · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning-calculator · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /tire-pressure-calculator · nl · 1440

URL: https://127.0.0.1:4342/nl/tire-pressure-calculator

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Vergelijk Free en Pro",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > a:nth-of-type(2)",
    "englishWords": [
      "free"
    ],
    "ratio": 0.25,
    "wordCount": 4,
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

### /tire-pressure-calculator · nl · 390

URL: https://127.0.0.1:4342/nl/tire-pressure-calculator

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Vergelijk Free en Pro",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > a:nth-of-type(2)",
    "englishWords": [
      "free"
    ],
    "ratio": 0.25,
    "wordCount": 4,
    "reason": "unambiguous-english-word"
  }
]
```

### /tire-pressure-calculator · en · 1440

URL: https://127.0.0.1:4342/en/tire-pressure-calculator

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bandenspanning-calculator · nl · 1440

URL: https://127.0.0.1:4342/nl/bandenspanning-calculator

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Vergelijk Free en Pro",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > a:nth-of-type(2)",
    "englishWords": [
      "free"
    ],
    "ratio": 0.25,
    "wordCount": 4,
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

### /bandenspanning-calculator · nl · 390

URL: https://127.0.0.1:4342/nl/bandenspanning-calculator

Rendering mode: production

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Vergelijk Free en Pro",
    "selector": "body > div:nth-of-type(2) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > a:nth-of-type(2)",
    "englishWords": [
      "free"
    ],
    "ratio": 0.25,
    "wordCount": 4,
    "reason": "unambiguous-english-word"
  }
]
```

### /bandenspanning-calculator · en · 1440

URL: https://127.0.0.1:4342/en/bandenspanning-calculator

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pressure-calculator · nl · 1440

URL: http://127.0.0.1:53394/nl/pressure-calculator

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

URL: http://127.0.0.1:53394/nl/pressure-calculator

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /pressure-calculator · en · 1440

URL: http://127.0.0.1:53394/en/pressure-calculator

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

URL: http://127.0.0.1:53394/en/pressure-calculator

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

