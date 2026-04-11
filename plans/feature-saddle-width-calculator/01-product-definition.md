# 01 — Product Definition and UX Specification

## Overview

This document defines the full UX, input/output design, copy direction, and EN/NL content for both versions of the saddle width calculator. It is the product management artifact; implementation prompts are in 02 through 06.

---

## 1. Product Goal

The saddle width selector answers three questions:

1. **How wide should my saddle be?** — expressed as a range and a target, not a fake-precise single value
2. **Which saddle category fits this rider and bike use?** — short-nose/traditional, flat/waved, cutout/no-cutout
3. **How confident is this recommendation?** — explicitly scored and explained, driven by data quality

The output should not stop at "143 mm". It must explain:
- why that width fits the rider
- what riding posture was assumed
- what symptoms may indicate too narrow or too wide
- how this interacts with saddle height, setback, and tilt (dashboard version only)

---

## 2. Core Design Principle

The engine is built around this hierarchy:

```
Primary predictor:    Sit-bone width in mm
Secondary modifiers:  Posture / torso angle → Bike category → Riding goal → Symptoms
```

Anatomy first, posture second, then category/shape mapping. This mirrors how leading brands differentiate saddle width in practice.

---

## 3. Public Marketing Calculator

### Purpose

Generate a good-enough recommendation in under 60 seconds, convert to account creation or dashboard use.

### Route

| Locale | Path |
|--------|------|
| EN | `/calculators/saddle-width` |
| NL | `/calculators/saddle-width` (same — consistent with other calculators) |

### Page Structure

```
PublicHero
  eyebrow: "BestBikeFit4U calculator"
  title: "Saddle Width Calculator" / "Zadelbreedtecalculator"
  description: short pitch
  chips: ["EN and NL available", "Measured + estimate mode", "Free starting point"]

PublicSection (trust points, 3 cards)

SaddleWidthCalculatorForm  ← client component
  mode selector: "I know my sit-bone width" / "I don't have this measurement"
  [Mode A inputs or Mode B inputs]
  [result panel, appears after form is valid]

PublicCtaBand
  eyebrow: "What's next?" / "Hoe verder?"
  title: "Refine the result in your account" / "Verfijn de uitkomst in je account"
  [campaign-aware CTA buttons]

FAQ section

RelatedLinksSection
```

### Input Design: Mode A — Measured

Label: **"Most accurate — I have my sit-bone measurement"**

| Input | Field | Type | Range |
|-------|-------|------|-------|
| Sit-bone width | `sitBoneWidthMm` | number field, mm | 60–200 mm |
| Riding type | `ridingType` | select | Road race / Endurance road / Gravel / MTB / Commuter–Leisure / TT–Triathlon |
| Position style | `postureCategory` | select | Upright / Balanced / Aggressive |

Measurement help:
- Small collapsible "How do I measure?" section
- Instructions: stand barefoot, place corrugated cardboard on a hard chair, sit on it for 30 seconds, measure the distance between the two deepest indentations center-to-center

### Input Design: Mode B — Body Data Fallback

Label: **"Quick estimate — I don't know my sit-bone width"**

| Input | Field | Type | Range |
|-------|-------|------|-------|
| Height | `heightCm` | number field, cm | 140–220 cm |
| Weight | `weightKg` | number field, kg | 40–150 kg |
| Hip circumference | `hipCircumferenceCm` | number field, cm | 70–160 cm |
| Riding type | `ridingType` | select | same as Mode A |
| Position style | `postureCategory` | select | same as Mode A |

Disclaimer note below form: "This estimate is less accurate than a direct sit-bone measurement. We recommend measuring for a better result."

### Mode B Estimation Logic (public, no dashboard context needed)

MVP rule-based estimator — do not claim statistical precision:

