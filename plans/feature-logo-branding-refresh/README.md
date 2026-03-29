# Logo And Branding Refresh

## Goal

Use the assets in `public/logo` to upgrade the BestBikeFit4U application branding with:

- consistent logo usage across the app
- a proper favicon and app icon setup
- a color system derived from the logo palette to improve UX clarity

## Status

Implemented on 2026-03-28.

Validation completed:

- `npm run build:vercel`

Closeout artifacts:

- [output-01-brand-contract.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-logo-branding-refresh/output-01-brand-contract.md)
- [output-02-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-logo-branding-refresh/output-02-closeout.md)

## Available Assets

Current logo files:

- `public/logo/bestbikefit4u_logo_primary.svg`
- `public/logo/bestbikefit4u_logo_dark.svg`
- `public/logo/bestbikefit4u_mark.svg`
- `public/logo/bestbikefit4u_icon_app.svg`
- PNG variants of the same assets

Observed brand colors in the SVG assets:

- deep charcoal: `#1C1F29`
- brand blue: `#089BE9`
- support blue: `#0587DC`
- brand orange: `#F68D17`
- slate: `#4E6778`
- light neutral: `#DEDEDF`

## Current State

- brand identity is still mostly text-only in [src/components/layout/Header.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/Header.tsx)
- root metadata exists in [src/app/layout.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/layout.tsx), but favicon/app-icon branding is not fully wired from `public/logo`
- the global design tokens already live in [src/app/globals.css](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/globals.css)
- brand constants live in [src/config/brand.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/config/brand.ts)

## Product Decisions

1. Use the horizontal logo on light surfaces and the dark-logo variant on dark surfaces.
2. Use the mark or app icon for favicon, app icon, and compact dashboard/mobile contexts.
3. Derive the main UI palette from the logo, but do not turn the whole app into a loud orange-and-blue theme.
4. Keep blue as the primary interaction color and use orange as a selective highlight or emphasis color.
5. Preserve readability, contrast, and the current structured product feel.

## Scope

This plan covers:

- favicon and app-icon integration
- header and dashboard logo usage
- selective metadata branding updates
- global token refresh based on the logo palette
- UI validation for light mode, dark mode, public pages, and dashboard surfaces

This plan does not cover:

- a full brand copy rewrite
- redesigning every page layout from scratch
- replacing every illustration or image asset in the app

## Acceptance Criteria

- the app uses actual BestBikeFit4U logo assets instead of text-only branding in primary navigation surfaces
- favicon and app icon are sourced from the new logo assets
- the global theme tokens are updated to use the logo-derived palette
- primary, hover, accent, border, and emphasis colors stay readable in light and dark mode
- public pages and dashboard pages both use the refreshed branding consistently
- the chosen logo variants are appropriate for light and dark surfaces
- metadata and basic sharing surfaces reference the refreshed brand assets where applicable

## Success Criteria

- the product feels recognizably branded within the first screen
- the interface looks more intentional and less generic
- the refreshed colors improve hierarchy and CTA clarity without hurting contrast
- logo usage is centralized and maintainable instead of scattered ad hoc

## Execution Steps

1. [01-brand-audit-and-asset-contract.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-logo-branding-refresh/01-brand-audit-and-asset-contract.md)
2. [02-favicon-and-metadata-plan.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-logo-branding-refresh/02-favicon-and-metadata-plan.md)
3. [03-logo-integration-surfaces.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-logo-branding-refresh/03-logo-integration-surfaces.md)
4. [04-theme-token-refresh.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-logo-branding-refresh/04-theme-token-refresh.md)
5. [05-validation-and-rollout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-logo-branding-refresh/05-validation-and-rollout.md)
