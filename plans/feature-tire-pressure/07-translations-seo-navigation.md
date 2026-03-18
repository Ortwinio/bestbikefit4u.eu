# Prompt 07 — Translations, SEO, Sitemap & Navigation

## Context

Project: BestBikeFit4U — Next.js 16 (App Router, `src/` dir), Tailwind CSS, TypeScript.

**Prerequisites**: Prompts 03–06 must be done. All new UI components and pages exist.

**i18n pattern**: Translations live in:
- `src/i18n/messages/en.ts` — typed object exported as `en`
- `src/i18n/messages/nl.ts` — must match the exact same shape as `en` (enforced by `type nl = typeof en`)

Both files export a deeply nested object. Add new keys by extending existing top-level sections (`nav`, `dashboard`, etc.) or by adding a new top-level section.

**Dashboard messages**: The dashboard uses `src/i18n/dashboardMessages.ts` which likely re-exports a slice of the full message object. Check whether `dashboard.*` keys from `en.ts` are accessed via this file or via the full `en.ts` shape.

**Sitemap**: Calculator pages are registered in `src/lib/seo/sitemap/sources.ts` inside `CALCULATOR_ROUTE_SEEDS`.

**Public navigation**: `src/components/layout/Header.tsx` and `src/components/layout/HeaderMobileMenu.tsx` render the public nav. Currently nav items are: "How It Works", "Pricing". There is no "Calculators" or "Tools" dropdown yet; the footer has a "Calculators" section. The public nav currently only links to `/about` and `/pricing`.

**Dashboard sidebar**: `src/components/layout/DashboardSidebar.tsx`. The `navigation` array drives the sidebar links.

---

## Part A — Translation keys to add

### In `en.ts`

Add a new top-level section `pressure` (or extend `dashboard` and `nav` as appropriate):

