# Prototyper UI Migration Audit

Date: 2026-03-21

## Scope

Audit of the partial Prototyper UI migration with focus on:

- root component migration in `src/components/ui` and `src/components/prototyper-ui/ui`
- CSS token usage and dark/light mode correctness
- root prop migration correctness
- remaining hardcoded styling in major consumer surfaces

Method:

- 20 subagent audits across root wrappers, theme, tests, and feature clusters
- local verification of root source, wrappers, plans, and consumer usage
- Prototyper UI component inventory/theme comparison via MCP docs

## Executive Summary

The migration is only partially complete.

- Real Prototyper source exists for 8 components in [src/components/prototyper-ui/ui](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui).
- The shared app layer in [src/components/ui](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui) is still mostly a compatibility layer, not a clean Prototyper surface.
- Several wrappers re-own Prototyper styling and props instead of exposing the upstream contracts.
- Dark mode is still broadly broken outside tokenized islands because public/dashboard/auth shells and many feature surfaces still use hardcoded `gray/*`, `blue/*`, `white`, `amber/*`, `green/*`.
- There are real correctness/accessibility bugs, not just styling drift.

## Remediation Update

Status update after the first implementation pass on 2026-03-21:

- Fixed: tooltip help triggers now set `type="button"` and no longer submit surrounding forms.
- Fixed: `ThemeProvider` now applies persisted `user.theme_preference` back into live React state instead of only writing `localStorage`.
- Fixed: the shared `Button` wrapper now exposes the Prototyper `render=` composition path, with test coverage for render-based link composition.
- Fixed: direct `Link > Button` nesting has been removed from the audited dashboard, bikes, pressure, profile, layout, error, and public page scopes.
- Fixed: `TrackedCtaLink` no longer forces `anchor > button` composition. It can now act as the rendered link target for `Button`, and the remaining marketing CTA buttons were migrated to `Button render={<TrackedCtaLink ... />}`.

Verified after these changes:

- repo scan found no remaining direct `<Link> ... <Button>` nesting
- repo scan found no remaining direct `<TrackedCtaLink> ... <Button>` nesting
- `npx tsc --noEmit --pretty false` passed
- `npx vitest run src/components/ui/Tooltip.test.tsx src/components/ui/primitives.test.tsx` passed

Still open after this pass:

