# BP-04 — Homepage Quick-Check Card

## Objective

Build the public homepage card that drives the public fit-check flow from code entry to preview to heuristic result.

## User story

As a visitor, I want a fast, clear widget that lets me check one shared bike code and understand the result without needing product knowledge.

## Business value

- creates a concrete acquisition surface for second-hand-bike traffic
- translates backend capability into a visible conversion flow
- sets the tone for trustworthy, non-overclaiming results

## Dependencies

- BP-02 complete
- BP-03 complete
- homepage structure reviewed before insertion

## Required states

The card must support:

- collapsed
- loading lookup
- preview
- loading match
- result
- invalid
- rate limited

## Content rules

- heading and result copy must stay hedged
- show `{score}/75`, never percent
- confidence must always be visible in result state
- if geometry is weak, state that clearly
- CTA after result should say what more data improves the estimate

## Revised public copy

Use this style:

- Heading: “Check whether this bike could suit your size”
- Preview prompt: “Enter your height for a first estimate”
- Result support line: “Estimate based on height and available geometry”
- Sign-up CTA support: “Add your inseam and rider profile for a better estimate”

Avoid:

- “matches your measurements”
- “fit confirmed”
- “accurate result”

## Acceptance criteria

- [ ] all 7 states render cleanly
- [ ] 375px mobile layout has no horizontal overflow
- [ ] invalid code and disabled-preview states are indistinguishable to the user
- [ ] result always shows confidence and limited-estimate framing
- [ ] sign-up CTA explains what extra inputs improve the estimate
- [ ] EN and NL are complete

## Edge cases

- no photo available
- token expires after preview but before match
- repeated invalid code attempts
- rate-limited countdown and recovery

## Analytics events

- `bike_public_fit_lookup_submitted`
- `bike_public_fit_lookup_succeeded`
- `bike_public_fit_lookup_failed`
- `bike_public_fit_rate_limited`
- `bike_public_fit_quick_match_completed`
- `bike_public_fit_signup_cta_clicked`

## Human audit checks

- verify the card feels like a screening tool, not a diagnosis
- verify all result states remain readable on mobile
- verify the sign-up CTA feels additive, not manipulative

## Testing

- component tests for all state transitions
- locale snapshot/contract tests for EN/NL strings
- route-mocked tests for invalid, expired, and rate-limited flows

