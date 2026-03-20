# Output 01 — Audit Changed Files

**Date:** 2026-03-18
**Branch:** main (post-`0288595`)

---

## Scope

All files modified since Round 1 quality plan (`e79b451`), focusing on:
- UI components migrated to Prototyper UI (`@base-ui/react`)
- Feature files: tire pressure module, dashboard upgrade, GTM consent
- Package changes

---

## UI Component Audit

### `src/components/ui/Button.tsx`

**Status: Clean**

- All props typed correctly via `ButtonHTMLAttributes<HTMLButtonElement>` + `VariantProps`
- `isLoading` disables the button — correct accessibility behavior
- `className` forwarded via `cn()`
- `displayName` set
- No `any` types
- No unused imports

**Notes:** `size` prop is destructured but the defaultVariants handles it — no issue.

---

### `src/components/ui/Card.tsx`

**Status: Clean**

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` all exported with `displayName`
- All use `forwardRef` with correct HTML element types
- `className` forwarded via `cn()` throughout
- No `any` types

---

### `src/components/ui/Input.tsx`

**Status: Clean with one minor note**

- Extends `InputHTMLAttributes<HTMLInputElement>` correctly
- Accessibility IDs wired correctly: `errorId`, `helperId`, `tooltipDescriptionId`, `aria-describedby`
- `ref as never` cast on `BaseInput` — this is an intentional cast because `@base-ui/react/input` ref type differs slightly from native `HTMLInputElement`. Acceptable workaround, not a runtime bug.
- No `any` types

**P2 (style):** `ref as never` is a type suppression that could be replaced with a proper cast once `@base-ui/react` ref types stabilize.

---

### `src/components/ui/Select.tsx`

**Status: Clean with one minor note**

- `SelectProps extends SelectHTMLAttributes<HTMLSelectElement>` but the rendered element is `BaseSelect.Root` (not a native `<select>`), so `ref as never` is used on `BaseSelect.Trigger`. Same pattern as Input — acceptable.
- `createSelectChangeEvent` correctly shapes a synthetic `ChangeEvent<HTMLSelectElement>` for backward compat with consumers expecting `onChange(e)`
- `value=""` mapped to `null` for Base UI compatibility — correct
- No `any` types

**P2 (style):** The `SelectHTMLAttributes<HTMLSelectElement>` extension causes many unused props (e.g., `multiple`, `size` from select-specific attributes) to be passed through `...props` to `BaseSelect.Root` via `props.name`, `props.autoComplete` etc. Most extra attributes are silently ignored by Base UI. Low impact.

---

### `src/components/ui/Tooltip.tsx`

**Status: Clean**

- `"use client"` directive present (needed because Base UI tooltip uses event handlers)
- `getNextTooltipOpenState` exported as a pure function — good for testability
- `TooltipInteraction` union type is exhaustive
- `useId()` used for accessible ID generation
- `sr-only` span provides screen reader description before the trigger — correct pattern
- No `any` types

---

### `src/components/ui/States.tsx`

**Status: Clean**

- Imports `Progress` from `./Progress` — relative sibling import, consistent with other files in the directory
- `LoadingState` uses `<Progress value={null} ...>` for indeterminate animation — correct
- `ErrorState` has `role="alert"` — correct
- Type aliases for props exported at bottom — good
- No `any` types

---

### `src/components/ui/FieldLabel.tsx`

**Status: Clean**

- Simple composition component
- Tooltip wired with `tooltipDescriptionId` correctly
- No `any` types

---

### `src/components/ui/AccessibleDialog.tsx`

**Status: Clean**

- `"use client"` directive present
- `disablePointerDismissal={false}` — explicit, clear intent
- `onOpenChange` correctly delegates to `onClose` only on close
- `React.ReactNode` import used implicitly via `React.` namespace (file imports `React` implicitly through JSX transform) — no explicit `React` import needed in Next.js 16 / React 19

**P2 (style):** `children: React.ReactNode` in the interface uses the global `React` namespace rather than a named import. Not an error (global JSX types cover this in React 19), but an explicit `import type { ReactNode } from "react"` would be more consistent with other files in the directory.

---

### `src/components/ui/Progress.tsx` (new)

**Status: Clean**

- `"use client"` directive present (Base UI progress uses client-side state)
- `ProgressProps extends HTMLAttributes<HTMLDivElement>` — correct base
- `indicatorClassName` and `trackClassName` for styling granularity — useful API
- `value === null` → indeterminate pattern with `animate-pulse` — correct
- `percentage` calculation guarded with `Math.max/min` — prevents out-of-range issues
- `displayName` set
- No `any` types

---

### `src/components/ui/index.ts`

**Status: One omission found (P1)**

All component exports present and correct. However:

| Component | Exported? |
|-----------|-----------|
| `Button` + `ButtonProps` | Yes |
| `Input` + `InputProps` | Yes |
| `Select` + `SelectProps` + `SelectOption` | Yes |
| `Tooltip` + `TooltipProps` | Yes |
| `FieldLabel` + `FieldLabelProps` | Yes |
| `Progress` + `ProgressProps` | Yes |
| `Card` + all sub-components + `CardProps` | Yes |
| `LoadingState`, `EmptyState`, `ErrorState` | Yes |
| `AccessibleDialog` + `AccessibleDialogProps` | Yes |
| `ThemeToggle` | **No** |
| `getNextTooltipOpenState` | **No (intentional — internal utility)** |
| `TooltipInteraction` | **No (intentional — internal type)** |

**Finding:** `ThemeToggle` is imported directly as `import { ThemeToggle } from "@/components/ui/ThemeToggle"` in `src/app/(dashboard)/settings/page.tsx`. It is not re-exported from `index.ts`. This is a consistency issue — every other UI component goes through `index.ts`. Not a build break, but a P1 style/convention violation. A consumer that follows the pattern `import { X } from "@/components/ui"` would not find `ThemeToggle`.

---

### `src/app/globals.css`

**Status: One gap found (P2)**

- OKLCH tokens present for both `:root` (light) and `.dark` themes
- All component-referenced CSS variables present: `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--card`, `--popover`, `--background`, `--foreground`, `--radius-*`
- Custom utilities defined: `focus-ring`, `focus-field-ring`, `invalid-field-ring`, `status-disabled`, `status-pending`, `no-highlight`, `shadow-inset-track`, `no-scrollbar`
- Custom media variants: `motion-reduce`, `motion-safe`, `hover-only`

**Gap:** `--success`, `--success-foreground`, `--warning`, `--warning-foreground`, `--danger`, `--danger-foreground` are defined in `:root` but have **no dark-mode overrides in the `.dark {}` block**. These tokens are referenced as Tailwind theme tokens (`--color-success` etc.) and used by pressure status badge / feedback components. In dark mode these will use the light-mode OKLCH values, which may not have sufficient contrast.

Priority: P2 (no runtime crash, but potential visual regression in dark mode for semantic color tokens).

---

### `src/components/questionnaire/ProgressBar.tsx`

**Status: P2 note**

- Correctly uses `Progress` component
- Correctly uses `useDashboardMessages` for i18n
- `formatMessage` used for parameterized strings

**P2:** Imports `Progress` from `@/components/ui/Progress` (direct file path) instead of `@/components/ui` (barrel export). This is inconsistent with the rest of the codebase. Should be `import { Progress } from "@/components/ui"`.

---

### GTM Consent (`src/components/analytics/GTMConsentLoader.tsx`)

**Status: Clean**

- `useSyncExternalStore` with a server snapshot returning `null` — correct SSR-safe pattern
- GTM script only injected when `consent === "accepted"` — correctly gated
- `window.__bfGtmLoaded` guard prevents double-injection on re-renders
- No `any` types (except `dataLayer` typed as `Array<Record<string, unknown>>` which is appropriate)

---

### Package Changes (`package.json`)

**Status: Clean**

Key relevant dependencies:
- `@base-ui/react: ^1.3.0` — Prototyper UI foundation
- `class-variance-authority: ^0.7.1` — CVA for Button/Card variants
- `tailwind-merge: ^3.4.0` — used in `cn()` utility
- `tailwindcss: ^4` — v4, consistent with `@import "tailwindcss"` syntax in globals.css
- No Radix UI remaining (full migration to Base UI)

No suspicious additions or unexpected version downgrades found.

---

## TypeScript Check (`npx tsc --noEmit`)

**Result: PASS** — No output, exit code 0.

---

## Lint Check (`npm run lint`)

**Result: PASS with warnings only**

```
6 problems (0 errors, 6 warnings)
```

Warnings are all in non-UI files (test stubs and scripts):
- `convex/__tests__/authRateLimit.contract.test.ts` — 4 unused `_`-prefixed vars (P3, test code)
- `convex/recommendations/__tests__/generate.mapping.integration.test.ts` — 1 unused `_actionRef` (P3)
- `scripts/seo/validate-sitemaps.mjs` — 1 unused `parsePathname` (P2, scripts)

All three custom lint scripts pass:
- `lint:eslint` — 0 errors
- `lint:runtime-boundaries` — PASS
- `lint:tooltips` — PASS (19 form-control files verified)

No lint errors in any of the UI migration files.

---

## Summary

| Priority | Count | Issues |
|----------|-------|--------|
| P0 | 0 | None |
| P1 | 1 | `ThemeToggle` not exported from `index.ts` |
| P2 | 4 | `ProgressBar` direct import, `AccessibleDialog` ReactNode import style, dark-mode missing `success/warning/danger` tokens, unused `ref as never` casts (Input/Select) |
| P3 | 6 | Unused `_`-prefixed vars in test/scripts (existing, pre-migration) |

**`any` types introduced:** 0

---

## Missing Exports Check

| File | Exported from `index.ts`? |
|------|--------------------------|
| `Button.tsx` | Yes |
| `Card.tsx` | Yes (all sub-components) |
| `Input.tsx` | Yes |
| `Select.tsx` | Yes |
| `Tooltip.tsx` | Yes |
| `States.tsx` | Yes (3 state components) |
| `FieldLabel.tsx` | Yes |
| `AccessibleDialog.tsx` | Yes |
| `Progress.tsx` | Yes |
| `ThemeToggle.tsx` | **No — P1** |
