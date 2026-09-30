# Whole-app QA sweep

3 routes; 12 locale/viewport cases; 12 without failures; 0 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/bike-fitting,/bikefitting,/app",
  "concurrency": 3,
  "label": "29d-tls",
  "limitations": [
    "Account fixtures test actual UI with mocked auth/Convex; not backend authorization or persistence.",
    "Small UI-word language detector is heuristic, not a complete translation audit.",
    "Automated axe serious/critical checks do not establish full accessibility conformance.",
    "Initial route states only; this sweep does not submit forms or exercise destructive actions.",
    "The two local Vercel analytics scripts are explicit QA no-ops; analytics delivery is not tested.",
    "Expected document-404 console diagnostics are retained separately, not treated as unexpected errors.",
    "Production uses the established custom Next server; next start caused a self-redirect loop in this preview."
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
    "origin": "https://127.0.0.1:4351",
    "sourceHash": "619eb8249872556a3093298ee758ae298238c5ce94442728858b8edeed615a69",
    "buildId": "eLDpwmF4vUcKCnS0rh8UL",
    "snapshot": "/tmp/bbf-final-sweep-619eb8249872556a",
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
| status | 12 | 0 | 0 |
| errors | 12 | 0 | 0 |
| overflow | 12 | 0 | 0 |
| h1 | 8 | 0 | 4 |
| locale | 8 | 0 | 4 |
| seo | 4 | 0 | 8 |
| language | 8 | 0 | 4 |
| touchTargets | 4 | 0 | 8 |
| images | 8 | 0 | 4 |
| axe | 8 | 0 | 4 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /bike-fitting | nl | 1440 | ✓ | ✓ | ✓ | — | — | — | — | — | — | — | [view](bike-fitting-nl-1440.png) |
| /bike-fitting | nl | 390 | ✓ | ✓ | ✓ | — | — | — | — | — | — | — | [view](bike-fitting-nl-390.png) |
| /bike-fitting | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](bike-fitting-en-1440.png) |
| /bike-fitting | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](bike-fitting-en-390.png) |
| /bikefitting | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](bikefitting-nl-1440.png) |
| /bikefitting | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](bikefitting-nl-390.png) |
| /bikefitting | en | 1440 | ✓ | ✓ | ✓ | — | — | — | — | — | — | — | [view](bikefitting-en-1440.png) |
| /bikefitting | en | 390 | ✓ | ✓ | ✓ | — | — | — | — | — | — | — | [view](bikefitting-en-390.png) |
| /app | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](app-nl-1440.png) |
| /app | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](app-nl-390.png) |
| /app | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](app-en-1440.png) |
| /app | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](app-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /bike-fitting · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bike-fitting · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bike-fitting · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bike-fitting · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bikefitting · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bikefitting · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bikefitting · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bikefitting · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /app · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /app · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /app · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /app · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /bike-fitting · nl · 1440

URL: https://127.0.0.1:4351/nl/bike-fitting

Rendering mode: production

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

URL: https://127.0.0.1:4351/nl/bike-fitting

Rendering mode: production

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

URL: https://127.0.0.1:4351/en/bike-fitting

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikefitting · nl · 1440

URL: https://127.0.0.1:4351/nl/bikefitting

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bikefitting · en · 1440

URL: https://127.0.0.1:4351/en/bikefitting

Rendering mode: production

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

URL: https://127.0.0.1:4351/en/bikefitting

Rendering mode: production

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

### /app · nl · 1440

URL: https://127.0.0.1:4351/nl/app

Rendering mode: production

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

URL: https://127.0.0.1:4351/nl/app

Rendering mode: production

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /app · en · 1440

URL: https://127.0.0.1:4351/en/app

Rendering mode: production

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

URL: https://127.0.0.1:4351/en/app

Rendering mode: production

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

