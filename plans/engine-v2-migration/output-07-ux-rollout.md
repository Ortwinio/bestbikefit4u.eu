# Output 07 — Initial UX Rollout

## Purpose

Expose the first Engine v2 concept in the dashboard without replacing the current results experience.

## What Landed

- the fit start page now loads bike profiles for a selected saved bike
- users can pick a profile before starting a session
- if profiles exist, the default profile is auto-selected
- new bikes automatically get a default `Base` profile on creation

## Compatibility Outcome

- users can still start a fit with a custom bike type and no saved bike
- users can still start a fit from a saved bike even if no bike profiles exist yet
- current results UI stays on the legacy recommendation shape

## Why This Is The Right First UX Slice

It exposes multi-profile behavior at the earliest meaningful point in the flow while keeping the rest of the fit experience stable.
