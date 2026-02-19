# SEO + Conversion Baseline Capture

Captured on: 2026-02-19
Owner: `@ortwinverreck`
Reference: `docs/SEO_CONVERSION_KPI_DASHBOARD.md`

## Baseline Window

- Type: Pre-release baseline
- Window length: 28 days
- Range used (unix ms):
  - `from=1769104359177`
  - `to=1771523559177`
- Query:

```bash
npx convex run analytics/queries:getKpiDashboard '{"from":1769104359177,"to":1771523559177}' --prod
```

## Convex KPI Baseline Result

- `trackedEvents`: 0
- `ctaClicks`: 0
- `loginCodeRequested`: 0
- `loginVerified`: 0
- `loginCompletionRatePct`: 0
- `cta.byLocale`: `[]`
- `cta.byPage`: `[]`
- `cta.byPageSection`: `[]`
- `loginFunnel.bySource`: `[]`

## Baseline Table (from KPI dashboard spec)

| Window | Organic Sessions EN | Organic Sessions NL | Clicks (guide cluster) | CTR (guide cluster) | CTA Clicks | Login Code Requested | Login Verified | Login Completion Rate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline (pre-release, 28d) | pending | pending | pending | pending | 0 | 0 | 0 | 0% |

## Notes

- Search Console and web analytics values are marked `pending` and should be filled from those platforms.
- Convex event baseline is expected to be near-zero before first production traffic reaches newly instrumented tracked CTAs.
