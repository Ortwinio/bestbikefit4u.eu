# Whole-app QA sweep

2 routes; 8 locale/viewport cases; 4 without failures; 4 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/tire-pressure",
  "concurrency": 3,
  "label": "25a-tire-pressure",
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
| status | 8 | 0 | 0 |
| errors | 8 | 0 | 0 |
| overflow | 8 | 0 | 0 |
| h1 | 8 | 0 | 0 |
| locale | 8 | 0 | 0 |
| seo | 8 | 0 | 0 |
| language | 8 | 0 | 0 |
| touchTargets | 4 | 0 | 4 |
| images | 8 | 0 | 0 |
| axe | 4 | 4 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /tire-pressure-calculator | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](tire-pressure-calculator-nl-1440.png) |
| /tire-pressure-calculator | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](tire-pressure-calculator-nl-390.png) |
| /tire-pressure-calculator | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](tire-pressure-calculator-en-1440.png) |
| /tire-pressure-calculator | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](tire-pressure-calculator-en-390.png) |
| /tire-pressure/[slug] | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](tire-pressure-slug-nl-1440.png) |
| /tire-pressure/[slug] | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](tire-pressure-slug-nl-390.png) |
| /tire-pressure/[slug] | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](tire-pressure-slug-en-1440.png) |
| /tire-pressure/[slug] | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](tire-pressure-slug-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /tire-pressure-calculator · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure-calculator · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure-calculator · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure-calculator · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure/[slug] · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure/[slug] · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure/[slug] · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /tire-pressure/[slug] · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /tire-pressure-calculator · nl · 1440

URL: http://127.0.0.1:4327/nl/tire-pressure-calculator

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /tire-pressure-calculator · nl · 390

URL: http://127.0.0.1:4327/nl/tire-pressure-calculator

Rendering mode: production

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /tire-pressure-calculator · en · 1440

URL: http://127.0.0.1:4327/en/tire-pressure-calculator

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /tire-pressure-calculator · en · 390

URL: http://127.0.0.1:4327/en/tire-pressure-calculator

Rendering mode: production

**axe ✗**

```json
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
    "nodes": [
      {
        "target": [
          ".border-\\[color\\:color-mix\\(in_oklch\\,var\\(--primary\\)_28\\%\\,transparent\\)\\]"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.78 (foreground color: #0f2420, background color: #0a7263, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]
```

### /tire-pressure/[slug] · nl · 1440

URL: http://127.0.0.1:4327/nl/tire-pressure/75kg-road-bike

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /tire-pressure/[slug] · en · 1440

URL: http://127.0.0.1:4327/en/tire-pressure/75kg-road-bike

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

