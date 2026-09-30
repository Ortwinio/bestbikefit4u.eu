# Whole-app QA sweep

2 routes; 8 locale/viewport cases; 8 without failures; 0 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/pain",
  "concurrency": 3,
  "label": "25a-pain",
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
| status | 8 | 0 | 0 |
| errors | 8 | 0 | 0 |
| overflow | 8 | 0 | 0 |
| h1 | 8 | 0 | 0 |
| locale | 8 | 0 | 0 |
| seo | 8 | 0 | 0 |
| language | 8 | 0 | 0 |
| touchTargets | 4 | 0 | 4 |
| images | 8 | 0 | 0 |
| axe | 8 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /pain | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pain-nl-1440.png) |
| /pain | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](pain-nl-390.png) |
| /pain | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pain-en-1440.png) |
| /pain | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](pain-en-390.png) |
| /pain/[slug] | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pain-slug-nl-1440.png) |
| /pain/[slug] | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](pain-slug-nl-390.png) |
| /pain/[slug] | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](pain-slug-en-1440.png) |
| /pain/[slug] | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](pain-slug-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /pain · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /pain · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /pain · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /pain · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /pain/[slug] · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /pain/[slug] · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /pain/[slug] · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /pain/[slug] · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /pain · nl · 1440

URL: http://127.0.0.1:4327/nl/pain

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pain · en · 1440

URL: http://127.0.0.1:4327/en/pain

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pain/[slug] · nl · 1440

URL: http://127.0.0.1:4327/nl/pain/knee-pain-cycling

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /pain/[slug] · en · 1440

URL: http://127.0.0.1:4327/en/pain/knee-pain-cycling

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