```
base_sbw_mm = hip_band_base(hipCircumferenceCm)
  where hip_band_base:
    < 90 cm  → 115
    90-95    → 120
    96-100   → 125
    101-106  → 130
    107-112  → 138
    113-118  → 145
    119-124  → 152
    ≥ 125    → 160

height_correction:
  heightCm < 160 → -5
  160-175        →  0
  176-185        → +3
  > 185          → +6

weight_correction:
  weightKg < 60  → -3
  60-80          →  0
  81-95          → +3
  > 95           → +5

SBW_est_mm = clamp(base_sbw_mm + height_correction + weight_correction, 90, 170)
```

This is an MVP heuristic. Accuracy improves in Phase 2 with anonymized measured vs estimated comparison data.

### Output Design

```
Recommended saddle width: 149–158 mm
Best target: ~152 mm

Saddle family: Endurance / All-road (flat to slightly waved, medium nose)

Confidence: ████░░ High  (icon + label)

Why this width:
  "Your sit-bone width and balanced riding posture suggest a saddle with a 149–158 mm support platform. In this position, your pelvis is moderately rotated and you need a platform that supports the sit bones without blocking your pedal stroke."

What to check if it feels wrong:
  Too narrow → "central soft tissue pressure, numbness after 30–60 minutes"
  Too wide   → "inner thigh chafing, restricted pedal stroke"
```

### Confidence Levels (public)

| Source | Score | Label | Visual |
|--------|-------|-------|--------|
| Measured sit-bone + full riding context | 90–100 | High | filled bar |
| Measured sit-bone + partial context | 70–85 | Medium | ¾ bar |
| Body data estimate | 45–65 | Lower | ½ bar |

### Saddle Families

| Key | Display name EN | Display name NL | Profile |
|-----|-----------------|-----------------|---------|
| `short_nose_performance` | Short-nose performance | Korte-neus performance | TT/race, aggressive posture |
| `endurance_allroad` | Endurance / All-road | Endurance / Allroad | Balanced road, endurance |
| `gravel_mtb_support` | Gravel / MTB support | Gravel / MTB support | Gravel, MTB, dynamic position |
| `comfort_upright` | Comfort / Upright | Comfort / Rechtop | City, leisure, very upright |

### Trust Points (3 cards, `PublicFeatureCard`)

EN:
1. **Anatomy first, not just size labels** — "The recommendation starts from sit-bone width because that is the strongest anatomical predictor. Riding posture and bike category refine it from there."
2. **Two input paths, honest about accuracy** — "If you have a direct sit-bone measurement, use it. If not, the body-data estimate still gives you a useful starting range, but we tell you the confidence is lower."
3. **Width is the start, not the end** — "Saddle comfort also depends on shape, nose type, and tilt. The dashboard version combines all of these into a complete recommendation."

NL:
1. **Anatomie eerst, niet alleen maatetiketten** — "De aanbeveling begint bij zitbeenbreedte, want dat is de sterkste anatomische voorspeller. Rijhouding en fietscategorie verfijnen daarna."
2. **Twee invoerpaden, eerlijk over nauwkeurigheid** — "Heb je een directe zitbeenmeting? Gebruik die. Zo niet, geeft de schatting op basis van lichaamsgegevens toch een bruikbaar startbereik, maar we geven eerlijk aan dat de betrouwbaarheid lager is."
3. **Breedte is het begin, niet het einde** — "Zadelcomfort hangt ook af van vorm, neustype en kanteling. De dashboardversie combineert dit alles tot een volledige aanbeveling."

### CTA Band

Non-campaign:
- Primary: "Create account or sign in" → `/login`
- Secondary: "Compare Free vs Pro" → `/pricing`
- Tertiary: "Open Bike Fit Calculator" → `/calculators/bike-fit`
- Aside: "The calculator gives a practical starting point. An in-person fitter can add value for complex biomechanical issues."

Campaign-active:
- Primary (CampaignCtaGroup): start + donate
- Secondary: "Open Bike Fit Calculator"

### FAQs

EN:
- Q: "How do I measure my sit-bone width at home?" / A: "Place corrugated cardboard or kitchen foil on a hard chair. Sit normally, stand up carefully, and measure the center-to-center distance between the two deepest indentations. This works well enough as a starting measurement."
- Q: "Can saddle width alone solve numbness?" / A: "Width matters, but tilt and setback are often equally important. A nose-down tilt concentrates pressure centrally even on a correctly sized saddle."
- Q: "Why does my posture affect saddle width?" / A: "More aggressive positions rotate the pelvis forward, shifting where it contacts the saddle. An upright rider typically needs more rear support than a race rider with the same sit-bone measurement."

