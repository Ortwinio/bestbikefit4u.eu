# 04 — Rebuild Input and FieldLabel

## Goal

Rebuild `Input` and `FieldLabel` on top of copied Prototyper `input` and `label` source while preserving the current public contracts.

## Background

This is a high-churn API. Do not force a pure Prototyper consumer refactor in this step unless the wrapper path clearly fails. The current component bundles label, tooltip, helper text, error state, generated ids, and `aria-describedby` wiring. That contract is valuable and should remain stable in phase one.

## Steps

### 1. Audit current usage

Find every `Input` and `FieldLabel` consumer and note reliance on:

- `label`
- `tooltip`
- `tooltipLabel`
- `error`
- `helperText`
- generated ids
- current `aria-describedby` behavior

### 2. Replace files

Replace `Input.tsx` with a Prototyper-backed compatibility wrapper. Preserve:

- `label`
- `tooltip`
- `tooltipLabel`
- `error`
- `helperText`
- generated `id` fallback
- composed `aria-describedby`

Replace `FieldLabel.tsx` with a Prototyper-backed compatibility wrapper. Preserve:

- `label`
- `htmlFor`
- `tooltip`
- `tooltipLabel`
- `tooltipDescriptionId`

Do not convert consumers to raw Prototyper primitives unless the wrapper approach proves impossible.

### 3. Update consumers

Update consumers only where wrapper compatibility is insufficient.

### 4. Update the barrel export

Ensure `Input` and `FieldLabel` remain exported from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] `Input.tsx` and `FieldLabel.tsx` now wrap copied Prototyper source
- [ ] All form fields render with proper labels and validation states
- [ ] Error messages display correctly
- [ ] Existing `InputProps` and `FieldLabelProps` behavior is preserved or affected consumers are updated
- [ ] `aria-describedby` remains correct for helper text, error text, and tooltip descriptions
- [ ] `npm run typecheck` passes
