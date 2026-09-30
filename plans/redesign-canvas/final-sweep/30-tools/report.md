# Whole-app QA sweep

4 routes; 16 locale/viewport cases; 16 without failures; 0 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/calculators/fuel-hydration,/calculators/ftp-wkg,/calculators/power-speed,/calculators/climb-planner",
  "concurrency": 3,
  "label": "30-tools",
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
    "sourceHash": "1c5191aece6646dda203be0b79e69f2f938fed0b518a1572177a0c781a7e212b",
    "buildId": "egvNF0bAfVkPFHCV8dh9l",
    "snapshot": "/tmp/bbf-final-sweep-1c5191aece6646dd",
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
| status | 16 | 0 | 0 |
| errors | 16 | 0 | 0 |
| overflow | 16 | 0 | 0 |
| h1 | 16 | 0 | 0 |
| locale | 16 | 0 | 0 |
| seo | 16 | 0 | 0 |
| language | 16 | 0 | 0 |
| touchTargets | 8 | 0 | 8 |
| images | 16 | 0 | 0 |
| axe | 16 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /calculators/ftp-wkg | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-ftp-wkg-nl-1440.png) |
| /calculators/ftp-wkg | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-ftp-wkg-nl-390.png) |
| /calculators/ftp-wkg | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-ftp-wkg-en-1440.png) |
| /calculators/ftp-wkg | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-ftp-wkg-en-390.png) |
| /calculators/power-speed | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-power-speed-nl-1440.png) |
| /calculators/power-speed | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-power-speed-nl-390.png) |
| /calculators/power-speed | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-power-speed-en-1440.png) |
| /calculators/power-speed | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-power-speed-en-390.png) |
| /calculators/fuel-hydration | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-fuel-hydration-nl-1440.png) |
| /calculators/fuel-hydration | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-fuel-hydration-nl-390.png) |
| /calculators/fuel-hydration | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-fuel-hydration-en-1440.png) |
| /calculators/fuel-hydration | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-fuel-hydration-en-390.png) |
| /calculators/climb-planner | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-climb-planner-nl-1440.png) |
| /calculators/climb-planner | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-climb-planner-nl-390.png) |
| /calculators/climb-planner | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-climb-planner-en-1440.png) |
| /calculators/climb-planner | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-climb-planner-en-390.png) |

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

URL: https://127.0.0.1:4351/nl/calculators/ftp-wkg

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/ftp-wkg · en · 1440

URL: https://127.0.0.1:4351/en/calculators/ftp-wkg

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/power-speed · nl · 1440

URL: https://127.0.0.1:4351/nl/calculators/power-speed

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/power-speed · en · 1440

URL: https://127.0.0.1:4351/en/calculators/power-speed

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/fuel-hydration · nl · 1440

URL: https://127.0.0.1:4351/nl/calculators/fuel-hydration

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/fuel-hydration · en · 1440

URL: https://127.0.0.1:4351/en/calculators/fuel-hydration

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/climb-planner · nl · 1440

URL: https://127.0.0.1:4351/nl/calculators/climb-planner

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/climb-planner · en · 1440

URL: https://127.0.0.1:4351/en/calculators/climb-planner

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