NL:
- Q: "Hoe meet ik mijn zitbeenbreedte thuis?" / A: "Leg golfkarton of aluminiumfolie op een harde stoel. Ga normaal zitten, sta voorzichtig op en meet de hart-op-hart afstand tussen de twee diepste indrukken. Dit geeft een goed genoeg startpunt."
- Q: "Lost zadelbreedteoplossing alleen gevoelloosheid op?" / A: "Breedte telt, maar kanteling en setback zijn vaak even belangrijk. Een neusdal-kanteling concentreert druk centraal, ook op een correct bemeten zadel."
- Q: "Waarom beïnvloedt mijn houding de zadelbreedteaanbeveling?" / A: "Een agressievere houding roteert het bekken naar voren, wat de belastingpunten op het zadel verschuift. Een rechtopzittende rijder heeft doorgaans meer achterste ondersteuning nodig dan een wedstrijdrijder met dezelfde zitbeenmeting."

---

## 4. Dashboard Saddle Selector

### Purpose

Turn saddle width into a true fit module. Combine width recommendation with shape, symptoms, posture context, and fit interaction warnings. This is the premium product feature.

### Route

`/dashboard/saddle-selector`

### Page Structure

```
DashboardPageHeader
  title: "Saddle Selector" / "Zadelkiezer"
  subtitle: "Find your saddle width and shape based on your anatomy and riding profile."

SaddleSelectorForm  ← multi-section client component
  Section A: Anatomy
  Section B: Riding profile
  Section C: Current saddle (optional)
  Section D: Symptoms (optional)
  [calculate button]

SaddleSelectorResult
  - Width recommendation panel
  - Shape recommendation panel
  - Fit interaction warnings
  - Save result button

SaddleHistorySection (if previous sessions exist)
```

### Section A — Anatomy

| Field | Source | Pre-fill rule |
|-------|--------|---------------|
| Sit-bone width (mm) | `profiles.sitBoneWidthMm` | Pre-fill if available; show "Update" hint if present |
| Measurement method | toggle | `measured` / `estimated` |
| Height (cm) | `profiles.heightCm` | Always pre-fill (required in profile) |
| Weight (kg) | `profiles.weightKg` | Pre-fill if available |
| Hip circumference (cm) | `profiles.hipCircumferenceCm` | Pre-fill if available (new optional field) |
| Flexibility | `profiles.flexibilityScore` | Pre-fill and map to 1-5 scale |
| Core stability | `profiles.coreStabilityScore` | Pre-fill |

When `sitBoneWidthMm` is available: show it prominently, method = "measured", hide hip circumference.
When `sitBoneWidthMm` is absent: show height/weight/hip circumference inputs, method = "estimated", explain lower confidence.

### Section B — Riding Profile

| Field | Source | Pre-fill rule |
|-------|--------|---------------|
| Bike type | `bikes.type` (passed via `?bikeId=` query param) | Pre-fill if bike context available |
| Riding goal | `bikes.primaryGoal` | Pre-fill from bike |
| Position style | derived from `bikes.primaryGoal` + `profiles.flexibilityScore` | Pre-fill |
| Indoor / outdoor | select | No pre-fill |
| Typical ride duration | `profiles.typicalRideLength` | Pre-fill if available |

### Section C — Current Saddle (optional)

| Field | Notes |
|-------|-------|
| Current saddle width (mm) | If known |
| Current saddle satisfaction | too narrow / just right / too wide / unsure |
| Current saddle shape | flat / waved / hammock / short-nose |
| Cutout | yes / no / unknown |
| Current tilt | nose down / neutral / nose up / unknown |

This section is collapsible. If skipped, the engine omits comparison warnings.

### Section D — Symptoms (optional, collapsible)

