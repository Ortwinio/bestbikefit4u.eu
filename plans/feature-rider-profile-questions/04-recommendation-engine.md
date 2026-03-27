# Prompt 04 — Recommendation Engine Update

## Goal

Update the recommendation generation pipeline to read the moved rider profile fields from the profile document instead of scanning questionnaire responses.

## Context

The recommendation engine flow:
1. `generate()` mutation (`convex/recommendations/mutations.ts`) — gathers data, schedules action
2. `generateFromData()` action (`convex/recommendations/actions.ts`) — runs fit algorithm
3. `storeResult()` internal mutation (`convex/recommendations/internalMutations.ts`) — saves result

Currently, `generate()` reads `experience_level` from questionnaire responses:
```typescript
const experienceLevelResponse = responses.find(r => r.questionId === "experience_level");
const experienceLevel = experienceLevelResponse?.response ?? "intermediate";
```

After this change, `experience_level` (and all other moved fields) should come from the profile.

## Changes to `generate()` mutation

The mutation already fetches the profile (`const profile = await ctx.db.get(session.profileId)`). Extend the data passed to `generateFromData()` with the rider profile fields:

```typescript
const riderProfile = {
  experienceLevel: profile.experienceLevel ?? "intermediate",
  weeklyHours: profile.weeklyHours ?? "3-6",
  typicalRideLength: profile.typicalRideLength ?? "medium",
  hasPain: profile.hasPain ?? "no",
  painAreas: profile.painAreas ?? [],
  kneePainTiming: profile.kneePainTiming,
  painSeverity: profile.painSeverity,
  positionPriority: profile.positionPriority ?? "balanced",
};
```

Remove the questionnaire-response lookup for `experience_level`.

Also pass `riderProfileUpdatedAt: profile.riderProfileUpdatedAt` so it can be stored on the recommendation for staleness comparison later.

## Changes to `generateFromData()` action

Update the action's input type to accept the new `riderProfile` object. Replace any references to questionnaire response lookups for the moved fields with the corresponding `riderProfile.*` properties.

The algorithm currently uses:
- `experienceLevel` → now from `riderProfile.experienceLevel`
- `weeklyHours` (already on session as `session.weeklyHours`) → also available from `riderProfile.weeklyHours` as a fallback
- Pain point data already lands on the session via `completeQuestionnaire` → this path remains unchanged (the session's `painPoints` array is still populated from the profile in the updated `completeQuestionnaire`)
- `positionPriority` → was a questionnaire response, now from `riderProfile.positionPriority`

## Changes to `storeResult()` internal mutation

Add a `riderProfileUpdatedAt` field to the recommendation record so that staleness can be detected by comparing this snapshot against future profile updates.

This requires adding `riderProfileUpdatedAt: v.optional(v.number())` to the `recommendations` table in `convex/schema.ts`.

## Fallback / backward compatibility

Existing recommendations (created before this change) will not have `riderProfileUpdatedAt`. These should be treated as "possibly stale" — handled in prompt 05 with appropriate UI treatment.

New sessions created after this change will not have questionnaire responses for the moved questions. The engine must not fail if those response records are absent.

## Files to Change

- `convex/recommendations/mutations.ts` — replace questionnaire response lookup with profile fields
- `convex/recommendations/actions.ts` — update `generateFromData` input type, replace field sources
- `convex/recommendations/internalMutations.ts` — store `riderProfileUpdatedAt` on recommendation
- `convex/schema.ts` — add `riderProfileUpdatedAt` to `recommendations` table
