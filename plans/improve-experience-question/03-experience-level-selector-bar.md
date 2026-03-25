# Prompt 03 — Experience Level Selector Bar with Biomechanical Tooltips

## Context

Read the plan README first: `plans/improve-experience-question/README.md`

Replace the generic `Selectable` card list for the experience question with a custom horizontal 3-position selector bar. Each position has a hover tooltip that honestly explains the biomechanical assumptions the engine makes for that level, so the user can make an informed choice.

The answer directly affects bar drop (−10mm / 0 / +5mm) and will also affect confidence score (+2 pts). Being honest about what each level means leads to better fit results.

---

## Step 1 — Create `ExperienceLevelSelector.tsx`

Create file: `src/components/questionnaire/questions/ExperienceLevelSelector.tsx`

### Visual design

A full-width horizontal segmented bar with three equally-sized clickable cells. The three cells share a border, creating one connected bar shape. Selected cell gets the primary color fill. Unselected cells get the secondary background.

Each cell contains:
- A label (Beginner / Intermediate / Advanced)
- A subtitle line in muted text (one-liner that shows without hover)
- A small info icon `(ⓘ)` that triggers a tooltip with the detailed biomechanical explanation on hover/focus

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Beginner  ⓘ   │ Intermediate  ⓘ │   Advanced  ⓘ   │
│  Comfort first  │    Balanced     │   Performance   │
└─────────────────┴─────────────────┴─────────────────┘
```

### Tooltip content (biomechanical, honest)

**Beginner tooltip:**
> We assume lower baseline flexibility and core stability, which is completely normal. Your fit will be more upright: less hip closure, less lower-back strain, and a saddle-to-bar height difference that is easier to sustain. Choosing this if it does not match your body leads to a position that may feel too relaxed and reduce pedalling efficiency.

**Intermediate tooltip:**
> Average flexibility and core strength. Your fit uses a neutral handlebar position — neither aggressive nor fully upright. This suits most regular riders doing multi-hour rides on varied terrain. The engine applies no modifier to bar drop for this level.

**Advanced tooltip:**
> Higher tolerance for hip closure, fuller knee extension at the bottom of the pedal stroke, and the core strength to hold an aerodynamic posture for extended periods. Your fit will be more aggressive — lower bars, longer reach. Be honest: if your core and flexibility do not support this, the position will cause discomfort within the first 30 minutes.

### Component code structure

```tsx
"use client";

import { cn } from "@/utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/prototyper-ui/ui/tooltip";
import { Info } from "lucide-react";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

interface ExperienceLevelSelectorProps {
  value: ExperienceLevel | null;
  onChange: (value: ExperienceLevel) => void;
}

const LEVELS: {
  value: ExperienceLevel;
  label: string;
  subtitle: string;
  tooltip: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    subtitle: "Comfort first",
    tooltip:
      "We assume lower baseline flexibility and core stability, which is completely normal. Your fit will be more upright: less hip closure, less lower-back strain, and a saddle-to-bar height difference that is easier to sustain. Choosing this if it does not match your body leads to a position that may feel too relaxed and reduce pedalling efficiency.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    subtitle: "Balanced",
    tooltip:
      "Average flexibility and core strength. Your fit uses a neutral handlebar position — neither aggressive nor fully upright. This suits most regular riders doing multi-hour rides on varied terrain. The engine applies no modifier to bar drop for this level.",
  },
  {
    value: "advanced",
    label: "Advanced",
    subtitle: "Performance",
    tooltip:
      "Higher tolerance for hip closure, fuller knee extension at the bottom of the pedal stroke, and the core strength to hold an aerodynamic posture for extended periods. Your fit will be more aggressive — lower bars, longer reach. Be honest: if your core and flexibility do not support this, the position will cause discomfort within the first 30 minutes.",
  },
];

