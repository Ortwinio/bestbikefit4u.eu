# 03 — Migrate Button

## Goal

Replace `src/components/ui/Button.tsx` with the Prototyper UI `button` component and update all consumers.

## Background

The current `Button.tsx` has variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`. The Prototyper UI button also has gradient variants. Map existing variants to the closest Prototyper UI equivalents.

## Steps

### 1. Audit current Button usage

Search for all imports of the current Button:
```
grep -r "from.*components/ui/Button\|from.*ui/Button\|from.*ui'" --include="*.tsx" --include="*.ts" src/
```

Also check `src/components/ui/index.ts` to see if Button is re-exported.

### 2. Understand current variant API

Read `src/components/ui/Button.tsx` to capture:
- Prop interface (variant, size, loading state, disabled, etc.)
- All variant names

### 3. Read the Prototyper UI button

Use `mcp__prototyper-ui__get_component` with name `"button"` to read its full API.

### 4. Replace the file

Delete `src/components/ui/Button.tsx` and replace it with the Prototyper UI button source, adjusted as needed:
- Keep the same export name `Button` (or re-export it as such)
- If variant names differ, create a thin adapter or rename the variants

### 5. Update consumers

Update every file that imports `Button` to use the new variant names if they changed. Common consumers:
- Layout components (`Header.tsx`, `DashboardSidebar.tsx`, etc.)
- Auth components (`UserMenu.tsx`)
- Feature components (measurement wizard, questionnaire, bike forms, pressure wizard)
- Page files in `src/app/`

### 6. Update `src/components/ui/index.ts`

Ensure `Button` is still exported from the barrel file.

## Acceptance Criteria

- [ ] Old `Button.tsx` replaced with Prototyper UI version
- [ ] All consumers compile without errors
- [ ] All button variants render correctly in dev mode
- [ ] `npm run type-check` passes
