# Whole-app QA sweep

1 routes; 4 locale/viewport cases; 2 without failures; 2 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/app",
  "concurrency": 3,
  "label": "25a-app",
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
    "origin": "http://127.0.0.1:4327",
    "sourceHash": "d1b4740762fe5382aa7342b9ab62ceda767e6a1bac22d8a3eb9f3c20de52b79b",
    "buildId": "h9P-2jtt5cZCA_TDRds5I",
    "snapshot": "/tmp/bbf-final-sweep-d1b4740762fe5382",
    "reused": true
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
| status | 4 | 0 | 0 |
| errors | 2 | 2 | 0 |
| overflow | 4 | 0 | 0 |
| h1 | 4 | 0 | 0 |
| locale | 4 | 0 | 0 |
| seo | 0 | 0 | 4 |
| language | 4 | 0 | 0 |
| touchTargets | 2 | 0 | 2 |
| images | 4 | 0 | 0 |
| axe | 4 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /app | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](app-nl-1440.png) |
| /app | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](app-nl-390.png) |
| /app | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](app-en-1440.png) |
| /app | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](app-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /app · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /app · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /app · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /app · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /app · nl · 1440

URL: http://127.0.0.1:4327/nl/app

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR",
    "location": {
      "url": "https://127.0.0.1:4327/nl/login",
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

URL: http://127.0.0.1:4327/nl/app

Rendering mode: production

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /app · en · 1440

URL: http://127.0.0.1:4327/en/app

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR",
    "location": {
      "url": "https://127.0.0.1:4327/en/login",
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

URL: http://127.0.0.1:4327/en/app

Rendering mode: production

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

