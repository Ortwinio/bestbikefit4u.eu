# Prompt 02 — Fix the experience_level data pipeline

## Context

Read the plan README first: `plans/improve-experience-question/README.md`

The `experience_level` questionnaire answer is collected and stored, but **never passed to the fit algorithm** during recommendation generation. The `calculateBarDrop()` function has `EXPERIENCE_DROP_MODIFIERS = { beginner: -10, intermediate: 0, advanced: +5 }` but always uses the `intermediate` fallback (0mm effect) because the value is never provided.

This prompt wires the collected answer through to `FitInputs`.

## Step 1 — Read the current pipeline

Read these files to understand the current data flow:
- `convex/recommendations/seedEngine.ts` — `buildEngineV1FitInputs()` function
- `convex/recommendations/actions.ts` — `generateFromData` action
- `convex/lib/fitAlgorithm/types.ts` — `FitInputs` type

## Step 2 — Fix `buildEngineV1FitInputs()` in `seedEngine.ts`

Inside `buildEngineV1FitInputs()`, responses are already available. Extract `experience_level` from them:

```ts
const experienceLevelResponse = responses.find(
  (r) => r.questionId === "experience_level"
);
const VALID_EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
type ExperienceLevel = (typeof VALID_EXPERIENCE_LEVELS)[number];
const experienceLevel: ExperienceLevel | undefined =
  VALID_EXPERIENCE_LEVELS.includes(
    experienceLevelResponse?.response as ExperienceLevel
  )
    ? (experienceLevelResponse!.response as ExperienceLevel)
    : undefined;
```

Then include `experienceLevel` in the returned `FitInputs` object alongside the other fields.

## Step 3 — Verify no changes needed in `actions.ts` or `mutations.ts`

Check whether `actions.ts` and `mutations.ts` pass the full `FitInputs` object through, or whether they reconstruct it from individual fields. If `buildEngineV1FitInputs()` returns the full `FitInputs` and it's passed directly to the engine, no further changes are needed upstream.

If the pipeline does reconstruct `FitInputs` from individual parameters (e.g. `{ heightCm, inseamCm, ... }`), then `experienceLevel` needs to be threaded through as well. Read and report what you find.

## Step 4 — Run fit algorithm tests

```bash
cd /Users/ortwinverreck/Developer/bestbikefit4u && npm run test:unit -- --reporter=verbose 2>&1 | grep -E "PASS|FAIL|✓|✗|experience" | head -30
```

All existing fit algorithm tests must still pass.

## Step 5 — Run full typecheck

```bash
cd /Users/ortwinverreck/Developer/bestbikefit4u && npm run typecheck 2>&1 | tail -10
```

## Validation

After this prompt:
- A user selecting "Advanced" will receive a bar drop that is 5mm more than an "Intermediate" user with identical measurements
- A user selecting "Beginner" will receive a bar drop that is 10mm less
- The `FitInputs` object constructed by `buildEngineV1FitInputs()` contains `experienceLevel` when the questionnaire response is present
