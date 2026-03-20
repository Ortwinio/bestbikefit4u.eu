# 05 — Rebuild Select

## Goal

Rebuild `src/components/ui/Select.tsx` on top of copied Prototyper `select` source while preserving the current consumer contract in phase one.

## Background

The current `Select.tsx` is already a wrapper over Base UI, but it is not a copied Prototyper component. This prompt converts it into a thin compatibility adapter over actual Prototyper source.

## Steps

### 1. Audit current usage

For each `Select` usage, note:

- the `options` shape
- `placeholder` usage
- controlled versus uncontrolled value binding
- `label`, `tooltip`, `error`, and `helperText` usage

### 2. Replace `Select.tsx`

Use copied Prototyper `select` source under the hood. Preserve the current wrapper contract where possible:

- `options: { value, label, disabled? }[]`
- `placeholder`
- `label`
- `tooltip`
- `tooltipLabel`
- `error`
- `helperText`
- current controlled/uncontrolled usage

### 3. Update consumers

Update consumers only where the compatibility adapter cannot preserve existing behavior.

### 4. Update the barrel export

Ensure `Select` remains exported from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] `Select.tsx` is now a thin adapter over copied Prototyper select source
- [ ] All select inputs render and function correctly
- [ ] Options display, selection works, and value binding works
- [ ] Existing `SelectProps` compatibility is preserved or affected consumers are updated
- [ ] Keyboard navigation and focus behavior work correctly
- [ ] `npm run typecheck` passes
