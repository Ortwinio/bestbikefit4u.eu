# Naming And Routing

## Current Problem

The public calculator routes are not fully polished as one family. The clearest inconsistency is the English tire-pressure route living on Dutch naming:

- `/bandenspanning-calculator`

There are also parallel content routes in both languages:

- `/bandenspanning/[slug]`
- `/tire-pressure/[slug]`

And internal references still exist to:

- `/pressure-calculator`

## Canonical Route Contract

### English

- `/calculators/bike-fit`
- `/calculators/saddle-height`
- `/calculators/frame-size`
- `/calculators/crank-length`
- `/calculators/tire-pressure`

### Dutch

- `/calculators/bike-fit`
- `/calculators/zadelhoogte`
- `/calculators/framemaat`
- `/calculators/cranklengte`
- `/calculators/bandenspanning`

## Migration Strategy

### Phase 1: Canonical declaration

- define the canonical route set in one shared routing config
- update metadata helpers to use canonical localized paths

### Phase 2: Internal-link update

- update CTAs
- update related links
- update homepage calculator references
- update sitemap sources

### Phase 3: Redirects

- redirect `/bandenspanning-calculator` to English or Dutch canonical route as appropriate
- redirect `/pressure-calculator` to the canonical localized route
- preserve campaign and analytics attribution parameters

### Phase 4: SEO cleanup

- canonical tags
- alternate locale links
- sitemap entries
- analytics page-path normalization

## Naming Contract

### UI naming

- always use one calculator title per locale
- use the same name in hero, metadata, CTA text, and related links

### CTA naming

- “Open bike-fit calculator”
- “Open saddle-height calculator”
- “Open frame-size calculator”
- “Open crank-length calculator”
- “Open tire-pressure calculator”

## Engineering Implications

- Introduce a shared calculator route registry.
- Stop hard-coding calculator hrefs across multiple pages.
- Update sitemap and metadata generation to pull from the same route registry.
- Normalize analytics page names so legacy paths and canonical paths roll up together during migration.

## Success Criteria

- No mixed-language calculator route remains as the visible canonical route.
- Internal links use one shared route source of truth.
- Redirects preserve SEO equity and analytics continuity.
- Users see the same calculator naming everywhere.

## User Acceptance Tests

1. An English user opens the tire-pressure calculator.
   Expected: the visible canonical route is English and matches the page title.
2. A Dutch user opens the Dutch tire-pressure calculator.
   Expected: the visible route and the page title are both Dutch and consistent.
3. A legacy link to `/bandenspanning-calculator` still works.
   Expected: it redirects cleanly to the correct canonical route without losing UTM parameters.
4. A user navigates from homepage, related links, and calculator CTAs.
   Expected: every path uses the same naming convention.