export function ExperienceLevelSelector({
  value,
  onChange,
}: ExperienceLevelSelectorProps) {
  return (
    <TooltipProvider delay={150} closeDelay={50}>
      <div
        role="radiogroup"
        aria-label="Cycling experience level"
        className="flex w-full overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]"
      >
        {LEVELS.map((level, index) => {
          const isSelected = value === level.value;
          const isFirst = index === 0;
          const isLast = index === LEVELS.length - 1;

          return (
            <button
              key={level.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(level.value)}
              className={cn(
                "group relative flex flex-1 flex-col items-center gap-1 px-3 py-4 text-center transition-colors duration-150 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--primary)]",
                !isFirst && "border-l border-[color:var(--border)]",
                isSelected
                  ? "bg-[color:color-mix(in_oklch,var(--primary)_14%,var(--card)_86%)] text-[color:var(--foreground)]"
                  : "bg-[color:var(--card)] text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
              )}
            >
              {/* Selected indicator bar at top */}
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-0.5 transition-colors duration-150",
                  isSelected
                    ? "bg-[color:var(--primary)]"
                    : "bg-transparent"
                )}
              />

              {/* Label + info icon row */}
              <span className="flex items-center gap-1.5">
                <span className={cn(
                  "text-sm font-semibold",
                  isSelected && "text-[color:var(--foreground)]"
                )}>
                  {level.label}
                </span>

                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    aria-label={`More about ${level.label}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)] focus-visible:outline-2 focus-visible:outline-[color:var(--primary)]"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    className="max-w-[260px] text-xs leading-relaxed"
                  >
                    {level.tooltip}
                  </TooltipContent>
                </Tooltip>
              </span>

              {/* Subtitle */}
              <span className="text-xs text-[color:var(--muted-foreground)]">
                {level.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
```

### Styling notes
- No hardcoded colors — all use CSS variables
- The selected indicator is a 2px primary-colored top border on the cell
- The info icon tooltip stops click propagation so clicking the icon doesn't simultaneously select the cell
- `role="radiogroup"` + `role="radio"` + `aria-checked` gives full keyboard/screen-reader accessibility

---

## Step 2 — Hook it into `QuestionRenderer.tsx`

In `src/components/questionnaire/QuestionRenderer.tsx`, add a special case for the `experience_level` question. This question has a known `questionId` and a well-defined set of values — it should use the custom selector instead of the generic single-choice cards.

Add import:
```ts
import { ExperienceLevelSelector } from "./questions/ExperienceLevelSelector";
```

Inside the `<div className="mt-6">` block, add before the existing `single_choice` branch:

```tsx
{question.questionId === "experience_level" && (
  <ExperienceLevelSelector
    value={(value as "beginner" | "intermediate" | "advanced") ?? null}
    onChange={onChange}
  />
)}

{question.responseType === "single_choice" &&
  question.options &&
  question.questionId !== "experience_level" && (
    <SingleChoiceQuestion ... />
)}
```

This keeps the existing `SingleChoiceQuestion` for all other single-choice questions.

---

## Step 3 — Update question copy

In `convex/questionnaire/questions.ts`, update the `experience_level` question text and help text to match the honest framing:

```ts
questionText: "What best describes your cycling experience?",
helpText:
  "This sets the physical baseline for your fit. Be honest — choosing a level that doesn't match your body will produce a position that is uncomfortable or inefficient.",
```

The option labels and descriptions from the `experience_level` definition are not rendered by the new component (it uses its own hardcoded copy with the biomechanical detail). The `label` values in the definition remain as-is for backend/response storage purposes.

---

## Step 4 — TypeScript and lint

```bash
cd /Users/ortwinverreck/Developer/bestbikefit4u && npm run typecheck 2>&1 | tail -10
cd /Users/ortwinverreck/Developer/bestbikefit4u && npm run lint 2>&1 | grep -E "error" | head -20
```

---

## Acceptance Criteria

- [ ] The experience question renders a horizontal 3-cell bar, not stacked cards
- [ ] Clicking a cell selects it (primary accent top border + background tint)
- [ ] Hovering the ⓘ icon shows a tooltip with the biomechanical explanation
- [ ] Tooltip explains: flexibility/core assumptions for beginner; neutral for intermediate; hip closure/knee extension/aerodynamic posture tolerance for advanced
- [ ] All other single-choice questions still use the card layout
- [ ] No hardcoded colors anywhere in the new component
- [ ] `role="radiogroup"` / `role="radio"` / `aria-checked` present
- [ ] TypeScript clean
