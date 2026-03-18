# 01 — Setup: Dependencies and CSS Tokens

## Goal

Install required npm packages and wire the Prototyper UI design tokens into the global stylesheet. After this step the design token system is available and the app still renders correctly in the current light-theme setup.

## Background

Prototyper UI components depend on `@base-ui/react`, `class-variance-authority`, and `lucide-react`. The token system is a CSS block that must be added to `globals.css` before any components are installed. The project uses Tailwind CSS v4 which is compatible.

## Steps

### 1. Install dependencies

```bash
npm install @base-ui/react class-variance-authority lucide-react
```

`lucide-react` may already be present — skip if so (check `package.json`).

### 2. Update `src/app/globals.css`

Replace the current minimal content with the full Prototyper UI token block. The current file only has `@import "tailwindcss"` and a `.skip-link` rule.

The new `globals.css` should:
1. Keep `@import "tailwindcss"` at the top
2. Add the complete `@theme { ... }` block with all Prototyper UI tokens
3. Add the `:root { ... }` light-mode token values
4. Add the `.dark { ... }` dark-mode overrides only as dormant token support unless this plan also adds an actual theme switch mechanism
5. Add the `@utility` helpers (`focus-ring`, `focus-field-ring`, `invalid-field-ring`, `status-disabled`, `status-pending`, `no-highlight`, `shadow-inset-track`, `no-scrollbar`)
6. Add the `@custom-variant` declarations (`motion-reduce`, `motion-safe`, `hover-only`)
7. Add the `@layer base { ... }` styles (border, body, headings)
8. Keep the existing `.skip-link` rule

The full token CSS is available via the `mcp__prototyper-ui__get_theme` tool.

### 3. Update font setup

Prototyper UI references `--font-geist-sans`, `--font-overpass`, `--font-geist-mono`. Check `src/app/layout.tsx` to see which fonts are currently loaded. If no custom fonts are loaded yet, prefer mapping the token variables conservatively instead of introducing a broad typography change in the same step.

If the existing font setup differs, map the existing font variables to `--font-sans` and `--font-heading` in `:root` rather than changing the font loading. Only add new fonts if the Prototyper UI components render incorrectly without them.

### 4. Verify

Run the dev server (`npm run dev`) and confirm:
- App still renders without errors
- No TypeScript errors (`npm run typecheck` or `tsc --noEmit`)
- The design tokens are applied (open DevTools, check `:root` for `--background`, `--primary`, etc.)

## Acceptance Criteria

- [ ] `@base-ui/react`, `class-variance-authority` in `package.json` dependencies
- [ ] `globals.css` contains the full Prototyper UI token block
- [ ] App renders without errors in dev mode
- [ ] `--background` and `--primary` CSS variables visible in browser DevTools
- [ ] No unnecessary font-loading change was introduced without verifying need