Checkboxes, multi-select:
- Sit-bone pain
- Perineal or soft tissue numbness
- Inner thigh / hamstring chafing
- Sliding forward on the saddle
- Feeling unstable side-to-side
- Lower-back pressure
- Increased hand pressure
- One-sided hot spot or asymmetry

When checked, the engine adds a symptom delta to the width calculation and generates a shape flag or setup warning.

### Output Design

```
┌─────────────────────────────────────────────────────┐
│ Target saddle width                                  │
│                                                      │
│  Best target: 152 mm                                │
│  Acceptable range: 149–158 mm                       │
│  Width confidence: ████████░░ High (88/100)         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Recommended saddle type                              │
│                                                      │
│  Endurance / All-road                               │
│  ✓ Medium nose length                               │
│  ✓ Slight wave profile                              │
│  ✓ Central pressure relief cutout recommended        │
│  ✓ Medium padding                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Fit interaction notes                                │
│                                                      │
│  ⚠ Your reported numbness may also be influenced    │
│    by tilt. Check that the nose is not tilted down  │
│    before attributing it to saddle width alone.     │
│                                                      │
│  ℹ Saddle width recommendation assumes your current │
│    saddle height is near the calculated target.     │
└─────────────────────────────────────────────────────┘
```

### Width Match Score (if current saddle width known)

If user filled in their current saddle width, show a match analysis:

```
Your current saddle (143 mm) vs recommended (149–158 mm):
Status: Likely too narrow for your anatomy and riding style.
Width match score: 52/100
```

---

## 5. Calculation Logic

### Width Engine: Step-by-Step

**Step 1: Determine sit-bone width source**

```typescript
if (sitBoneWidthMm provided && method === "measured") {
  SBW_mm = sitBoneWidthMm
  confidence_base = 95
} else {
  SBW_mm = estimateSitBoneWidth({ heightCm, weightKg, hipCircumferenceCm })
  confidence_base = 55
}
```

**Step 2: Posture factor**

Map `postureCategory` to posture index:

| postureCategory | posture_index | addition_mm | Description |
|-----------------|---------------|-------------|-------------|
| `aggressive` | 0 | +10 | Race / TT, forward pelvic rotation |
| `aggressive` (road goal) | 1 | +15 | Aggressive road |
| `balanced` | 2 | +20 | Balanced endurance / gravel |
| `upright` | 3 | +25 | Upright MTB / commuter |
| `upright` (leisure) | 4 | +30 | Very upright leisure |

In practice, `postureCategory` maps from:
- `Ambition.aero` / `Ambition.performance` → `aggressive`
- `Ambition.balanced` → `balanced`
- `Ambition.comfort` → `upright`
- `BikeCategory.city` always adds at least `upright` floor

`target_support_width_mm = SBW_mm + posture_addition_mm`

**Step 3: Bike-type correction**

| ridingType | adjustment_mm |
|------------|---------------|
| `tt_triathlon` | −3 |
| `road_race` | 0 |
| `endurance_road` | +2 |
| `gravel` | +3 |
| `mtb` | +4 |
| `commuter_leisure` | +6 |
| `indoor_only` | +2 |

`adjusted_support_width_mm = target_support_width_mm + bike_type_adjustment_mm`

**Step 4: Symptom correction (dashboard only)**

| Symptom group | Width delta | Notes |
|---------------|-------------|-------|
| Numbness / soft tissue pressure / centerline pressure | +3 to +8 mm | Increase width |
| Inner thigh / hamstring chafing / restricted stroke | −3 to −8 mm | Decrease width |
| Sliding forward / asymmetric hot spot / tilt-related | 0 mm | Shape/setup flag instead |

Multiple symptoms: take the dominant direction. Conflicting symptoms: flag as "complex — professional fit recommended".

`symptom_adjusted_width_mm = adjusted_support_width_mm + symptom_delta_mm`

**Step 5: Map to width class**

Width bins (brand-agnostic):

| Class | Range |
|-------|-------|
| XS | 125–135 mm |
| S | 136–145 mm |
| M | 146–155 mm |
| L | 156–165 mm |
| XL | 166–175 mm |
| XXL | 176–190 mm |

