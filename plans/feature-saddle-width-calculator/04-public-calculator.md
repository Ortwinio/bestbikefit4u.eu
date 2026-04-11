# Prompt 04 — Public Marketing Calculator Page

## Context

Project: BestBikeFit4U — Next.js 16 (App Router, `src/` dir), TypeScript.

You are implementing the public saddle width calculator page. Prompts 02 and 03 must be complete before this one.

Dependencies:
- `src/lib/saddle-width-engine/` — calculation engine
- `convex/saddleWidth/mutations.ts` — `createPublicSaddleWidthSession`
- Existing public calculator pages as style reference — especially `src/app/(public)/calculators/bike-fit/page.tsx` and `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/components/public/` — `PublicPageShell`, `PublicHero`, `PublicSection`, `PublicFeatureCard`, `PublicCtaBand`, `PublicNumberField`, `PublicSelectField`
- `src/components/campaign/CampaignCtaGroup.tsx` — for campaign-aware CTAs
- `src/config/commercial.ts` — `isConsumerCampaignActive`, `getConsumerCampaignCopy`, `CONSUMER_CAMPAIGN_CONFIG`

---

## Part A — Route Registration

### 1. Add to `src/lib/public-calculators/routes.ts`

Add `"saddle-width"` to the `PublicCalculatorId` union:

```typescript
export type PublicCalculatorId =
  | "bike-fit"
  | "saddle-height"
  | "frame-size"
  | "crank-length"
  | "tire-pressure"
  | "saddle-width";   // ← add
```

Add registry entry:

```typescript
"saddle-width": {
  id: "saddle-width",
  canonicalPath: "/calculators/saddle-width",
  localizedPaths: {
    en: "/calculators/saddle-width",
    nl: "/calculators/saddle-width",
  },
  legacyAliases: [],
},
```

---

## Part B — Page and Form Files

Create the following files:

```
src/app/(public)/calculators/saddle-width/page.tsx
src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.tsx
```

---

## Part C — `page.tsx` structure

Follow the exact same structure as `src/app/(public)/calculators/bike-fit/page.tsx`.

### `generateMetadata()`

```typescript
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/saddle-width", locale);
  return {
    title: isNl
      ? "Zadelbreedtecalculator | BestBikeFit4U"
      : "Saddle Width Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken je ideale zadelbreedteaanbeveling op basis van zitbeenmeting of lichaamsgegevens. Inclusief zadelcategorie en betrouwbaarheidsscore."
      : "Calculate your ideal saddle width from sit-bone measurement or body data. Get a recommended width range, saddle family, and confidence score.",
    keywords: isNl
      ? ["zadelbreedte calculator", "zitbeenbreedte calculator", "racefiets zadelbreedteadvies", "gravelbike zadelmaat"]
      : ["saddle width calculator", "sit bone width calculator", "road saddle size", "gravel saddle selector"],
    openGraph: {
      title: isNl ? "Zadelbreedtecalculator" : "Saddle Width Calculator",
      description: isNl
        ? "Gratis zadelbreedteaanbeveling op basis van anatomie en rijprofiel."
        : "Free saddle width recommendation based on anatomy and riding profile.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}
```

### Page component

