# Color Scheme And Theme Contract

## Objective

Improve the CSS color system so the public experience feels more intentional, more premium, and more consistent across light, dark, and system theme modes.

## Inputs

- [globals.css](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/globals.css)
- [ThemeProvider.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/providers/ThemeProvider.tsx)
- Public pages touched in earlier steps
- Output from Step 01

## Tasks

1. Audit current public palette usage:
   backgrounds, card layers, muted surfaces, primary emphasis, CTA contrast, and warning/support states.
2. Define a tighter public surface hierarchy using the existing token system:
   shell background, section background, card, subtle card, accent band, and trust/info states.
3. Refine light-theme tokens where the current experience feels too flat or too weakly separated.
4. Refine dark-theme tokens so cards, muted surfaces, and CTA accents remain distinct and commercial rather than muddy.
5. Verify `system` theme behavior from [ThemeProvider.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/providers/ThemeProvider.tsx) and make any needed polish changes without breaking preference persistence.
6. Remove one-off public color treatments when they should map to shared tokens or utilities.
7. Confirm contrast and CTA visibility on homepage, pricing, login, calculators, FAQ, and contact.

## Deliverable

A cleaner public color-token contract and updated implementation that improves hierarchy, brand feel, and theme consistency.

## Completion Checklist

- [ ] Surface hierarchy is explicitly defined.
- [ ] Public pages rely more on shared tokens and less on one-off mixes.
- [ ] Light and dark themes both preserve emphasis and readability.
- [ ] `system` theme behavior remains correct.
- [ ] CTA contrast is strong on key conversion pages.
