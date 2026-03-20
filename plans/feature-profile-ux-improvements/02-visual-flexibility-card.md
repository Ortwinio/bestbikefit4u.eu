# Step 02 — Visual Flexibility Card

## Goal

Replace the plain text "Good" on the flexibility card with a visually engaging display: a coloured progress bar across 5 levels, the level label with a short description, a quick inline edit, and a "How to improve" link.

## Current State

The flexibility card in `ProfileSummary` (profile/page.tsx:120-138) shows:
```tsx
<div className="text-3xl font-bold text-green-600 capitalize">
  {profile.flexibilityScore?.replace("_", " ")}
</div>
<p className="text-sm text-gray-500 mt-2">
  {messages.profile.flexibility.helper}
</p>
```

No visual, no edit, no guidance.

## New Flexibility Card Design

### Visual Scale Component

Create `src/components/profile/FlexibilityScale.tsx`:

```tsx
// Maps score to a 1-5 index for the progress bar and colour
const FLEXIBILITY_LEVELS = [
  { score: "very_limited", index: 1, color: "var(--danger)" },
  { score: "limited",      index: 2, color: "var(--warning)" },
  { score: "average",      index: 3, color: "var(--warning)" },
  { score: "good",         index: 4, color: "var(--success)" },
  { score: "excellent",    index: 5, color: "var(--success)" },
];
```

Display elements:
1. **Label row**: `{label}` on the left (e.g. "Good"), `{index}/5` on the right
2. **Progress bar**: Use the `Progress` component from `@/components/ui`, value `(index / 5) * 100`, with the colour applied via `style={{ "--progress-indicator-color": color } as CSSProperties}`
3. **Description line**: The `description` from `flexibilityTests` (e.g. "Can reach toes when seated")
4. **Test result chip**: The `testResult` value (e.g. "Reach toes") in a small badge

### Card Actions Row

Below the scale in the flexibility card:

```tsx
<div className="mt-4 flex items-center justify-between">
  <Button variant="ghost" size="sm" onClick={() => setEditingFlexibility(true)}>
    <Edit2 className="h-4 w-4 mr-1" />
    {messages.profile.flexibility.editButton}
  </Button>
  <Link href={withLocalePrefix("/profile/improve/flexibility", locale)}>
    <Button variant="ghost" size="sm">
      {messages.profile.flexibility.improveLink}
      <ArrowRight className="h-4 w-4 ml-1" />
    </Button>
  </Link>
</div>
```

### Quick-Edit Inline Panel

When `editingFlexibility` is true, replace the card content with:

1. The test instructions (same blue info box from `StepFlexibility`)
2. The 5 `Selectable` cards (same as the wizard step)
3. Save / Cancel buttons

On save:
- Call `upsertProfile({ flexibilityScore: newScore })`
- Show toast on success
- Collapse the edit panel

The instructions text should be in i18n (Step 05). For now, reference the existing hardcoded content from `StepFlexibility.tsx` as the source.

### Impact on Riding Position Note

Below the quick-edit (or in the collapsed view), keep the existing "How this affects your fit" note, but move it to a collapsible `<details>` element or a `Tooltip` so it does not clutter the default view.

## State Management

Add to `ProfileSummary` (or lift to `ProfilePage`):
```ts
const [editingFlexibility, setEditingFlexibility] = useState(false);
```

The mutation call stays in `ProfilePage.handleSaveProfile` (or a new dedicated `handleSaveFlexibility` function that calls `upsertProfile` with just the flexibility score).

## Colour Tokens

Use the existing CSS variable tokens from `globals.css`:
- `--danger` (oklch warm red) — score 1
- `--warning` (oklch amber) — scores 2-3
- `--success` (oklch green) — scores 4-5

This respects dark/light mode automatically.

## i18n Keys Needed (Step 05 will add them)

```
profile.flexibility.editButton
profile.flexibility.improveLink
profile.flexibility.levelLabel          // "{label} ({index}/5)"
profile.flexibility.testInstructions.title
profile.flexibility.testInstructions.step1
profile.flexibility.testInstructions.step2
profile.flexibility.testInstructions.step3
profile.flexibility.testInstructions.step4
profile.flexibility.impactTitle
profile.flexibility.impactDescription
profile.flexibility.saveButton
```

## Acceptance Criteria

- [ ] Flexibility card shows a coloured horizontal progress bar at 5 levels
- [ ] Colour reflects the level (amber for limited, green for good/excellent)
- [ ] Label and description from `flexibilityTests` are displayed below the bar
- [ ] "Edit" button opens an inline selector with test instructions and the 5 selectable options
- [ ] Saving an updated score calls `upsertProfile` and shows a toast
- [ ] Cancel returns to the read view without saving
- [ ] "How to improve your flexibility →" link navigates to the guide page
- [ ] Both light and dark mode display correctly using CSS variable colours
