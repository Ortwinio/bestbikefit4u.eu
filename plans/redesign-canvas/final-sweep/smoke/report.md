# Whole-app QA sweep

1 routes; 4 locale/viewport cases; 0 without failures; 4 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "science/stack",
  "concurrency": 3,
  "limitations": [
    "Account fixtures test actual UI with mocked auth/Convex; not backend authorization or persistence.",
    "Small UI-word language detector is heuristic, not a complete translation audit.",
    "Automated axe serious/critical checks do not establish full accessibility conformance.",
    "Initial route states only; this sweep does not submit forms or exercise destructive actions.",
    "Axe explicitly disabled by --without-axe; accessibility checks are skipped, not passed."
  ],
  "production": {
    "origin": "http://127.0.0.1:4321",
    "sourceHash": "0c5b746aaa1ec56d165ab527765fe3eb0bb612d138ca4c2305bc855dbfa560e3",
    "buildId": "J8PcS72NAlZVtFk_nZENA",
    "snapshot": "/tmp/bbf-final-sweep-0c5b746aaa1ec56d",
    "reused": true
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
| status | 0 | 0 | 4 |
| errors | 0 | 4 | 0 |
| overflow | 0 | 0 | 4 |
| h1 | 0 | 0 | 4 |
| locale | 0 | 0 | 4 |
| seo | 0 | 0 | 4 |
| language | 0 | 0 | 4 |
| touchTargets | 0 | 0 | 4 |
| images | 0 | 0 | 4 |
| axe | 0 | 0 | 4 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /science/stack-and-reach | nl | 1440 | — | ✗ | — | — | — | — | — | — | — | — | [view](science-stack-and-reach-nl-1440.png) |
| /science/stack-and-reach | nl | 390 | — | ✗ | — | — | — | — | — | — | — | — | [view](science-stack-and-reach-nl-390.png) |
| /science/stack-and-reach | en | 1440 | — | ✗ | — | — | — | — | — | — | — | — | [view](science-stack-and-reach-en-1440.png) |
| /science/stack-and-reach | en | 390 | — | ✗ | — | — | — | — | — | — | — | — | [view](science-stack-and-reach-en-390.png) |

## Findings and skipped checks

### /science/stack-and-reach · nl · 1440

URL: http://127.0.0.1:4321/nl/science/stack-and-reach

Rendering mode: production

**status —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**errors ✗**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**overflow —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**h1 —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**locale —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**seo —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**language —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**touchTargets —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**images —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**axe —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

### /science/stack-and-reach · nl · 390

URL: http://127.0.0.1:4321/nl/science/stack-and-reach

Rendering mode: production

**status —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**errors ✗**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**overflow —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**h1 —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**locale —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**seo —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**language —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**touchTargets —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**images —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**axe —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/nl/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/nl/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

### /science/stack-and-reach · en · 1440

URL: http://127.0.0.1:4321/en/science/stack-and-reach

Rendering mode: production

**status —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**errors ✗**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**overflow —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**h1 —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**locale —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**seo —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**language —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**touchTargets —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**images —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**axe —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

### /science/stack-and-reach · en · 390

URL: http://127.0.0.1:4321/en/science/stack-and-reach

Rendering mode: production

**status —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**errors ✗**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**overflow —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**h1 —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**locale —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**seo —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**language —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**touchTargets —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**images —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

**axe —**

```json
[
  "Capture failed: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:4321/en/science/stack-and-reach\nCall log:\n\u001b[2m  - navigating to \"http://127.0.0.1:4321/en/science/stack-and-reach\", waiting until \"load\"\u001b[22m\n"
]
```

