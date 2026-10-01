# Whole-app QA sweep

5 routes; 20 locale/viewport cases; 20 without failures; 0 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 72,
  "scope": "Active audited non-admin routes and account calculators; retired import and /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/profile",
  "concurrency": 3,
  "label": "41b",
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
    "origin": "https://127.0.0.1:4354",
    "sourceHash": "0be6cecd9432a0710fa1d83c8c16d7251ad4b281a44962bb19542fe372397bf5",
    "buildId": "5rZ_yfomhMIU21my7dQqE",
    "snapshot": "/tmp/bbf-final-sweep-0be6cecd9432a071",
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
| status | 20 | 0 | 0 |
| errors | 20 | 0 | 0 |
| overflow | 20 | 0 | 0 |
| h1 | 20 | 0 | 0 |
| locale | 20 | 0 | 0 |
| seo | 0 | 0 | 20 |
| language | 20 | 0 | 0 |
| touchTargets | 10 | 0 | 10 |
| images | 20 | 0 | 0 |
| axe | 20 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /profile | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-nl-1440.png) |
| /profile | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-nl-390.png) |
| /profile | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-en-1440.png) |
| /profile | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-en-390.png) |
| /profile/improve/body-measurements | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-body-measurements-nl-1440.png) |
| /profile/improve/body-measurements | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-body-measurements-nl-390.png) |
| /profile/improve/body-measurements | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-body-measurements-en-1440.png) |
| /profile/improve/body-measurements | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-body-measurements-en-390.png) |
| /profile/improve/flexibility | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-flexibility-nl-1440.png) |
| /profile/improve/flexibility | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-flexibility-nl-390.png) |
| /profile/improve/flexibility | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-flexibility-en-1440.png) |
| /profile/improve/flexibility | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-flexibility-en-390.png) |
| /profile/improve/core-stability | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-core-stability-nl-1440.png) |
| /profile/improve/core-stability | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-core-stability-nl-390.png) |
| /profile/improve/core-stability | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-core-stability-en-1440.png) |
| /profile/improve/core-stability | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-core-stability-en-390.png) |
| /profile/improve/comfort | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-comfort-nl-1440.png) |
| /profile/improve/comfort | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-comfort-nl-390.png) |
| /profile/improve/comfort | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](profile-improve-comfort-en-1440.png) |
| /profile/improve/comfort | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](profile-improve-comfort-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.


## Findings and skipped checks

### /profile · nl · 1440

URL: http://127.0.0.1:49289/nl/profile

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

### /profile · nl · 390

URL: http://127.0.0.1:49289/nl/profile

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile · en · 1440

URL: http://127.0.0.1:49289/en/profile

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

### /profile · en · 390

URL: http://127.0.0.1:49289/en/profile

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/body-measurements · nl · 1440

URL: http://127.0.0.1:49289/nl/profile/improve/body-measurements

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

### /profile/improve/body-measurements · nl · 390

URL: http://127.0.0.1:49289/nl/profile/improve/body-measurements

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/body-measurements · en · 1440

URL: http://127.0.0.1:49289/en/profile/improve/body-measurements

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

### /profile/improve/body-measurements · en · 390

URL: http://127.0.0.1:49289/en/profile/improve/body-measurements

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/flexibility · nl · 1440

URL: http://127.0.0.1:49289/nl/profile/improve/flexibility

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

### /profile/improve/flexibility · nl · 390

URL: http://127.0.0.1:49289/nl/profile/improve/flexibility

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/flexibility · en · 1440

URL: http://127.0.0.1:49289/en/profile/improve/flexibility

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

### /profile/improve/flexibility · en · 390

URL: http://127.0.0.1:49289/en/profile/improve/flexibility

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/core-stability · nl · 1440

URL: http://127.0.0.1:49289/nl/profile/improve/core-stability

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

### /profile/improve/core-stability · nl · 390

URL: http://127.0.0.1:49289/nl/profile/improve/core-stability

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/core-stability · en · 1440

URL: http://127.0.0.1:49289/en/profile/improve/core-stability

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

### /profile/improve/core-stability · en · 390

URL: http://127.0.0.1:49289/en/profile/improve/core-stability

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/comfort · nl · 1440

URL: http://127.0.0.1:49289/nl/profile/improve/comfort

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

### /profile/improve/comfort · nl · 390

URL: http://127.0.0.1:49289/nl/profile/improve/comfort

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /profile/improve/comfort · en · 1440

URL: http://127.0.0.1:49289/en/profile/improve/comfort

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

### /profile/improve/comfort · en · 390

URL: http://127.0.0.1:49289/en/profile/improve/comfort

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

