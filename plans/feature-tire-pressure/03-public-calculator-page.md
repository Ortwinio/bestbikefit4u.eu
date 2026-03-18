# Prompt 03 — Public Tire Pressure Calculator Pages

## Context

Project: BestBikeFit4U — Next.js 16 (App Router, `src/` dir), Tailwind CSS, TypeScript.

**Prerequisite**: Prompt 01 must have been executed. The pressure engine module is available at `src/lib/pressure-engine.ts` and exports:
- `calculateBasicPressure(input: BasicPressureInput): PressureOutput`
- `validatePressureInput(input: Partial<BasicPressureInput>): ValidationError[]`
- Types: `Discipline`, `Surface`, `TubeType`, `RidingGoal`, `WarningKey`, `BasicPressureInput`, `PressureOutput`, `ValidationError`

The existing public app is in `src/app/(public)/`. Public pages use Server Components for metadata and Client Components for interactive parts. Look at `src/app/(public)/calculators/saddle-height/page.tsx` for the pattern.

The project uses i18n with `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts` for translations, but the public calculator pages currently use hardcoded strings in some places. **For this prompt, hardcode the UI strings in English** — translations will be added in prompt 07. Use clear string constants at the top of each component file so they can be easily moved to the translation files later.

---

## Part A — Main public calculator page

Create: `src/app/(public)/bandenspanning-calculator/page.tsx`

This is a **Server Component** that renders the page with metadata and embeds client components.

### Metadata

```ts
export const metadata: Metadata = {
  title: "Bandenspanningscalculator | BestBikeFit4U",
  description:
    "Bereken gratis de ideale bandenspanning voor jouw racefiets, gravelbike of MTB. Voer je gewicht en bandmaat in en krijg direct een advies in bar en PSI.",
  keywords: [
    "bandenspanning calculator",
    "bandenspanning racefiets",
    "bandenspanning gravelbike",
    "bandenspanning MTB",
    "tire pressure calculator",
    "band druk berekenen",
  ],
  alternates: {
    canonical: "https://bestbikefit4u.eu/bandenspanning-calculator",
  },
  openGraph: {
    title: "Gratis bandenspanningscalculator",
    description: "Bereken direct de ideale bandenspanning voor jouw fiets.",
    type: "website",
  },
};
```

### Page structure

```tsx
export default function BandenspanningCalculatorPage() {
  return (
    <div>
      <PressureCalculatorHero />
      <PressureCalculatorForm />
      <PressureCalculatorFaq />
      <PressureCalculatorCta />
    </div>
  );
}
```

---

## Part B — Discipline-specific landing pages

Create three pages that pre-select a discipline and render the same calculator:

- `src/app/(public)/bandenspanning/racefiets/page.tsx` — pre-selects `discipline: "road"`
- `src/app/(public)/bandenspanning/gravelbike/page.tsx` — pre-selects `discipline: "gravel"`
- `src/app/(public)/bandenspanning/mtb/page.tsx` — pre-selects `discipline: "mtb"`

Each has its own `metadata` (title, description, canonical) targeting the specific keyword.

Example for `racefiets`:
```ts
export const metadata: Metadata = {
  title: "Bandenspanning Racefiets Calculator | BestBikeFit4U",
  description:
    "Bereken de ideale bandenspanning voor jouw racefiets op basis van gewicht, bandmaat en ondergrond. Gratis, direct resultaat.",
  keywords: ["bandenspanning racefiets", "band druk racefiets", "tire pressure road bike"],
  alternates: { canonical: "https://bestbikefit4u.eu/bandenspanning/racefiets" },
};
```

Pass `defaultDiscipline` prop to `PressureCalculatorForm`:
```tsx
<PressureCalculatorForm defaultDiscipline="road" />
```

---

## Part C — `PressureCalculatorHero` component

Create: `src/components/features/pressure/PressureCalculatorHero.tsx`

This is a **Server Component** (no `"use client"`).

Content:
- `<h1>Gratis bandenspanningscalculator</h1>`
- Subtitle: "Bereken direct de ideale band druk voor racefiets, gravelbike of MTB. Geen account nodig."
- Three short trust signals as a row of chips: "Gebaseerd op gewicht & bandmaat", "Werkt voor road, gravel & MTB", "Direct resultaat"

