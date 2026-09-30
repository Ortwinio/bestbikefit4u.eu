# Whole-app QA sweep

8 routes; 32 locale/viewport cases; 26 without failures; 6 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/bikes",
  "concurrency": 3,
  "label": "25a-bikes",
  "limitations": [
    "Account fixtures test actual UI with mocked auth/Convex; not backend authorization or persistence.",
    "Small UI-word language detector is heuristic, not a complete translation audit.",
    "Automated axe serious/critical checks do not establish full accessibility conformance.",
    "Initial route states only; this sweep does not submit forms or exercise destructive actions.",
    "Local preview lacks Vercel analytics endpoints; resulting console errors remain failures.",
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
    "origin": "http://127.0.0.1:4326",
    "sourceHash": "d1b4740762fe5382aa7342b9ab62ceda767e6a1bac22d8a3eb9f3c20de52b79b",
    "buildId": "h9P-2jtt5cZCA_TDRds5I",
    "snapshot": "/tmp/bbf-final-sweep-d1b4740762fe5382",
    "reused": false
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
| status | 32 | 0 | 0 |
| errors | 32 | 0 | 0 |
| overflow | 32 | 0 | 0 |
| h1 | 32 | 0 | 0 |
| locale | 32 | 0 | 0 |
| seo | 0 | 0 | 32 |
| language | 32 | 0 | 0 |
| touchTargets | 10 | 6 | 16 |
| images | 32 | 0 | 0 |
| axe | 32 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /bikes | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-nl-1440.png) |
| /bikes | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-nl-390.png) |
| /bikes | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-en-1440.png) |
| /bikes | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-en-390.png) |
| /bikes/new | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-nl-1440.png) |
| /bikes/new | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-new-nl-390.png) |
| /bikes/new | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-en-1440.png) |
| /bikes/new | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-new-en-390.png) |
| /bikes/new/manual | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-manual-nl-1440.png) |
| /bikes/new/manual | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-new-manual-nl-390.png) |
| /bikes/new/manual | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-new-manual-en-1440.png) |
| /bikes/new/manual | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-new-manual-en-390.png) |
| /bikes/import/marktplaats | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-marktplaats-nl-1440.png) |
| /bikes/import/marktplaats | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-import-marktplaats-nl-390.png) |
| /bikes/import/marktplaats | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-marktplaats-en-1440.png) |
| /bikes/import/marktplaats | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-import-marktplaats-en-390.png) |
| /bikes/import/passport | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-passport-nl-1440.png) |
| /bikes/import/passport | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-import-passport-nl-390.png) |
| /bikes/import/passport | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-import-passport-en-1440.png) |
| /bikes/import/passport | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | ✓ | ✓ | [view](bikes-import-passport-en-390.png) |
| /bikes/[bikeId] | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-bikeId-nl-1440.png) |
| /bikes/[bikeId] | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-bikeId-nl-390.png) |
| /bikes/[bikeId] | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-bikeId-en-1440.png) |
| /bikes/[bikeId] | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-bikeId-en-390.png) |
| /bikes/[bikeId]/edit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-bikeId-edit-nl-1440.png) |
| /bikes/[bikeId]/edit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-bikeId-edit-nl-390.png) |
| /bikes/[bikeId]/edit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-bikeId-edit-en-1440.png) |
| /bikes/[bikeId]/edit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-bikeId-edit-en-390.png) |
| /bikes/compare-fit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-compare-fit-nl-1440.png) |
| /bikes/compare-fit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-compare-fit-nl-390.png) |
| /bikes/compare-fit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](bikes-compare-fit-en-1440.png) |
| /bikes/compare-fit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](bikes-compare-fit-en-390.png) |

## Findings and skipped checks

### /bikes · nl · 1440

URL: http://127.0.0.1:60613/nl/bikes

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

### /bikes · nl · 390

URL: http://127.0.0.1:60613/nl/bikes

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes · en · 1440

URL: http://127.0.0.1:60613/en/bikes

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

### /bikes · en · 390

URL: http://127.0.0.1:60613/en/bikes

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new · nl · 1440

URL: http://127.0.0.1:60613/nl/bikes/new

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

### /bikes/new · nl · 390

URL: http://127.0.0.1:60613/nl/bikes/new

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new · en · 1440

URL: http://127.0.0.1:60613/en/bikes/new

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

### /bikes/new · en · 390

URL: http://127.0.0.1:60613/en/bikes/new

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/new/manual · nl · 1440

URL: http://127.0.0.1:60613/nl/bikes/new/manual

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

URL: http://127.0.0.1:60613/nl/bikes/new/manual

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

URL: http://127.0.0.1:60613/en/bikes/new/manual

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

URL: http://127.0.0.1:60613/en/bikes/new/manual

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

### /bikes/import/marktplaats · nl · 1440

URL: http://127.0.0.1:60613/nl/bikes/import/marktplaats

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

### /bikes/import/marktplaats · nl · 390

URL: http://127.0.0.1:60613/nl/bikes/import/marktplaats

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
    "id": "marktplaats-url",
    "width": 324,
    "height": 36
  }
]
```

### /bikes/import/marktplaats · en · 1440

URL: http://127.0.0.1:60613/en/bikes/import/marktplaats

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

### /bikes/import/marktplaats · en · 390

URL: http://127.0.0.1:60613/en/bikes/import/marktplaats

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
    "id": "marktplaats-url",
    "width": 324,
    "height": 36
  }
]
```

### /bikes/import/passport · nl · 1440

URL: http://127.0.0.1:60613/nl/bikes/import/passport

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

### /bikes/import/passport · nl · 390

URL: http://127.0.0.1:60613/nl/bikes/import/passport

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
    "id": "bike-passport-id",
    "width": 324,
    "height": 36
  }
]
```

### /bikes/import/passport · en · 1440

URL: http://127.0.0.1:60613/en/bikes/import/passport

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

### /bikes/import/passport · en · 390

URL: http://127.0.0.1:60613/en/bikes/import/passport

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
    "id": "bike-passport-id",
    "width": 324,
    "height": 36
  }
]
```

### /bikes/[bikeId] · nl · 1440

URL: http://127.0.0.1:60613/nl/bikes/visual-bike

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

### /bikes/[bikeId] · nl · 390

URL: http://127.0.0.1:60613/nl/bikes/visual-bike

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/[bikeId] · en · 1440

URL: http://127.0.0.1:60613/en/bikes/visual-bike

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

### /bikes/[bikeId] · en · 390

URL: http://127.0.0.1:60613/en/bikes/visual-bike

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/[bikeId]/edit · nl · 1440

URL: http://127.0.0.1:60613/nl/bikes/visual-bike/edit

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

### /bikes/[bikeId]/edit · nl · 390

URL: http://127.0.0.1:60613/nl/bikes/visual-bike/edit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/[bikeId]/edit · en · 1440

URL: http://127.0.0.1:60613/en/bikes/visual-bike/edit

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

### /bikes/[bikeId]/edit · en · 390

URL: http://127.0.0.1:60613/en/bikes/visual-bike/edit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/compare-fit · nl · 1440

URL: http://127.0.0.1:60613/nl/bikes/compare-fit

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

### /bikes/compare-fit · nl · 390

URL: http://127.0.0.1:60613/nl/bikes/compare-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /bikes/compare-fit · en · 1440

URL: http://127.0.0.1:60613/en/bikes/compare-fit

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

### /bikes/compare-fit · en · 390

URL: http://127.0.0.1:60613/en/bikes/compare-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

