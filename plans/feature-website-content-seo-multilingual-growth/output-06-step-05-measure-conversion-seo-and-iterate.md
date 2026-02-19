# Output 06: Step 05 - Measure Conversion, SEO, and Iterate

Date: 2026-02-19
Status: Completed

## Objective Delivered

Implemented a production-ready KPI instrumentation layer for SEO/content conversion analysis, added a dashboard query surface in Convex, and documented the 30/60/90-day optimization loop with monthly review cadence and A/B test plan.

## Implemented Tracking and Data Model

Added a dedicated analytics table and query surface:

- `convex/schema.ts`
  - New `marketingEvents` table with indexes for time, event type, locale, and page.
- `convex/analytics/mutations.ts`
  - New public mutation `logMarketingEvent`.
- `convex/analytics/queries.ts`
  - New KPI query `getKpiDashboard` returning:
    - totals (`cta_click`, `login_code_requested`, `login_verified`)
    - login completion rate
    - CTA breakdowns by locale/page/section
    - login funnel breakdown by source tag

## Frontend Instrumentation Added

New reusable tracked CTA component:

- `src/components/analytics/TrackedCtaLink.tsx`
  - Logs `cta_click` with `locale`, `pagePath`, `section`, and `ctaLabel`.
  - Appends `src=<pagePath:section>` for `/login` links.

Instrumented content pages:

- `src/app/(public)/page.tsx`
  - `hero_primary`, `recommendation_card`, `final_cta`
- `src/app/(public)/about/page.tsx`
  - `about_final_cta`
- `src/app/(public)/faq/page.tsx`
  - `faq_final_cta`
- `src/app/(public)/pricing/page.tsx`
  - `pricing_tier_*`, `pricing_final_cta`
- `src/app/(public)/guides/page.tsx`
  - `hub_final_cta`
- `src/app/(public)/guides/[slug]/page.tsx`
  - `guide_final_cta`

Auth funnel instrumentation:

- `src/app/(auth)/login/page.tsx`
  - Logs `login_code_requested` when code send succeeds.
  - Logs `login_verified` when verification succeeds.
  - Uses `src` query parameter as `sourceTag` attribution.

## KPI Dashboard Spec + Iteration Loop

Created runbook:

- `docs/SEO_CONVERSION_KPI_DASHBOARD.md`
  - KPI definitions and sources
  - Baseline table template (pre-release + 30/60/90 checkpoints)
  - Monthly review cadence
  - Hero + reasons-to-start A/B test plan
  - Iteration backlog template
  - Convex command to pull KPI data

## Validation

- `npm run lint:eslint -- ...` passed for all touched Step 05 files.
- `npm run test:i18n` passed (18/18 tests).
- `npm run build` passed (includes `/guides` and `/guides/[slug]` routes).
- `npm run typecheck` passed.

## Notes

- No production deployment executed.
- Baseline capture process is documented; actual baseline values should be captured right before rollout and then at day 30/60/90.
- `npx convex codegen` could not run in this sandbox due outbound DNS failure to Sentry ingest; implementation uses typed `makeFunctionReference(...)` to avoid dependency on regenerated `convex/_generated/api.d.ts` for new analytics references.
