# Plan: Complete Prototyper UI Migration

## Status

- Current state: partial migration to `@base-ui/react`
- Target state: actual Prototyper UI source in-repo, with compatibility adapters or consumer refactors where needed
- Recommended migration mode: compatibility-first
- Last updated: `2026-03-18`
- Execution status: compatibility-first migration implemented on `2026-03-18`

## Goal

Finish the UI migration so the app uses real Prototyper UI component source instead of custom primitives or Base UI compatibility wrappers, while keeping the product stable during the transition.

## Current Reality

The repo is not starting from zero. It already has:

- Prototyper-style tokens and Base UI primitives in some places
- custom primitives still living in `src/components/ui/`
- compatibility wrappers over Base UI for several controls

The remaining migration gaps are captured in `MIGRATION-GAPS.md`:

- no Prototyper CLI-generated source files are present
- `Button` and `Card` are still fully custom
- `Input`, `Select`, `Tooltip`, `AccessibleDialog`, and `Progress` are wrapper implementations over Base UI
- `States.tsx` and `src/components/questionnaire/ProgressBar.tsx` remain custom compositions

## Scope

In scope:

- add actual Prototyper UI source for `button`, `input`, `label`, `select`, `card`, `dialog`, `tooltip`, and `progress`
- replace local primitives in `src/components/ui/` with copied Prototyper source or thin adapters around that source
- preserve current contracts for high-churn APIs unless a prompt explicitly performs a consumer refactor
- migrate questionnaire progress and async state components to the new primitive layer
- validate with typecheck, build, targeted tests, and the migration test plan

Out of scope:

- broad layout redesign
- unrelated lint/test failures outside this migration
- replacing every consumer with raw Prototyper composition in the first pass if adapters are sufficient

## Migration Strategy

### Phase 1: Land Real Prototyper Source

Copy the official component source into the repo first. Existing Base UI wrappers are not the final state.

### Phase 2: Stabilize Through Compatibility Adapters

Use thin adapters for APIs that currently bundle extra behavior:

- `Input`
- `Select`
- `AccessibleDialog`
- `ProgressBar`
- `States`

This keeps the migration tractable and limits churn across forms, dialogs, and questionnaire flows.

### Phase 3: Optional Pure Prototyper Cleanup

After the real components are in place and validated, decide whether to keep the compatibility layer or do a second pass that moves consumers to direct Prototyper APIs.

Recommended decision:

- primary delivery target: compatibility mode
- optional follow-up: pure Prototyper consumer refactor

## Component Mapping

| Current file | Required target |
|--------------|-----------------|
| `src/components/ui/Button.tsx` | copied Prototyper `button` source or thin adapter over it |
| `src/components/ui/Input.tsx` | adapter over copied Prototyper `input` + `label` |
| `src/components/ui/FieldLabel.tsx` | adapter over copied Prototyper `label` |
| `src/components/ui/Select.tsx` | adapter over copied Prototyper `select` |
| `src/components/ui/Card.tsx` | copied Prototyper `card` source or thin adapter over it |
| `src/components/ui/AccessibleDialog.tsx` | adapter over copied Prototyper `dialog` |
| `src/components/ui/Tooltip.tsx` | copied Prototyper `tooltip` source or small wrapper over it |
| `src/components/ui/Progress.tsx` | copied Prototyper `progress` source or thin wrapper over it |
| `src/components/ui/States.tsx` | custom composed states rebuilt on top of Prototyper primitives |
| `src/components/questionnaire/ProgressBar.tsx` | custom composition rebuilt on top of Prototyper `progress` |

## Acceptance Criteria

- [x] Actual Prototyper CLI-generated source files for the required primitives exist in the repo
- [x] Every primitive in `src/components/ui/` is either copied Prototyper UI source or a thin compatibility adapter over copied Prototyper source
- [ ] Temporary custom styling glue that only simulated a component library is removed where no longer needed
- [ ] Existing feature flows keep working, especially forms, dialogs, questionnaire, and results
- [x] `npm run typecheck` passes
- [x] `npm run build` passes
- [x] Targeted UI tests pass
- [ ] `plans/feature-prototyper-ui-migration/TESTPLAN.md` is executed or deferred explicitly with notes
- [x] Remaining unrelated repo validation failures are documented rather than silently ignored

## Validation Notes

- `npm run typecheck`: passed on `2026-03-18`
- `npm run build`: passed on `2026-03-18`
- `npx vitest run src/components/ui/primitives.test.tsx src/components/ui/Tooltip.test.tsx`: passed on `2026-03-18`
- `npm run lint`: not rerun in this pass because the repo already has unrelated known failures outside this migration
- `npm test`: not rerun in this pass because the repo already has unrelated known Convex test failures
- `TESTPLAN.md` manual/browser checks: still outstanding

## Known External Blockers

- `npm run lint` has unrelated existing failures outside this migration
- `npm test` has unrelated existing Convex failures
- manual browser checks still need explicit execution and sign-off

These are not reasons to stop the UI migration, but they must be recorded during final verification.

## Prompts

| # | File | Description |
|---|------|-------------|
| 01 | `01-setup-theme.md` | Confirm baseline, dependencies, and token/theme readiness |
| 02 | `02-install-components.md` | Install actual Prototyper UI source into the repo |
| 03 | `03-migrate-button.md` | Replace custom Button with copied Prototyper button |
| 04 | `04-migrate-input-label.md` | Rebuild Input and FieldLabel on copied Prototyper input/label |
| 05 | `05-migrate-select.md` | Rebuild Select on copied Prototyper select with compatibility props |
| 06 | `06-migrate-card.md` | Replace custom Card with copied Prototyper card |
| 07 | `07-migrate-dialog.md` | Rebuild AccessibleDialog on copied Prototyper dialog |
| 08 | `08-migrate-tooltip.md` | Replace tooltip wrapper with copied Prototyper tooltip |
| 09 | `09-migrate-feedback.md` | Rebuild Progress, States, and questionnaire progress on Prototyper primitives |
| 10 | `10-cleanup.md` | Remove migration glue, validate, and record residual blockers |
