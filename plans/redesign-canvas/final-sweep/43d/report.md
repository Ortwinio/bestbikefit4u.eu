# Whole-app QA sweep

8 routes; 32 locale/viewport cases; 24 without failures; 8 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 77,
  "scope": "Active audited non-admin routes and account calculators; retired import and /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/dashboard,/tools/bike-fit,/fit",
  "concurrency": 3,
  "label": "43d-final",
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
    "sourceHash": "96e9ff154e0cdf6c228fc0cfca24fc6776d7a220f3305ffc86e5ad25ab72e195",
    "buildId": "QMyUzS-ERlQAbb0FNjuex",
    "snapshot": "/tmp/bbf-final-sweep-96e9ff154e0cdf6c",
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
| status | 32 | 0 | 0 |
| errors | 32 | 0 | 0 |
| overflow | 32 | 0 | 0 |
| h1 | 32 | 0 | 0 |
| locale | 32 | 0 | 0 |
| seo | 4 | 0 | 28 |
| language | 24 | 8 | 0 |
| touchTargets | 16 | 0 | 16 |
| images | 32 | 0 | 0 |
| axe | 32 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /fit-pass | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](fit-pass-nl-1440.png) |
| /fit-pass | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](fit-pass-nl-390.png) |
| /fit-pass | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](fit-pass-en-1440.png) |
| /fit-pass | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](fit-pass-en-390.png) |
| /dashboard | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](dashboard-nl-1440.png) |
| /dashboard | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](dashboard-nl-390.png) |
| /dashboard | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](dashboard-en-1440.png) |
| /dashboard | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](dashboard-en-390.png) |
| /fit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](fit-nl-1440.png) |
| /fit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](fit-nl-390.png) |
| /fit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-en-1440.png) |
| /fit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-en-390.png) |
| /fit/[sessionId]/questionnaire | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-sessionId-questionnaire-nl-1440.png) |
| /fit/[sessionId]/questionnaire | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-sessionId-questionnaire-nl-390.png) |
| /fit/[sessionId]/questionnaire | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-sessionId-questionnaire-en-1440.png) |
| /fit/[sessionId]/questionnaire | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-sessionId-questionnaire-en-390.png) |
| /fit/[sessionId]/results | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](fit-sessionId-results-nl-1440.png) |
| /fit/[sessionId]/results | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](fit-sessionId-results-nl-390.png) |
| /fit/[sessionId]/results | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-sessionId-results-en-1440.png) |
| /fit/[sessionId]/results | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-sessionId-results-en-390.png) |
| /fit/how-it-works | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-how-it-works-nl-1440.png) |
| /fit/how-it-works | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-how-it-works-nl-390.png) |
| /fit/how-it-works | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-how-it-works-en-1440.png) |
| /fit/how-it-works | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-how-it-works-en-390.png) |
| /fit-history | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | — | ✓ | ✓ | [view](fit-history-nl-1440.png) |
| /fit-history | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✓ | ✓ | ✓ | [view](fit-history-nl-390.png) |
| /fit-history | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](fit-history-en-1440.png) |
| /fit-history | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](fit-history-en-390.png) |
| /tools/bike-fit | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-bike-fit-nl-1440.png) |
| /tools/bike-fit | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-bike-fit-nl-390.png) |
| /tools/bike-fit | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | [view](tools-bike-fit-en-1440.png) |
| /tools/bike-fit | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | [view](tools-bike-fit-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /fit-pass · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /fit-pass · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /fit-pass · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /fit-pass · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /fit-pass · nl · 1440

URL: https://127.0.0.1:4354/nl/fit-pass

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit-pass · en · 1440

URL: https://127.0.0.1:4354/en/fit-pass

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /dashboard · nl · 1440

URL: http://127.0.0.1:54997/nl/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > section:nth-of-type(2) > div:nth-of-type(2) > article:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > section:nth-of-type(2) > div:nth-of-type(2) > article:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /dashboard · nl · 390

URL: http://127.0.0.1:54997/nl/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > section:nth-of-type(2) > div:nth-of-type(2) > article:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > section:nth-of-type(2) > div:nth-of-type(2) > article:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

### /dashboard · en · 1440

URL: http://127.0.0.1:54997/en/dashboard

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

### /dashboard · en · 390

URL: http://127.0.0.1:54997/en/dashboard

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit · nl · 1440

URL: http://127.0.0.1:54997/nl/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > span:nth-of-type(1) > span:nth-of-type(2) > span:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit · nl · 390

URL: http://127.0.0.1:54997/nl/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "aria-label",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > span:nth-of-type(1) > span:nth-of-type(2) > span:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

### /fit · en · 1440

URL: http://127.0.0.1:54997/en/fit

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

### /fit · en · 390

URL: http://127.0.0.1:54997/en/fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/[sessionId]/questionnaire · nl · 1440

URL: http://127.0.0.1:54997/nl/fit/visual-session/questionnaire

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

### /fit/[sessionId]/questionnaire · nl · 390

URL: http://127.0.0.1:54997/nl/fit/visual-session/questionnaire

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/[sessionId]/questionnaire · en · 1440

URL: http://127.0.0.1:54997/en/fit/visual-session/questionnaire

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

### /fit/[sessionId]/questionnaire · en · 390

URL: http://127.0.0.1:54997/en/fit/visual-session/questionnaire

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/[sessionId]/results · nl · 1440

URL: http://127.0.0.1:54997/nl/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > header:nth-of-type(1) > div:nth-of-type(1) > p:nth-of-type(2)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > details:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > h3:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit/[sessionId]/results · nl · 390

URL: http://127.0.0.1:54997/nl/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > header:nth-of-type(1) > div:nth-of-type(1) > p:nth-of-type(2)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  },
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > details:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > h3:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

### /fit/[sessionId]/results · en · 1440

URL: http://127.0.0.1:54997/en/fit/visual-session/results

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

### /fit/[sessionId]/results · en · 390

URL: http://127.0.0.1:54997/en/fit/visual-session/results

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/how-it-works · nl · 1440

URL: http://127.0.0.1:54997/nl/fit/how-it-works

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

### /fit/how-it-works · nl · 390

URL: http://127.0.0.1:54997/nl/fit/how-it-works

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit/how-it-works · en · 1440

URL: http://127.0.0.1:54997/en/fit/how-it-works

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

### /fit/how-it-works · en · 390

URL: http://127.0.0.1:54997/en/fit/how-it-works

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /fit-history · nl · 1440

URL: http://127.0.0.1:54997/nl/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /fit-history · nl · 390

URL: http://127.0.0.1:54997/nl/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

**language ✗**

```json
[
  {
    "kind": "visible-text",
    "text": "Endurance racefiets",
    "selector": "body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)",
    "englishWords": [
      "endurance"
    ],
    "ratio": 0.5,
    "wordCount": 2,
    "reason": "unambiguous-english-word"
  }
]
```

### /fit-history · en · 1440

URL: http://127.0.0.1:54997/en/fit-history

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

### /fit-history · en · 390

URL: http://127.0.0.1:54997/en/fit-history

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/bike-fit · nl · 1440

URL: http://127.0.0.1:54997/nl/tools/bike-fit

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

### /tools/bike-fit · nl · 390

URL: http://127.0.0.1:54997/nl/tools/bike-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

### /tools/bike-fit · en · 1440

URL: http://127.0.0.1:54997/en/tools/bike-fit

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

### /tools/bike-fit · en · 390

URL: http://127.0.0.1:54997/en/tools/bike-fit

Rendering mode: account-fixture

**seo —**

```json
[
  "Canonical/hreflang not required on account or expected 404 pages."
]
```

