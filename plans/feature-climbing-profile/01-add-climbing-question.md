# 01 — Add climbing question to questionnaire

## Goal
Add "How important is climbing in your riding?" to the questionnaire and wire up its UX using the established tooltip pattern.

## Steps

### 1. Add question to `convex/questionnaire/questions.ts`

Insert after the `current_position_feeling` question (baseOrder 80), before the bike-specific section (baseOrder 90):

```ts
{
  questionId: "climbing_importance",
  category: "position",
  questionText: "How important is climbing in your riding?",
  helpText:
    "Climbing changes how your body interacts with the bike. We adjust your position to improve efficiency, comfort, and control on long or steep climbs.",
  responseType: "single_choice",
  options: [
    { value: "rarely", label: "Rarely climb" },
    { value: "occasional", label: "Occasional climbs" },
    { value: "regular", label: "Regular climbing" },
    { value: "climbing_focused", label: "Climbing-focused" },
  ],
  baseOrder: 85,
  isRequired: false,
},
```

### 2. Add to `QuestionRenderer.tsx`

Wire up `SingleChoiceTooltipQuestion` for `climbing_importance` with the following tooltips:

```ts
tooltips={{
  rarely:
    "On flat terrain, we can optimize your position for aerodynamics and speed with a lower and more stretched setup.",
  occasional:
    "A balanced position helps you stay efficient on flats while remaining comfortable on short climbs.",
  regular:
    "Climbing requires efficient power transfer and comfort in a more upright position. We adjust your setup to reduce strain during sustained efforts.",
  climbing_focused:
    "Long climbs demand an open hip angle and stable posture. We optimize your position for seated climbing efficiency and reduced fatigue.",
}}
```

Exclude `climbing_importance` from the generic `SingleChoiceQuestion` fallback.

### 3. Add illustration

Check `public/` for a climbing-specific illustration. If `climbing.png` or similar exists, add it to `QuestionRenderer` for `climbing_importance` using the same `<Image>` block pattern as `road_riding_type` and `mtb_terrain`.

### 4. Update contract test

In `convex/questionnaire/__tests__/completeQuestionnaire.contract.test.ts`, the existing test does not need to include `climbing_importance` since it is not required. No change needed.

## Acceptance criteria
- [ ] Question appears in the questionnaire flow
- [ ] Tooltip panel shows the correct text for each selected option
- [ ] Skipping the question (it is optional) does not break the flow