```ts
// Under nav section — extend nav object
nav: {
  // ... existing keys ...
  tools: "Tools",
  tirePressure: "Tire Pressure Calculator",
},

// New top-level section: pressure
pressure: {
  // Page metadata
  publicPage: {
    title: "Tire Pressure Calculator | BestBikeFit4U",
    description: "Calculate the ideal tire pressure for road, gravel or MTB. Free, no account needed.",
    h1: "Free Tire Pressure Calculator",
    subtitle: "Calculate your ideal tyre pressure for road, gravel or MTB. Enter your weight and tyre size for an instant recommendation.",
  },
  roadPage: {
    title: "Road Bike Tire Pressure Calculator | BestBikeFit4U",
    description: "Calculate ideal road bike tyre pressure based on weight, tyre width and surface.",
    h1: "Road Bike Tire Pressure",
  },
  gravelPage: {
    title: "Gravel Bike Tire Pressure Calculator | BestBikeFit4U",
    description: "Find the optimal gravel bike tyre pressure for mixed surfaces.",
    h1: "Gravel Bike Tire Pressure",
  },
  mtbPage: {
    title: "MTB Tire Pressure Calculator | BestBikeFit4U",
    description: "Calculate mountain bike tyre pressure for trail, enduro or XC.",
    h1: "MTB Tire Pressure",
  },
  // Calculator form labels
  form: {
    disciplineLabel: "Bike type",
    disciplineRoad: "Road bike",
    disciplineGravel: "Gravel bike",
    disciplineMtb: "MTB",
    bodyWeightLabel: "Body weight (kg)",
    widthFrontLabel: "Front tyre width (mm)",
    widthRearLabel: "Rear tyre width (mm)",
    tubeTypeLabel: "Tube type",
    tubeTypeInnerTube: "Inner tube",
    tubeTypeLatex: "Latex tube",
    tubeTypeTubeless: "Tubeless",
    surfaceLabel: "Surface",
    surfaceSmoothAsphalt: "Smooth asphalt",
    surfaceAverageAsphalt: "Average asphalt",
    surfaceRoughAsphalt: "Rough asphalt",
    surfaceHardpackGravel: "Hardpack gravel",
    surfaceLooseGravel: "Loose gravel",
    surfaceTrail: "Trail",
    ridingGoalLabel: "Riding goal (optional)",
    ridingGoalSpeed: "Speed",
    ridingGoalBalance: "Balance",
    ridingGoalComfort: "Comfort",
    bikeWeightLabel: "Bike weight (optional)",
    advancedOptions: "Advanced options",
  },
  // Result card
  result: {
    front: "Front",
    rear: "Rear",
    bar: "bar",
    psi: "PSI",
    explanation: "Explanation",
    warningsTitle: "Warnings",
    disclaimer: "Always follow the manufacturer's maximum pressure limits.",
    warningMessages: {
      max_rim_pressure_exceeded: "Recommended pressure exceeds the tyre or rim maximum.",
      hookless_limit_exceeded: "Hookless rim: maximum pressure limit exceeded. Check specifications.",
      hookless_max_pressure_unknown: "Hookless rim: maximum pressure unknown. Stay at or below 3.5 bar unless otherwise stated.",
      inner_tube_pinch_flat_risk: "Low pressure with inner tube: risk of pinch flat.",
      front_rear_pressure_mismatch: "Large difference between front and rear pressure. Check your inputs.",
      road_tire_width_unusual: "Unusual tyre width for a road bike. Please verify.",
      gravel_tire_width_unusual: "Unusual tyre width for a gravel bike.",
      mtb_tire_width_unusual: "MTB tyres are typically at least 45 mm wide.",
    },
  },
  // CTA after public result
  cta: {
    heading: "Want to save this for your bike?",
    body: "Create a free account to save your ideal tyre pressure per bike, wheelset and surface.",
    primaryButton: "Create free account",
    secondaryButton: "Learn more",
    loginPrompt: "Already have an account?",
    loginLink: "Log in",
  },
  // Dashboard wizard
  wizard: {
    title: "Calculate tyre pressure",
    stepLabels: {
      bike: "Bike",
      wheelsetTires: "Wheelset & tyres",
      weightGoal: "Weight & goal",
      route: "Route",
      result: "Result",
    },
    stepOf: "Step {current} of {total}",
    back: "Back",
    next: "Next",
    selectBike: "Select a bike",
    noBikes: "No bikes saved yet.",
    addBikeLink: "Add a bike",
    continueWithoutBike: "Continue without saved bike",
    selectWheelset: "Select a wheelset",
    manualInput: "Enter manually",
    bodyWeightRequired: "Body weight is required.",
    saveCalculation: "Save calculation",
    saveAsPreset: "Save as preset",
    presetName: "Preset name",
    presetUseCase: "Use case",
    useCaseRace: "Race",
    useCaseEndurance: "Endurance",
    useCaseWetWeather: "Wet weather",
    useCaseGravelMixed: "Gravel mixed",
    useCaseComfort: "Comfort",
    useCaseCustom: "Custom",
    calculationSaved: "Calculation saved!",
    presetSaved: "Preset saved!",
    newCalculation: "New calculation",
    goToMyBikes: "Go to my bikes",
    routeModeManual: "Manual",
    routeModeNoRoute: "Without route",
    routeModeStrava: "Strava (coming soon)",
    surfaceLabel: "Surface",
    distanceLabel: "Route distance (km)",
    elevationLabel: "Elevation (m)",
    offRoadLabel: "Off-road %",
    currentFrontLabel: "Current front pressure (bar, optional)",
    currentRearLabel: "Current rear pressure (bar, optional)",
    extraLuggageLabel: "Extra luggage (kg)",
    wetLabel: "Weather",
    wet: "Wet",
    dry: "Dry",
  },
  // Bike card pressure summary
  bikeCard: {
    front: "Front",
    rear: "Rear",
    noCalculation: "No pressure calculated",
    newCalculation: "Calculate pressure",
    lastCalculated: "Last calculated",
  },
  // Bike detail pressure section
  bikeDetail: {
    sectionTitle: "Tyre pressure",
    activeWheelset: "Active wheelset",
    activeTireSetup: "Active tyre setup",
    noWheelset: "No wheelset saved",
    noTireSetup: "No tyre setup",
    recommendedPressure: "Recommended pressure",
    currentPressure: "Current pressure",
    noCalculation: "No pressure calculated for this bike yet.",
    profiles: "Saved presets",
    manageWheelsets: "Manage wheelsets",
    calculatePressure: "Calculate pressure",
  },
  // Status badge
  status: {
    optimal: "On target",
    slightly_high: "Slightly high",
    too_high: "Too high",
    too_low: "Too low",
    no_measurement: "No measurement",
  },
  // Dashboard pressure widget
  dashboardWidget: {
    title: "Tyre pressure overview",
    bikesOptimal: "{count} bike(s) on target",
    bikesNeedAttention: "{count} bike(s) need attention",
    noRecentCalculations: "No recent pressure calculations.",
    link: "View all",
  },
},
```

