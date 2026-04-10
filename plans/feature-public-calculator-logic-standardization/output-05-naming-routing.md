# Naming And Routing

## Mission

Make calculator naming and routing feel deliberate, bilingual, and product-grade.

## Current Routing Reality

Current mixed pattern:

- fit calculators use `/calculators/...`
- English tire pressure still uses `/bandenspanning-calculator`

This weakens polish and makes the English product surface feel partially untranslated.

## Recommended Route Model

### English

- `/calculators/bike-fit`
- `/calculators/saddle-height`
- `/calculators/frame-size`
- `/calculators/crank-length`
- `/calculators/tire-pressure`

### Dutch

Recommended preferred pattern:

- `/calculators/bike-fit`
- `/calculators/zadelhoogte`
- `/calculators/framemaat`
- `/calculators/cranklengte`
- `/calculators/bandenspanning`

Alternative if the product chooses one neutral route family:

- keep `/calculators/...` as the family path in both locales
- localize the slug per locale

## Naming Contract

### Product-facing names

- English: Bike Fit Calculator, Saddle Height Calculator, Frame Size Calculator, Crank Length Calculator, Tire Pressure Calculator
- Dutch: Bike fit calculator, Zadelhoogte calculator, Framemaat calculator, Cranklengte calculator, Bandenspanning calculator

### CTA references

CTAs should use the same names everywhere:

- no mixed references like “bandenspanning calculator” on English surfaces unless intentional for SEO legacy only
- no inconsistent capitalization across the same locale

## Migration Strategy

### Phase 1

- define new canonical route targets
- keep current routes working
- add redirect plan

### Phase 2

- update internal links, CTAs, related-links modules, and calculators index
- update metadata and alternates

### Phase 3

- add permanent redirects from legacy routes
- monitor analytics continuity

## SEO And Analytics Constraints

- preserve canonical and alternate links during migration
- preserve campaign and CTA source tracking
- preserve route-level analytics history through redirect mapping
- update sitemap calculator entries

## Success Criteria

- Route conventions are consistent and bilingual.
- English routes are no longer partially Dutch for the tire-pressure calculator.
- Internal links and metadata follow the same naming contract.
- Redirects protect SEO and campaign attribution.

## User Acceptance Tests

1. An English-speaking rider sees English calculator route names and English calculator titles.
2. A Dutch-speaking rider sees Dutch calculator titles and route slugs where localization is intended.
3. Legacy calculator URLs still reach the right destination through redirects.
4. Internal links from homepage, guides, FAQ, and related-links modules all point to the canonical route version.
