# Subagent C — Public Quick-Check UI

## Mission

Build the homepage quick-check experience from code entry through preview and result state.

## Write scope

- homepage quick-check component
- homepage integration
- related public UI tests
- locale copy additions needed for this surface

Do not edit backend schema or owner settings UI.

## Requirements

- all 7 states render cleanly
- mobile-safe at 375px
- invalid and disabled-preview user states stay indistinguishable
- result shows score, confidence, explanation, and limited-estimate framing
- CTA after result explains what extra rider data improves the estimate

## Acceptance criteria

- `{score}/75` only, never percent
- confidence visible in result state
- EN/NL complete
- no “this bike fits you” language

## Analytics events

- `bike_public_fit_lookup_submitted`
- `bike_public_fit_lookup_succeeded`
- `bike_public_fit_lookup_failed`
- `bike_public_fit_rate_limited`
- `bike_public_fit_quick_match_completed`
- `bike_public_fit_signup_cta_clicked`

## Tests required

- UI state tests
- locale coverage tests
- route-mocked tests for invalid/expired/rate-limited transitions

## Final handoff format

- changed files
- screenshots or described state coverage
- acceptance criteria met
- remaining UX risks

