# Step 03 — Accessibility And Layout Validation

## Goal

Add explicit evidence for accessibility and non-obstruction behavior of the feedback entry system.

## Tasks

1. Define the required accessibility checks for the feedback panel:
   - keyboard open
   - keyboard close
   - focus entry
   - accessible labeling
2. Define the representative layout checks for trigger placement on:
   - marketing/public page
   - auth page
   - calculator page
   - dashboard page
   - fit results page
3. Implement tests or verification artifacts that prove these behaviors.
4. Document any cases where manual verification is still required.

## Constraints

- validate behavior, not fragile CSS internals
- do not hard-code pixel-perfect snapshot assumptions unless unavoidable

## Done When

- accessibility and layout claims are supported by explicit evidence