### In `nl.ts`

Add the exact same structure with Dutch translations:

```ts
nav: {
  // ... existing keys ...
  tools: "Tools",
  tirePressure: "Bandenspanningscalculator",
},

pressure: {
  publicPage: {
    title: "Bandenspanningscalculator | BestBikeFit4U",
    description: "Bereken gratis de ideale bandenspanning voor racefiets, gravelbike of MTB. Direct resultaat, geen account nodig.",
    h1: "Gratis bandenspanningscalculator",
    subtitle: "Bereken je ideale bandenspanning voor racefiets, gravelbike of MTB. Voer je gewicht en bandmaat in voor direct advies.",
  },
  roadPage: {
    title: "Bandenspanning Racefiets Calculator | BestBikeFit4U",
    description: "Bereken de ideale bandenspanning voor jouw racefiets op basis van gewicht, bandmaat en ondergrond.",
    h1: "Bandenspanning Racefiets",
  },
  gravelPage: {
    title: "Bandenspanning Gravelbike Calculator | BestBikeFit4U",
    description: "Vind de optimale bandenspanning voor jouw gravelbike op gemengde ondergrond.",
    h1: "Bandenspanning Gravelbike",
  },
  mtbPage: {
    title: "Bandenspanning MTB Calculator | BestBikeFit4U",
    description: "Bereken de ideale MTB-bandenspanning voor trail, enduro of crosscountry.",
    h1: "Bandenspanning MTB",
  },
  form: {
    disciplineLabel: "Fietstype",
    disciplineRoad: "Racefiets",
    disciplineGravel: "Gravelbike",
    disciplineMtb: "MTB",
    bodyWeightLabel: "Lichaamsgewicht (kg)",
    widthFrontLabel: "Bandbreedte voor (mm)",
    widthRearLabel: "Bandbreedte achter (mm)",
    tubeTypeLabel: "Type band",
    tubeTypeInnerTube: "Binnenband",
    tubeTypeLatex: "Latex binnenband",
    tubeTypeTubeless: "Tubeless",
    surfaceLabel: "Ondergrond",
    surfaceSmoothAsphalt: "Glad asfalt",
    surfaceAverageAsphalt: "Gemiddeld asfalt",
    surfaceRoughAsphalt: "Slecht asfalt",
    surfaceHardpackGravel: "Hardpack gravel",
    surfaceLooseGravel: "Losse gravel",
    surfaceTrail: "Trail",
    ridingGoalLabel: "Rijdoel (optioneel)",
    ridingGoalSpeed: "Snelheid",
    ridingGoalBalance: "Balans",
    ridingGoalComfort: "Comfort",
    bikeWeightLabel: "Fietsgewicht (optioneel)",
    advancedOptions: "Geavanceerde opties",
  },
  result: {
    front: "Voor",
    rear: "Achter",
    bar: "bar",
    psi: "PSI",
    explanation: "Toelichting",
    warningsTitle: "Waarschuwingen",
    disclaimer: "Fabrikantlimieten zijn altijd leidend.",
    warningMessages: {
      max_rim_pressure_exceeded: "De aanbevolen druk overschrijdt de maximale druk van je band/velg.",
      hookless_limit_exceeded: "Hookless velgen: maximale druk overschreden. Controleer de specificaties.",
      hookless_max_pressure_unknown: "Hookless velgen: maximale druk onbekend. Houd het op max. 3,5 bar tenzij anders vermeld.",
      inner_tube_pinch_flat_risk: "Binnenband bij lage druk: risico op klemband (pinch flat).",
      front_rear_pressure_mismatch: "Groot verschil tussen voor- en achterdruk. Controleer je invoer.",
      road_tire_width_unusual: "Ongebruikelijke bandbreedte voor een racefiets. Controleer de maat.",
      gravel_tire_width_unusual: "Ongebruikelijke bandbreedte voor een gravelbike.",
      mtb_tire_width_unusual: "MTB-banden zijn normaal minimaal 45 mm breed.",
    },
  },
  cta: {
    heading: "Wil je dit opslaan per fiets?",
    body: "Maak een gratis account aan om je ideale bandenspanning per fiets, wielset en ondergrond te bewaren.",
    primaryButton: "Maak gratis account",
    secondaryButton: "Meer informatie",
    loginPrompt: "Al een account?",
    loginLink: "Inloggen",
  },
  wizard: {
    title: "Bandenspanning berekenen",
    stepLabels: {
      bike: "Fiets",
      wheelsetTires: "Wielset & banden",
      weightGoal: "Gewicht & doel",
      route: "Route",
      result: "Resultaat",
    },
    stepOf: "Stap {current} van {total}",
    back: "Terug",
    next: "Volgende",
    selectBike: "Kies een fiets",
    noBikes: "Nog geen fietsen opgeslagen.",
    addBikeLink: "Fiets toevoegen",
    continueWithoutBike: "Doorgaan zonder opgeslagen fiets",
    selectWheelset: "Kies een wielset",
    manualInput: "Handmatig invoeren",
    bodyWeightRequired: "Lichaamsgewicht is verplicht.",
    saveCalculation: "Berekening opslaan",
    saveAsPreset: "Opslaan als preset",
    presetName: "Naam",
    presetUseCase: "Gebruiksscenario",
    useCaseRace: "Race",
    useCaseEndurance: "Endurance",
    useCaseWetWeather: "Nat weer",
    useCaseGravelMixed: "Gravel mixed",
    useCaseComfort: "Comfort",
    useCaseCustom: "Aangepast",
    calculationSaved: "Berekening opgeslagen!",
    presetSaved: "Preset opgeslagen!",
    newCalculation: "Nieuwe berekening",
    goToMyBikes: "Naar mijn fietsen",
    routeModeManual: "Handmatig",
    routeModeNoRoute: "Zonder route",
    routeModeStrava: "Strava (binnenkort)",
    surfaceLabel: "Ondergrond",
    distanceLabel: "Routeafstand (km)",
    elevationLabel: "Hoogtemeters (m)",
    offRoadLabel: "% off-road",
    currentFrontLabel: "Huidige voordruk (bar, optioneel)",
    currentRearLabel: "Huidige achterdruk (bar, optioneel)",
    extraLuggageLabel: "Extra bagage (kg)",
    wetLabel: "Weer",
    wet: "Nat",
    dry: "Droog",
  },
  bikeCard: {
    front: "Voor",
    rear: "Achter",
    noCalculation: "Geen druk berekend",
    newCalculation: "Druk berekenen",
    lastCalculated: "Berekend op",
  },
  bikeDetail: {
    sectionTitle: "Bandenspanning",
    activeWheelset: "Actief wielset",
    activeTireSetup: "Actieve bandenset",
    noWheelset: "Geen wielset opgeslagen",
    noTireSetup: "Geen bandenset",
    recommendedPressure: "Aanbevolen druk",
    currentPressure: "Huidige druk",
    noCalculation: "Nog geen druk berekend voor deze fiets.",
    profiles: "Opgeslagen presets",
    manageWheelsets: "Wielset beheren",
    calculatePressure: "Druk berekenen",
  },
  status: {
    optimal: "In lijn",
    slightly_high: "Iets te hoog",
    too_high: "Te hoog",
    too_low: "Te laag",
    no_measurement: "Geen meting",
  },
  dashboardWidget: {
    title: "Overzicht bandenspanning",
    bikesOptimal: "{count} fiets(en) optimaal",
    bikesNeedAttention: "{count} fiets(en) vraagt aandacht",
    noRecentCalculations: "Geen recente drukberekeningen.",
    link: "Bekijk alles",
  },
},
```

