# Whole-app QA sweep

5 routes; 20 locale/viewport cases; 4 without failures; 16 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/bandenspanning",
  "concurrency": 3,
  "label": "25a-bandenspanning",
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
    "origin": "http://127.0.0.1:4328",
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
| status | 20 | 0 | 0 |
| errors | 20 | 0 | 0 |
| overflow | 20 | 0 | 0 |
| h1 | 20 | 0 | 0 |
| locale | 20 | 0 | 0 |
| seo | 20 | 0 | 0 |
| language | 20 | 0 | 0 |
| touchTargets | 10 | 0 | 10 |
| images | 20 | 0 | 0 |
| axe | 4 | 16 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /bandenspanning-calculator | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-calculator-nl-1440.png) |
| /bandenspanning-calculator | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](bandenspanning-calculator-nl-390.png) |
| /bandenspanning-calculator | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-calculator-en-1440.png) |
| /bandenspanning-calculator | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](bandenspanning-calculator-en-390.png) |
| /bandenspanning/racefiets | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-racefiets-nl-1440.png) |
| /bandenspanning/racefiets | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](bandenspanning-racefiets-nl-390.png) |
| /bandenspanning/racefiets | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-racefiets-en-1440.png) |
| /bandenspanning/racefiets | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](bandenspanning-racefiets-en-390.png) |
| /bandenspanning/gravelbike | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-gravelbike-nl-1440.png) |
| /bandenspanning/gravelbike | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](bandenspanning-gravelbike-nl-390.png) |
| /bandenspanning/gravelbike | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-gravelbike-en-1440.png) |
| /bandenspanning/gravelbike | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](bandenspanning-gravelbike-en-390.png) |
| /bandenspanning/mtb | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-mtb-nl-1440.png) |
| /bandenspanning/mtb | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](bandenspanning-mtb-nl-390.png) |
| /bandenspanning/mtb | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](bandenspanning-mtb-en-1440.png) |
| /bandenspanning/mtb | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](bandenspanning-mtb-en-390.png) |
| /bandenspanning/[slug] | nl | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](bandenspanning-slug-nl-1440.png) |
| /bandenspanning/[slug] | nl | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](bandenspanning-slug-nl-390.png) |
| /bandenspanning/[slug] | en | 1440 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](bandenspanning-slug-en-1440.png) |
| /bandenspanning/[slug] | en | 390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](bandenspanning-slug-en-390.png) |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.

- /bandenspanning-calculator · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning-calculator · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning-calculator · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning-calculator · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/racefiets · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/racefiets · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/racefiets · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/racefiets · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/gravelbike · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/gravelbike · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/gravelbike · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/gravelbike · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/mtb · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/mtb · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/mtb · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/mtb · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/[slug] · nl · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/[slug] · nl · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/[slug] · en · 1440: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync
- /bandenspanning/[slug] · en · 390: local-dev-convex-csp: ws://127.0.0.1:3210/api/1.42.1/sync

## Findings and skipped checks

### /bandenspanning-calculator · nl · 1440

URL: http://127.0.0.1:4328/nl/bandenspanning-calculator

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

### /bandenspanning-calculator · nl · 390

URL: http://127.0.0.1:4328/nl/bandenspanning-calculator

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

### /bandenspanning-calculator · en · 1440

URL: http://127.0.0.1:4328/en/bandenspanning-calculator

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

### /bandenspanning-calculator · en · 390

URL: http://127.0.0.1:4328/en/bandenspanning-calculator

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

### /bandenspanning/racefiets · nl · 1440

URL: http://127.0.0.1:4328/nl/bandenspanning/racefiets

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

### /bandenspanning/racefiets · nl · 390

URL: http://127.0.0.1:4328/nl/bandenspanning/racefiets

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

### /bandenspanning/racefiets · en · 1440

URL: http://127.0.0.1:4328/en/bandenspanning/racefiets

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

### /bandenspanning/racefiets · en · 390

URL: http://127.0.0.1:4328/en/bandenspanning/racefiets

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

### /bandenspanning/gravelbike · nl · 1440

URL: http://127.0.0.1:4328/nl/bandenspanning/gravelbike

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

### /bandenspanning/gravelbike · nl · 390

URL: http://127.0.0.1:4328/nl/bandenspanning/gravelbike

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

### /bandenspanning/gravelbike · en · 1440

URL: http://127.0.0.1:4328/en/bandenspanning/gravelbike

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

### /bandenspanning/gravelbike · en · 390

URL: http://127.0.0.1:4328/en/bandenspanning/gravelbike

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

### /bandenspanning/mtb · nl · 1440

URL: http://127.0.0.1:4328/nl/bandenspanning/mtb

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

### /bandenspanning/mtb · nl · 390

URL: http://127.0.0.1:4328/nl/bandenspanning/mtb

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

### /bandenspanning/mtb · en · 1440

URL: http://127.0.0.1:4328/en/bandenspanning/mtb

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

### /bandenspanning/mtb · en · 390

URL: http://127.0.0.1:4328/en/bandenspanning/mtb

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

### /bandenspanning/[slug] · nl · 1440

URL: http://127.0.0.1:4328/nl/bandenspanning/75kg-racefiets

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /bandenspanning/[slug] · en · 1440

URL: http://127.0.0.1:4328/en/bandenspanning/75kg-racefiets

Rendering mode: production

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

