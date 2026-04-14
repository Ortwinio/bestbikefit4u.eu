# Feature Plan: Saddle Width Calculator

## Goal

Build a two-version saddle width selector that answers three questions for every rider:

1. **How wide should my saddle be?** — in mm, with a range, not a single fake-precise number
2. **Which saddle category fits my riding style and bike?** — shape, nose, cutout, padding preference
3. **How confident is this recommendation?** — explicitly communicated, driven by data quality

BestBikeFit4U's output must go beyond a size label. The recommendation should explain why that width fits the rider, what posture it assumes, what symptoms may indicate a mismatch, and how saddle width interacts with height, setback, and tilt.

---

## Background

Saddle width is one of the highest-intent search topics in cycling fit. Riders searching "saddle width calculator" or "sit bone width" are either experiencing discomfort or about to buy a new saddle. Both cases are natural entry points into the BestBikeFit4U product.

The `profiles.sitBoneWidthMm` field already exists in the schema as an optional field, meaning riders who have gone through the profile wizard may already have this value. The saddle width calculator should surface and reuse it, rather than asking for it again.

The key commercial design principle: the public calculator generates a useful first answer and converts to account creation; the dashboard calculator is the premium tool that combines anatomy, symptoms, posture, and bike context into a complete saddle recommendation.

---

## Scope

### Phase 1 — MVP (this plan)

**Public marketing calculator** (`/calculators/saddle-width`)
- Measured path: user enters sit-bone width in mm
- Fallback path: user enters height, weight, hip circumference when sit-bone width is unknown
- Output: recommended width range, target width, saddle family, confidence score
- Full EN/NL support
- SEO landing page with FAQ, related links, structured data
- Campaign-aware CTAs (reuses `CampaignCtaGroup` pattern)

**Dashboard saddle selector** (`/dashboard/saddle-selector`)
- Combines anatomy, riding profile, current saddle, and symptoms
- Pre-fills from profile data (`sitBoneWidthMm`, `heightCm`, `inseamCm`, `flexibilityScore`, `weightKg`)
- Pre-fills from bike context (category, riding goal, discipline)
- Outputs: target width, acceptable range, saddle shape/nose/cutout recommendation, fit interaction warnings
- Saves session results to `saddleWidthSessions` Convex table
- Linked from dashboard sidebar and bike detail page

**Calculation engine** (`src/lib/saddle-width-engine/`)
- Pure function module, no UI dependencies
- Admin-configurable constants (posture additions, bike-type adjustments, symptom deltas, width bins)
- Two separate engines: Width Engine + Suitability Engine (shape/nose/cutout)
- Unit tested

**Convex backend**
- New table: `saddleWidthSessions`
- New mutations: `createPublicSaddleWidthSession`, `createDashboardSaddleWidthSession`
- New queries: `getLatestSaddleWidthSession`, `listSaddleWidthSessions`
- `profiles` extended with `hipCircumferenceCm` (optional, needed for fallback estimation)

**Navigation and SEO**
- Footer Calculators column: add "Saddle Width Calculator"
- Dashboard sidebar: add "Saddle Selector" under Tools group
- Sitemap and related links updated
- EN/NL i18n strings for all new UI

### Phase 2 — not in this plan
- Map outputs to a curated saddle catalog (brand/model matching)
- Current-saddle comparison module
- Symptom learning loop with anonymized data
- Confidence improvements from accumulated data

### Phase 3 — not in this plan
- Connect to full fit engine (reach/drop/setback/torso angle as live modifiers)
- Camera-based posture inference
- Affiliate or retail saddle matching

---

## Approach

Build bottom-up: engine first, schema second, backend third, UI last. This prevents UI from driving wrong data shapes.

| Prompt | Scope | Depends on |
|--------|-------|------------|
| 01 | Product definition, UX spec, copy decisions | — |
| 02 | Saddle width calculation engine (pure TS) | — |
| 03 | Convex schema extension + mutations/queries | 02 |
| 04 | Public marketing calculator page + form | 02, 03 |
| 05 | Dashboard saddle selector page | 02, 03 |
| 06 | Navigation, footer, SEO, i18n, sitemap | 04, 05 |

---

## Key Architectural Decisions

### Reuse over re-invent

- `sitBoneWidthMm` already in `profiles` — pre-fill in dashboard version, never ask twice
- `BikeCategory` and `Ambition` from `convex/lib/fitAlgorithm/types.ts` map to the posture/bike-type correction factors
- `publicCalculatorLogic.ts` patterns (`createPublicFitBaseline`, `PUBLIC_FIT_REQUIREMENTS`, `PublicResultEnvelope`) are extended for saddle-width
- `CampaignCtaGroup` pattern reused in public calculator CTA band
- `PUBLIC_CALCULATOR_ROUTE_REGISTRY` in `src/lib/public-calculators/routes.ts` extended with `saddle-width`
- Dashboard pressure calculator at `/dashboard/pressure-calculator` is the structural model for the dashboard saddle selector

### Two-layer engine design

The engine is split into two layers deliberately:

**Layer 1: Width Engine** — anatomical support width calculation
```
base_sit_bone_mm → add posture factor → add bike-type correction → add symptom delta (dashboard only) → recommended_width_mm + range
```

