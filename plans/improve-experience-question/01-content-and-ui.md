# Prompt 01 — Content and UI improvements

## Context

Read the plan README first: `plans/improve-experience-question/README.md`

The goal is to split option labels into a title + description, update the question copy, and wire the `description` through the UI component.

## Step 1 — Extend the option type in `questions.ts`

File: `convex/questionnaire/questions.ts`

Add `description?: string` to the options array type in the `QuestionDefinition` interface:

```ts
options?: Array<{
  value: string;
  label: string;
  description?: string;
  followUpQuestionIds?: string[];
}>;
```

Then rewrite the `experience_level` question definition:

```ts
{
  questionId: "experience_level",
  category: "riding_context",
  questionText: "What best describes your cycling experience?",
  helpText:
    "Your experience level adjusts handlebar position and how aggressive or relaxed your fit will be",
  responseType: "single_choice",
  options: [
    {
      value: "beginner",
      label: "Beginner",
      description: "New to cycling, or returning after a long break",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Ride regularly and feel comfortable on most terrain",
    },
    {
      value: "advanced",
      label: "Advanced",
      description:
        "Race or train seriously, and want a performance-oriented position",
    },
  ],
  baseOrder: 10,
  isRequired: true,
},
```

## Step 2 — Update `SingleChoiceQuestion` to forward `description`

File: `src/components/questionnaire/questions/SingleChoice.tsx`

The `Option` interface already has `followUpQuestionIds`. Add `description`:

```ts
interface Option {
  value: string;
  label: string;
  description?: string;
  followUpQuestionIds?: string[];
}
```

Then forward it to `Selectable`:

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

The `Selectable` component already renders `description` as a muted subtitle when provided — no changes to `Selectable.tsx` are needed.

## Step 3 — Verify TypeScript

```bash
cd /Users/ortwinverreck/Developer/bestbikefit4u && npm run typecheck 2>&1 | tail -10
```

Should be clean. Fix any type errors if found.

## Step 4 — Run the relevant unit tests

```bash
cd /Users/ortwinverreck/Developer/bestbikefit4u && npm run test:unit 2>&1 | tail -20
```

Report results.
