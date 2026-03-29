# 01 — Wizard Shell

## Goal
Replace the current step indicator (numbered circles + connecting lines) inside `MeasurementWizard.tsx` with the `QuestionnaireProgressBar` visual style: a slim branded progress bar with step count and percentage, matching the bike fitting questionnaire exactly.

## File to change
`src/components/measurements/MeasurementWizard.tsx`

## What to remove
The `<nav aria-label="Measurement steps">` block (lines ~173–219) — the `<ol>` with numbered circle divs, step title labels, and connecting `<div>` lines between them. Replace the entire `<nav>` block with the new progress bar below.

Also update the `CardHeader` to be more minimal and visually aligned with the questionnaire:
- Remove the `bg-[color:var(--secondary)]/30` background tint — use plain card header
- Remove the `CardDescription` right-aligned subtitle — not needed when we have the progress bar
- Keep only: step title + the new progress bar

## New CardHeader

```tsx
<CardHeader className="border-b border-[color:var(--border)] px-6 py-5">
  <div className="mb-4 flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--muted)]/50 px-4 py-3">
    <ListChecks className="h-4 w-4 shrink-0 text-[color:var(--primary)]" />
    <span className="text-sm text-[color:var(--muted-foreground)]">
      Step {currentStep} of {steps.length}
    </span>
    <span className="text-[color:var(--border)]">·</span>
    <div className="flex flex-1 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--border)]">
        <div
          className="h-full rounded-full bg-[color:var(--primary)] transition-[width] duration-500 ease-out"
          style={{ width: `${Math.round((currentStep / steps.length) * 100)}%` }}
        />
      </div>
      <span className="shrink-0 text-sm text-[color:var(--muted-foreground)]">
        {Math.round((currentStep / steps.length) * 100)}%
      </span>
    </div>
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">
      {activeStep.category}
    </p>
    <CardTitle className="mt-1 text-xl text-[color:var(--foreground)]">
      {activeStep.title}
    </CardTitle>
  </div>
</CardHeader>
```

## Updated `steps` array
Add a `category` field to the steps for the small subtitle label above the title:

```typescript
const steps = [
  {
    id: 1,
    title: "Body Measurements",
    description: "Height and inseam",
    category: "Rider Profile · Step 1 of 4",
  },
  {
    id: 2,
    title: "Advanced Measurements",
    description: "Torso, arms, shoulders",
    category: "Rider Profile · Step 2 of 4",
  },
  {
    id: 3,
    title: "Flexibility",
    description: "Hamstring mobility test",
    category: "Rider Profile · Step 3 of 4",
  },
  {
    id: 4,
    title: "Core Stability",
    description: "Plank hold test",
    category: "Rider Profile · Step 4 of 4",
  },
];
```

## Import to add
```tsx
import { ListChecks, ChevronLeft, ChevronRight, Check } from "lucide-react";
```
(Replace the existing `Check, ChevronLeft, ChevronRight` import line with this.)

## Remove from CardContent
Remove the entire `<nav aria-label="Measurement steps">…</nav>` block and the `mb-8` spacing it was inside. The `<form>` starts directly after `<CardContent className="px-6 py-6">`.

## Navigation buttons — verify they match questionnaire
The existing buttons already match. Confirm they are:
```tsx
// Previous
<Button type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
  <ChevronLeft className="mr-1 h-4 w-4" />
  {messages.questionnaire.actions.previous}
</Button>

// Next
<Button type="button" onClick={handleNext}>
  {messages.questionnaire.actions.next}
  <ChevronRight className="ml-1 h-4 w-4" />
</Button>

// Save (last step)
<Button type="submit" isLoading={isSubmitting} disabled={!formState.isValid}>
  {messages.common.save}
  <Check className="ml-1 h-4 w-4" />
</Button>
```
If they already look like this, no change needed.

## Acceptance criteria
- Old numbered circle step indicator is removed
- New progress bar shows: step count text · thin branded bar · percentage
- Bar animates smoothly when advancing between steps (500ms ease-out)
- Card header shows a small category label + large step title, no right-aligned subtitle
- Previous/Next/Save buttons unchanged
- `npm run build:vercel` passes
