# Step 01 — Migration Audit

## Objective

Verify each component adapter in `src/components/ui/` against the actual in-repo Prototyper source first, then identify mismatches, missing prop forwarding, incorrect override patterns, and components that should be replaced rather than wrapped.

## Sources

Primary:
- `src/components/prototyper-ui/ui/*`
- `src/components/ui/*`
- `src/app/globals.css`

Optional support:
- upstream Prototyper docs if available during execution

Do not block this step on MCP-specific tooling.

## Audit Checklist

For each component, compare the adapter against the in-repo Prototyper source and current consumer contract:

### Button (`src/components/ui/Button.tsx`)
- Does it use `variant="ghost"` + custom class overrides, or the Prototyper native variants?
- Are any Prototyper `Button` features being unnecessarily shadowed?
- Does `isLoading` behavior match Prototyper's built-in loading support (if any)?
- Does `ref` forwarding work with the `nativeButton` prop?

### Card (`src/components/ui/Card.tsx`)
- Does `variant="transparent"` on `PrototyperCard` + manual class overrides make sense, or should native Prototyper variants be used?
- Is `border-[color:rgb(255_255_255_/_0.35)]` in `elevated` variant a dark-mode bug? (Yes — document it for Step 02.)
- Are all sub-components (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) properly forwarded?

### Input (`src/components/ui/Input.tsx`)
- Is `PrototyperInput` being styled correctly for the current token system?
- Does error state styling use CSS tokens or hardcoded colors?
- Is `aria-describedby` correctly constructed when multiple descriptors exist?
- Would Prototyper's `Field` component be a better wrapper than the current `div` + manual ID management?

### FieldLabel (`src/components/ui/FieldLabel.tsx`)
- Does it use the Prototyper `Label` component correctly?
- Is tooltip integration accessible (keyboard triggerable, not hover-only)?

### Select (`src/components/ui/Select.tsx`)
- Does it use Prototyper `Select` primitives correctly?
- Does the `options[]` → Prototyper `Select.Option` mapping work for all edge cases (disabled options, long labels)?
- Does keyboard navigation work as expected?

### AccessibleDialog (`src/components/ui/AccessibleDialog.tsx`)
- Does it use Prototyper `Dialog` primitives?
- Are `title`, `description`, focus management, and overlay-click-close all correct?
- Does `Escape` close the dialog?

### Tooltip (`src/components/ui/Tooltip.tsx`)
- Does it trigger on both focus and hover?
- Does `Escape` close it when keyboard-triggered?
- Is the accessible description wiring correct?

### Progress (`src/components/ui/Progress.tsx`)
- Does it use Prototyper `Progress` correctly?
- Does it handle `value={null}` (indeterminate state) for `LoadingState`?

### States (`src/components/ui/States.tsx`)
- Does `ErrorState` use `var(--danger)` for all colored elements (fixed in previous pass)?
- Are `LoadingState`, `EmptyState`, `ErrorState` each built on Prototyper primitives where appropriate?

### ThemeToggle (`src/components/ui/ThemeToggle.tsx`)
- Currently hand-rolled. Is this the right approach?
- Verify current accessibility before assuming replacement is required.
- Document whether an upstream segmented/toggle primitive is actually needed or merely preferred.

## Additional Checks

1. **CSS token audit** — Search `src/components/ui/` first, then only expand to layout/shell files that are directly part of the Prototyper migration surface. Do not balloon this into a full-app color audit.

2. **`index.ts` audit** — Verify all components and sub-components are exported from `src/components/ui/index.ts`.

3. **Candidate component audit** — Verify whether these components actually exist upstream and are suitable before creating downstream steps:
   - `NumberField` (for numeric inputs)
   - `SegmentedControl` (for ThemeToggle)
   - `Toast` (for action feedback)
   - `Switch` (for boolean toggles)
   - `Field` / `Fieldset` (for form field composition)
   - `Slider` (for range inputs)

4. **Scope control** — Explicitly classify findings as:
   - fix now in this plan
   - defer to later UI cleanup
   - out of scope

## Output

Write `output-01-migration-audit.md`:
- Per-component audit table: component | status | issues found | priority
- List of hardcoded colors found with file:line references
- Recommended component swaps (current → better Prototyper component), but only if upstream availability was confirmed
- Step-04 and Step-05 scope decision:
  which numeric-input flows and which toast flows should actually be migrated in this plan
- Priority classification for all findings (P0/P1/P2)