Output:
- `recommendedWidthMm`: the calculated value (not rounded to bin)
- `primaryWidthClass`: the bin containing `recommendedWidthMm`
- `acceptableRange`: `[recommendedWidthMm - 5, recommendedWidthMm + 5]`
- `alternateClasses`: adjacent bins

**Step 6: Confidence score**

```
base = confidence_base (95 if measured, 55 if estimated)

deductions:
  missing riding type:        -5
  missing posture category:   -5
  conflicting symptoms:       -10
  partial profile data:       -5

confidence_score = clamp(base - sum(deductions), 20, 100)

confidence_level:
  >= 85 → "high"
  70-84 → "medium"
  < 70  → "lower"
```

### Suitability Engine: Saddle Shape + Category

Decision rules (applied in priority order):

**Nose type**
- `short_nose` if: `ridingType` is `tt_triathlon` OR (`postureCategory` is `aggressive` AND `symptom.sliding_forward` is false)
- `traditional_nose` otherwise

**Profile shape**
- `flat` if: `ridingType` is `gravel` or `mtb` OR user frequently changes seated position OR flexibility >= 4
- `waved` if: user reports `sliding_forward` OR `ridingType` is `endurance_road` and flexibility < 3
- `moderate_wave` (default) otherwise

**Cutout / pressure relief**
- `cutout_recommended` if: any of: `symptom.numbness`, `symptom.soft_tissue_pressure`, `indoor_use`, `postureCategory` is `aggressive`
- `no_cutout_needed` otherwise

**Padding**
- `firm` if: `ridingType` is `road_race` or `tt_triathlon` OR `typicalRideLength` is `long` / `ultra`
- `soft` if: `ridingType` is `commuter_leisure` AND `postureCategory` is `upright`
- `medium` (default)

**Saddle family assignment** (final output)

| Conditions | Family |
|------------|--------|
| nose=short + aggressive | `short_nose_performance` |
| nose=traditional + road/endurance + balanced/upright | `endurance_allroad` |
| nose=traditional + gravel/mtb | `gravel_mtb_support` |
| commuter/leisure + upright | `comfort_upright` |

### Fit Interaction Warnings (dashboard only)

Generate warnings when:

1. `symptom.numbness` AND `currentSaddleTilt` is `nose_down` → "Your tilt may be contributing to numbness independently of width."
2. `symptom.hand_pressure` → "Increased hand pressure is more likely related to reach/drop than saddle width."
3. `currentSaddleWidthMm` AND `|currentSaddleWidthMm - recommendedWidthMm| <= 5` AND `symptom.numbness` → "Your current saddle width is close to the recommendation. Tilt and setback are more likely contributing factors."
4. `symptom.asymmetry` → "One-sided symptoms often reflect pelvic tilt or cleat issues rather than saddle width. A width change alone is unlikely to resolve this."
5. `saddleHeightMm` differs significantly from `profiles.fitSession.saddleHeightMm` → "Saddle height may be off. Correct height before making width decisions."

---

## 6. Data Model

### New table: `saddleWidthSessions`

