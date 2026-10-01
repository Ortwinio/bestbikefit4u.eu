# Whole-app QA sweep

9 routes; 36 locale/viewport cases; 36 without failures; 0 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 72,
  "scope": "Active audited non-admin routes and account calculators; retired import and /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/gearing,/saddle-selector,/settings,/shoe-cleat-fit,/feedback,/tools/saddle-height,/tools/frame-size,/tools/crank-length",
  "concurrency": 3,
  "label": "41a-43a",
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
    "origin": "https://127.0.0.1:4321",
    "sourceHash": "41c1710c0b020b1e861daca4c344cdd6cc126af0f0940704eaf1d20479c347ea",
    "buildId": "UYEUQI06l_vfZopCnYJDH",
    "snapshot": "/tmp/bbf-final-sweep-41c1710c0b020b1e",
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
| status | 36 | 0 | 0 |
| errors | 36 | 0 | 0 |
| overflow | 36 | 0 | 0 |
| h1 | 36 | 0 | 0 |
| locale | 36 | 0 | 0 |
| seo | 4 | 0 | 32 |
| language | 36 | 0 | 0 |
| touchTargets | 18 | 0 | 18 |
| images | 36 | 0 | 0 |
| axe | 36 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /calculators/gearing | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-gearing-nl-1440.png) |
| /calculators/gearing | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-gearing-nl-390.png) |
| /calculators/gearing | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-gearing-en-1440.png) |
| /calculators/gearing | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-gearing-en-390.png) |
| /gearing | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](gearing-nl-1440.png) |
| /gearing | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](gearing-nl-390.png) |
| /gearing | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](gearing-en-1440.png) |
| /gearing | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](gearing-en-390.png) |
| /saddle-selector | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](saddle-selector-nl-1440.png) |
| /saddle-selector | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](saddle-selector-nl-390.png) |
| /saddle-selector | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](saddle-selector-en-1440.png) |
| /saddle-selector | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](saddle-selector-en-390.png) |
| /tools/saddle-height | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-saddle-height-nl-1440.png) |
| /tools/saddle-height | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-saddle-height-nl-390.png) |
| /tools/saddle-height | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-saddle-height-en-1440.png) |
| /tools/saddle-height | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-saddle-height-en-390.png) |
| /tools/frame-size | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-frame-size-nl-1440.png) |
| /tools/frame-size | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-frame-size-nl-390.png) |
| /tools/frame-size | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-frame-size-en-1440.png) |
| /tools/frame-size | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-frame-size-en-390.png) |
| /tools/crank-length | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-crank-length-nl-1440.png) |
| /tools/crank-length | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-crank-length-nl-390.png) |
| /tools/crank-length | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-crank-length-en-1440.png) |
| /tools/crank-length | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-crank-length-en-390.png) |
| /shoe-cleat-fit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](shoe-cleat-fit-nl-1440.png) |
| /shoe-cleat-fit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](shoe-cleat-fit-nl-390.png) |
| /shoe-cleat-fit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](shoe-cleat-fit-en-1440.png) |
| /shoe-cleat-fit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](shoe-cleat-fit-en-390.png) |
| /settings | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](settings-nl-1440.png) |
| /settings | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](settings-nl-390.png) |
| /settings | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](settings-en-1440.png) |
| /settings | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](settings-en-390.png) |
| /feedback | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](feedback-nl-1440.png) |
| /feedback | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](feedback-nl-390.png) |
| /feedback | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](feedback-en-1440.png) |
| /feedback | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](feedback-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /calculators/gearing · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/gearing · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/gearing · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/gearing · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /calculators/gearing · nl · 1440

URL: https://127.0.0.1:4321/nl/calculators/gearing

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/gearing · en · 1440

URL: https://127.0.0.1:4321/en/calculators/gearing

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /gearing · nl · 1440

URL: http://127.0.0.1:63591/nl/gearing

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

URL: http://127.0.0.1:63591/nl/gearing

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /gearing · en · 1440

URL: http://127.0.0.1:63591/en/gearing

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

URL: http://127.0.0.1:63591/en/gearing

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /saddle-selector · nl · 1440

URL: http://127.0.0.1:63591/nl/saddle-selector

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

URL: http://127.0.0.1:63591/nl/saddle-selector

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /saddle-selector · en · 1440

URL: http://127.0.0.1:63591/en/saddle-selector

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

URL: http://127.0.0.1:63591/en/saddle-selector

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/saddle-height · nl · 1440

URL: http://127.0.0.1:63591/nl/tools/saddle-height

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

### /tools/saddle-height · nl · 390

URL: http://127.0.0.1:63591/nl/tools/saddle-height

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/saddle-height · en · 1440

URL: http://127.0.0.1:63591/en/tools/saddle-height

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

### /tools/saddle-height · en · 390

URL: http://127.0.0.1:63591/en/tools/saddle-height

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/frame-size · nl · 1440

URL: http://127.0.0.1:63591/nl/tools/frame-size

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

### /tools/frame-size · nl · 390

URL: http://127.0.0.1:63591/nl/tools/frame-size

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/frame-size · en · 1440

URL: http://127.0.0.1:63591/en/tools/frame-size

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

### /tools/frame-size · en · 390

URL: http://127.0.0.1:63591/en/tools/frame-size

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/crank-length · nl · 1440

URL: http://127.0.0.1:63591/nl/tools/crank-length

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

### /tools/crank-length · nl · 390

URL: http://127.0.0.1:63591/nl/tools/crank-length

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/crank-length · en · 1440

URL: http://127.0.0.1:63591/en/tools/crank-length

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

### /tools/crank-length · en · 390

URL: http://127.0.0.1:63591/en/tools/crank-length

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /shoe-cleat-fit · nl · 1440

URL: http://127.0.0.1:63591/nl/shoe-cleat-fit

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

### /shoe-cleat-fit · nl · 390

URL: http://127.0.0.1:63591/nl/shoe-cleat-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /shoe-cleat-fit · en · 1440

URL: http://127.0.0.1:63591/en/shoe-cleat-fit

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

### /shoe-cleat-fit · en · 390

URL: http://127.0.0.1:63591/en/shoe-cleat-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /settings · nl · 1440

URL: http://127.0.0.1:63591/nl/settings

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

### /settings · nl · 390

URL: http://127.0.0.1:63591/nl/settings

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /settings · en · 1440

URL: http://127.0.0.1:63591/en/settings

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

URL: http://127.0.0.1:63591/en/settings

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /feedback · nl · 1440

URL: http://127.0.0.1:63591/nl/feedback

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

### /feedback · nl · 390

URL: http://127.0.0.1:63591/nl/feedback

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /feedback · en · 1440

URL: http://127.0.0.1:63591/en/feedback

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

URL: http://127.0.0.1:63591/en/feedback

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