```typescript
export default async function SaddleWidthCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/saddle-width", locale);
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = buildFaqs(isNl);
  const trustPoints = buildTrustPoints(isNl);

  return (
    <PublicPageShell className="text-foreground">
      <JsonLd schema={[buildWebApplicationSchema({ ... }), buildHowToSchema({ ... })]} />

      <PublicHero
        eyebrow="BestBikeFit4U calculator"
        title={isNl ? "Zadelbreedtecalculator" : "Saddle Width Calculator"}
        description={isNl
          ? "Bereken een eerste zadelbreedteaanbeveling op basis van je zitbeenmeting of lichaamsgegevens en rijprofiel."
          : "Calculate a first-pass saddle width recommendation from your sit-bone measurement or body data and riding profile."}
        chips={isNl
          ? ["Gemeten of geschatte invoer", "Zadelcategorie inbegrepen", "Gratis startpunt"]
          : ["Measured or estimated input", "Saddle family included", "Free starting point"]}
      />

      <PublicSection className="mt-10" header={{ eyebrow: ..., title: ..., description: ... }}>
        <div className="grid gap-4 md:grid-cols-3">
          {trustPoints.map(...)}
        </div>
      </PublicSection>

      <SaddleWidthCalculatorForm isNl={isNl} />

      <PublicCtaBand
        className="mt-10"
        eyebrow={isNl ? "Hoe verder?" : "What's next?"}
        title={isNl ? "Verfijn de uitkomst in je account" : "Refine the result in your account"}
        description={isNl
          ? "Maak een gratis account aan om symptomen, huidige zadelpositie en rijprofiel mee te nemen in een completere zadelanalyse."
          : "Create a free account to include symptoms, current saddle position, and riding profile in a more complete saddle analysis."}
        actions={
          campaignActive ? (
            <>
              <CampaignCtaGroup
                locale={locale} pagePath={pagePath}
                startHref={withLocalePrefix("/login", locale)}
                startSection="saddle_width_result"
                donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
                donateSection="saddle_width_campaign_donate"
                startLabel={isNl ? "Maak account aan of log in" : "Create account or sign in"}
                donateLabel={campaign.donateCta}
              />
              <Button render={<TrackedCtaLink href={withLocalePrefix("/calculators/bike-fit", locale)} ... />} variant="outline">
                {isNl ? "Ga naar bike fit calculator" : "Open bike-fit calculator"}
              </Button>
            </>
          ) : (
            <>
              <Button render={<TrackedCtaLink href={withLocalePrefix("/login", locale)} ... section="saddle_width_result" />}>
                {isNl ? "Maak account aan of log in" : "Create account or sign in"}
              </Button>
              <Button render={<TrackedCtaLink href={withLocalePrefix("/pricing", locale)} ... section="saddle_width_pricing_cta" />} variant="outline">
                {isNl ? "Vergelijk Free vs Pro" : "Compare Free vs Pro"}
              </Button>
              <Button render={<TrackedCtaLink href={withLocalePrefix("/calculators/bike-fit", locale)} ... section="saddle_width_bike_fit_cta" />} variant="outline">
                {isNl ? "Ga naar bike fit calculator" : "Open bike-fit calculator"}
              </Button>
            </>
          )
        }
        aside={isNl
          ? "De calculator geeft een praktisch startpunt. Een persoonlijke fitter kan toegevoegde waarde bieden bij complexe biomechanische kwesties."
          : "The calculator gives a practical starting point. An in-person fitter can add value for complex biomechanical issues."}
      />

      <PublicSection className="mt-10" header={{ title: isNl ? "Veelgestelde vragen" : "FAQ", ... }}>
        <div className="space-y-4">
          {faqs.map(...)}
        </div>
      </PublicSection>

      <section className="mt-10">
        <RelatedLinksSection
          title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
          links={getRelatedLinks("saddle-width", locale)}
          locale={locale}
        />
      </section>
    </PublicPageShell>
  );
}
```

### Trust points (`buildTrustPoints`)

Use `ShieldCheck`, `Ruler`, `Gauge` icons from lucide-react.

EN:
1. **Anatomy first, not just size labels** (ShieldCheck) — "The recommendation starts from sit-bone width because that is the strongest anatomical predictor. Riding posture and bike category refine it from there."
2. **Two input paths, honest about accuracy** (Ruler) — "If you have a direct sit-bone measurement, use it. If not, the body-data estimate gives a useful starting range — but we tell you the confidence is lower."
3. **Width is the start, not the end** (Gauge) — "Saddle comfort also depends on shape, nose type, and tilt. The dashboard version combines all of these into a complete recommendation."

