# BP-05 — Owner Controls and Authenticated Follow-up UI

## Objective

Add the owner-facing public-fit toggle to bike settings and a lightweight authenticated follow-up state that encourages better-profile completion without pretending a full Profile Match exists yet.

## User story

As a bike owner, I want to control whether a bike can be previewed publicly and understand what information is shared.

As a logged-in rider, I want to know what to do next after a public quick check if I want a better estimate.

## Business value

- gives owners explicit consent and control
- reduces privacy confusion
- creates a clean bridge from anonymous preview to signed-in rider flow

## Dependencies

- BP-01 complete
- BP-04 UI patterns available
- current bike edit form reviewed in [src/components/bikes/BikeForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeForm.tsx)

## Scope

### Owner controls

Add a new bike-settings section:

- enable preview
- show read-only public fit code
- copy code
- disable preview
- explain what is shared
- explain when geometry quality is too weak for a good preview

### Authenticated follow-up

Do not build the full 0-100 Profile Match card in this sprint.

Instead ship:

- signed-in result CTA:
  - “Get a better estimate with your inseam and rider profile”
- bike page / garage support state:
  - if public preview is enabled but geometry is weak, guide owner to add geometry
  - if rider is signed in after quick check, guide them to profile completion or bike-fit entry

## Revised user-facing copy

### Owner settings

- Section title: “Second-hand fit preview”
- Body: “Let potential buyers run a limited size check for this bike with a shared fit code.”
- Privacy note: “Only bike size and geometry preview data are shared. Personal account details are not shared.”
- Weak geometry note: “Add fuller bike geometry for a better public estimate.”

### Signed-in follow-up

- “Get a better estimate with your inseam and rider profile”
- “Use the quick check as a first screen. Add your rider data for a better estimate.”

## Acceptance criteria

- [ ] owner can enable preview from bike settings
- [ ] owner sees the same code again after disable/re-enable
- [ ] owner can copy the code
- [ ] owner-facing privacy note is visible when preview is enabled
- [ ] weak-geometry guidance appears when preview quality is limited
- [ ] signed-in follow-up CTA does not promise a full fit score unless that feature is actually live

## Edge cases

- bike has no geometry
- bike has partial geometry
- code exists but preview is disabled
- clipboard copy unavailable in browser

## Analytics events

- `bike_public_fit_enabled`
- `bike_public_fit_disabled`
- `bike_public_fit_code_copied`
- `bike_public_fit_signup_cta_clicked`

## Human audit checks

- verify owners understand that public preview is opt-in
- verify privacy copy is visible and plain
- verify no signed-in CTA claims that a detailed fit score exists if it does not

## Testing

- component tests for enable/disable/copy flows
- UI tests for weak-geometry notice
- signed-in CTA visibility tests

