# Output 03 — UI Migration Validation

**Date:** 2026-03-18

---

## Migration Context

Per `plans/feature-prototyper-ui-migration/MIGRATION-GAPS.md`, the current implementation is a **compatibility-first Base UI migration** — not a completed Prototyper UI component-copy migration. The UI components in `src/components/ui/` are:

- `Button.tsx` / `Card.tsx`: fully custom CVA-based implementations
- `Input.tsx` / `Select.tsx`: thin wrappers over `@base-ui/react/input` and `@base-ui/react/select`
- `Tooltip.tsx`: wrapper over `@base-ui/react/tooltip`
- `AccessibleDialog.tsx`: wrapper over `@base-ui/react/dialog`
- `Progress.tsx`: wrapper over `@base-ui/react/progress`
- `States.tsx` / `FieldLabel.tsx`: custom composed components

This means the quality question is: **Is the current Base UI migration complete, consistent, and safe for consumers?**

---

## 1. Completeness Check

### Component Migration Status

| Component | Base UI Used | Re-exported from `index.ts` | Consumer Import Pattern |
|-----------|-------------|----------------------------|------------------------|
| `Button` | No (fully custom CVA) | Yes | `from "@/components/ui"` |
| `Card` + sub-components | No (fully custom CVA) | Yes | `from "@/components/ui"` |
| `Input` | `@base-ui/react/input` | Yes | `from "@/components/ui"` |
| `Select` | `@base-ui/react/select` | Yes | `from "@/components/ui"` |
| `Tooltip` | `@base-ui/react/tooltip` | Yes | `from "@/components/ui"` |
| `FieldLabel` | No (custom compose) | Yes | `from "@/components/ui"` |
| `AccessibleDialog` | `@base-ui/react/dialog` | Yes | `from "@/components/ui"` |
| `Progress` | `@base-ui/react/progress` | Yes | `from "@/components/ui"` |
| `States` (Loading/Empty/Error) | No (custom compose, uses Progress) | Yes | `from "@/components/ui"` |
| `ThemeToggle` | No (custom) | **No** | `from "@/components/ui/ThemeToggle"` |

**Finding:** All migrated components are re-exported through `index.ts` except `ThemeToggle`. All consumers import from `@/components/ui` (the barrel) except:
- `src/app/(dashboard)/settings/page.tsx`: imports `ThemeToggle` directly from `@/components/ui/ThemeToggle`
- `src/components/questionnaire/ProgressBar.tsx`: imports `Progress` directly from `@/components/ui/Progress`