NL:
1. **Anatomie eerst, niet alleen maatetiketten** — "De aanbeveling begint bij zitbeenbreedte, want dat is de sterkste anatomische voorspeller. Rijhouding en fietscategorie verfijnen daarna."
2. **Twee invoerpaden, eerlijk over nauwkeurigheid** — "Heb je een directe zitbeenmeting? Gebruik die. Zo niet, geeft de schatting op basis van lichaamsgegevens toch een bruikbaar startbereik, maar we geven eerlijk aan dat de betrouwbaarheid lager is."
3. **Breedte is het begin, niet het einde** — "Zadelcomfort hangt ook af van vorm, neustype en kanteling. De dashboardversie combineert dit alles tot een volledige aanbeveling."

### HowTo schema steps

EN: ["Decide whether you have a sit-bone measurement or will use body data.", "Enter your measurements and riding profile.", "Read the recommended width range and saddle family.", "Use the result to shortlist saddles before buying."]

NL: ["Bepaal of je een zitbeenmeting hebt of lichaamsgegevens wilt gebruiken.", "Vul je metingen en rijprofiel in.", "Lees het aanbevolen breedtebereik en de zadelcategorie.", "Gebruik de uitkomst als shortlist voordat je een zadel koopt."]

### FAQs (`buildFaqs`)

EN:
- Q: "How do I measure my sit-bone width at home?" / A: "Place corrugated cardboard or kitchen foil on a hard chair. Sit normally for 30 seconds, stand up carefully, and measure the center-to-center distance between the two deepest indentations."
- Q: "Can saddle width alone solve numbness?" / A: "Width matters, but tilt and setback are often equally important. A nose-down tilt concentrates pressure centrally even on a correctly sized saddle. If your current saddle width is near the recommendation but you still have numbness, check tilt first."
- Q: "Why does my posture affect the saddle width recommendation?" / A: "More aggressive positions rotate the pelvis forward, which shifts where the sit bones contact the saddle. An upright rider typically needs more rear support than a race rider with the same sit-bone measurement."

NL: (translate faithfully)

---

## Part D — `SaddleWidthCalculatorForm.tsx` (client component)

Add `"use client"` at the top.

### State

```typescript
const [inputMode, setInputMode] = useState<"measured" | "estimated">("measured");

// Mode A fields
const [sitBoneWidthMm, setSitBoneWidthMm] = useState<number | undefined>(undefined);

// Mode B fields
const [heightCm, setHeightCm] = useState<number | undefined>(undefined);
const [weightKg, setWeightKg] = useState<number | undefined>(undefined);
const [hipCircumferenceCm, setHipCircumferenceCm] = useState<number | undefined>(undefined);

// Shared fields
const [ridingType, setRidingType] = useState<SaddleRidingType>("endurance_road");
const [postureCategory, setPostureCategory] = useState<SaddlePostureCategory>("balanced");
```

### Mode toggle

Show a two-option toggle at the top of the form:

```
[ ✓ I know my sit-bone width ] [ I don't have this measurement ]
```

Use two `Button` components with `variant="outline"` / `variant="default"` to show active state.

When mode switches, clear the fields from the inactive mode.

### Measurement help section (Mode A only)

Collapsible `<details>` / `<summary>` below the sit-bone input:

> **How to measure your sit-bone width at home**
> 1. Place corrugated cardboard or kitchen foil on a firm, flat chair (no cushion).
> 2. Sit in your normal riding position for about 30 seconds.
> 3. Stand up carefully without disturbing the indentations.
> 4. Measure the center-to-center distance between the two deepest marks.
> 5. Add 20–25 mm for a road/performance saddle, 25–30 mm for a comfort saddle, to get your target saddle width.

NL translation: "Hoe meet je je zitbeenbreedte thuis" — translate the steps faithfully.

### Select options

Riding type (`ridingType`):

| Value | EN label | NL label |
|-------|----------|----------|
| `road_race` | Road race | Racefiets koers |
| `endurance_road` | Endurance road | Endurance racefiets |
| `gravel` | Gravel | Gravel |
| `mtb` | Mountain bike | Mountainbike |
| `commuter_leisure` | Commuter / Leisure | Pendel / Recreatief |
| `tt_triathlon` | TT / Triathlon | TT / Triatlon |
| `indoor_only` | Indoor trainer only | Alleen indoor trainer |