**Important**: After adding these keys, run `npm run type-check` (or equivalent) to verify `nl.ts` still satisfies `type nl = typeof en`. Fix any mismatches.

---

## Part B — Sitemap: add new calculator pages

In `src/lib/seo/sitemap/sources.ts`, add to `CALCULATOR_ROUTE_SEEDS`:

```ts
{
  id: "calculator-tire-pressure",
  path: "/bandenspanning-calculator",
  lastmod: "2026-03-17",
  changefreq: "weekly",
  priority: 0.9,
},
{
  id: "calculator-tire-pressure-road",
  path: "/bandenspanning/racefiets",
  lastmod: "2026-03-17",
  changefreq: "weekly",
  priority: 0.8,
},
{
  id: "calculator-tire-pressure-gravel",
  path: "/bandenspanning/gravelbike",
  lastmod: "2026-03-17",
  changefreq: "weekly",
  priority: 0.8,
},
{
  id: "calculator-tire-pressure-mtb",
  path: "/bandenspanning/mtb",
  lastmod: "2026-03-17",
  changefreq: "weekly",
  priority: 0.8,
},
```

---

## Part C — Public navigation: add tire pressure link

In `src/components/layout/Header.tsx`, add "Bandenspanning" as a nav item linking to `/bandenspanning-calculator`.

