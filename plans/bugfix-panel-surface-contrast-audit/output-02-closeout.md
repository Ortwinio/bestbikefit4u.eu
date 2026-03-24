# Panel Surface Contrast Closeout

## Summary

The panel contrast plan has been implemented.

The main change is structural:

- translucency is now limited to the backdrop layer
- panel bodies use an explicit opaque surface contract
- the feedback panel inherits the shared contract instead of maintaining a separate semi-transparent style path

## Implemented Contract

Defined in:

- [globals.css](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/globals.css)
- [dialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui/dialog.tsx)

Shared contract pieces:

- `panel-surface-base`
- `panel-surface-subtle`
- `panel-theme-context`
- `panel-backdrop`

## Remediated Surfaces

- feedback panel in [FeedbackDialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/feedback/FeedbackDialog.tsx)
- shared dialog primitive in [dialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui/dialog.tsx)
- shared accessible dialog in [AccessibleDialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/AccessibleDialog.tsx)
- dashboard mobile header/menu in [layout.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/layout.tsx)
- cookie consent banner in [CookieConsentBanner.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/CookieConsentBanner.tsx)

## Acceptance Mapping

### The feedback panel body is opaque and readable in both light and dark mode

Met in code.

Evidence:

- [FeedbackDialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/feedback/FeedbackDialog.tsx)
- [dialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui/dialog.tsx)

### The feedback panel no longer feels transparent against the page behind it

Met in code.

Evidence:

- the panel body now uses `panel-surface-base`
- transparency is isolated to `panel-backdrop`

### The shared Prototyper UI dialog surface contract is updated to match the new panel rule

Met.

Evidence:

- [dialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui/dialog.tsx)
- [dialog.contract.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui/dialog.contract.test.ts)

### The dashboard mobile menu and other audited popup-style panels are checked against the same rule

Met for the implemented scope.

Evidence:

- [layout.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/layout.tsx)
- [CookieConsentBanner.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/CookieConsentBanner.tsx)

### No popup-style panel relies on semi-transparent body backgrounds after remediation

Met for the audited user-facing surfaces and shared wrappers.

### Backdrop styling is visually separate from panel-body styling

Met.

Evidence:

- `panel-backdrop` utility in [globals.css](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/globals.css)

### Buttons, text, links, and form controls inside panels remain readable

Met in changed scope, with manual browser QA still recommended.

Evidence:

- panel theme context overrides in [globals.css](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/globals.css)
- feedback panel action/button adjustments in [FeedbackDialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/feedback/FeedbackDialog.tsx)

## Validation

- `npm run typecheck`
- `npx vitest run src/components/prototyper-ui/ui/dialog.contract.test.ts src/components/ui/AccessibleDialog.test.tsx 'src/app/(dashboard)/layout.test.tsx'`

Manual QA still required:

- light mode browser check
- dark mode browser check
- mobile feedback panel
- mobile dashboard menu

## Notes

- the requested theme direction was implemented as an explicit panel contract
- dark-mode readability still takes precedence where a literal “white text on white panel” outcome would be unusable
