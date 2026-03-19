# Prototyper UI Verification + UX Improvement

## Goal

Verify that the Prototyper UI migration in `plans/feature-prototyper-ui-migration/` is complete and correct, fix the remaining dark/light mode issues, and make targeted UX upgrades only where the required Prototyper primitives can be added safely to this repo.

## Background

### Current State

The Prototyper UI migration landed on 2026-03-18. The Prototyper source files currently present in-repo are:

- `button`
- `card`
- `dialog`
- `input`
- `label`
- `progress`
- `select`
- `tooltip`

All components in `src/components/ui/` now import from this source via thin adapters.

However, **the migration has open issues**:

1. **`body` background is broken in dark mode.** `globals.css` defines the body background as a hardcoded light-colored `linear-gradient(180deg, rgb(255 255 255 / 0.96), rgb(248 250 252 / 0.98))` — this never changes when `.dark` is applied. Dark mode users see a near-white background behind dark-colored cards.

2. **Some component variants have hardcoded light-mode colors.** `Card.tsx` `elevated` variant uses `border-[color:rgb(255_255_255_/_0.35)]` — a hardcoded white border that disappears or looks wrong in dark mode.

3. **`ThemeToggle` is a custom component.** The theme toggle uses hand-rolled button styling instead of Prototyper UI's `SegmentedControl` or `ToggleGroup`, which would handle active-state styling and accessibility properly out of the box.

4. **`TESTPLAN.md` manual browser checks are outstanding.** The acceptance criteria in the migration plan are partially unchecked. No one has verified the full flow in a browser post-migration.

5. **There are likely useful Prototyper primitives not yet installed.** `NumberField`, `Toast`, and a segmented/toggle control pattern may improve the UX, but they are not in the repo today. This follow-up plan must first confirm those components exist upstream and can be integrated without destabilizing the existing adapters.

6. **This plan must be executable from the repo as it exists today.** It should not depend on external MCP tooling being available at runtime. Any upstream reference lookup should be treated as optional support, not a hard precondition for execution.

### Source Material

- Prototyper UI docs: `https://prototyper-ui.com/llms.txt` (component index)
- Theming: `https://prototyper-ui.com/docs/theming` (OKLCH token system)
- Skills: `https://prototyper-ui.com/skills` (Claude Code skill install)
- MCP tools available: `mcp__prototyper-ui__*` (get_component, get_install_command, get_theme, list_components, search_docs)

## Scope

**In scope:**
- Dark mode fix for `body` background and all hardcoded colors in component adapters
- ThemeToggle replacement with Prototyper UI `SegmentedControl`
- Audit all 8 component adapters in `src/components/ui/` against Prototyper UI docs
- Execute `TESTPLAN.md` browser checks and document results
- Replace `Input type="number"` usages with Prototyper UI `NumberField` in measurement and questionnaire forms
- Add `Toast` for user action feedback (form saves, session start, error recovery)
- Assess `Field`/`Fieldset` wrappers as replacement for current `Input` + `FieldLabel` composition
- Verify OKLCH token usage is consistent — no hardcoded `rgb()`/hex values where a CSS token exists

**Out of scope:**
- Redesigning page layouts
- Replacing every component consumer with pure Prototyper composition (compatibility adapters are acceptable)
- Migrating to a different design system
- Changing brand colors or overall visual identity

## Repo Anchors

- Component source: `src/components/prototyper-ui/ui/`
- Component adapters: `src/components/ui/`
- Theme: `src/app/globals.css`
- ThemeToggle: `src/components/ui/ThemeToggle.tsx`
- App shell: `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/(public)/layout.tsx`
- ThemeProvider: `src/components/providers/ThemeProvider.tsx`
- Measurement forms: `src/components/measurements/`
- Questionnaire: `src/components/questionnaire/`
- Migration test plan: `plans/feature-prototyper-ui-migration/TESTPLAN.md`

## Approach

1. **Migration audit** — Check each component adapter against the in-repo Prototyper source first, then confirm any upstream mismatches if needed
2. **Dark mode fixes** — Fix `body` background, hardcoded colors in adapters, and verify token-driven styling works in both modes
3. **ThemeToggle decision + upgrade** — First confirm whether an upstream segmented/toggle primitive is actually available and worth installing; otherwise improve the current component accessibly without forcing a dependency mismatch
4. **Numeric input feasibility + migration** — First inventory all `type="number"` usage and define scope; do not silently expand from measurement/questionnaire to every public calculator unless explicitly accepted
5. **Toast feasibility + rollout** — First confirm toast source availability and choose a root provider location; then wire only high-value async success/error flows
6. **Browser QA** — Execute the existing migration test plan plus the additional checks introduced here; document deferrals explicitly

## Acceptance Criteria

1. Dark mode is visually correct: background, cards, inputs, dialogs, and tooltips all use dark surface colors — no white or near-white backgrounds visible
2. All hardcoded `rgb()`/hex colors in `src/components/ui/` are replaced with CSS token references
3. `ThemeToggle` reaches a clear end state:
   either it is upgraded to a real Prototyper primitive,
   or the plan documents why the current component should be retained and hardened
4. Numeric-input migration has explicit scope and is completed for the agreed targets
5. Toast rollout has explicit scope and is completed for the agreed targets
6. `TESTPLAN.md` browser checklist is executed and all pass/fail/deferred items are documented with reasons
7. Validation is repo-realistic:
   - targeted type/build/tests for changed areas must pass
   - unrelated known repo failures must be documented, not hidden
8. No regressions in existing feature flows (auth, questionnaire, bikes, results)

## Status

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-migration-audit.md` | P0 | Complete |
| 02 | `02-dark-mode-fixes.md` | P0 | Complete |
| 03 | `03-themtoggle-upgrade.md` | P1 | Complete |
| 04 | `04-numberfield-migration.md` | P1 | Complete |
| 05 | `05-toast-system.md` | P1 | Complete |
| 06 | `06-browser-qa.md` | P0 | Deferred |

## Execution Notes

- Do not assume upstream Prototyper components exist until verified.
- Do not widen Step 04 to every `type="number"` input in the repo unless Step 01 explicitly approves that expansion.
- Do not require full-repo `lint` / `npm test` pass as the exit gate for this plan; use changed-scope validation plus documented residual blockers.
- Execution completed without MCP by using the already-installed `@base-ui/react` primitives that exist in this repo's dependency tree.
- `ThemeToggle` ended in the documented fallback state: retained locally, but hardened for keyboard navigation and radio-group accessibility instead of forcing an upstream segmented-control dependency.
- `NumberField` rollout was intentionally limited to measurement forms and questionnaire numeric questions.
- `Toast` rollout was intentionally limited to the root provider plus high-value success flows: profile save, display-name save, fit-session start, report email, and cookie consent.
- Validation completed: `npx vitest run src/components/ui/primitives.test.tsx src/i18n/messages/messages-parity.test.ts` and `npm run build:vercel` passed.
- Manual browser QA from Step 06 is still outstanding in this environment and must be completed separately.
