# Whole-app QA sweep

10 routes; 40 locale/viewport cases; 0 without failures; 40 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 70,
  "scope": "70 audited non-admin routes; later /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/calculators",
  "concurrency": 3,
  "label": "25a-calculators",
  "limitations": [
    "Account fixtures test actual UI with mocked auth/Convex; not backend authorization or persistence.",
    "Small UI-word language detector is heuristic, not a complete translation audit.",
    "Automated axe serious/critical checks do not establish full accessibility conformance.",
    "Initial route states only; this sweep does not submit forms or exercise destructive actions.",
    "Local preview lacks Vercel analytics endpoints; resulting console errors remain failures.",
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
  "blog": {
    "mode": "fixture",
    "reason": "No published CMS slug available; existing visual-article-1 fixture."
  }
}
```

## Check totals

| Check | ✓ | ✗ | — |
| --- | ---: | ---: | ---: |
| status | 40 | 0 | 0 |
| errors | 0 | 40 | 0 |
| overflow | 40 | 0 | 0 |
| h1 | 40 | 0 | 0 |
| locale | 40 | 0 | 0 |
| seo | 40 | 0 | 0 |
| language | 40 | 0 | 0 |
| touchTargets | 20 | 0 | 20 |
| images | 40 | 0 | 0 |
| axe | 20 | 20 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /calculators/bike-fit | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-bike-fit-nl-1440.png) |
| /calculators/bike-fit | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-bike-fit-nl-390.png) |
| /calculators/bike-fit | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-bike-fit-en-1440.png) |
| /calculators/bike-fit | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-bike-fit-en-390.png) |
| /calculators/saddle-height | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-saddle-height-nl-1440.png) |
| /calculators/saddle-height | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-saddle-height-nl-390.png) |
| /calculators/saddle-height | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-saddle-height-en-1440.png) |
| /calculators/saddle-height | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-saddle-height-en-390.png) |
| /calculators/frame-size | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-frame-size-nl-1440.png) |
| /calculators/frame-size | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-frame-size-nl-390.png) |
| /calculators/frame-size | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-frame-size-en-1440.png) |
| /calculators/frame-size | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-frame-size-en-390.png) |
| /calculators/gearing | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-gearing-nl-1440.png) |
| /calculators/gearing | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-gearing-nl-390.png) |
| /calculators/gearing | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-gearing-en-1440.png) |
| /calculators/gearing | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-gearing-en-390.png) |
| /calculators/crank-length | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-crank-length-nl-1440.png) |
| /calculators/crank-length | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-crank-length-nl-390.png) |
| /calculators/crank-length | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-crank-length-en-1440.png) |
| /calculators/crank-length | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-crank-length-en-390.png) |
| /calculators/saddle-width | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-saddle-width-nl-1440.png) |
| /calculators/saddle-width | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-saddle-width-nl-390.png) |
| /calculators/saddle-width | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✗ | [view](calculators-saddle-width-en-1440.png) |
| /calculators/saddle-width | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | [view](calculators-saddle-width-en-390.png) |
| /calculators/ftp-wkg | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-ftp-wkg-nl-1440.png) |
| /calculators/ftp-wkg | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-ftp-wkg-nl-390.png) |
| /calculators/ftp-wkg | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-ftp-wkg-en-1440.png) |
| /calculators/ftp-wkg | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-ftp-wkg-en-390.png) |
| /calculators/power-speed | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-power-speed-nl-1440.png) |
| /calculators/power-speed | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-power-speed-nl-390.png) |
| /calculators/power-speed | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-power-speed-en-1440.png) |
| /calculators/power-speed | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-power-speed-en-390.png) |
| /calculators/fuel-hydration | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-fuel-hydration-nl-1440.png) |
| /calculators/fuel-hydration | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-fuel-hydration-nl-390.png) |
| /calculators/fuel-hydration | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-fuel-hydration-en-1440.png) |
| /calculators/fuel-hydration | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-fuel-hydration-en-390.png) |
| /calculators/climb-planner | nl | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-climb-planner-nl-1440.png) |
| /calculators/climb-planner | nl | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-climb-planner-nl-390.png) |
| /calculators/climb-planner | en | 1440 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | [view](calculators-climb-planner-en-1440.png) |
| /calculators/climb-planner | en | 390 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [view](calculators-climb-planner-en-390.png) |

## Findings and skipped checks

### /calculators/bike-fit · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/bike-fit

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/bike-fit · nl · 390

URL: http://127.0.0.1:4327/nl/calculators/bike-fit

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/bike-fit · en · 1440

URL: http://127.0.0.1:4327/en/calculators/bike-fit

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/bike-fit · en · 390

URL: http://127.0.0.1:4327/en/calculators/bike-fit

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/saddle-height · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/saddle-height

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/saddle-height · nl · 390

URL: http://127.0.0.1:4327/nl/calculators/saddle-height

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/saddle-height · en · 1440

URL: http://127.0.0.1:4327/en/calculators/saddle-height

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/saddle-height · en · 390

URL: http://127.0.0.1:4327/en/calculators/saddle-height

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/frame-size · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/frame-size

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/frame-size · nl · 390

URL: http://127.0.0.1:4327/nl/calculators/frame-size

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/frame-size · en · 1440

URL: http://127.0.0.1:4327/en/calculators/frame-size

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/frame-size · en · 390

URL: http://127.0.0.1:4327/en/calculators/frame-size

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/gearing · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  },
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
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

URL: http://127.0.0.1:4327/nl/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  },
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

### /calculators/gearing · en · 1440

URL: http://127.0.0.1:4327/en/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/gearing · en · 390

URL: http://127.0.0.1:4327/en/calculators/gearing

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

### /calculators/crank-length · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/crank-length

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/crank-length · nl · 390

URL: http://127.0.0.1:4327/nl/calculators/crank-length

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/crank-length · en · 1440

URL: http://127.0.0.1:4327/en/calculators/crank-length

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/crank-length · en · 390

URL: http://127.0.0.1:4327/en/calculators/crank-length

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/saddle-width · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/saddle-width

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/saddle-width · nl · 390

URL: http://127.0.0.1:4327/nl/calculators/saddle-width

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/saddle-width · en · 1440

URL: http://127.0.0.1:4327/en/calculators/saddle-width

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

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

### /calculators/saddle-width · en · 390

URL: http://127.0.0.1:4327/en/calculators/saddle-width

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
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

### /calculators/ftp-wkg · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/ftp-wkg

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/ftp-wkg · nl · 390

URL: http://127.0.0.1:4327/nl/calculators/ftp-wkg

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

### /calculators/ftp-wkg · en · 1440

URL: http://127.0.0.1:4327/en/calculators/ftp-wkg

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/ftp-wkg · en · 390

URL: http://127.0.0.1:4327/en/calculators/ftp-wkg

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

### /calculators/power-speed · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  },
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
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

URL: http://127.0.0.1:4327/nl/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "pageerror",
    "message": "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  },
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

### /calculators/power-speed · en · 1440

URL: http://127.0.0.1:4327/en/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/power-speed · en · 390

URL: http://127.0.0.1:4327/en/calculators/power-speed

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

### /calculators/fuel-hydration · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/fuel-hydration

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/fuel-hydration · nl · 390

URL: http://127.0.0.1:4327/nl/calculators/fuel-hydration

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

### /calculators/fuel-hydration · en · 1440

URL: http://127.0.0.1:4327/en/calculators/fuel-hydration

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/fuel-hydration · en · 390

URL: http://127.0.0.1:4327/en/calculators/fuel-hydration

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

### /calculators/climb-planner · nl · 1440

URL: http://127.0.0.1:4327/nl/calculators/climb-planner

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/climb-planner · nl · 390

URL: http://127.0.0.1:4327/nl/calculators/climb-planner

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

### /calculators/climb-planner · en · 1440

URL: http://127.0.0.1:4327/en/calculators/climb-planner

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

**touchTargets —**

```json
[
  "Mobile-only check."
]
```

### /calculators/climb-planner · en · 390

URL: http://127.0.0.1:4327/en/calculators/climb-planner

Rendering mode: production

**errors ✗**

```json
[
  {
    "type": "console",
    "message": "Connecting to 'ws://127.0.0.1:3210/api/1.42.1/sync' violates the following Content Security Policy directive: \"connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com\". The action has been blocked.",
    "location": {
      "url": "http://127.0.0.1:4327/_next/static/chunks/2348-205cd8da596b9c8f.js",
      "lineNumber": 1,
      "columnNumber": 0
    }
  }
]
```

