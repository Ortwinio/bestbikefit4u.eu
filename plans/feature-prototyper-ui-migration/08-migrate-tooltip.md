# 08 — Replace Tooltip Wrapper

## Goal

Replace `src/components/ui/Tooltip.tsx` with copied Prototyper tooltip source or the thinnest possible wrapper over it.

## Background

The current tooltip is conceptually close, but the migration is incomplete until the implementation is actually backed by copied Prototyper source.

## Steps

### 1. Audit current usage

Find all direct `Tooltip` usages and confirm whether `Input` or `FieldLabel` still depend on it internally.

### 2. Replace `Tooltip.tsx`

Use copied Prototyper `tooltip` source as the base implementation. Keep local wrapper logic only if needed to preserve a simpler `content + children` API.

### 3. Update consumers

Update consumers where the wrapper API cannot fully preserve current behavior.

### 4. Update the barrel export

Ensure `Tooltip` remains exported from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] `Tooltip.tsx` is now copied Prototyper source or a small wrapper over it
- [ ] Tooltips appear on hover and focus
- [ ] ARIA `aria-describedby` is correctly set
- [ ] `npm run typecheck` passes
