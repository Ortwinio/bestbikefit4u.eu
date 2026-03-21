# Prototyper UI Audit Remediation Plan

## Goal

Close the remaining open issues from [audit.md](/Users/ortwinverreck/Developer/bestbikefit4u/audit.md) and complete the migration of the shared UI surface toward Prototyper UI contracts, tokens, and dark/light mode behavior.

## Scope

In scope:

- root wrapper cleanup in `src/components/ui`
- adoption of missing Prototyper primitives where the audit identified local fallbacks
- token and dark/light cleanup across shell and high-traffic feature surfaces
- migration of selection controls and form composition to Prototyper-style field/group semantics
- test coverage for the migrated shared surface

Out of scope:

- unrelated Convex/backend work
- SEO/content changes unrelated to UI migration
- broad product redesign outside what is needed to align with Prototyper UI and existing app tokens

## Current Status

- Completed already:
  - `Button` link composition path restored
  - tooltip submit bug fixed
  - persisted theme preference sync fixed
  - major `Link > Button` / `TrackedCtaLink > Button` composition issues removed
  - `AccessibleDialog`, `Progress`, `Input`, `NumberInput`, `Slider`, `Textarea`, `Select`, `Card`, `Toast`, and `ThemeToggle` moved closer to Prototyper-style contracts
  - `Field` helper introduced and partially adopted
- Still open from the audit:
  - shell and feature surfaces still hardcode palette classes instead of tokens
  - `Selectable` and selection-heavy flows still need proper Prototyper semantics
  - some wrapper APIs remain compatibility-oriented instead of clean upstream contracts
  - missing upstream primitive adoption is still incomplete
  - tests do not yet fully protect the new root contracts

## Approach

1. Finish the shared primitive surface so the app stops fighting the design system.
2. Migrate selection and field composition patterns in feature flows.
3. Replace remaining hardcoded shell and feature styling with token-driven styling.
4. Backfill tests for wrapper contracts and critical client interactions.

## Acceptance Criteria

- `src/components/ui` uses Prototyper/UI or Base UI composition consistently, without major contract mismatches called out in `audit.md`
- dark/light mode works across shared shells and primary feature flows without hardcoded light-only palette assumptions
- major selection/form surfaces use Prototyper-style field/group/radio/checkbox/segmented patterns
- `npm run build:vercel` passes
- targeted lint/type/test checks pass for the migrated surfaces
- `audit.md` is updated to reflect completed work and any consciously deferred items

## Steps

1. `01-shared-surface.md`
2. `02-selection-controls.md`
3. `03-shell-token-migration.md`
4. `04-feature-surface-migration.md`
5. `05-test-hardening.md`
6. `06-audit-closeout.md`
