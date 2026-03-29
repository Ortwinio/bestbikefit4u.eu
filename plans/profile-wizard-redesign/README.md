# Plan: Profile Wizard Redesign

## Goal
Redesign the 4-step rider profile wizard (Body Measurements → Advanced → Flexibility → Core Stability) to match the visual quality and UX conventions of the bike fitting questionnaire. Add clear explanatory copy at each step, use the `FlexibilityScale` and `CoreStabilityBar` cards from My Profile as live interactive previews, apply the brand progress bar, styled navigation buttons, and tooltip patterns.

## Background
The wizard (`src/components/measurements/MeasurementWizard.tsx`) already exists and works correctly. Its visual design lags behind the questionnaire flow:

| Feature | Questionnaire | Current Wizard | Target |
|---------|--------------|----------------|--------|
| Progress bar | `QuestionnaireProgressBar` — thin primary bar + clock + % text | `Progress` component under a plain header | Same as questionnaire |
| Step indicators | Single question at a time, no dots | Numbered circles + connecting lines inside content area | Minimal — just "Step X of 4" text + bar |
| Navigation | Outline Previous (ChevronLeft) + Primary Next (ChevronRight) | Same buttons, same icons — already correct | No change needed |
| Contextual "why" text | HelpCircle info box above each question | Plain `<p>` intro + small explainer box at bottom | Prominent `InfoBox variant="primary"` at top of each step with bike-fit relevance |
| Tooltips | `SingleChoiceTooltipQuestion` tooltip panel | `NumberInput tooltip` prop string only | Rich tooltip panels on all selection options |
| Measurement info boxes | — | Plain `bg-secondary/35` divs | `InfoBox variant="secondary"` |
| Ratio warning | — | Ad-hoc orange div | `InfoBox variant="warning"` |
| Flexibility display | — | Radio cards only | Radio cards + live `FlexibilityScale` preview of selected value |
| Core stability display | — | Radio cards only | Radio cards + live `CoreStabilityBar` preview of selected value |

## Architecture
All changes are in `src/components/measurements/` — no backend, no data model, no i18n changes required. The wizard is already wired correctly; this is a pure visual and copy redesign.

```
src/components/measurements/
├── MeasurementWizard.tsx          ← header/progress bar/step indicator
├── StepBodyMeasurements.tsx       ← step 1
├── StepAdvancedMeasurements.tsx   ← step 2
├── StepFlexibility.tsx            ← step 3
└── StepCoreStability.tsx          ← step 4
```

## Design Reference: Questionnaire patterns to adopt

### Progress bar (from `QuestionnaireProgressBar.tsx`)
```tsx
<div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-muted/50 px-4 py-3">
  <Clock className="h-4 w-4 shrink-0 text-primary" />
  <span className="text-sm text-muted-foreground">Step {n} of 4</span>
  <span className="text-border">·</span>
  <div className="flex flex-1 items-center gap-2">
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
      <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
           style={{ width: `${(currentStep / 4) * 100}%` }} />
    </div>
    <span className="shrink-0 text-sm text-muted-foreground">{Math.round((currentStep / 4) * 100)}%</span>
  </div>
</div>
```

### "Why this matters" intro box (from `QuestionRenderer.tsx` help text pattern)
```tsx
<InfoBox variant="primary" icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}>
  <p className="font-medium">Why we need this for your bike fit</p>
  <p className="mt-1 text-[color:var(--muted-foreground)]">{explanation}</p>
</InfoBox>
```

### Measurement instruction box (from `StepBodyMeasurements.tsx` converted)
```tsx
<InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
  <p className="font-medium">How to measure</p>
  <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">…</ul>
</InfoBox>
```

### Live score preview (new pattern)
After the user selects a flexibility or stability option, show the profile card component as a real-time preview:
```tsx
{selectedScore && (
  <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">
      Your result
    </p>
    <FlexibilityScale score={selectedScore} />
  </div>
)}
```

## Scope

**In scope:**
- `MeasurementWizard.tsx` — replace step indicator with `QuestionnaireProgressBar`-style bar; remove numbered circles
- `StepBodyMeasurements.tsx` — add prominent "why" intro box; convert info boxes to `InfoBox`; convert warning to `InfoBox variant="warning"`
- `StepAdvancedMeasurements.tsx` — add prominent "why" intro box; convert info boxes to `InfoBox`; improve per-field explanations
- `StepFlexibility.tsx` — add prominent "why" intro box; convert instruction box to `InfoBox`; add live `FlexibilityScale` preview of currently selected score
- `StepCoreStability.tsx` — add prominent "why" intro box; convert instruction box to `InfoBox`; add live `CoreStabilityBar` preview of currently selected score

**Out of scope:**
- Navigation button style — already correct (matches questionnaire)
- Data model, schema, validation logic
- i18n / translation strings (keep English inline text for now, consistent with existing steps)
- The `ProfileImproveGuideClient` improve pages
- Comfort or pain questions (separate flow)

## Prompts
- `01-wizard-shell.md` — Replace step indicator in `MeasurementWizard.tsx` with questionnaire-style progress bar
- `02-step-body-measurements.md` — Redesign Step 1 with intro box, `InfoBox` instructions, and warning
- `03-step-advanced-measurements.md` — Redesign Step 2 with intro box and `InfoBox` instructions
- `04-step-flexibility.md` — Redesign Step 3 with intro box, `InfoBox` test instructions, and live `FlexibilityScale` preview
- `05-step-core-stability.md` — Redesign Step 4 with intro box, `InfoBox` test instructions, and live `CoreStabilityBar` preview

## Progress
- [ ] 01 Wizard shell
- [ ] 02 Step 1 — Body Measurements
- [ ] 03 Step 2 — Advanced Measurements
- [ ] 04 Step 3 — Flexibility
- [ ] 05 Step 4 — Core Stability
