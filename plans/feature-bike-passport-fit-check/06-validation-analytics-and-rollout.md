# BP-06 — Validation, Analytics, Audit, and Rollout

## Objective

Finish the sprint with explicit test coverage, typed analytics wiring, human copy audit, and rollout notes.

## User story

As the team, we want confidence that the public fit-preview feature is safe, honest, and production-ready before we release it.

## Business value

- prevents privacy leakage from a public feature
- keeps trust-sensitive fit copy under control
- reduces the chance of shipping a pseudo-scientific UX

## Dependencies

- BP-01 through BP-05 complete

## Required automated validation

### Contract and backend

- public fit code generation/enable/disable tests
- preview snapshot precedence tests
- lookup route tests:
  - `200`
  - `404`
  - `405`
  - `429`
- preview token tests:
  - valid
  - expired
  - revoked/disabled-preview
- Quick Match engine tests:
  - score cap
  - band boundaries
  - limited-data behavior

### Frontend

- quick-check card state tests
- owner toggle UI tests
- signed-in follow-up CTA tests
- locale coverage tests for EN/NL key copy

## Required analytics checks

All events must use the typed analytics layer and must not carry:

- raw IP
- public fit code
- internal bike ID
- owner identity

Required audit list:

- `bike_public_fit_enabled`
- `bike_public_fit_disabled`
- `bike_public_fit_code_copied`
- `bike_public_fit_lookup_submitted`
- `bike_public_fit_lookup_succeeded`
- `bike_public_fit_lookup_failed`
- `bike_public_fit_rate_limited`
- `bike_public_fit_quick_match_completed`
- `bike_public_fit_signup_cta_clicked`

## Required human audit checks

### Privacy

- confirm public preview never exposes owner identity
- confirm invalid and disabled-preview states are indistinguishable
- confirm copied code is the public fit code, not `bikePassportId`

### Trust / claims

- confirm no visible string says “this bike fits you”
- confirm every result includes confidence
- confirm limited-data states clearly state their limits
- confirm sign-up CTA promises only a better estimate, not certainty

### UX

- verify 375px mobile
- verify desktop layout
- verify no weak-contrast CTA or badge states

## Release checklist

- [ ] `npx convex codegen`
- [ ] targeted vitest suite
- [ ] `npm run build:vercel`
- [ ] manual lookup test with:
  - valid code
  - invalid code
  - disabled preview
  - limited-data bike
- [ ] owner settings smoke test for enable/copy/disable/re-enable

## Success criteria

- [ ] build passes
- [ ] all planned automated tests pass
- [ ] public API contract is privacy-safe
- [ ] public result copy remains practical and trust-building
- [ ] MVP is shippable without the deferred Profile Match feature

