# 06 — Migrate Card

## Goal

Replace `src/components/ui/Card.tsx` with the Prototyper UI `card` component and update all consumers.

## Background

The current `Card.tsx` exports `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` with variants `default`, `bordered`, `elevated`. Prototyper UI's card also has variant styles — check how they map.

## Steps

### 1. Audit current usage

```
grep -r "from.*ui/Card\|CardHeader\|CardTitle\|CardContent\|CardFooter" --include="*.tsx" src/
```

Note which sub-components are used and which variants are applied.

### 2. Read Prototyper UI card

Use `mcp__prototyper-ui__get_component` with `"card"` to read the full API and sub-components.

### 3. Replace `Card.tsx`

Replace with the Prototyper UI card source. Keep the same named exports (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) so consumers need minimal changes. Map variants:
- `default` → closest Prototyper UI default
- `bordered` → bordered variant if available, else add custom class
- `elevated` → elevated/shadow variant if available

### 4. Update consumers

Main consumers:
- `src/components/results/` — FitSummaryCard, AdjustmentPriorities, etc.
- `src/components/features/pressure/PressureResultCard.tsx`
- Dashboard and profile pages
- Questionnaire container

### 5. Update barrel export

Ensure all Card sub-components are re-exported from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] Old `Card.tsx` replaced
- [ ] All card sub-components present and exported
- [ ] All card usages render correctly
- [ ] `npm run type-check` passes
