# Prompt 03 — Bike Showcase And Closing CTA Cleanup

## Context

Read:

- `plans/feature-homepage-post-redesign-upgrade/README.md`

Phases 1 and 2 should be complete first.

The bike showcase is a key bridge between generic trust and bike-specific relevance. It must be reliably visible and understandable on desktop.

## Task

Verify and harden the bike showcase section, then remove the remaining duplication inside the closing CTA band.

## Deliverables

### 1. Diagnose bike showcase visibility on desktop

Review the live behavior and current code path for:

- `src/components/home/BikeShowcaseSection.tsx`
- `src/components/home/BikeShowcaseCarousel.tsx`
- any associated loading/empty-state logic

Determine why the showcase was absent in the reviewed desktop screenshot.

Possible causes to investigate:

- hidden/conditional rendering
- empty-state logic
- async query timing
- layout overflow/collapse
- a live-data dependency with no fallback

### 2. Ensure graceful fallback behavior

If showcase data is delayed or unavailable, the section should still render a stable surface.

That may be:

- a loading state
- a curated fallback
- a clear empty state with a secondary path

The section should not disappear silently.

### 3. Remove duplicated eyebrow language inside `ClosingCtaBand`

Review `src/components/home/ClosingCtaBand.tsx`.

The left recommendation block and right CTA card should not repeat the same eyebrow line at near-identical hierarchy.

Either:

- remove the eyebrow from one side, or
- give the right-side CTA card a different label with a distinct purpose

## Constraints

- Preserve valid bike-card interaction semantics.
- Preserve analytics behavior for bike details and fit-entry actions.
- Do not turn the fallback into a dead/promotional placeholder.
- Keep the closing CTA decisive and uncluttered.

## Completion Checklist

- [x] Bike showcase visibility is verified on desktop.
- [x] The homepage still shows a meaningful bike section when live data is slow or empty.
- [x] The closing CTA no longer repeats the same eyebrow text twice.
- [x] Bike showcase analytics/interaction behavior still works.
