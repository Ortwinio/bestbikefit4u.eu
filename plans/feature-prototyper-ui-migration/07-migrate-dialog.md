# 07 — Rebuild AccessibleDialog

## Goal

Rebuild `src/components/ui/AccessibleDialog.tsx` on top of copied Prototyper `dialog` source while preserving the current controlled API.

## Background

This is a high-churn API. Keep the current shape in phase one:

- `open`
- `title`
- `description`
- `onClose`
- `children`

## Steps

### 1. Audit current usage

Find every `AccessibleDialog` usage and note:

- open/close state management
- title and description usage
- body/footer composition
- expected overlay click behavior
- expected focus return behavior

### 2. Replace `AccessibleDialog.tsx`

Use copied Prototyper `dialog` source under the hood. Keep the existing controlled wrapper API unless a consumer clearly needs more of the raw Prototyper composition model.

### 3. Update consumers

Update consumers only where the compatibility wrapper is insufficient.

### 4. Update the barrel export

Ensure `AccessibleDialog` remains exported from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] `AccessibleDialog.tsx` is now a thin adapter over copied Prototyper dialog source
- [ ] All dialogs open and close correctly
- [ ] Focus management works correctly
- [ ] ESC closes dialogs
- [ ] Overlay click closes dialogs where expected
- [ ] `npm run typecheck` passes
