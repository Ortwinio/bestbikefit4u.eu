# Bugfix Plan: Dashboard Tire Pressure Runtime Validation

## Goal

Identify why the new dashboard route for tire pressure fails at runtime while the public tire pressure calculator works, then validate the most likely fix path without requiring user intervention.

## Scope

- Verify the dashboard tire pressure route exists and compiles
- Validate the route behavior in an unauthenticated local environment
- Trace all runtime dependencies used only by the dashboard tire pressure flow
- Determine whether the failure is frontend runtime, route wiring, or Convex backend contract/deployment related
- Add regression-oriented validation where feasible in the current local environment

## Working Hypothesis

The dashboard route itself is present, but it depends on new Convex queries/mutations:

- `api.bikes.queries.list`
- `api.wheelsets.queries.listForBike`
- `api.tireSetups.queries.listForWheelset`
- `api.pressureCalculations.queries.getLatestForBike`
- `api.pressureProfiles.queries.listForBike`

If the frontend is deployed before the matching Convex backend is deployed, the new dashboard page will fail at runtime after auth, while the public calculator continues to work because it is pure frontend logic.

## Validation Steps

1. Confirm route registration and local render for `/pressure-calculator`
2. Confirm public calculator still renders independently
3. Confirm dashboard route does not 404 or fail during SSR
4. Audit dashboard-only runtime dependencies on Convex
5. Run project validation:
   - `npm run typecheck`
   - `npm run test:unit`
   - `npm run test:i18n`
   - `npm run build`
6. Record findings and required operational next step if backend deployment is the blocker

## Status

- [x] Route existence checked
- [x] Public calculator checked
- [x] Dashboard SSR checked
- [x] Convex dependency audit checked
- [ ] Production/deployed Convex parity verified
- [x] Local build and test validation completed
- [x] Dashboard mobile menu parity fixed
- [ ] Post-fix authenticated dashboard smoke test verified

## Findings So Far

- `/en/pressure-calculator` exists and server-renders locally
- Unauthenticated access returns the dashboard loading shell, so the route itself is not missing
- The dashboard tire pressure flow uniquely depends on newly added Convex backend modules
- This makes missing Convex deployment the primary suspected runtime failure in authenticated usage
- `npm run typecheck`, `npm run test:unit`, `npm run test:i18n`, and `npm run build` all passed locally
- The dashboard mobile menu was missing the new pressure route and has been corrected
- Attempting `npx convex deploy` failed with `401 Unauthorized: MissingAccessToken`, so backend deployment parity could not be completed from this environment
