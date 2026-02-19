# SEO + Conversion KPI Dashboard Spec

Last updated: 2026-02-19

## Objective

Track whether SEO/content updates improve:

1. Organic visibility (impressions/clicks/CTR).
2. Localized traffic quality (EN/NL sessions).
3. Conversion from public content to authenticated onboarding.

## KPI Set

### KPI Group A: Organic traffic by locale

- Metric: `organic_sessions`
- Dimensions: `date`, `locale` (`en`, `nl`)
- Source: web analytics platform
- Baseline window: 28 days before content release
- Review target: +15-25% sessions in 90 days

### KPI Group B: Search performance by page

- Metrics: `impressions`, `clicks`, `ctr`, `avg_position`
- Dimensions: `landing_page`, `locale`
- Source: Google Search Console
- Baseline pages:
  - `/`
  - `/guides`
  - `/guides/bike-fitting-for-knee-pain`
  - `/guides/bike-fitting-for-lower-back-pain`
  - `/guides/road-bike-fit-guide`
  - `/guides/gravel-bike-fit-guide`
  - `/guides/mountain-bike-fit-guide`
  - `/guides/triathlon-bike-fit-guide`

### KPI Group C: Conversion funnel from public pages

- Metrics:
  - `cta_clicks`
  - `login_code_requested`
  - `login_verified`
  - `login_completion_rate = login_verified / login_code_requested`
- Dimensions:
  - `locale`
  - `pagePath`
  - `section`
  - `sourceTag` (for login attribution)
- Source: Convex `marketingEvents` table

## Event Tracking Model

Implemented events:

- `cta_click`
- `login_code_requested`
- `login_verified`

Event fields:

- `locale`
- `pagePath`
- `section`
- `ctaLabel` (CTA only)
- `ctaTargetPath` (CTA only)
- `sourceTag`
- `occurredAt`

Implementation files:

- `convex/schema.ts`
- `convex/analytics/mutations.ts`
- `convex/analytics/queries.ts`
- `src/components/analytics/TrackedCtaLink.tsx`
- `src/app/(auth)/login/page.tsx`

## Baseline Capture Template

Capture once before rollout, then at D+30/D+60/D+90.

| Window | Organic Sessions EN | Organic Sessions NL | Clicks (guide cluster) | CTR (guide cluster) | CTA Clicks | Login Code Requested | Login Verified | Login Completion Rate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline (pre-release, 28d) |  |  |  |  |  |  |  |  |
| Day 30 |  |  |  |  |  |  |  |  |
| Day 60 |  |  |  |  |  |  |  |  |
| Day 90 |  |  |  |  |  |  |  |  |

## Convex Query Command

Use this query for CTA/funnel reporting:

```bash
npx convex run analytics/queries:getKpiDashboard '{"from": <unix_ms>, "to": <unix_ms>}' --prod
```

If `from`/`to` are omitted, the query returns the last 30 days by default.

## Monthly Review Cadence

Schedule: first Monday of each month.

1. Export Search Console page-level data for previous month.
2. Export analytics sessions by locale and landing page.
3. Run Convex KPI query for same date range.
4. Compare against previous month and against 90-day trajectory.
5. Create/update iteration backlog with prioritized experiments.

## A/B Copy Testing Plan

### Test 1: Homepage hero

- Variant A: current copy
- Variant B: stronger pain-to-outcome framing
- Primary metric: `hero_primary` CTA click-through rate
- Secondary metric: login completion rate from hero source tag

### Test 2: Reasons-to-start framing

- Variant A: current reasons cards
- Variant B: sharper problem-first headlines
- Primary metric: downstream CTA clicks (`final_cta`, `recommendation_card`)
- Secondary metric: login completion rate from homepage source tags

## Iteration Backlog Template

Use this structure each cycle:

| Priority | Hypothesis | Target Page/Section | Metric | Expected Lift | Owner | Status |
|---|---|---|---|---|---|---|
| P1 |  |  |  |  |  | Backlog |
| P2 |  |  |  |  |  | Backlog |
| P3 |  |  |  |  |  | Backlog |

## 30/60/90-Day Optimization Loop

### Day 30

- Validate indexing and early CTR signals.
- Drop underperforming CTA labels (< site median CTR).
- Ship first hero copy test.

### Day 60

- Expand top-performing guide patterns (new pain/disciplines).
- Update internal links from high-traffic pages to top-converting guides.
- Ship reasons-to-start A/B test.

### Day 90

- Consolidate winning variants into default copy.
- Remove underperforming pages or merge overlapping intent pages.
- Publish next-quarter backlog with expected impact per item.
