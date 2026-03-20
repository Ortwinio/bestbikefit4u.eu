# 03 — Replace Custom Button

## Goal

Replace `src/components/ui/Button.tsx` with copied Prototyper button source or a very thin adapter over it.

## Background

`Button.tsx` is still fully custom and still uses `class-variance-authority`. This is one of the clearest examples of migration glue that should go away once Prototyper source is in place.

## Steps

### 1. Audit current Button usage

Search for all imports of the current Button and note which variants, sizes, and loading states are used.

### 2. Preserve only the public contract that matters

Use the copied Prototyper button source as the base implementation:

- keep the public export name `Button`
- preserve `isLoading` if consumers use it
- map current variants and sizes to the nearest Prototyper equivalents
- avoid keeping styling logic that the copied source already provides

### 3. Replace the file

Rebuild `src/components/ui/Button.tsx` so it is either:

- the copied Prototyper source with minimal local edits, or
- a thin adapter over the copied Prototyper source

### 4. Update consumers

Update consumers only where the compatibility surface is not sufficient.

### 5. Update the barrel export

Ensure `Button` remains exported from `src/components/ui/index.ts`.

## Acceptance Criteria

- [ ] `Button.tsx` is now copied Prototyper source or a thin adapter over it
- [ ] All consumers compile without errors
- [ ] Legacy `isLoading` behavior is preserved if required
- [ ] Button variants render correctly in dev mode
- [ ] `class-variance-authority` is removed from `Button.tsx` if no longer needed
- [ ] `npm run typecheck` passes
