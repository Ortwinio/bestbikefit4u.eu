# 09 — Migrate Feedback Components

## Goal

Replace `src/components/ui/States.tsx` and `src/components/questionnaire/ProgressBar.tsx` with implementations that use Prototyper UI tokens and, where appropriate, the `progress` component without breaking current contracts.

## Background

`States.tsx` exports `LoadingState`, `EmptyState`, and `ErrorState` — visual display components for async states. The loading state typically shows a spinner or skeleton. The Prototyper UI `progress` component (with indeterminate mode) can power the loading state.

`ProgressBar.tsx` in the questionnaire renders a localized completion bar. Replace the visual implementation with the Prototyper UI `progress` while preserving the real current props contract.

## Steps

### 1. Read Prototyper UI progress

Use `mcp__prototyper-ui__get_component` with `"progress"` to understand the API, particularly indeterminate mode.

### 2. Update `States.tsx`

- `LoadingState`: Replace custom spinner/skeleton with `<Progress value={null} />` (indeterminate) only if the result still reads clearly as a loading state; otherwise keep a spinner and migrate styling to the token system
- `EmptyState`: No progress involved — keep as-is or apply design token classes for consistency
- `ErrorState`: No progress involved — keep as-is with design token classes

### 3. Replace `src/components/questionnaire/ProgressBar.tsx`

Replace the custom progress bar implementation with the Prototyper UI `progress` component. Keep the same real props interface so `QuestionnaireContainer.tsx` needs no changes:
- `current: number`
- `total: number`
- `estimatedMinutes?: number`
- `className?: string`

Preserve the localized label and percentage text that the current component renders.

### 4. Audit consumers of States

```
grep -r "LoadingState\|EmptyState\|ErrorState" --include="*.tsx" src/
```

No API changes are expected so consumers should not need updates.

### 5. Update barrel exports

Ensure `LoadingState`, `EmptyState`, `ErrorState` are still exported from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] `States.tsx` uses Prototyper UI tokens/components where appropriate
- [ ] `ProgressBar.tsx` uses Prototyper UI `progress`
- [ ] Questionnaire progress bar renders correctly
- [ ] Loading, empty, and error states render correctly
- [ ] `ProgressBar` preserves `current/total/estimatedMinutes` behavior
- [ ] `ErrorState` still exposes `role="alert"`
- [ ] `npm run typecheck` passes