Posture category (`postureCategory`):

| Value | EN label | NL label |
|-------|----------|----------|
| `aggressive` | Aggressive / Race | Agressief / Koers |
| `balanced` | Balanced / Endurance | Gebalanceerd / Endurance |
| `upright` | Upright / Relaxed | Rechtop / Ontspannen |

### Calculation trigger

Use `useMemo` to derive the result reactively (no submit button needed, same pattern as `BikeFitCalculatorForm`):

```typescript
const result = useMemo((): SaddleCalculationResult | null => {
  // Mode A: need sitBoneWidthMm
  if (inputMode === "measured") {
    if (!sitBoneWidthMm) return null;
    const widthResult = calculateSaddleWidth({ inputMethod: "measured", sitBoneWidthMm, ridingType, postureCategory });
    const suitability = classifySaddleSuitability({ inputMethod: "measured", sitBoneWidthMm, ridingType, postureCategory }, widthResult);
    return { width: widthResult, suitability };
  }
  // Mode B: need all three body measurements
  if (!heightCm || !weightKg || !hipCircumferenceCm) return null;
  const widthResult = calculateSaddleWidth({ inputMethod: "estimated", heightCm, weightKg, hipCircumferenceCm, ridingType, postureCategory });
  const suitability = classifySaddleSuitability({ inputMethod: "estimated", heightCm, weightKg, hipCircumferenceCm, ridingType, postureCategory }, widthResult);
  return { width: widthResult, suitability };
}, [inputMode, sitBoneWidthMm, heightCm, weightKg, hipCircumferenceCm, ridingType, postureCategory]);
```

### Result display (shown when `result !== null`)

Use `PublicCalculatorResultSummary` for the outer shell, then render inside:

**Width section:**
```
Recommended saddle width: 149–158 mm
Best target: ~152 mm
Confidence: [ConfidenceBadge]
```

**Saddle family section:**
```
Saddle family: Endurance / All-road
[list of shape flags, e.g. "Central pressure relief recommended"]
```

**Why section** (explanation text, derived from `explanationKey` and `explanationParams`):
Render the appropriate explanation paragraph per `result.width.explanationKey`.

**Mode B disclaimer** (if `inputMode === "estimated"`):
```
This estimate is based on body proportions, not a direct measurement. Measuring your sit bones will give a more accurate result.
```
Style: `PublicInfoPanel` with `tone="secondary"`.

**What to check if it feels wrong:**
Two short items:
- Too narrow: soft tissue pressure, numbness after 30–60 min
- Too wide: inner thigh chafing, restricted pedal stroke

### Analytics / session save

After a valid result is computed, use `useMutation(api.saddleWidth.mutations.createPublicSaddleWidthSession)` to save the session. Fire once per unique result (use a `useEffect` with a ref guard to avoid repeated saves).

---

## Part E — Related links

Add `"saddle-width"` to the `getRelatedLinks` function in `src/lib/seo/relatedLinks.ts`.

Suggested related links for `"saddle-width"` key:
- Bike Fit Calculator (`/calculators/bike-fit`)
- Saddle Height Calculator (`/calculators/saddle-height`)
- FAQ (`/faq`)
- Measurement Guide (`/measurement-guide`)

---

## Part F — SEO sitemap

Add the saddle-width calculator path to `src/lib/seo/sitemap/sources.ts` or wherever other calculator pages are listed for `sitemap-calculators.xml`.

---

## Part G — Validation

After completing this prompt:
1. `npx tsc --noEmit` must pass
2. The page renders at `/calculators/saddle-width` without login
3. Mode toggle switches inputs correctly and clears stale values
4. Mode A: entering sit-bone width + riding type + posture shows result immediately
5. Mode B: all three body fields required before result appears
6. CTA band shows correct campaign or non-campaign buttons depending on `isConsumerCampaignActive()`
7. Page works at 375 px mobile viewport
