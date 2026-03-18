# Prompt 02 — Programmatic Tire-Pressure Pages

## Goal

Generate static landing pages for high-intent long-tail tire-pressure searches using the existing pressure engine.

## Repo Reality

- `src/lib/pressure-engine.ts` already provides the calculation logic
- The repo already has public pressure entry pages under `/bandenspanning*`
- The route plan must avoid invalid Next.js folder syntax; use a single `[slug]` param and parse it
- Existing sitemap code is section-based and should be extended, not replaced

## Recommended Route Shape

- `src/app/(public)/tire-pressure/[slug]/page.tsx`
- `src/app/(public)/bandenspanning/[slug]/page.tsx`

Examples:

- `/tire-pressure/75kg-road-bike`
- `/bandenspanning/75kg-racefiets`

## Deliverables

1. Add shared slug/data helpers under `src/lib/seo/programmatic/`
2. Build static EN and NL programmatic pages backed by the pressure engine
3. Add explicit alternates because EN and NL pathnames differ
4. Add these routes to the calculators sitemap

## Acceptance Criteria

- Each page renders a recommendation that matches its slug
- Invalid slugs return `notFound()`
- Pages link back to the main pressure calculator and relevant guides
