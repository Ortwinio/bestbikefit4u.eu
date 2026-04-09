# Step 04: Dashboard High-Traffic Page Harmony

## Objective

Apply the dashboard contract to the highest-traffic authenticated pages so the signed-in product feels visually coherent with the public site.

## Inputs

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/fit/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/bikes/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
- Shared dashboard-facing components used by those pages
- Outputs from Steps 01–03

## Tasks

1. Standardize page-header composition:
   title, subtitle, top-level CTA, and optional utility actions.
2. Standardize section-card composition:
   section intro, content grouping, muted sub-panels, state modules, and secondary actions.
3. Align CTA hierarchy so dashboard actions feel premium and coherent with the public brand without becoming marketing-heavy.
4. Harmonize support/info/warning/success states across these pages.
5. Improve mobile-first clarity for dashboard hero/header/action surfaces.
6. Keep page behavior intact; this is a look-and-feel and component-alignment pass, not a workflow rewrite.

## Deliverable

Updated high-traffic dashboard pages that share one coherent visual language.

## Completion Checklist

- [ ] Dashboard home follows the new shell/card/header contract.
- [ ] Fit start follows the new shell/card/header contract.
- [ ] Settings follows the new shell/card/header contract.
- [ ] Bikes follows the new shell/card/header contract.
- [ ] Fit results visually align with the same system.
- [ ] Mobile and desktop both remain clear and usable.