The existing nav array is roughly:
```tsx
{ href: "/about", label: labels.nav.howItWorks }
{ href: "/pricing", label: labels.nav.pricing }
```

Add:
```tsx
{ href: "/bandenspanning-calculator", label: labels.nav.tirePressure }
```

Or, if a "Tools" / "Calculators" dropdown already exists, add it there. If not, add it as a direct link before "Pricing".

Also update `src/components/layout/HeaderMobileMenu.tsx` (or equivalent) to include the same link.

Update the footer: the footer has a "Calculators" section. Add "Bandenspanning" (NL) / "Tire Pressure" (EN) to the footer calculators list, linking to `/bandenspanning-calculator`.

In `src/i18n/messages/en.ts` footer section, extend:
```ts
footer: {
  // ... existing ...
  tirePressure: "Tire Pressure",
}
```

And in `nl.ts`:
```ts
footer: {
  // ... existing ...
  tirePressure: "Bandenspanning",
}
```

---

## Part D — Dashboard sidebar: add Bandenspanning link

In `src/components/layout/DashboardSidebar.tsx`, add a new nav item to the `navigation` array:

```ts
import { Gauge } from "lucide-react"; // or another relevant icon like Wind, Zap

// Add to navigation array:
{ name: messages.nav.tirePressure, href: "/dashboard/pressure-calculator", icon: Gauge },
```

Place it after "Mijn fietsen" (myBikes) in the navigation list.

Also add the same item to the mobile menu in `src/app/(dashboard)/layout.tsx`:
```tsx
{ href: "/dashboard/pressure-calculator", label: messages.nav.tirePressure },
```

Add the `nav.tirePressure` translation key to the dashboard messages section in both `en.ts` and `nl.ts`:
```ts
// en.ts dashboard.nav:
tirePressure: "Tyre Pressure"

// nl.ts dashboard.nav:
tirePressure: "Bandenspanning"
```

---

## Part E — Dashboard overview widget

On the main dashboard page (`src/app/(dashboard)/dashboard/page.tsx` or similar — check what exists), add a tire pressure summary widget.

Load recent calculations:
```ts
const recentCalcs = useQuery(api.pressureCalculations.queries.listForUser, { limit: 3 });
const bikes = useQuery(api.bikes.queries.list);
```

Widget content:
- Heading: messages.pressure.dashboardWidget.title ("Tyre pressure overview" / "Overzicht bandenspanning")
- For each of the user's bikes (up to 3): show bike name, latest recommended pressure (Voor X.X / Achter X.X), and status badge
- If no calculations: show "Nog geen drukberekeningen." with a link to `/dashboard/pressure-calculator`
- "Bekijk alles" link → `/dashboard/bikes`

Create this as a separate Client Component:
`src/components/features/pressure/DashboardPressureWidget.tsx`

---

## Part F — Update public calculator components to use translations

Go back to the components created in prompt 03 and replace hardcoded strings with translation keys. The public pages use a locale-aware messages system (check how existing public pages access translations — likely via a hook or prop). Follow the same pattern used in e.g. `src/app/(public)/faq/page.tsx`.

---

## Files to create/modify

```
src/i18n/messages/en.ts                          (modified — add pressure section)
src/i18n/messages/nl.ts                          (modified — add pressure section)
src/lib/seo/sitemap/sources.ts                   (modified — add 4 new calculator routes)
src/components/layout/Header.tsx                 (modified — add tire pressure nav link)
src/components/layout/HeaderMobileMenu.tsx       (modified — add tire pressure nav link)
src/components/layout/DashboardSidebar.tsx       (modified — add Bandenspanning sidebar item)
src/app/(dashboard)/layout.tsx                   (modified — add item to mobile menu)
src/components/features/pressure/DashboardPressureWidget.tsx   (new)
src/app/(dashboard)/dashboard/page.tsx           (modified — embed DashboardPressureWidget)
```

And update any hardcoded strings in the components from prompt 03 to use the translation system.
