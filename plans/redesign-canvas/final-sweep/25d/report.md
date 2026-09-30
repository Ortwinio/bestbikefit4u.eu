# Whole-app QA sweep

4 routes; 16 locale/viewport cases; 10 without failures; 6 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/calculators/gearing,/calculators/power-speed,/bikes/new/manual,/blog/[slug]",
  "concurrency": 3,
  "label": "25d-harness-fixes",
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
    "Feedback panel provider is mocked on account tool routes; batch-20 overlay differences remain fixture limitations.",
    "Blog detail uses existing visual-article-1 CMS fixture; no published production article was available.",
    "HTTP 200 is the fixture server response, not proof of production CMS lookup or routing.",
    "Next generateMetadata is not run: canonical/hreflang and production article title remain unverified.",
    "Existing JsonLd adapter renders actual page schema without the production server nonce wrapper.",
    "Header, Footer, and article components use production CSS; Next Image/Link use existing visual adapters."
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
    "origin": "http://127.0.0.1:4351",
    "sourceHash": "a85233c25f07ebce5d7a423a5773e3d770f871673d2311c02e779f18b319e2ce",
    "buildId": "niccQUvIvS6wzk7M4uQMY",
    "snapshot": "/tmp/bbf-final-sweep-a85233c25f07ebce",
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
| status | 16 | 0 | 0 |
| errors | 12 | 4 | 0 |
| overflow | 16 | 0 | 0 |
| h1 | 16 | 0 | 0 |
| locale | 16 | 0 | 0 |
| seo | 8 | 0 | 8 |
| language | 16 | 0 | 0 |
| touchTargets | 6 | 2 | 8 |
| images | 16 | 0 | 0 |
| axe | 16 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /calculators/gearing | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-gearing-nl-1440.png) |
| /calculators/gearing | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-gearing-nl-390.png) |
| /calculators/gearing | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-gearing-en-1440.png) |
| /calculators/gearing | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-gearing-en-390.png) |
| /calculators/power-speed | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-power-speed-nl-1440.png) |
| /calculators/power-speed | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-power-speed-nl-390.png) |
| /calculators/power-speed | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-power-speed-en-1440.png) |
| /calculators/power-speed | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-power-speed-en-390.png) |
| /blog/[slug] | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](blog-slug-nl-1440.png) |
| /blog/[slug] | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](blog-slug-nl-390.png) |
| /blog/[slug] | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](blog-slug-en-1440.png) |
| /blog/[slug] | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](blog-slug-en-390.png) |
| /bikes/new/manual | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-manual-nl-1440.png) |
| /bikes/new/manual | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-new-manual-nl-390.png) |
| /bikes/new/manual | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-manual-en-1440.png) |
| /bikes/new/manual | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-new-manual-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /calculators/gearing · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/gearing · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/gearing · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/gearing · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/power-speed · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/power-speed · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/power-speed · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /calculators/power-speed · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /calculators/gearing · nl · 1440

URL: http://127.0.0.1:4351/nl/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/gearing · nl · 390

URL: http://127.0.0.1:4351/nl/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  }
]
```

### /calculators/gearing · en · 1440

URL: http://127.0.0.1:4351/en/calculators/gearing

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/power-speed · nl · 1440

URL: http://127.0.0.1:4351/nl/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/power-speed · nl · 390

URL: http://127.0.0.1:4351/nl/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  }
]
```

### /calculators/power-speed · en · 1440

URL: http://127.0.0.1:4351/en/calculators/power-speed

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /blog/[slug] · nl · 1440

URL: http://127.0.0.1:64367/nl/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /blog/[slug] · nl · 390

URL: http://127.0.0.1:64367/nl/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

### /blog/[slug] · en · 1440

URL: http://127.0.0.1:64367/en/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /blog/[slug] · en · 390

URL: http://127.0.0.1:64367/en/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

### /bikes/new/manual · nl · 1440

URL: http://127.0.0.1:64366/nl/bikes/new/manual

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

URL: http://127.0.0.1:64366/nl/bikes/new/manual

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "fietsnaam",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "Fitness",
    "id": "base-ui-_r_h_",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "Gebalanceerd",
    "id": "base-ui-_r_n_",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "2x",
    "id": "base-ui-_r_t_",
    "width": 274,
    "height": 36
  },
  {
    "tag": "input",
    "label": "",
    "id": "groupset",
    "width": 274,
    "height": 36
  }
]
```

### /bikes/new/manual · en · 1440

URL: http://127.0.0.1:64366/en/bikes/new/manual

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

URL: http://127.0.0.1:64366/en/bikes/new/manual

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**touchTargets ✗**

```json
[
  {
    "tag": "input",
    "label": "",
    "id": "bike-name",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "Fitness",
    "id": "base-ui-_r_h_",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "Balanced",
    "id": "base-ui-_r_n_",
    "width": 308,
    "height": 36
  },
  {
    "tag": "button",
    "label": "2x",
    "id": "base-ui-_r_t_",
    "width": 274,
    "height": 36
  },
  {
    "tag": "input",
    "label": "",
    "id": "groupset",
    "width": 274,
    "height": 36
  }
]
```

