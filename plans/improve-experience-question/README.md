# Plan: Improve the Cycling Experience Question

## Goal

Improve the "How would you describe your cycling experience?" questionnaire question — better copy, cleaner card layout using the `Selectable` component's existing `description` prop, and fix a critical data pipeline gap where the collected answer is never actually passed to the fit algorithm.

## Background

The question currently renders three options as a `Selectable` `variant="card"` list. Each option uses a single `label` string that combines a title and a description with a dash:

```
"Beginner - New to cycling or returning after a long break"
```

The `Selectable` component already supports separate `label` and `description` props, which render as a bold title and a muted subtitle. The options are not using this — they pack everything into `label`, which means no visual hierarchy.

**Critical bug found:** The `experience_level` answer is collected in the questionnaire and the fit algorithm has a dedicated `EXPERIENCE_DROP_MODIFIERS` constant (`{ beginner: -10, intermediate: 0, advanced: +5 }`) that adjusts bar drop. However, the value is never extracted from questionnaire responses and never passed through `mutations.ts` → `actions.ts` → `seedEngine.ts` to `FitInputs`. The question's effect on bike fit recommendations is effectively dead code.

## Scope

**In scope:**
- Add a `description` field to the `QuestionDefinition` options type
- Update `SingleChoiceQuestion` to pass `description` to `Selectable`
- Rewrite the experience question options: split title from description, tighten the copy
- Improve `questionText` and `helpText`
- Fix the data pipeline: wire `experienceLevel` from questionnaire responses through to `FitInputs`

**Out of scope:**
- Dutch translation of question text (questionnaire questions are English-only currently)
- Adding icons or visual level indicators per option (future enhancement)
- Changing the three experience levels themselves (Beginner / Intermediate / Advanced)
- Changing `EXPERIENCE_DROP_MODIFIERS` values

## Approach

### Phase 1 — Content and UI

**`convex/questionnaire/questions.ts`**

Add `description` to the option type:
```ts
options?: Array<{
  value: string;
  label: string;
  description?: string;
  followUpQuestionIds?: string[];
}>;
```

Rewrite the experience question:

| Field | Current | Improved |
|-------|---------|----------|
| `questionText` | "How would you describe your cycling experience?" | "What best describes your cycling experience?" |
| `helpText` | "This helps us adjust recommendations for your skill level" | "Your experience level adjusts handlebar position and how aggressive or relaxed your fit will be" |
| Beginner label | "Beginner - New to cycling or returning after a long break" | label: **"Beginner"** / description: "New to cycling, or returning after a long break" |
| Intermediate label | "Intermediate - Regular rider, comfortable on most terrain" | label: **"Intermediate"** / description: "Ride regularly and feel comfortable on most terrain" |
| Advanced label | "Advanced - Experienced cyclist, races or trains seriously" | label: **"Advanced"** / description: "Race or train seriously, and want a performance-oriented position" |

**`src/components/questionnaire/questions/SingleChoice.tsx`**

Pass `description` through to `Selectable` when the option provides it:
```tsx
<Selectable
  key={option.value}
  mode="radio"
  value={option.value}
  label={option.label}
  description={option.description}
  variant="card"
/>
```

### Phase 2 — Fix the data pipeline

The `experience_level` response is stored in `questionnaireResponses` but never extracted during recommendation generation.

**`convex/recommendations/seedEngine.ts`** — `buildEngineV1FitInputs()`:
Extract `experience_level` from responses and include it in `FitInputs`:
```ts
const experienceLevelResponse = responses.find(
  (r) => r.questionId === "experience_level"
);
const experienceLevel = ["beginner", "intermediate", "advanced"].includes(
  experienceLevelResponse?.response as string
)
  ? (experienceLevelResponse!.response as "beginner" | "intermediate" | "advanced")
  : undefined;
```

Then pass `experienceLevel` to the `FitInputs` object.

## Acceptance Criteria

- [ ] Experience question options render with a bold title and a muted description line below it
- [ ] No dash-separated labels in any option
- [ ] `questionText` and `helpText` updated
- [ ] `description` field on `QuestionDefinition` options is typed as optional
- [ ] `SingleChoiceQuestion` forwards `description` to `Selectable`
- [ ] TypeScript and lint pass
- [ ] `experienceLevel` is extracted from questionnaire responses in `buildEngineV1FitInputs()`
- [ ] `experienceLevel` reaches the `FitInputs` object used by `calculateBarDrop()`
- [ ] Existing fit algorithm tests still pass

## Key Files

| File | Change |
|------|--------|
| `convex/questionnaire/questions.ts` | Add `description` to option type; update experience question content |
| `src/components/questionnaire/questions/SingleChoice.tsx` | Pass `description` to `Selectable` |
| `convex/recommendations/seedEngine.ts` | Extract `experience_level` from responses, pass to `FitInputs` |
