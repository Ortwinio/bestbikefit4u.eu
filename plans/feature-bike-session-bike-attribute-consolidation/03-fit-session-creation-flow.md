# Step 03 — Fit Session Creation Flow

## Goal

Change the new-fit experience so it derives fit-context attributes from the bike instead of asking for them every time.

## Current State

The start page in [`src/app/(dashboard)/fit/page.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/fit/page.tsx) collects:

- bike type
- riding style
- primary goal

This is the main duplication point.

## New UX Direction

### Existing bike path

When the user selects an existing bike:

- read `bikeType`, `ridingStyle`, and `primaryGoal` from the bike
- show them as confirmation/read-only summary
- do not ask the user to reselect them

### New bike / no bike path

If the app still supports starting a fit without a saved bike, choose one of these approaches explicitly:

1. Recommended:
   - require the user to create/save a bike first
   - then start the fit from that bike
2. Transitional fallback:
   - still allow ad-hoc session creation
   - but create a temporary bike-like record or explicit “unsaved bike context”

The cleaner long-term approach is bike-first creation.

## Backend Changes

Update [`convex/sessions/mutations.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/sessions/mutations.ts):

- if `bikeId` is present, derive snapshot values from the bike
- reject mismatches between passed values and bike-owned values during transition
- eventually stop accepting those values from the client for bike-linked sessions

## Session Write Contract

At creation time:

- store bike-linked snapshot values on the session
- those values become immutable historical context

## Acceptance Criteria

- [ ] Existing-bike fit start no longer requires manual entry of bike type, riding style, or primary goal
- [ ] Session creation snapshots those values from the selected bike
- [ ] Transition logic prevents inconsistent bike/session combinations
