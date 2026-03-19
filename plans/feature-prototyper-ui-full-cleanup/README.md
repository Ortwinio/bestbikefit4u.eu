# Prototyper UI Full Cleanup

## Goal

Finish the UI migration so app and public flows stop rendering ad hoc native controls directly and instead go through shared UI primitives.

## Scope

In scope:
- Remaining raw form controls and action buttons in `src/app` and `src/components`
- Missing shared UI primitives needed to complete migration
- Dashboard, questionnaire, bikes, pressure, auth/public calculator surfaces

Out of scope:
- Redesigning page information architecture
- Rewriting `src/components/prototyper-ui/ui/*`
- Non-UI backend or data-model changes

## Execution Order

1. Add missing shared primitives:
   - `Textarea`
   - `Slider`
   - reusable selectable option controls for card/pill/button patterns
2. Migrate questionnaire and profile measurement choice controls
3. Migrate dashboard settings/new-fit selection controls
4. Migrate bikes create/edit and upload-facing controls
5. Migrate pressure calculator and pressure wizard
6. Migrate public calculator forms and remaining auth/menu controls
7. Validate build/tests and document residual risk

## Acceptance Criteria

1. No remaining raw `<input>`, `<select>`, or `<textarea>` in app/components consumer code except hidden file inputs where browser-native behavior is required
2. Remaining raw `<button>` usage is limited to structurally justified cases, with primary user-facing actions and selection patterns routed through shared UI primitives
3. Dashboard, questionnaire, bikes, pressure wizard, and public calculator forms all use shared UI wrappers
4. `npm run build:vercel` passes
5. Changed-scope tests pass

## Status

| Step | Status |
|------|--------|
| Shared primitives | Done |
| Questionnaire + profile steps | Done |
| Dashboard controls | Done |
| Bikes flows | Done |
| Pressure flows | Done |
| Public/auth/menu cleanup | Done |
| Validation | Done |

## Validation Notes

- `npm run build:vercel`: passed
- `npx vitest run src/components/ui/primitives.test.tsx src/i18n/messages/messages-parity.test.ts`: passed
- Remaining native elements after repo scan are limited to:
  - hidden file inputs in photo uploaders, where browser-native file selection is required
  - one dashboard mobile-menu overlay close button used as structural shell chrome rather than a reusable form/action control
