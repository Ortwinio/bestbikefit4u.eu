# Whole-app QA sweep

1 routes; 4 locale/viewport cases; 4 without failures; 0 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/fiets-afstellen",
  "concurrency": 3,
  "label": "25a-fiets-afstellen",
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
    "sourceHash": "e9bfedc692022ccd8d4b8b4d2adfca67236966113cdbc251259749349f0395cc",
    "buildId": "M5J1JUrGPFc3ETrRaAo1x",
    "snapshot": "/tmp/bbf-final-sweep-e9bfedc692022ccd",
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
| errors | 4 | 0 | 0 |
| overflow | 4 | 0 | 0 |
| h1 | 4 | 0 | 0 |
| locale | 4 | 0 | 0 |
| seo | 4 | 0 | 0 |
| language | 4 | 0 | 0 |
| touchTargets | 2 | 0 | 2 |
| images | 4 | 0 | 0 |
| axe | 4 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /fiets-afstellen | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](fiets-afstellen-nl-1440.png) |
| /fiets-afstellen | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](fiets-afstellen-nl-390.png) |
| /fiets-afstellen | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](fiets-afstellen-en-1440.png) |
| /fiets-afstellen | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](fiets-afstellen-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /fiets-afstellen · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /fiets-afstellen · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /fiets-afstellen · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /fiets-afstellen · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /fiets-afstellen · nl · 1440

URL: http://127.0.0.1:4327/nl/fiets-afstellen

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fiets-afstellen · en · 1440

URL: http://127.0.0.1:4327/en/fiets-afstellen

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

