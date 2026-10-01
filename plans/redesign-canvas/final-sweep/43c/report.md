# Whole-app QA sweep

4 routes; 16 locale/viewport cases; 16 without failures; 0 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 77,
  "scope": "Active audited non-admin routes and account calculators; retired import and /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/gearing,/saddle-selector,/calculators/gearing,/calculators/saddle-width",
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
    "origin": "https://127.0.0.1:4344",
    "sourceHash": "883bcce555b91e5959880c51d725ca74359524fbbca6eb017fa25b670227c4df",
    "buildId": "sEX3MC8HNc8SPd1BQ9MMW",
    "snapshot": "/tmp/bbf-final-sweep-883bcce555b91e59",
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
| status | 16 | 0 | 0 |
| errors | 16 | 0 | 0 |
| overflow | 16 | 0 | 0 |
| h1 | 16 | 0 | 0 |
| locale | 16 | 0 | 0 |
| seo | 8 | 0 | 8 |
| language | 16 | 0 | 0 |
| touchTargets | 8 | 0 | 8 |
| images | 16 | 0 | 0 |
| axe | 16 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /calculators/gearing | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-gearing-nl-1440.png) |
| /calculators/gearing | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-gearing-nl-390.png) |
| /calculators/gearing | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-gearing-en-1440.png) |
| /calculators/gearing | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-gearing-en-390.png) |
| /calculators/saddle-width | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-saddle-width-nl-1440.png) |
| /calculators/saddle-width | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-saddle-width-nl-390.png) |
| /calculators/saddle-width | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-saddle-width-en-1440.png) |
| /calculators/saddle-width | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-saddle-width-en-390.png) |
| /gearing | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](gearing-nl-1440.png) |
| /gearing | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](gearing-nl-390.png) |
| /gearing | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](gearing-en-1440.png) |
| /gearing | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](gearing-en-390.png) |
| /saddle-selector | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](saddle-selector-nl-1440.png) |
| /saddle-selector | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](saddle-selector-nl-390.png) |
| /saddle-selector | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](saddle-selector-en-1440.png) |
| /saddle-selector | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](saddle-selector-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /calculators/gearing · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/gearing · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/gearing · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/gearing · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/saddle-width · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/saddle-width · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/saddle-width · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/saddle-width · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /calculators/gearing · nl · 1440

URL: https://127.0.0.1:4344/nl/calculators/gearing

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/gearing · en · 1440

URL: https://127.0.0.1:4344/en/calculators/gearing

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/saddle-width · nl · 1440

URL: https://127.0.0.1:4344/nl/calculators/saddle-width

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/saddle-width · en · 1440

URL: https://127.0.0.1:4344/en/calculators/saddle-width

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /gearing · nl · 1440

URL: http://127.0.0.1:55939/nl/gearing

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

### /gearing · nl · 390

URL: http://127.0.0.1:55939/nl/gearing

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /gearing · en · 1440

URL: http://127.0.0.1:55939/en/gearing

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

### /gearing · en · 390

URL: http://127.0.0.1:55939/en/gearing

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /saddle-selector · nl · 1440

URL: http://127.0.0.1:55939/nl/saddle-selector

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

URL: http://127.0.0.1:55939/nl/saddle-selector

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /saddle-selector · en · 1440

URL: http://127.0.0.1:55939/en/saddle-selector

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

URL: http://127.0.0.1:55939/en/saddle-selector

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

