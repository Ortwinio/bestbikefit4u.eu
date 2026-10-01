# Whole-app QA sweep

0 routes; 0 locale/viewport cases; 0 without failures; 0 with failures.

✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.

## Run context

```json
{
  "inventory": "plans/redesign-canvas/audit/route-map.md",
  "inventoryRoutes": 72,
  "scope": "Active audited non-admin routes and account calculators; retired import and /design-system excluded.",
  "billing": "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  "browser": "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  "filtering": "/bikes,/bikes/new,/bikes/import",
  "concurrency": 2,
  "label": null,
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
  "fatalError": "Error: Build exited 1; see /Users/ortwinverreck/Developer/bestbikefit4u/plans/redesign-canvas/final-sweep/46/build.log\n    at ChildProcess.<anonymous> (file:///Users/ortwinverreck/Developer/bestbikefit4u/tests/visual/final-sweep/production.mjs:53:63)\n    at Object.onceWrapper (node:events:622:26)\n    at ChildProcess.emit (node:events:507:28)\n    at ChildProcess._handle.onexit (node:internal/child_process:294:12)"
}
```

## Check totals

| Check | ✓ | ✗ | — |
| --- | ---: | ---: | ---: |
| status | 0 | 0 | 0 |
| errors | 0 | 0 | 0 |
| overflow | 0 | 0 | 0 |
| h1 | 0 | 0 | 0 |
| locale | 0 | 0 | 0 |
| seo | 0 | 0 | 0 |
| language | 0 | 0 | 0 |
| touchTargets | 0 | 0 | 0 |
| images | 0 | 0 | 0 |
| axe | 0 | 0 | 0 |

## Route matrix

| Route | Locale | Width | status | errors | overflow | h1 | locale | seo | language | touchTargets | images | axe | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Expected local diagnostics

These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.


## Findings and skipped checks

