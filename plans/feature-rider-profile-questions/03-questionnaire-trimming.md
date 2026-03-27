# Prompt 03 — Fit Session Gate & Questionnaire Trimming

## Goal

1. Gate the fit session start on the rider profile questions being complete (in addition to body measurements).
2. Remove the 5 questions from the fit session questionnaire — they are now sourced from the profile.

## Part A: Fit Session Gate

### Backend (`convex/sessions/mutations.ts` — `createSession`)

The `createSession` mutation should validate that the profile has the rider profile questions answered before creating a session. This prevents creating sessions where the recommendation engine would have no data to work with.

Add validation after the existing profile check:

```typescript
if (!isRiderProfileComplete(profile)) {
  throw new Error("Rider profile is incomplete. Complete your riding style questions first.");
}
```

Import `isRiderProfileComplete` from the helper added in prompt 01.

### Frontend (`src/app/(dashboard)/fit/page.tsx`)

The existing `canStart` check already requires `hasProfile`. Add a second check:

```typescript
const hasRiderProfile = profile ? isRiderProfileComplete(profile) : false;

const canStart = Boolean(
  selectedBikeId &&
  effectiveBikeType &&
  !bikeNeedsAttributes &&
  isSelectedGoalAllowed &&
  hasProfile &&
  hasRiderProfile &&   // NEW
  !isCreating
);
```

Since the profile object comes from `useQuery(api.profiles.queries.getMyProfile)`, the new fields will be present. Implement `isRiderProfileComplete` as a frontend helper in `src/lib/profile.ts` (same logic as the Convex helper):

```typescript
export function isRiderProfileComplete(profile: Doc<"profiles"> | null): boolean {
  if (!profile) return false;
  return (
    !!profile.experienceLevel &&
    !!profile.weeklyHours &&
    !!profile.typicalRideLength &&
    !!profile.hasPain &&
    !!profile.positionPriority &&
    (profile.hasPain !== "yes" || (profile.painAreas?.length ?? 0) > 0)
  );
}
```

Add a warning card on the fit page (similar to the existing `profileWarning` card) when `hasProfile` but `!hasRiderProfile`:

```
Complete your riding profile
Answer a few questions about your riding style before starting a fit session.
[Go to My Profile →]
```

Use messages key `fit.riderProfileWarning`.

## Part B: Questionnaire Trimming

### Remove questions from the questionnaire definition

In `convex/questionnaire/questions.ts`, the questions array is defined (with `baseOrder`). Remove or mark as inactive the following question IDs:

- `experience_level` (baseOrder 10)
- `weekly_hours` (baseOrder 20)
- `typical_ride_length` (baseOrder 30)
- `has_pain` (baseOrder 40)
- `pain_areas` (baseOrder 50)
- `knee_pain_timing` (baseOrder 55)
- `pain_severity` (baseOrder 60)
- `position_priority` (baseOrder 70)

**Recommended approach:** Add an `isProfileQuestion: true` flag to each of these question definitions. Then in `convex/questionnaire/queries.ts` — `getQuestions` — filter them out:

```typescript
return questions.filter(q => !q.isProfileQuestion);
```

This keeps the question definitions intact (useful for display labels and migration) while excluding them from the active questionnaire.

### Update `completeQuestionnaire` mutation

The `completeQuestionnaire` mutation in `convex/questionnaire/mutations.ts` currently:
- Validates all required questions are answered
- Extracts `weeklyHours` from `weekly_hours` response
- Extracts pain points from `has_pain` / `pain_areas` responses

After trimming, these values come from the profile instead of questionnaire responses. Update the mutation to:

1. Read `weeklyHours`, `hasPain`, `painAreas`, `painSeverity` from the **profile** (fetched by userId), not from questionnaire responses
2. Remove validation for the removed question IDs from the required-questions check
3. The `required` questions list should now only include: `current_position_feeling` (the only truly required remaining question — check the definition)

### Questionnaire required questions validation

The `missingRequiredMarker` logic in the frontend (`QuestionnaireContainer`) and the backend validator both check `isRequired`. Since the removed questions are no longer in the questionnaire, this should work automatically once they are filtered out.

## Files to Change

- `convex/questionnaire/questions.ts` — add `isProfileQuestion: true` flag to 8 questions
- `convex/questionnaire/queries.ts` — filter profile questions out of `getQuestions`
- `convex/questionnaire/mutations.ts` — update `completeQuestionnaire` to read pain/hours from profile
- `convex/sessions/mutations.ts` — add rider profile completeness check in `createSession`
- `src/app/(dashboard)/fit/page.tsx` — add `hasRiderProfile` to `canStart`, add warning card
- `src/lib/profile.ts` — add `isRiderProfileComplete` frontend helper
- `src/i18n/messages/en.ts` — add `fit.riderProfileWarning` messages
- `src/i18n/messages/nl.ts` — same for NL