- the broader token/dark-mode migration across shell and feature surfaces
- incomplete root wrapper adoption for `Card`, `AccessibleDialog`, `Progress`, `Input`/`Textarea`, `Select`, `Slider`, `NumberInput`, `Toast`, and selection controls
- missing adoption of upstream primitives like `field`, `textarea`, `slider`, `numberfield`, and segmented/radio/checkbox group patterns
- lint cleanup in existing files, including `@typescript-eslint/no-explicit-any` in [src/app/(dashboard)/dashboard/page.tsx#L51](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/dashboard/page.tsx#L51)

## Priority Findings

### P0

1. Fixed: Tooltip help icons can submit forms.
  Evidence: [src/components/ui/Tooltip.tsx#L57](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Tooltip.tsx#L57), [src/components/ui/FieldLabel.tsx#L30](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/FieldLabel.tsx#L30)
   Why: `TooltipTrigger` renders a button and no `type="button"` is set.
2. Fixed: `Button` migration exposed the missing Prototyper `render=` path, and the invalid nested interactive markup identified in the audit was removed.
  Evidence: [src/components/ui/Button.tsx#L25](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Button.tsx#L25), [src/components/ui/Button.tsx#L44](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Button.tsx#L44), [src/components/prototyper-ui/ui/button.tsx#L89](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui/button.tsx#L89)
   Representative fallout:
  - [src/app/(dashboard)/fit/page.tsx#L303](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/fit/page.tsx#L303)
  - [src/app/(dashboard)/fit/[sessionId]/results/page.tsx#L431](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/fit/[sessionId]/results/page.tsx#L431)
  - [src/components/bikes/BikeGarageOverview.tsx#L169](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeGarageOverview.tsx#L169)
  - [src/components/features/pressure/wizard/StepResult.tsx#L224](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/pressure/wizard/StepResult.tsx#L224)
3. Fixed: persisted user theme preference is now applied back into live React state.
  Evidence: [src/components/providers/ThemeProvider.tsx#L85](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/providers/ThemeProvider.tsx#L85)
   Why: the effect only writes `localStorage`; it does not update `theme` state from `user.theme_preference`.

### P1

1. Root wrapper migration is incomplete and often mismapped.
  - `Button` reimplements variants on top of forced upstream `ghost`
   Evidence: [src/components/ui/Button.tsx#L44](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Button.tsx#L44)
  - `Card` forces upstream `transparent` and restyles locally
  Evidence: [src/components/ui/Card.tsx#L27](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Card.tsx#L27)
  - `AccessibleDialog` and `Progress` still use Base UI directly instead of the copied Prototyper roots
  Evidence: [src/components/ui/AccessibleDialog.tsx#L3](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/AccessibleDialog.tsx#L3), [src/components/ui/Progress.tsx#L4](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Progress.tsx#L4)
  - `Textarea` and `Slider` are still native wrappers, not Prototyper source adoption
  Evidence: [src/components/ui/Textarea.tsx#L55](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Textarea.tsx#L55), [src/components/ui/Slider.tsx#L70](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Slider.tsx#L70)
2. Theme/token migration is incomplete at the root.
  - `globals.css` is a partial local token fork, missing important Prototyper tokens like `--color-field-border-focus`, semantic shadows, and easing tokens.
   Evidence: [src/app/globals.css#L3](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/globals.css#L3)
  - Core surfaces still hardcode black/white/shadow math instead of semantic token classes.
  Evidence:
  [src/components/prototyper-ui/ui/dialog.tsx#L35](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui/dialog.tsx#L35),
  [src/components/ui/Toast.tsx#L79](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Toast.tsx#L79),
  [src/components/ui/Tooltip.tsx#L69](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Tooltip.tsx#L69)
3. Public, auth, and dashboard shells are still mostly hardcoded light-mode UI.
  Evidence:
  - [src/app/(auth)/layout.tsx#L14](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(auth)/layout.tsx#L14)
  - [src/components/layout/Header.tsx#L22](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/Header.tsx#L22)
  - [src/components/layout/Footer.tsx#L18](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/Footer.tsx#L18)
  - [src/components/layout/DashboardSidebar.tsx#L70](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/DashboardSidebar.tsx#L70)
  - [src/components/layout/LanguageSwitch.tsx#L41](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/LanguageSwitch.tsx#L41)
4. `Input`/`Textarea` still use a custom field API instead of Prototyper `Field`.
  Evidence: [src/components/ui/Input.tsx#L6](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Input.tsx#L6), [src/components/ui/Textarea.tsx#L7](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Textarea.tsx#L7)
   Notes:
  - helper text disappears when an error exists
  - label styling is locally owned
  - ID fallback is label-derived before generated uniqueness
5. `Select` is still a compatibility shim, not a clean Prototyper contract.
  Evidence: [src/components/ui/Select.tsx#L18](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Select.tsx#L18), [src/components/ui/Select.tsx#L93](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Select.tsx#L93), [src/components/ui/Select.tsx#L98](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Select.tsx#L98)
   Notes:
  - ref type claims `HTMLSelectElement`, but the rendered trigger is a button
  - synthetic `ChangeEvent` only partially recreates native behavior
6. Questionnaire and settings selection controls still bypass proper Prototyper primitives.
  Evidence:
  - [src/components/questionnaire/questions/SingleChoice.tsx#L36](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/questionnaire/questions/SingleChoice.tsx#L36)
  - [src/components/questionnaire/questions/MultipleChoice.tsx#L44](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/questionnaire/questions/MultipleChoice.tsx#L44)
  - [src/components/ui/Selectable.tsx#L42](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Selectable.tsx#L42)
  - [src/components/ui/ThemeToggle.tsx#L29](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/ThemeToggle.tsx#L29)
7. Progress migration is incomplete.
  Evidence: [src/components/ui/Progress.tsx#L11](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Progress.tsx#L11), [src/components/prototyper-ui/ui/progress.tsx#L51](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui/progress.tsx#L51)
   Notes:
  - indeterminate state bypasses upstream behavior
  - wrapper keeps custom `indicatorClassName`/`trackClassName`
8. Results, pressure, bikes, measurements, and public marketing surfaces still have broad token drift.
  Representative evidence:
  - Results: [src/app/(dashboard)/fit/[sessionId]/results/page.tsx#L259](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/fit/[sessionId]/results/page.tsx#L259), [src/components/results/FitSummaryCard.tsx#L66](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/results/FitSummaryCard.tsx#L66)
  - Pressure: [src/components/features/pressure/BikePressureSection.tsx#L32](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/pressure/BikePressureSection.tsx#L32)
  - Bikes: [src/components/features/bikes/CreateBikeForm.tsx#L188](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/CreateBikeForm.tsx#L188)
  - Measurements/Profile: [src/components/measurements/MeasurementWizard.tsx#L141](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/measurements/MeasurementWizard.tsx#L141)
  - Public home/pricing/about: [src/app/(public)/page.tsx#L198](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/page.tsx#L198), [src/app/(public)/pricing/page.tsx#L287](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/pricing/page.tsx#L287)

### P2

1. Tests do not adequately protect the migrated contracts.
  Evidence:
  - [src/components/ui/primitives.test.tsx#L3](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/primitives.test.tsx#L3)
  - [src/components/ui/Tooltip.test.tsx#L4](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Tooltip.test.tsx#L4)
   Gaps:
  - barrel exports are effectively untested
  - dialog client path is untested
  - select compatibility behavior is only smoke-tested
  - field wrapper ARIA wiring is barely covered
2. `src/components/results` appears to be stale pre-migration UI still exported from a barrel.
  Evidence: [src/components/results/index.ts#L1](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/results/index.ts#L1)

## Root Component Audit


| Surface                  | Status                      | Notes                                                                                                     |
| ------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `prototyper-ui/button`   | Present                     | Root source exists, but shared wrapper hides `render`/`isPending` and reowns variants                     |
| `ui/Button`              | Failed clean migration      | Not a thin adapter; widespread nested `Link > Button` fallout                                             |
| `prototyper-ui/card`     | Present                     | Root source exists                                                                                        |
| `ui/Card`                | Partial                     | Forces upstream `transparent`, narrows variant model, reowns styling                                      |
| `prototyper-ui/dialog`   | Present                     | Root source exists                                                                                        |
| `ui/AccessibleDialog`    | Partial                     | Still Base UI direct; wrapper API not aligned with upstream composition                                   |
| `prototyper-ui/input`    | Present                     | Root source exists                                                                                        |
| `ui/Input`               | Partial                     | Custom field API instead of Prototyper `Field` composition                                                |
| `prototyper-ui/label`    | Present                     | Root source exists                                                                                        |
| `ui/FieldLabel`          | Partial                     | Custom label+tooltip composite, not upstream field contract                                               |
| `prototyper-ui/progress` | Present                     | Root source exists                                                                                        |
| `ui/Progress`            | Partial                     | Base UI root direct; indeterminate logic/custom slots reowned                                             |
| `prototyper-ui/select`   | Present                     | Root source exists                                                                                        |
| `ui/Select`              | Partial                     | Synthetic event adapter and wrong ref contract                                                            |
| `prototyper-ui/tooltip`  | Present                     | Root source exists                                                                                        |
| `ui/Tooltip`             | Failed clean migration      | Wrong a11y contract, per-tooltip provider, submit bug                                                     |
| `ui/Textarea`            | Missing Prototyper adoption | Local native wrapper                                                                                      |
| `ui/Slider`              | Missing Prototyper adoption | Local native range wrapper                                                                                |
| `ui/NumberInput`         | Partial                     | Base UI direct, not copied Prototyper `numberfield`                                                       |
| `ui/Toast`               | Partial                     | Base UI direct, not copied Prototyper `toast`                                                             |
| `ui/ThemeToggle`         | Local fallback              | Acceptable as a local fallback, but not aligned with upstream segmented-control and has a11y/state issues |
| `ui/Selectable`          | Custom                      | Should likely be replaced by radio/checkbox-group style primitives depending on usage                     |


## Upstream Primitives That Exist But Are Not Properly Adopted

Confirmed upstream via Prototyper docs/MCP:

- `field`
- `fieldset`
- `textarea`
- `slider`
- `numberfield`
- `toast`
- `segmented-control`
- `radio-group`
- `checkbox-group`
- `switch`

Most relevant local misses:

- `field` / `fieldset` for form composition
- `textarea` and `slider` because local wrappers are still native controls
- `numberfield` because local numeric input is still Base UI direct and public calculators still use generic numeric text inputs
- `segmented-control`, `radio-group`, and `checkbox-group` for theme toggle and questionnaire/settings selection patterns
- `toast` because the app uses a local Base UI implementation instead of copied Prototyper source

## Migration Verdict

The answer to “did we migrate the root components properly to the Prototyper UI ones, and did we migrate the props correctly?” is:

- Partially for source presence
- No for the shared root surface as actually consumed by the app

The repo has copied Prototyper source, but the public/shared app layer is still dominated by compatibility wrappers and custom ownership. The largest failures are:

1. hidden upstream APIs (`Button.render`, `Button.isPending`, proper `Card` variants, proper `Field` composition)
2. custom wrappers that still bypass copied Prototyper roots (`AccessibleDialog`, `Progress`, `Toast`, `NumberInput`)
3. major consumer surfaces still hardcoded to raw Tailwind palettes instead of the token system

## Recommended Fix Order

1. Fix correctness bugs first:
  - completed: tooltip `type="button"`
  - completed: `ThemeProvider` sync from saved user preference
  - completed: remove `Link > Button` nesting by restoring a proper link composition path
2. Normalize the root shared surface:
  - `Button`
  - `Card`
  - `AccessibleDialog`
  - `Progress`
  - `Input`/`Textarea`/`FieldLabel`
  - `Select`
3. Adopt the missing upstream primitives with highest leverage:
  - `field`
  - `textarea`
  - `slider`
  - `numberfield`
  - `segmented-control` or `radio-group`
4. Migrate shell surfaces to semantic tokens:
  - auth layout
  - public header/footer/language switch/mobile menu
  - dashboard sidebar
5. Tackle feature clusters:
  - questionnaire/results
  - pressure
  - bikes
  - profile/measurements
  - public marketing pages
6. Backfill tests around root wrapper contracts and client-side interactions