Both are deviations from the pattern but not build-breaking. `ThemeToggle` is intentionally not in the barrel (it's a layout-specific component, not a UI primitive). The `ProgressBar` deviation is a minor inconsistency (P2).

**No direct `@base-ui/react` imports found outside `src/components/ui/`.** All consumers go through the wrapper layer.

---

## 2. API Compatibility

### Button

Consumer-facing API:
- `variant`: `"primary" | "secondary" | "outline" | "ghost" | "destructive"` (default: `"primary"`)
- `size`: `"sm" | "md" | "lg"` (default: `"md"`)
- `isLoading?: boolean`
- All `ButtonHTMLAttributes<HTMLButtonElement>` pass-through

Consumers verified: All checked files use `variant` and/or `isLoading`. No breaking changes found.

### Card

Consumer-facing API: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` all accept `className` + all `HTMLAttributes<HTMLDivElement/HTMLHeadingElement/HTMLParagraphElement>`. Standard composition pattern.

All consumers use standard composition pattern. No breaking changes found.

### Input

Consumer-facing API:
- `label?`, `tooltip?`, `tooltipLabel?`, `error?`, `helperText?`
- All `InputHTMLAttributes<HTMLInputElement>` pass-through

Consumers pass standard props (`id`, `type`, `value`, `onChange`, `placeholder`, `disabled`). The `ref` is forwarded. No breaking changes found.

### Select

Consumer-facing API:
- `options: SelectOption[]` (required)
- `label?`, `tooltip?`, `tooltipLabel?`, `error?`, `helperText?`, `placeholder?`
- `value?`, `defaultValue?`, `onChange?` — these are mapped to Base UI equivalents internally

Consumers pass `options`, `value`, `onChange`, `label`. The `onChange` shim (`createSelectChangeEvent`) preserves the `ChangeEvent<HTMLSelectElement>` shape expected by consumers. No breaking changes found.

### AccessibleDialog

Consumer-facing API:
- `open: boolean`, `onClose: () => void`, `title: string`, `description?: string`, `children: React.ReactNode`

Clean minimal API. No consumers needed to change their call signatures.

### Progress

Consumer-facing API:
- `value: number | null` (null = indeterminate)
- `max?: number` (default 100)
- `label?: string`
- `indicatorClassName?`, `trackClassName?`

`ProgressBar.tsx` passes `value={percentage}` (number) and `label`. `States.tsx` passes `value={null}` for loading animation. Both match the API.

---

## 3. CSS Token Check

### Tokens Required by Base UI Components

Base UI components do not ship with their own CSS tokens — they use the classes applied via `className` props. All styling is driven by the OKLCH design tokens defined in `globals.css` and referenced as `var(--primary)`, `var(--border)`, etc.

**All tokens referenced by UI components are present in `globals.css`:**

| Token | Present in `:root` | Present in `.dark` |
|-------|-------------------|-------------------|
| `--primary` / `--primary-foreground` | Yes | Yes |
| `--secondary` / `--secondary-foreground` | Yes | Yes |
| `--muted` / `--muted-foreground` | Yes | Yes |
| `--accent` / `--accent-foreground` | Yes | Yes |
| `--destructive` / `--destructive-foreground` | Yes | Yes |
| `--border` | Yes | Yes |
| `--input` | Yes | Yes |
| `--ring` | Yes | Yes |
| `--card` / `--card-foreground` | Yes | Yes |
| `--popover` / `--popover-foreground` | Yes | Yes |
| `--background` / `--foreground` | Yes | Yes |
| `--radius-sm/md/lg/xl` | Yes (in `@theme`) | N/A (global) |
| `--success` / `--success-foreground` | Yes | **No** |
| `--warning` / `--warning-foreground` | Yes | **No** |
| `--danger` / `--danger-foreground` | Yes | **No** |

**Gap:** `--success`, `--warning`, `--danger` and their foreground counterparts are missing from `.dark {}`. These semantic tokens are registered in `@theme` as `--color-success` etc. and used in pressure/status components. In dark mode, the light-mode OKLCH values will be used, which may not meet WCAG contrast requirements.

**P2 issue.** No dark-mode usage of these tokens was found in the UI primitive components themselves (States.tsx, Progress.tsx) but pressure feature components likely use them.

### Custom Utilities

All custom utilities from `globals.css` are used in the UI components:
- `focus-ring` — Button, AccessibleDialog close button
- `focus-field-ring` — Input, Select trigger
- `invalid-field-ring` — Input, Select (error state)
- `status-disabled` — Select item disabled state
- `no-highlight` — Button (mobile tap highlight)
- `shadow-inset-track` — Progress track
- `no-scrollbar` — Select list

No utility was found in globals.css without a corresponding usage, and no component references an undefined utility.

---

## 4. Dark Mode Check

**ThemeToggle mechanism:** `src/components/providers/ThemeProvider.tsx` sets a `dark` class on `<html>`. The `.dark {}` block in `globals.css` overrides the OKLCH color tokens. All UI component class names reference `var(--...)` tokens rather than hardcoded colors, so they automatically respond to the `.dark` class swap.

**Exceptions (hardcoded colors):**
- `Tooltip.tsx`: `bg-slate-950` and `text-white` on the popup — these are hardcoded and intentional (tooltip always dark regardless of theme, which is a common pattern). No issue.
- `AccessibleDialog.tsx`: `bg-slate-950/45` on the backdrop — hardcoded, intentional.
- `States.tsx` (`ErrorState`): `border-red-200`, `bg-red-50/90`, `text-red-600`, `text-red-800`, `text-red-700` — these are hardcoded Tailwind red utilities. In dark mode, the error state will still render in light-mode red tones, which may have contrast issues on dark backgrounds.

**P2:** `ErrorState` hardcoded red colors will not adapt to dark mode. This predates the migration but is worth noting.

---

## 5. DOM Structural Assertions (Test Results)

The `primitives.test.tsx` uses `renderToStaticMarkup` to assert on the rendered HTML. Key assertions verified:

- `Button isLoading` renders `disabled` attribute ✓
- `Select` with label/tooltip renders correct aria wiring ✓
- `LoadingState` renders `role="progressbar"` (from Base UI `Progress.Root`) ✓
- `Progress` renders `role="progressbar"` and `aria-label` ✓
- `ErrorState` renders `role="alert"` ✓

The `Tooltip.test.tsx` verifies:
- `aria-describedby` chain: tooltip trigger's `aria-describedby` ID appears inside the input's `aria-describedby` ✓
- Screen reader text is present in the DOM ✓

No structural regressions detected via static render tests.

---

## Migration Status Summary

| Component | Migration Status | Notes |
|-----------|-----------------|-------|
| `Button` | Complete (custom CVA, no Base UI dependency) | Fully local |
| `Card` + sub-components | Complete (custom CVA, no Base UI dependency) | Fully local |
| `Input` | Complete (Base UI wrapper) | ref cast accepted |
| `Select` | Complete (Base UI wrapper) | onChange shim working |
| `Tooltip` | Complete (Base UI wrapper) | getNextTooltipOpenState exported |
| `FieldLabel` | Complete (custom compose) | Clean |
| `AccessibleDialog` | Complete (Base UI wrapper) | Clean |
| `Progress` | Complete (Base UI wrapper) | New component, clean |
| `States` | Complete (custom compose + Progress) | ErrorState dark mode gap (P2) |
| `ThemeToggle` | Separate — not in barrel | Intentional separation |

**Overall assessment: Migration is consistent and complete for its defined scope.** No half-migrated components. No consumers bypass the wrapper layer. The remaining work (actual Prototyper CLI source replacement) is documented in `MIGRATION-GAPS.md` and is out of scope for this quality pass.
