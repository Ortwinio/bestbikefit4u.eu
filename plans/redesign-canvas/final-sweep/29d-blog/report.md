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
  "filtering": "/blog",
  "concurrency": 3,
  "label": "29d-blog",
  "limitations": [
    "Account fixtures test actual UI with mocked auth/Convex; not backend authorization or persistence.",
    "Small UI-word language detector is heuristic, not a complete translation audit.",
    "Automated axe serious/critical checks do not establish full accessibility conformance.",
    "Initial route states only; this sweep does not submit forms or exercise destructive actions.",
    "The two local Vercel analytics scripts are explicit QA no-ops; analytics delivery is not tested.",
    "Expected document-404 console diagnostics are retained separately, not treated as unexpected errors.",
    "Production uses the established custom Next server; next start caused a self-redirect loop in this preview.",
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
| status | 8 | 0 | 0 |
| errors | 8 | 0 | 0 |
| overflow | 8 | 0 | 0 |
| h1 | 8 | 0 | 0 |
| locale | 8 | 0 | 0 |
| seo | 4 | 0 | 4 |
| language | 8 | 0 | 0 |
| touchTargets | 4 | 0 | 4 |
| images | 8 | 0 | 0 |
| axe | 8 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /blog | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](blog-nl-1440.png) |
| /blog | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](blog-nl-390.png) |
| /blog | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](blog-en-1440.png) |
| /blog | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](blog-en-390.png) |
| /blog/[slug] | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](blog-slug-nl-1440.png) |
| /blog/[slug] | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](blog-slug-nl-390.png) |
| /blog/[slug] | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](blog-slug-en-1440.png) |
| /blog/[slug] | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](blog-slug-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /blog · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /blog · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /blog · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /blog · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /blog · nl · 1440

URL: https://127.0.0.1:4351/nl/blog

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /blog · en · 1440

URL: https://127.0.0.1:4351/en/blog

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /blog/[slug] · nl · 1440

URL: http://127.0.0.1:60066/nl/blog/visual-article-1

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

URL: http://127.0.0.1:60066/nl/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

### /blog/[slug] · en · 1440

URL: http://127.0.0.1:60066/en/blog/visual-article-1

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

URL: http://127.0.0.1:60066/en/blog/visual-article-1

Rendering mode: blog-fixture

**seo —**

```json
[
  "CMS fixture renders actual content; production metadata injection is not exercised."
]
```

