# 04 — Migrate Input and FieldLabel

## Goal

Replace `src/components/ui/Input.tsx` and `src/components/ui/FieldLabel.tsx` with Prototyper UI-backed implementations while preserving the current public API unless a consumer migration is explicitly required.

## Background

The current `Input.tsx` is a compound component that bundles a label, tooltip, error message, helper text, generated ids, and `aria-describedby` wiring together. The current `FieldLabel.tsx` is a standalone label with optional tooltip. Prototyper UI separates these concerns: `input` is the raw input primitive, `label` is the label, and `field` / `textfield` are the compound wrappers.

Consider whether to:
- Use `textfield` (full compound: label + input + error) for most form usages
- Use `input` + `label` separately where composition is needed

Read both `input` and `textfield` component docs via `mcp__prototyper-ui__get_component` before deciding.

## Steps

### 1. Audit current usage

```
grep -r "from.*ui/Input\|from.*ui/FieldLabel\|from.*ui'" --include="*.tsx" src/
```

Note how `Input` is used: is the `label` prop always provided? Is `tooltip` commonly used? Is `error` always used? Does any consumer depend on generated ids or existing `aria-describedby` behavior?

### 2. Read Prototyper UI docs

- `mcp__prototyper-ui__get_component` for `"input"`
- `mcp__prototyper-ui__get_component` for `"label"`
- `mcp__prototyper-ui__get_component` for `"textfield"` (compound)
- `mcp__prototyper-ui__get_component` for `"field"` (wrapper)

### 3. Replace files

Replace `Input.tsx` with a Prototyper UI-backed compatibility wrapper. Preserve the current `InputProps` surface first:
- `label`
- `tooltip`
- `tooltipLabel`
- `error`
- `helperText`
- generated `id` fallback
- composed `aria-describedby`

Replace `FieldLabel.tsx` with a Prototyper UI-backed compatibility wrapper. Preserve:
- `label`
- `htmlFor`
- `tooltip`
- `tooltipLabel`
- `tooltipDescriptionId`

Do not convert consumers to raw Prototyper UI primitives unless the wrapper approach proves impossible.

### 4. Update consumers

Main consumers:
- `src/components/measurements/` — all step files use Input for body measurements
- `src/components/questionnaire/questions/NumericQuestion.tsx`
- `src/components/questionnaire/questions/TextQuestion.tsx`
- `src/components/bikes/BikeForm.tsx`
- Any auth or profile pages

Only update consumers where wrapper compatibility is insufficient. Pay attention to label, error, tooltip, helper text, and accessibility behavior.

### 5. Update barrel export

Update `src/components/ui/index.ts` to export the new components.

## Acceptance Criteria

- [ ] Old `Input.tsx` and `FieldLabel.tsx` replaced
- [ ] All form fields render with proper labels and validation states
- [ ] Error messages display correctly
- [ ] Existing `InputProps` and `FieldLabelProps` behavior is preserved or all affected consumers are updated
- [ ] `aria-describedby` remains correct for helper text, error text, and tooltip descriptions
- [ ] `npm run typecheck` passes
