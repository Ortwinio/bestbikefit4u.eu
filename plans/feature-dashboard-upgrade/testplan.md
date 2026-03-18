# Testplan: Dashboard Upgrade

## Goal

Validate the `feature-dashboard-upgrade` plan against the current codebase and verify that each rollout step can be implemented without regressions in dashboard, bikes, profile, pressure, fit, and integrations.

## Test Strategy

Use four layers:

1. Static validation: `npm run typecheck`, `npm run lint`, i18n parity tests, Convex codegen/schema validation
2. Unit tests: pure helpers for uploads, theme, pressure staleness, pressure-fit interaction
3. Contract/integration tests: Convex mutations, queries, ownership checks, route data wiring
4. Manual smoke tests: core dashboard flows, uploads, bike detail, settings, pressure UX, Strava happy path and gating

## Preconditions

- Convex dev deployment is available and authenticated
- App runs locally with dashboard auth working
- Test user fixtures exist for:
  - free user with profile but no bike
  - free user with one bike and no pressure data
  - pro user with multiple bikes and pressure data
  - pro user with fit recommendations
- Image upload testing uses JPG, PNG, WEBP and one invalid file >5 MB
- If Strava is tested, sandbox/test app credentials are configured in Convex env vars

## Test Matrix

### 01. Schema and file storage

- Confirm `users` additions match actual schema naming and generated Convex types
- Confirm no duplicate user profile mutation is introduced
- Verify upload URL generation requires auth
- Verify file deletion requires auth and rejects cross-user access assumptions
- Verify bike photo field naming matches actual schema (`photoUrl` vs planned `photo`)
- Run:
  - `npx convex dev`
  - `npm run typecheck`

### 02. Profile photo

- Upload valid JPG, PNG, WEBP files and verify avatar refreshes without reload
- Reject invalid MIME type and files over 5 MB
- Verify fallback avatar renders when no image exists
- Verify query used by sidebar returns the image field actually stored in `users`
- Verify remove/replace flow does not leave broken UI state

Suggested automated coverage:
- upload hook validation unit tests
- component test for loading/error/fallback states

### 03. Bike photo and bike detail

- Verify bike detail route exists and loads the target bike only for the owner
- Upload and replace bike photo
- Verify bike card shows image or placeholder
- Verify card and detail links follow current localized routing
- Verify edit and delete actions still work after card redesign

Suggested automated coverage:
- Convex `getById` ownership contract
- page/component smoke render with and without photo

### 04. Weight promotion

- Verify profile form surfaces `weightKg` prominently without breaking existing wizard flow
- Verify kg/lbs conversion stores canonical kg values
- Reject out-of-range hard limits; show soft warning in warning-only range
- Verify dashboard pressure calculator pre-fills weight from profile
- Verify missing-weight banner appears until weight is set
- Verify `weightUpdatedAt` changes only when weight changes

Suggested automated coverage:
- unit tests for kg/lbs conversion
- Convex mutation tests for `weightUpdatedAt`

### 05. Settings page

- Verify `/settings` route exists in desktop and mobile navigation
- Verify language switch moved from sidebar/mobile header without losing functionality
- Verify account tier badge renders correctly for `free`, `pro`, and current extra values if supported
- Verify sign-out action still works from settings
- Verify units preference persistence target is explicit and tested

Suggested automated coverage:
- navigation smoke tests
- i18n parity tests for all added keys

### 06. Theme switch

- Verify light/dark/system applies immediately without reload
- Verify `.dark` class is correct on first paint
- Verify localStorage fallback works for logged-out or pre-query state
- Verify persisted theme field matches schema and query source
- Verify system mode reacts to `prefers-color-scheme` changes

Suggested automated coverage:
- unit tests for theme resolution helper
- client component test around context + DOM class toggling

### 07. Dashboard overview

- Verify dashboard still handles loading, no-profile, no-bike, and populated states
- Verify rider card uses current user/profile fields that actually exist
- Verify current bike selection works for:
  - explicit primary bike
  - no primary bike with multiple bikes
  - no bikes
- Verify pressure card handles:
  - no calculation
  - existing calculation
  - stale calculation
- Verify recent fit activity still links correctly to questionnaire/results flows

Suggested automated coverage:
- query test for `getMyPrimaryBike`
- dashboard component smoke tests with mocked Convex responses

### 08. Pressure in bikes

- Verify bike detail pressure block reads latest calculation for that bike
- Verify calculator deep-link with `?bikeId=` pre-fills bike and profile values
- Verify current pressure save flow writes to the actual bike fields used in schema
- Verify delta colors and text around boundary values
- Verify empty state when no calculation exists

Suggested automated coverage:
- contract test for `getLatestForBike`
- unit tests for delta classification helper

### 09. Pressure staleness

- Change profile weight and verify stale state appears on next dashboard/bike visit
- Change tire setup values and verify stale state appears only for affected bike
- Verify stale values remain visible
- Verify server-side staleness query matches client rendering
- Verify no false positive when unrelated bike fields change

Suggested automated coverage:
- unit tests for `isPressureStale`
- Convex query test for `isBikePressureStale`

### 10. Fit-pressure interaction

- Verify pressure insights do not alter core fit outputs
- Verify each rule scenario returns expected `comfortBias`, warnings, and stability score
- Verify fit results page renders insights section only when data exists
- Verify backfill action is manual-only and idempotent enough for reruns

Suggested automated coverage:
- pure unit tests for `computePressureInsights`
- contract test around recommendation generation storing insights

### 11. Pressure warnings

- Verify all warning keys have translation coverage in EN and NL
- Verify each warning has trigger and no-trigger tests
- Verify dashboard warning badge count matches warning array length
- Verify bike detail surfaces insights from latest recommendation for that bike
- Verify fallback CTA when no fit recommendation exists

Suggested automated coverage:
- warning-rule unit tests
- fit results rendering smoke tests

### 12. Strava integration

- Verify free-tier gating blocks connect flow
- Verify Pro flow covers connect, callback, token storage, sync, disconnect
- Verify tokens are never exposed to client queries
- Verify expired token refresh works
- Verify inferred terrain is surfaced in pressure calculator and can be overridden
- Verify failed OAuth or sync shows recoverable error state

Suggested automated coverage:
- action tests with mocked Strava API
- callback CSRF/state validation tests

## Regression Checks

- Bikes list/create/edit still work
- Dashboard login redirect still works
- Existing pressure wizard save flow still works
- Existing fit recommendation generation still works
- Existing locale switch still works after moving UI entry points
- Existing delete-account flow still works after user schema expansion

## Exit Criteria

- `npm run typecheck` passes
- `npm run lint` passes
- existing unit/integration suites pass
- new plan-specific unit and contract tests pass
- manual smoke checks pass for dashboard, profile, bikes, settings, pressure, and fit
- Strava tests pass or are explicitly deferred behind env/config availability
