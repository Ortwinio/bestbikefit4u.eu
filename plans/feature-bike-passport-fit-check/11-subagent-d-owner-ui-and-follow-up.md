# Subagent D — Owner Controls and Signed-In Follow-up

## Mission

Implement the owner-facing public-fit controls on bike settings and the signed-in follow-up UI that points riders toward a better estimate without promising a full Profile Match.

## Write scope

- bike settings / bike form surfaces
- bike detail or related signed-in follow-up surface
- related tests
- any localized copy needed for these UI states

Do not edit quick-match engine internals or homepage quick-check component.

## Requirements

- enable preview
- copy code
- disable preview
- keep code stable across re-enable
- show privacy note
- show weak-geometry guidance
- signed-in CTA must promise only a better estimate, not a full fit score unless such a feature is already live

## Acceptance criteria

- owner can manage preview state cleanly
- owner understands what is shared
- signed-in rider sees a sensible next step after quick check
- no copy overclaims precision

## Analytics events

- `bike_public_fit_enabled`
- `bike_public_fit_disabled`
- `bike_public_fit_code_copied`
- `bike_public_fit_signup_cta_clicked`

## Tests required

- enable/disable/copy UI tests
- stable-code re-enable tests
- signed-in follow-up CTA tests

## Final handoff format

- changed files
- acceptance criteria met
- copy audit notes
- remaining UX risks