Use Tailwind for styling. Consistent with the existing hero sections in the project (see `src/app/(public)/page.tsx` for reference style).

---

## Part D — `PressureCalculatorForm` component

Create: `src/components/features/pressure/PressureCalculatorForm.tsx`

This is a **Client Component** (`"use client"`).

### Props

```ts
interface PressureCalculatorFormProps {
  defaultDiscipline?: "road" | "gravel" | "mtb";
}
```

### State

```ts
const [discipline, setDiscipline] = useState<"road" | "gravel" | "mtb">(
  props.defaultDiscipline ?? "road"
);
const [bodyWeightKg, setBodyWeightKg] = useState<number>(75);
const [widthFrontMm, setWidthFrontMm] = useState<number>(28);
const [widthRearMm, setWidthRearMm] = useState<number>(28);
const [tubeType, setTubeType] = useState<"inner_tube" | "latex_tube" | "tubeless">("tubeless");
const [surface, setSurface] = useState<Surface>("average_asphalt");
const [ridingGoal, setRidingGoal] = useState<RidingGoal | undefined>(undefined);
const [bikeWeightKg, setBikeWeightKg] = useState<number | undefined>(undefined);
const [result, setResult] = useState<PressureOutput | null>(null);
const [errors, setErrors] = useState<ValidationError[]>([]);
```

### Real-time calculation

Use `useEffect` (or `useMemo`) to call `calculateBasicPressure` whenever any input changes. Update `result` and `errors` on every change.

```ts
useEffect(() => {
  const validationErrors = validatePressureInput({
    bodyWeightKg, widthFrontMm, widthRearMm, discipline, tubeType, surface
  });
  setErrors(validationErrors);
  if (validationErrors.length === 0) {
    const output = calculateBasicPressure({
      discipline,
      bodyWeightKg,
      widthFrontMm,
      widthRearMm,
      tubeType,
      surface,
      ridingGoal,
      bikeWeightKg,
    });
    setResult(output);
  } else {
    setResult(null);
  }
}, [discipline, bodyWeightKg, widthFrontMm, widthRearMm, tubeType, surface, ridingGoal, bikeWeightKg]);
```

### UX requirements (mobile-first)

- **Discipline**: segmented control (3 buttons: "Racefiets" / "Gravelbike" / "MTB") — maps to `road` / `gravel` / `mtb`
- **Lichaamsgewicht**: slider, range 35–160 kg, step 1, with numeric display
- **Bandbreedte voor**: slider, range 18–80 mm, step 1. After `widthFrontMm` changes and `widthRearMm` has not been manually changed by the user, mirror the value automatically.
- **Bandbreedte achter**: slider, range 18–80 mm, step 1. Label shows "(achter)".
- **Type band**: segmented control — "Binnenband" (inner_tube) / "Latex" (latex_tube) / "Tubeless"
- **Ondergrond**: chip selection or dropdown — options:
  - "Glad asfalt" (smooth_asphalt)
  - "Gemiddeld asfalt" (average_asphalt)
  - "Slecht asfalt" (rough_asphalt)
  - "Hardpack gravel" (hardpack_gravel)
  - "Losse gravel" (loose_gravel)
  - "Trail" (trail)
- **Rijdoel** (optional, shown as collapsed "Geavanceerde opties" accordion or simple row of 3 optional chips):
  - "Snelheid" (speed) / "Balans" (balance) / "Comfort" (comfort)
- **Fietsgewicht** (optional): small number input, placeholder "ca. 8 kg"

The result (`PressureResultCard`) appears **below the form on the same screen**, updating in real time. No submit button needed; result is always visible once inputs are valid.

Display validation errors inline next to the relevant field.

---

## Part E — `PressureResultCard` component

Create: `src/components/features/pressure/PressureResultCard.tsx`

### Props

```ts
interface PressureResultCardProps {
  result: PressureOutput;
}
```

### Content

- Large display of front pressure: "Voor **{frontBar} bar** ({frontPsi} PSI)"
- Large display of rear pressure: "Achter **{rearBar} bar** ({rearPsi} PSI)"
- Explanation text from `result.explanation`
- Warning section: if `result.warnings.length > 0`, render a yellow/amber box with:
  - Always include the static disclaimer: "Controleer altijd de maximale druk van band en velg."
  - Per warning key, map to a human-readable Dutch message:

