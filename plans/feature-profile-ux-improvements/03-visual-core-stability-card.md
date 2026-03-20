# Step 03 — Visual Core Stability Card

## Goal

Replace the "3/5" plain text on the core stability card with a 5-segment visual indicator, a level label with plank hold description, a quick inline edit (plank test re-test), and a "How to improve" link.

## Current State

Core stability card in `ProfileSummary` (profile/page.tsx:140-158):
```tsx
<div className="text-3xl font-bold text-purple-600">
  {profile.coreStabilityScore}/5
</div>
<p className="text-sm text-gray-500 mt-2">
  {messages.profile.coreStability.helper}
</p>
```

Same issues as flexibility: plain, no visual, no edit, no guidance.

## New Core Stability Card Design

### Visual Segment Bar Component

Create `src/components/profile/CoreStabilityBar.tsx`:

Rather than a continuous progress bar, use a 5-segment indicator:

```tsx
// Five discrete blocks, each coloured if score >= segment index
{[1, 2, 3, 4, 5].map((segment) => (
  <div
    key={segment}
    className="h-3 flex-1 rounded-sm"
    style={{
      backgroundColor: segment <= score
        ? getSegmentColor(score)
        : "var(--muted)",
    }}
  />
))}
```

Segment colour by score:
- Score 1: `var(--danger)` (1 red segment)
- Score 2: `var(--warning)` (2 amber segments)
- Score 3: `var(--warning)` (3 amber segments)
- Score 4: `var(--success)` (4 green segments)
- Score 5: `var(--success)` (5 green segments)

Below the bar:
- **Score label**: from `coreStabilityTests[score - 1].label` (e.g. "Good")
- **Plank duration**: from `coreStabilityTests[score - 1].description` (e.g. "Plank hold 60-90 seconds")
- **Score chip**: `{score}/5` in a small badge

### Card Actions Row

```tsx
<div className="mt-4 flex items-center justify-between">
  <Button variant="ghost" size="sm" onClick={() => setEditingCoreStability(true)}>
    <Edit2 className="h-4 w-4 mr-1" />
    {messages.profile.coreStability.editButton}
  </Button>
  <Link href={withLocalePrefix("/profile/improve/core-stability", locale)}>
    <Button variant="ghost" size="sm">
      {messages.profile.coreStability.improveLink}
      <ArrowRight className="h-4 w-4 ml-1" />
    </Button>
  </Link>
</div>
```

### Quick-Edit Inline Panel

When `editingCoreStability` is true, replace the card content with:

1. The plank test instructions (same blue box from `StepCoreStability`, with the `Timer` icon)
2. The 5 `Selectable` cards (same as the wizard step, with the circular score badge as `trailing`)
3. Save / Cancel buttons

On save:
- Call `upsertProfile({ coreStabilityScore: newScore })`
- Show toast on success
- Collapse edit panel

### Icon Choice

The existing card uses `User` from lucide-react. Consider changing to `Dumbbell` or `Zap` to better represent core strength. Keep it consistent with the section purpose.

## State Management

Add to `ProfileSummary` or `ProfilePage`:
```ts
const [editingCoreStability, setEditingCoreStability] = useState(false);
```

## i18n Keys Needed (Step 05 will add them)

```
profile.coreStability.editButton
profile.coreStability.improveLink
profile.coreStability.levelLabel         // "{label} • {description}"
profile.coreStability.testInstructions.title
profile.coreStability.testInstructions.step1
profile.coreStability.testInstructions.step2
profile.coreStability.testInstructions.step3
profile.coreStability.testInstructions.step4
profile.coreStability.testInstructions.step5
profile.coreStability.impactTitle
profile.coreStability.impactDescription
profile.coreStability.saveButton
```

## Acceptance Criteria

- [ ] Core stability card shows a 5-segment horizontal bar filled proportionally to the score
- [ ] Segments are coloured by level (red at 1, amber at 2-3, green at 4-5)
- [ ] Score label and plank duration description are displayed below the bar
- [ ] "Edit" button opens an inline selector with plank test instructions and the 5 selectable options
- [ ] Each option shows the circular score badge on the trailing side (matching the wizard)
- [ ] Saving calls `upsertProfile` and shows a success toast
- [ ] "How to improve your core stability →" links to the guide page
- [ ] Dark/light mode renders correctly via CSS variable colours