```typescript
saddleWidthSessions: defineTable({
  userId: v.optional(v.id("users")),          // null for public sessions
  bikeId: v.optional(v.id("bikes")),          // context bike if provided
  sessionType: v.union(v.literal("public"), v.literal("dashboard")),

  // Input method
  measurementMethod: v.union(v.literal("measured"), v.literal("estimated")),

  // Anatomy inputs
  sitBoneWidthMm: v.optional(v.number()),
  heightCm: v.optional(v.number()),
  weightKg: v.optional(v.number()),
  hipCircumferenceCm: v.optional(v.number()),
  flexibilityScore: v.optional(v.number()),
  coreStabilityScore: v.optional(v.number()),

  // Riding inputs
  ridingType: v.string(),
  postureCategory: v.string(),
  indoorOutdoor: v.optional(v.string()),

  // Current saddle (dashboard only)
  currentSaddleWidthMm: v.optional(v.number()),
  currentSaddleShape: v.optional(v.string()),
  currentSaddleTilt: v.optional(v.string()),
  currentSaddleSatisfaction: v.optional(v.string()),

  // Symptoms (dashboard only)
  symptoms: v.optional(v.array(v.string())),

  // Outputs
  recommendedWidthMm: v.number(),
  widthRangeMinMm: v.number(),
  widthRangeMaxMm: v.number(),
  primaryWidthClass: v.string(),
  saddleFamily: v.string(),
  noseType: v.string(),
  profileShape: v.string(),
  cutoutRecommended: v.boolean(),
  paddingPreference: v.string(),
  confidenceScore: v.number(),
  confidenceLevel: v.string(),
  widthMatchScore: v.optional(v.number()),
  warnings: v.optional(v.array(v.string())),
  explanationText: v.string(),

  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_and_session_type", ["userId", "sessionType"])
  .index("by_bike", ["bikeId"])
```

### Profile extension

Add to `profiles` table:
```typescript
hipCircumferenceCm: v.optional(v.number()),  // for saddle width fallback estimation
```

---

## 7. Route Registration

Add to `PUBLIC_CALCULATOR_ROUTE_REGISTRY` in `src/lib/public-calculators/routes.ts`:

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

Update `PublicCalculatorId` union to include `"saddle-width"`.

---

## 8. Navigation

### Footer

Add to Calculators column (after Saddle Height Calculator, before Frame Size Calculator):

EN: `Saddle Width Calculator` → `/calculators/saddle-width`
NL: `Zadelbreedtecalculator` → `/calculators/saddle-width`

### Dashboard Sidebar

Add after Tire Pressure nav item:

```typescript
{ name: messages.nav.saddleSelector, href: "/dashboard/saddle-selector", icon: ArrowUpDown }
```

Icon suggestion: `ArrowUpDown` or `Ruler` from lucide-react.

---

## 9. SEO Metadata

### Public calculator page

EN:
- `title`: "Saddle Width Calculator | BestBikeFit4U"
- `description`: "Calculate your ideal saddle width from sit-bone measurement or body data. Get a recommended width range, saddle family, and confidence score."
- `keywords`: ["saddle width calculator", "sit bone width calculator", "road saddle size", "gravel saddle selector"]

NL:
- `title`: "Zadelbreedtecalculator | BestBikeFit4U"
- `description`: "Bereken je ideale zadelbreedteaanbeveling op basis van zitbeenmeting of lichaamsgegevens. Inclusief betrouwbaarheidsscore en zadelcategorie."
- `keywords`: ["zadelbreedte calculator", "zitbeenbreedte calculator", "racefiets zadelbreedteadvies"]

### Structured data

Include `WebApplication` schema and `HowTo` schema (steps: measure sit bones → enter data → read recommendation → verify with account).

---

## 10. Copy Reference

### Public result explanation templates

Mode A (measured):
> "Based on your measured sit-bone width of {sbw} mm and your {posture} riding position, your saddle should provide about {targetSupportWidth} mm of rear support. Starting with a {primaryWidthClass} ({rangeMin}–{rangeMax} mm) saddle gives you a reliable first test range."

Mode B (estimated):
> "Based on your height, weight, and hip circumference, your sit-bone width is estimated around {sbwEstMin}–{sbwEstMax} mm. This suggests starting with a {primaryWidthClass} ({rangeMin}–{rangeMax} mm) saddle. The confidence is lower because this is an estimate — measuring your sit bones directly will give a better result."

### Dashboard explanation templates

> "Your measured sit-bone width of {sbw} mm in a {posture} position suggests a target support width of {targetSupportWidth} mm. The bike-type adjustment for {rideType} riding adds {bikeAdj} mm, giving a final recommended width of approximately {finalWidth} mm — best matched by a {primaryWidthClass} saddle in the {rangeMin}–{rangeMax} mm range."

With symptoms:
> "Your reported {symptomLabel} is consistent with a saddle that is {direction} for your anatomy. The recommendation has been adjusted {delta} mm to account for this."