| Warning key | Dutch message |
|---|---|
| `max_rim_pressure_exceeded` | "De aanbevolen druk overschrijdt de maximale druk van je band/velg." |
| `hookless_limit_exceeded` | "Hookless velgen hebben een maximale druk — controleer de specificaties." |
| `hookless_max_pressure_unknown` | "Hookless velgen: maximale druk onbekend. Houd het op max. 3,5 bar tenzij anders vermeld." |
| `inner_tube_pinch_flat_risk` | "Binnenband bij lage druk: risico op klemband (pinch flat)." |
| `front_rear_pressure_mismatch` | "Groot verschil tussen voor- en achterdruk. Controleer je invoer." |
| `road_tire_width_unusual` | "Ongebruikelijke bandbreedte voor een racefiets. Controleer de maat." |
| `gravel_tire_width_unusual` | "Ongebruikelijke bandbreedte voor een gravelbike." |
| `mtb_tire_width_unusual` | "MTB-banden zijn normaal minimaal 45 mm breed." |

- Static disclaimer line (always shown, outside the warning box): "Fabrikantlimieten zijn altijd leidend."

---

## Part F — `PressureCalculatorFaq` component

Create: `src/components/features/pressure/PressureCalculatorFaq.tsx`

Server component. Contains FAQ content targeting SEO keywords.

FAQ items (hardcoded, English/Dutch mixed is fine for now; translations in prompt 07):

1. **Hoe bereken ik de bandenspanning voor mijn racefiets?**
   Body: short paragraph explaining weight, tire width, tube type are the main factors. Mention the typical range: 5–8 bar for road bikes.

2. **Welke bandenspanning is goed voor een gravelbike?**
   Body: gravel bikes typically run 1.5–3.5 bar tubeless. Lower pressure gives more grip and comfort on mixed surfaces.

3. **Welke bandenspanning gebruik ik voor MTB-banden?**
   Body: MTB tubeless typically 1.0–2.5 bar. Downhill and enduro use lower pressures than XC.

4. **Wat is het verschil tussen tubeless en binnenband voor bandenspanning?**
   Body: tubeless can run 0.3–0.5 bar lower because there's no pinch-flat risk. This gives more comfort and grip.

5. **Hoeveel bandenspanning voor een zwaarder rijder?**
   Body: heavier riders need higher pressure. The calculator accounts for your body weight and bike weight automatically.

Use an accordion or simple stacked `<details>` / `<summary>` elements. Use `itemScope` / `itemType="https://schema.org/FAQPage"` structured data.

---

## Part G — `PressureCalculatorCta` component

Create: `src/components/features/pressure/PressureCalculatorCta.tsx`

Server component. Shown after the result card.

Content:
- Heading: "Wil je dit advies opslaan per fiets?"
- Body: "Maak een gratis account aan om je ideale bandenspanning per fiets, wielset en ondergrond te bewaren. Log ook je huidige druk in en vergelijk."
- Two buttons:
  - Primary: "Maak gratis account" → links to `/login` (use `withLocalePrefix` from `src/i18n/navigation.ts` if locale is available, otherwise just `/login`)
  - Secondary: "Meer informatie" → links to `/pricing`
- Also a line: "Al een account? [Log in](/login)"

---

## File structure summary

```
src/app/(public)/bandenspanning-calculator/page.tsx
src/app/(public)/bandenspanning/racefiets/page.tsx
src/app/(public)/bandenspanning/gravelbike/page.tsx
src/app/(public)/bandenspanning/mtb/page.tsx
src/components/features/pressure/PressureCalculatorHero.tsx
src/components/features/pressure/PressureCalculatorForm.tsx
src/components/features/pressure/PressureResultCard.tsx
src/components/features/pressure/PressureCalculatorFaq.tsx
src/components/features/pressure/PressureCalculatorCta.tsx
```

Do not modify any existing files in this prompt except to add the new routes (Next.js App Router will automatically pick up new directories). Do not create Convex mutations or queries.
