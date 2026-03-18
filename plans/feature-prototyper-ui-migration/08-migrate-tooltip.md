# 08 — Migrate Tooltip

## Goal

Replace `src/components/ui/Tooltip.tsx` with the Prototyper UI `tooltip` component and update all consumers.

## Background

The current `Tooltip.tsx` is a simple hover tooltip. The Prototyper UI `tooltip` is built on `@base-ui/react` with proper accessibility (ARIA described-by) and animation.

Tooltip is also used inside `Input.tsx` and `FieldLabel.tsx` — since those were already replaced in prompt 04, check if Tooltip was inlined there or still imported separately.

## Steps

### 1. Audit current usage

```
grep -r "from.*ui/Tooltip\|<Tooltip" --include="*.tsx" src/
```

Note all direct usages.

### 2. Read Prototyper UI tooltip

Use `mcp__prototyper-ui__get_component` with `"tooltip"` to read the full API.

### 3. Replace `Tooltip.tsx`

Replace with the Prototyper UI tooltip source. Keep the export name `Tooltip`. The Prototyper UI tooltip uses a provider/trigger/content pattern — create a simple `Tooltip` wrapper that accepts `content` and `children` props if needed to minimize API changes.

### 4. Update consumers

Update all `<Tooltip>` usages to the new API.

### 5. Update barrel export

Ensure `Tooltip` is exported from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] Old `Tooltip.tsx` replaced
- [ ] Tooltips appear on hover/focus
- [ ] ARIA `aria-describedby` is correctly set
- [ ] `npm run type-check` passes
