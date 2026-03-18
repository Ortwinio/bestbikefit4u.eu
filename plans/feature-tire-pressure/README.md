# Feature Plan: Tire Pressure Module (Bandenspanningsmodule)

## Goal

Build a tire pressure calculator and management feature for BestBikeFit4U that serves both as a public SEO/lead-generation tool and as a logged-in setup assistant. Users should be able to open their dashboard and immediately see the recommended tire pressure for each of their bikes.

## Background

The functional design (in Dutch) is located at:

```
plans/feature-tire pressure/Functioneel ontwerp bandenspanningsmodule BestBikeFit4U.md
```

It covers goals, UX principles, domain model, calculation logic, validation rules, safety warnings, and phasing advice. All implementation details in the prompt files below are derived from that document.

## Scope

### In scope — MVP (Fase 1 + Fase 2 from section 23 of the functional design)

**Fase 1**
- Public tire pressure calculator (no login required)
- Discipline-specific landing pages: road, gravel, MTB
- Bike storage in the dashboard (new fields: discipline, bikeWeightKg, photoUrl)
- Dashboard bike cards showing pressure summary
- Dashboard advanced pressure calculator (wizard, no Strava)

**Fase 2**
- Comparing recommended vs. current pressure
- Saving presets (race, endurance, wet weather, gravel mixed)
- Multiple wheelsets per bike
- Extended safety warnings

### Out of scope (Fase 3 — not in this plan)
- Strava integration (OAuth, activity import, route-based corrections)
- Pressure history / trend log
- AI feedback loop
- Temperature-based corrections

## Approach / Phasing

The prompts are ordered to respect data and dependency flow:

| Prompt | Content | Dependency |
|--------|---------|------------|
| 01 | Convex schema + pressure engine | None |
| 02 | Convex mutations/queries for all new tables | 01 |
| 03 | Public calculator page + discipline landing pages | 01 |
| 04 | Dashboard bikes extension (cards + detail) | 02 |
| 05 | Dashboard advanced pressure wizard | 02 |
| 06 | `/dashboard/bikes/new` extended with wheelset step | 02 |
| 07 | Translations, SEO, sitemap, navigation | 03–06 |

Each prompt is self-contained: it repeats all field names, route paths, component names, and Convex function names so a fresh agent can execute it without reading other prompts or the functional design.

## Acceptance Criteria

### Public calculator
- [ ] `/bandenspanning-calculator` renders without login, shows result in real time
- [ ] `/bandenspanning/racefiets`, `/bandenspanning/gravelbike`, `/bandenspanning/mtb` each pre-select the correct discipline
- [ ] Result shows front bar, rear bar, front PSI, rear PSI, and a short explanation
- [ ] Safety warning "controleer altijd de maximale druk van band en velg" is always shown
- [ ] Post-result CTA links to sign-up flow
- [ ] Page works fully on mobile (375 px viewport)

### Dashboard bikes
- [ ] Each bike card on `/dashboard/bikes` shows pressure summary (Voor X.X bar / Achter X.X bar) with status color
- [ ] Bike detail page `/dashboard/bikes/[bikeId]` shows a tire pressure section with active wheelset, tire setup, recommended pressure, and last recorded pressure
- [ ] Status label (in lijn / iets te hoog / te hoog / te laag) is color-coded: green / orange / red

### Dashboard pressure wizard
- [ ] `/dashboard/pressure-calculator` is a 5-step wizard requiring authentication
- [ ] Steps: (1) select/create bike, (2) wheelset & tires, (3) weight & goal, (4) route, (5) result
- [ ] Result can be saved as a `pressureCalculation` and optionally as a `pressureProfile` preset
- [ ] All validation rules from section 20 of the functional design are enforced

### Data model
- [ ] `wheelsets`, `tireSetups`, `pressureProfiles`, `pressureCalculations` tables exist in Convex schema
- [ ] `bikes` table extended with `discipline`, `bikeWeightKg`, `photoUrl`, `fitProfileId`
- [ ] All mutations are guarded by `requireUserId()` or `requireBikeOwner()`

### Translations & SEO
- [ ] All new UI strings exist in both `en.ts` and `nl.ts`
- [ ] New public pages have `title`, `description`, and `canonical` metadata
- [ ] Public calculator pages are in `sitemap-calculators.xml`
- [ ] "Bandenspanning" / "Tire Pressure" appears in public nav under existing Calculators link / footer
- [ ] Dashboard sidebar includes a "Bandenspanning" nav item

## Progress Notes

_(to be filled in during execution)_
