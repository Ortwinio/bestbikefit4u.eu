# P1 profile access

- `scoreRiderProfile(input, now, access?)` retains exact legacy results unless access.enforced is true.
  Enforced base excludes old femur/sit-bone weights and normalizes remaining rules to 80 points;
  six measured refinements add 5/4/4/2/3/2. Free scoring excludes retained expired refinements from
  both completeness and reliability, without deleting data. Fully completed base is exactly 80.
- Guided tests use board bounds: flexibilityTestCm -20..20 cm, coreTestSeconds 0..180 seconds.
  Zero and negative flexibility results count as present. Tests never overwrite declared flexibility/core.
- All existing profile writers reach a central entitlement check before observation/value writes.
  Public handoff has the same check before profile/bike creation. Ordinary unchanged full-form values
  pass; changed paid values and same-value provenance reconfirmation reject without fullProfile access.
  Self-assessment, complaints and base fields remain free. Flag off exits before any entitlement query.
- `removePaidField` is owner-authenticated and current-value guarded, allowed regardless of expiry.
  It removes only a recognized paid field and supersedes current provenance. Existing values remain readable.
- New shared `useProfileAccess` hook returns conservative free access while enforced query loads;
  skips access lookup off. B owns score call-site integration and account presentation; details in
  messages/A-profile-contract.md.
- Focused tests: 336 passed across shared/profileScore, convex/profiles and useProfileAccess.
  Scoped ESLint passed. Root owns combined final gates and generated API registration.
- No deploy, production data access, commit or push.

## Selected-bike refinement follow-up

- Bike score gains optional `{ enforced, fullReport }` access. Normalized free base is exactly 80;
  BikeProfile board refinements are reach/drop 5/5, seat/head angles 2/2, gearing 3, real Strava rides 3.
  Both server detail and garage summaries use selected-bike access. Flag off keeps old scores/query behaviour.
- `assertPaidBikeWrite` is exported for root's other writer integrations. Profile updateFields guards
  changed values and evidence confirmation; removeRefinement remains available after expiry with ownership
  and current-value checks. Removal supersedes evidence and clears field metadata, including grouped
  gear arrays and imported riding summaries. It does not disconnect Strava or delete old reports.
- `activitySummary` requires actual source strava_v1_1 and positive rideCount for completeness;
  merely connecting Strava does not fabricate riding data.
- Focused bike/scoring follow-up: 132 tests pass. Nonincremental TypeScript passes.
