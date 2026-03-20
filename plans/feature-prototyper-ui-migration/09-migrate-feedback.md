# 09 — Rebuild Progress and Feedback Components

## Goal

Rebuild `Progress`, `States`, and questionnaire `ProgressBar` so they sit on top of copied Prototyper `progress` source and consistent token styling.

## Background

`Progress.tsx` is currently still a wrapper. `States.tsx` and `src/components/questionnaire/ProgressBar.tsx` are still custom compositions. This step finishes that layer.

## Steps

### 1. Replace `src/components/ui/Progress.tsx`

Use copied Prototyper `progress` source as the base implementation. Keep any wrapper logic minimal.

### 2. Update `States.tsx`

Rebuild:

- `LoadingState`
- `EmptyState`
- `ErrorState`

Use Prototyper tokens and primitives where appropriate. Preserve `role="alert"` for error state.

### 3. Replace `src/components/questionnaire/ProgressBar.tsx`

Rebuild the questionnaire progress bar on top of the migrated `Progress` primitive while preserving the current props:

- `current`
- `total`
- `estimatedMinutes?`
- `className?`

Keep current labels and percentage behavior intact.

### 4. Audit consumers of states and progress

Update consumers only if the rebuilt components cannot preserve current contracts.

### 5. Update barrel exports

Ensure `Progress`, `LoadingState`, `EmptyState`, and `ErrorState` remain exported correctly.

## Acceptance Criteria

- [ ] `Progress.tsx` is now copied Prototyper source or a thin wrapper over it
- [ ] `States.tsx` uses Prototyper UI tokens/components where appropriate
- [ ] `ProgressBar.tsx` uses Prototyper-backed progress
- [ ] Questionnaire progress renders correctly
- [ ] Loading, empty, and error states render correctly
- [ ] `ProgressBar` preserves `current/total/estimatedMinutes` behavior
- [ ] `ErrorState` still exposes `role="alert"`
- [ ] `npm run typecheck` passes
