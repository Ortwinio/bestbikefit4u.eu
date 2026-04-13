# 04 — Validation, Copy, And Rollout

## Task

Define how the guided picklist change will be validated and shipped safely.

## Deliver

1. Test plan for:
   - add-bike standard linking flow
   - edit-bike prefilled linking flow
   - switching to fallback
   - switching back to standard
   - year-required vs year-not-required models
   - size selection and geometry preview
2. Copy checklist for:
   - section intro
   - step labels
   - preview block
   - empty states
   - fallback disclosure
3. Analytics / instrumentation recommendations:
   - brand selected
   - model selected
   - year selected
   - size selected
   - geometry link saved
   - fallback opened
   - fallback saved
4. Rollout note:
   - ship behind normal dashboard release
   - validate create and edit flows manually on desktop and mobile

## Acceptance

- There is a concrete verification path for the full guided flow
- Copy reinforces the product goal: connect a bike to the correct standard geometry
- The rollout can detect whether the new UX actually improves link completion
