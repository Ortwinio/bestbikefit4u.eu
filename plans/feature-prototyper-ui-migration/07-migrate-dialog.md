# 07 — Migrate Dialog

## Goal

Replace `src/components/ui/AccessibleDialog.tsx` with a Prototyper UI-backed implementation while preserving the current controlled API unless a full consumer migration is intentionally chosen.

## Background

The current `AccessibleDialog.tsx` is a controlled focus-managed modal with props `open`, `title`, `description`, `onClose`, and `children`. The Prototyper UI `dialog` is compositional and handles accessibility natively, but its API shape differs materially.

## Steps

### 1. Audit current usage

```
grep -r "AccessibleDialog\|from.*ui/AccessibleDialog" --include="*.tsx" src/
```

For each usage, note:
- How open/close state is managed
- What props are passed (title, description, trigger, etc.)
- Whether custom content or actions are in the body/footer
- Whether any consumer depends on close-via-overlay or return-focus behavior

### 2. Read Prototyper UI dialog

Use `mcp__prototyper-ui__get_component` with `"dialog"` to read the full API including the sheet variant.

### 3. Replace `AccessibleDialog.tsx`

Replace with a Prototyper UI-backed compatibility wrapper first. Preserve the current controlled API if practical:
- `open`
- `title`
- `description`
- `onClose`
- `children`

The Prototyper UI dialog has a sheet variant (slides in from the side) — note this for any side-panel usages in mobile navigation.

### 4. Update consumers

Search for `AccessibleDialog` usages and only update them to the compositional Prototyper UI API if the compatibility wrapper proves too limiting.

Also check `src/app/(dashboard)/layout.tsx` — the mobile menu uses a sliding overlay that could benefit from the `dialog` sheet variant.

### 5. Update barrel export

Keep `AccessibleDialog` exported from `src/components/ui/index.ts`. Export `Dialog` aliases or sub-components only if they are actually used.

## Acceptance Criteria

- [ ] Old `AccessibleDialog.tsx` replaced
- [ ] All dialogs open/close correctly
- [ ] Focus management works (focus trapped inside, returns to trigger on close)
- [ ] ESC key closes dialogs
- [ ] Overlay click closes dialogs where current behavior expects it
- [ ] `npm run typecheck` passes
