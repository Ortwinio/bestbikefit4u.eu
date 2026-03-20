# 06 — Replace Custom Card

## Goal

Replace `src/components/ui/Card.tsx` with copied Prototyper card source or a minimal adapter over it.

## Background

`Card.tsx` is still fully custom and still uses local styling glue. This should end with the same named exports backed by actual Prototyper source.

## Steps

### 1. Audit current usage

Find all usages of:

- `Card`
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `CardContent`
- `CardFooter`

Note current variant usage such as `default`, `bordered`, and `elevated`.

### 2. Replace `Card.tsx`

Use copied Prototyper card source as the base implementation and keep the same named exports. Map current variants to the nearest Prototyper styles, adding only thin adapter logic where necessary.

### 3. Update consumers

Update consumers only if the replacement cannot preserve the current API.

### 4. Update the barrel export

Ensure all card exports remain available from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] `Card.tsx` is now copied Prototyper source or a thin adapter over it
- [ ] All card sub-components are present and exported
- [ ] All card usages render correctly
- [ ] `class-variance-authority` is removed from `Card.tsx` if no longer needed
- [ ] `npm run typecheck` passes
