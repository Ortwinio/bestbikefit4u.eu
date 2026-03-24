# Panel Surface Contrast Audit And Remediation Plan

**Status:** Implemented
**Target:** Remove unreadable transparent panels and standardize panel contrast behavior
**Owner:** Codex
**Last updated:** 2026-03-24

---

## Why This Plan Exists

The current application still contains panel and overlay surfaces that rely on translucency.

That is now a product and usability problem:

- the feedback panel can feel transparent against the page behind it
- overlay and mobile panel surfaces are not visually strong enough in all contexts
- the styling rules for panel backgrounds are not explicitly defined or enforced

The audit already shows that this is broader than the feedback panel:

- shared Prototyper UI dialog overlay in `src/components/prototyper-ui/ui/dialog.tsx`
- feedback right-side panel in `src/components/feedback/FeedbackDialog.tsx`
- dashboard mobile top bar in `src/app/(dashboard)/layout.tsx`
- dashboard mobile menu overlay in `src/app/(dashboard)/layout.tsx`
- accessible dialog overlay in `src/components/ui/AccessibleDialog.tsx`

This plan creates one explicit panel-surface contract, audits the app against it, and then implements the fixes in a controlled way.

---

## Product Requirement

The styling guideline for panel-like surfaces is:

- in light mode:
  - panel background is black
  - text and controls are white or blue
- in dark mode:
  - panel background is white
  - text and controls are white or blue, adjusted as needed for readability and contrast

Operational interpretation for implementation:

- no panel body should feel transparent against page content
- overlay/backdrop may still dim the page, but the panel content surface itself must be opaque
- the rule applies to sheet-like panels, modal panels, mobile slide-over navigation, and other popup-style surfaces

Because the dark-mode button rule is visually unusual if interpreted literally, implementation must validate readability carefully before rollout. The requirement itself remains the source of truth unless revised.

---

## Goal

Bring all panel-like surfaces to one explicit contrast standard by:

- removing panel-body transparency
- auditing all dialog/sheet/slide-over surfaces in the app
- defining reusable theme tokens or utility classes for panel surfaces
- aligning feedback and non-feedback panels to the same rule
- verifying contrast and usability in both light and dark modes

---

## Scope

### In scope

- feedback right-side panel
- shared Prototyper UI dialog overlay and content surface
- shared accessible dialog overlay/content
- mobile dashboard navigation panel and overlay
- other popup-style panels found during audit
- theme tokens/utilities needed to enforce the new rule
- acceptance validation for contrast and readability

### Out of scope

- full-page backgrounds
- regular cards embedded in page layout
- hero overlays and decorative backgrounds unless they are used as functional panels
- unrelated visual redesign of the application

---

## Current Audit Findings

### Shared dialog primitive

`src/components/prototyper-ui/ui/dialog.tsx`

- `DialogOverlay` uses translucent black overlays:
  - `bg-black/40`
  - `dark:bg-black/55`
- `DialogContent` uses token-driven `bg-overlay`, but the theme contract for panel contrast is not aligned to the new requirement

### Feedback panel

`src/components/feedback/FeedbackDialog.tsx`

- the feedback panel itself uses `bg-[color:var(--card)]`
- it inherits the shared dialog overlay behavior
- this means the visual system still depends on existing theme tokens instead of the new explicit black/white panel rule

### Dashboard mobile surfaces

`src/app/(dashboard)/layout.tsx`

- the mobile top bar uses `bg-card/90 backdrop-blur`
- the mobile menu close overlay uses `bg-[color:var(--foreground)]/20`

### Shared accessible dialog

`src/components/ui/AccessibleDialog.tsx`

- the overlay uses `bg-[color:color-mix(in_oklch,var(--foreground)_30%,transparent)] backdrop-blur-sm`

---

## Implementation Strategy

### Principle 1 — Fix the contract first

Do not patch individual panels with one-off hardcoded classes until the panel-surface rule is defined centrally.

### Principle 2 — Separate backdrop from panel body

- backdrop may dim the page
- panel body must be opaque
- these are different responsibilities and should not share the same style assumptions

### Principle 3 — Tokenize where possible

If the requirement becomes durable, use dedicated tokens or reusable utilities such as:

- `--panel-surface`
- `--panel-foreground`
- `--panel-accent`
- `panel-surface`
- `panel-backdrop`

### Principle 4 — Audit all popup surfaces, not just feedback

The feedback panel is the main user complaint, but the same issue exists in other slide-over and overlay surfaces.

### Principle 5 — Validate contrast explicitly

This plan must check:

- readability
- focus visibility
- button contrast
- destructive/warning/info state readability on inverted panel backgrounds

---

## Execution Order

1. `01-panel-surface-contract.md`
2. `02-surface-audit-inventory.md`
3. `03-feedback-and-shared-dialog-remediation.md`
4. `04-non-feedback-panel-remediation.md`
5. `05-validation-and-closeout.md`

---

## Acceptance Criteria

- [ ] The feedback panel body is opaque and readable in both light and dark mode.
- [ ] The feedback panel no longer feels transparent against the page behind it.
- [ ] The shared Prototyper UI dialog surface contract is updated to match the new panel rule or explicitly wrapped where needed.
- [ ] The dashboard mobile menu and other audited popup-style panels are checked against the same rule.
- [ ] No popup-style panel relies on semi-transparent body backgrounds after remediation.
- [ ] Backdrop styling is visually separate from panel-body styling.
- [ ] Buttons, text, links, and form controls inside panels meet readable contrast in both light and dark mode.
- [ ] A closeout document maps every audited panel surface to pass/fail/remediated status.

---

## Success Criteria

- the feedback panel is easy to read on every page background
- the app has one clear rule for panel surfaces instead of mixed transparency behavior
- future dialogs/sheets can reuse the same styling contract
- no new hardcoded one-off panel color rules are introduced without documentation

---

## Risks

- the requested dark-mode rule may create poor contrast if applied mechanically
- changing shared dialog primitives may unintentionally affect admin or auth flows
- some surfaces may need per-surface exceptions if they depend on semantic state colors

---

## Success Definition

This work is successful if the feedback panel and every audited popup-style surface have an explicit, opaque, contrast-safe design contract that matches the requested theme direction and can be verified in both light and dark mode.

## Outputs

- [output-01-surface-inventory.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-panel-surface-contrast-audit/output-01-surface-inventory.md)
- [output-02-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-panel-surface-contrast-audit/output-02-closeout.md)