**Layer 2: Suitability Engine** — shape, nose, cutout, and padding recommendation
```
(riding_type, posture, symptoms, indoor_use) → saddle_family + shape_flags + warnings
```

Keeping them separate means the marketing calculator can run Layer 1 only and still give a useful result. The dashboard runs both layers.

### Admin-configurable constants

Posture additions, bike-type adjustments, symptom deltas, width bins, and confidence weights live in `src/lib/saddle-width-engine/config.ts` as exported constants, not hardcoded in calculation functions. This mirrors how `src/lib/saddle-width-engine/` will be structured for future admin-panel tunability.

### Public calculator: two explicit input modes

The public calculator shows two clearly labelled paths, not a hidden fallback:

- **"Most accurate"**: user enters measured sit-bone width
- **"I don't have this measurement"**: user enters height, weight, hip circumference (body-data fallback)

This is commercially correct: it positions measured > estimated, sets honest expectations on confidence, and gives the fallback path genuine utility rather than making it feel like a second-class experience.

---

## Existing Data Available for Reuse

| Source | Field | Used in |
|--------|-------|---------|
| `profiles.sitBoneWidthMm` | Sit-bone width in mm | Dashboard pre-fill |
| `profiles.heightCm` | Height in cm | Dashboard + fallback estimate |
| `profiles.weightKg` | Weight in kg | Dashboard + fallback estimate |
| `profiles.flexibilityScore` | Flexibility (1-5 mapped) | Posture factor modifier |
| `profiles.coreStabilityScore` | Core stability (1-5) | Shape recommendation |
| `bikes.type` | Bike category | Bike-type correction |
| `bikes.primaryGoal` | Riding goal / ambition | Posture factor |
| `bikes.currentSetup.saddleHeightMm` | Current saddle height | Fit interaction warnings |
| `fitSessions` questionnaire answers | Pain areas, symptoms | Symptom delta (dashboard) |

---

## Acceptance Criteria

### Public calculator
- [ ] `/calculators/saddle-width` renders without login and works in both EN and NL
- [ ] Two clearly labelled input modes: measured sit-bone and body-data fallback
- [ ] Measured path shows confidence High, body-data path shows confidence Lower
- [ ] Output: recommended width range, target width, saddle family label, confidence badge
- [ ] Explanation text matches the input mode and confidence level
- [ ] "Refine the result in your account" CTA band with campaign awareness
- [ ] FAQ section with at least 2 questions per locale
- [ ] Related links and JSON-LD structured data present
- [ ] Page works on 375 px mobile viewport
- [ ] Footer Calculators column includes "Saddle Width Calculator" link

### Dashboard saddle selector
- [ ] `/dashboard/saddle-selector` requires authentication
- [ ] Pre-fills `sitBoneWidthMm`, `heightCm`, `weightKg`, `flexibilityScore` from profile where available
- [ ] Pre-fills bike category and riding goal if a bike context is passed via query param
- [ ] Outputs: target width, width range, saddle family, shape flags, confidence score, fit interaction warnings
- [ ] Result can be saved to `saddleWidthSessions` table
- [ ] Sidebar nav item "Saddle Selector" present and links correctly
- [ ] Dashboard version shows symptom section not present in public calculator

### Calculation engine
- [ ] `src/lib/saddle-width-engine/` exports `calculateSaddleWidth` and `classifySaddleSuitability`
- [ ] Both functions are pure (no side effects, no Convex imports)
- [ ] All posture additions, bike-type adjustments, symptom deltas, and width bins are in `config.ts`
- [ ] Unit tests cover: measured path, estimated path, each posture level, each bike type, symptom corrections, width bin mapping
- [ ] Confidence score is 90-100 for measured + full context, 70-85 for measured + partial, 45-65 for estimated only

### Data model
- [ ] `saddleWidthSessions` table exists in Convex schema
- [ ] `profiles` schema extended with optional `hipCircumferenceCm: v.optional(v.number())`
- [ ] `createPublicSaddleWidthSession` mutation is unauthenticated (no `requireUserId`)
- [ ] `createDashboardSaddleWidthSession` mutation requires auth via `requireUserId()`
- [ ] `getLatestSaddleWidthSession` query returns the most recent session for the authenticated user

---

## Plan Files

- [01-product-definition.md](01-product-definition.md) — Full UX spec, input/output design, copy direction, EN/NL content
- [02-saddle-width-engine.md](02-saddle-width-engine.md) — Calculation engine implementation prompt
- [03-convex-schema-and-backend.md](03-convex-schema-and-backend.md) — Schema extension and Convex mutations/queries prompt
- [04-public-calculator.md](04-public-calculator.md) — Public marketing calculator page prompt
- [05-dashboard-calculator.md](05-dashboard-calculator.md) — Dashboard saddle selector page prompt
- [06-navigation-seo-translations.md](06-navigation-seo-translations.md) — Footer, sidebar, i18n, SEO prompt

## Progress

- [x] 01 Product definition finalized
- [x] 02 Calculation engine implemented and unit tested
- [x] 03 Convex schema and backend implemented
- [x] 04 Public calculator page implemented
- [x] 05 Dashboard saddle selector implemented
- [x] 06 Navigation, SEO, and i18n completed

## Closeout

- Implementation and review evidence recorded in [output-03-closeout-and-review.md](output-03-closeout-and-review.md)
