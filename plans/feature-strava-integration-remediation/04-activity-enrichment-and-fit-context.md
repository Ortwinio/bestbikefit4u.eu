# 04 — Activity Enrichment And Fit Context

## Goal

Use recent Strava activity data to enrich imported bikes and improve fit guidance.

## Suggested Owner

- Fit Context

## Dependencies

- Step 03 sync contract

## Derived Metrics

For each imported bike compute:

- recent ride count
- recent distance
- average ride distance
- average speed
- elevation per 100 km
- trainer ratio
- dominant sport type
- last ride date
- inferred bike role

## Fit Rules

- Strava context is advisory only.
- It may bias recommendation framing and defaults.
- It must not override body measurements or user-confirmed setup values.

## Acceptance Criteria

- [ ] Metrics are recomputed idempotently from synced activities.
- [ ] Unattached activities do not contaminate bike summaries.
- [ ] Bike role inference is explainable and bounded.
- [ ] Fit recommendations can consume the derived context safely.
- [ ] If role inference is shown to the user, the explanation is plain-language and evidence-based.

## Success Criteria

- [ ] Users see a meaningful difference between a highly used endurance bike and a low-use training bike.
- [ ] Recommendation changes remain understandable and controlled.
