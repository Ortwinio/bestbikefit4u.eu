# Plan: Migrate to Prototyper UI

## Goal

Replace the custom-built UI component primitives in `src/components/ui/` with [Prototyper UI](https://prototyperai.dev) components, establishing a consistent design system with OKLCH color tokens and accessible Base UI primitives while preserving the current app's component contracts.

## Background

The project currently has 8 hand-rolled primitive components (Button, Input, Select, Card, Dialog, Tooltip, FieldLabel, States). These work but lack polish, animation, dark mode support, and consistent design tokens. Prototyper UI provides 46 accessible components built on `@base-ui/react` with a well-structured OKLCH token system — a significant upgrade with minimal lock-in risk since components are copied (not installed as a dependency).

## Scope

**In scope:**
- Set up Prototyper UI CSS tokens and theme in `globals.css`
- Replace all 8 custom primitives with Prototyper UI equivalents
- Preserve current component APIs where practical via compatibility wrappers
- Update consumer components only where a compatibility wrapper is not sufficient
- Replace the custom `ProgressBar` in questionnaire with Prototyper UI `progress`
- Replace the custom `States` loading/empty/error components
- Add or update tests needed to cover changed DOM structure and behavior

**Out of scope:**
- Redesigning layouts or page structure
- Adding new UI components not currently used
- Changing color palette or brand identity (the zinc-based palette maps cleanly)
- Migrating from Tailwind CSS v4 (Prototyper UI is compatible)

## Approach

1. **Setup** — Add dependencies and CSS tokens; validate nothing is broken
2. **Install primitives** — Use `npx @prototyperai/cli add` to pull component source into the repo without overwriting current primitives blindly
3. **Wrap for compatibility first** — Preserve current exports and prop contracts for high-usage components (`Input`, `Select`, `AccessibleDialog`, `ProgressBar`) before changing consumers
4. **Migrate per-component** — Replace each custom primitive one at a time, keeping the same export names where possible to minimize consumer changes
5. **Update consumers deliberately** — Fix only the usages that cannot remain on the compatibility layer
6. **Verify continuously** — Run `npm run typecheck`, `npm run lint`, and relevant tests during the migration rather than only at the end

## Component Mapping

| Current custom component | Prototyper UI replacement |
|--------------------------|--------------------------|
| `Button.tsx` | `button` |
| `Input.tsx` | `input` + `label` (or `textfield`) |
| `Select.tsx` | `select` |
| `Card.tsx` | `card` |
| `AccessibleDialog.tsx` | `dialog` |
| `Tooltip.tsx` | `tooltip` |
| `FieldLabel.tsx` | `label` |
| `States.tsx` (LoadingState, EmptyState, ErrorState) | `progress` + custom wrappers |
| `ProgressBar.tsx` (questionnaire) | `progress` |

## Acceptance Criteria

- [ ] `globals.css` includes Prototyper UI tokens and base styles
- [ ] All components in `src/components/ui/` are Prototyper UI components
- [ ] All existing pages and features render without major visual regressions
- [ ] Current component contracts remain intact or all affected consumers are updated safely
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No unused old component files remain
- [ ] `plans/feature-prototyper-ui-migration/TESTPLAN.md` has been executed or explicitly checked off as deferred

## Prompts

| # | File | Description |
|---|------|-------------|
| 01 | `01-setup-theme.md` | Install deps and wire up CSS tokens |
| 02 | `02-install-components.md` | Pull Prototyper UI component source files |
| 03 | `03-migrate-button.md` | Migrate Button and all consumers |
| 04 | `04-migrate-input-label.md` | Migrate Input, FieldLabel, and form consumers |
| 05 | `05-migrate-select.md` | Migrate Select and consumers |
| 06 | `06-migrate-card.md` | Migrate Card and consumers |
| 07 | `07-migrate-dialog.md` | Migrate AccessibleDialog and consumers |
| 08 | `08-migrate-tooltip.md` | Migrate Tooltip and consumers |
| 09 | `09-migrate-feedback.md` | Migrate States, ProgressBar with progress component |
| 10 | `10-cleanup.md` | Remove dead code, verify types, final check |
