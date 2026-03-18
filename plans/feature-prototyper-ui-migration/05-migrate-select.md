# 05 — Migrate Select

## Goal

Replace `src/components/ui/Select.tsx` with a Prototyper UI-backed implementation while preserving the current public API unless there is a strong reason not to.

## Background

The current `Select.tsx` takes an `options` array prop and also handles `label`, `tooltip`, `tooltipLabel`, `error`, `helperText`, generated ids, and `aria-describedby`. The Prototyper UI `select` is a custom dropdown built on `@base-ui/react` with a different API.

## Steps

### 1. Audit current usage

```
grep -r "from.*ui/Select" --include="*.tsx" src/
```

For each usage, note:
- What options are passed (static array vs. dynamic)
- Whether `label` or `error` props are used
- Whether `tooltip`, `helperText`, and `placeholder` are used
- The `value` / `onChange` binding pattern

### 2. Read Prototyper UI select

Use `mcp__prototyper-ui__get_component` with `"select"` to read the full API.

### 3. Replace `Select.tsx`

Replace with Prototyper UI select source. Because the API changes from an `options` array to declarative children, you have two options:

**Option A (recommended):** Create a compatibility wrapper that accepts the same current props and renders Prototyper UI internals. Preserve:
- `options: { value, label, disabled? }[]`
- `placeholder`
- `label`
- `tooltip`
- `tooltipLabel`
- `error`
- `helperText`
- existing controlled/uncontrolled usage pattern

**Option B:** Update every consumer to use the declarative API directly.

Choose Option A unless there are very few consumers.

### 4. Update consumers

Main consumer:
- `src/components/bikes/BikeForm.tsx`

### 5. Update barrel export

Ensure `Select` is still exported from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] Old `Select.tsx` replaced with Prototyper UI version
- [ ] All select inputs render and function correctly
- [ ] Options display, selection works, value binding works
- [ ] Existing `SelectProps` compatibility is preserved or the affected consumers are fully updated
- [ ] Keyboard navigation and focus behavior work correctly
- [ ] `npm run typecheck` passes
