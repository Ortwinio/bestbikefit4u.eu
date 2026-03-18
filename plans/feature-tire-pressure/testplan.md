# Test Plan — Tire Pressure Module

## Scope

This plan covers functional testing for all deliverables in the tire pressure feature (Fase 1 + Fase 2). Strava integration is out of scope.

---

## 1. Pressure Engine Unit Tests

File: `src/lib/pressure-engine.ts`
Test location: `src/lib/__tests__/pressure-engine.test.ts`

### 1.1 Basic calculation — reference cases

| ID | Input | Expected output |
|----|-------|----------------|
| PE-01 | 75 kg, road, 28mm front/rear, tubeless, average_asphalt, balance | ~5.2 bar front / ~5.6 bar rear |
| PE-02 | 75 kg, road, 25mm, inner_tube, smooth_asphalt, speed | Higher than PE-01 (+ surface + goal) |
| PE-03 | 90 kg, gravel, 40mm, tubeless, hardpack_gravel, comfort | Output within 1.5–5.0 bar clamp |
| PE-04 | 80 kg, mtb, 50mm, tubeless, trail, balance | Output within 0.8–3.5 bar clamp |
| PE-05 | 60 kg, tt, 23mm, inner_tube, smooth_asphalt, speed | Output within 5.0–9.5 bar clamp |

### 1.2 Rear ≥ front rule

| ID | Scenario | Expected |
|----|----------|----------|
| PE-06 | Any combination where base formula would give rear < front | `rearBar >= frontBar` |

### 1.3 Clamp enforcement

| ID | Scenario | Expected |
|----|----------|----------|
| PE-07 | Very heavy rider + narrow road tire | Output capped at 9.0 bar |
| PE-08 | Very light rider + wide MTB tire | Output floored at 0.8 bar |

### 1.4 Tube type adjustments

| ID | Scenario | Expected |
|----|----------|----------|
| PE-09 | Same inputs, inner_tube vs tubeless | Tubeless produces lower pressure by ~0.2 front / ~0.3 rear |
| PE-10 | Latex tube | Between inner_tube and tubeless |

### 1.5 Surface adjustments

| ID | Scenario | Expected |
|----|----------|----------|
| PE-11 | smooth_asphalt vs rough_asphalt, same rider | Smooth produces +0.4 bar over rough |
| PE-12 | trail vs smooth_asphalt | Trail produces ~0.9 bar lower |

### 1.6 Discipline multipliers

| ID | Scenario | Expected |
|----|----------|----------|
| PE-13 | Same 80 kg rider, road vs gravel (40mm, tubeless, average_asphalt) | Gravel output ≈ road output × 0.72 (before surface/tube adjustments) |

### 1.7 Advanced adjustments

| ID | Scenario | Expected |
|----|----------|----------|
| PE-14 | `isWet = true` | −0.2 bar vs dry equivalent |
| PE-15 | `casingType = "race_light"` vs `"reinforced"` | Race light +0.1, reinforced −0.1 vs allround |
| PE-16 | `extraLuggageKg = 10` | Rear increases by ~0.05 bar |
| PE-17 | `routeElevationM = 2000` | −0.1 bar comfort buffer applied |
| PE-18 | `routeDistanceKm = 160` | −0.1 bar comfort buffer applied |
| PE-19 | `internalRimWidthFrontMm = 25` (vs 19 reference) | +0.06 bar front rim correction |

### 1.8 Warnings

| ID | Scenario | Expected warning |
|----|----------|-----------------|
| PE-20 | `maxPressureBar = 4.0`, computed result > 4.0 | `max_rim_pressure_exceeded` |
| PE-21 | `rimType = "hookless"`, no `maxPressureBar`, result > 3.5 bar | `hookless_max_pressure_unknown` |
| PE-22 | `rimType = "hookless"`, `maxPressureBar = 3.0`, result > 3.0 | `hookless_limit_exceeded` |
| PE-23 | `tubeType = "inner_tube"`, result < 1.5 bar | `inner_tube_pinch_flat_risk` |
| PE-24 | `rearBar > frontBar * 1.4` | `front_rear_pressure_mismatch` |
| PE-25 | `discipline = "road"`, `widthFrontMm = 18` | `road_tire_width_unusual` |
| PE-26 | `discipline = "road"`, `widthFrontMm = 45` | `road_tire_width_unusual` |
| PE-27 | `discipline = "gravel"`, `widthFrontMm = 25` | `gravel_tire_width_unusual` |
| PE-28 | `discipline = "mtb"`, `widthFrontMm = 40` | `mtb_tire_width_unusual` |
| PE-29 | Valid input within normal ranges | Empty warnings array |

### 1.9 PSI conversion

| ID | Scenario | Expected |
|----|----------|---------|
| PE-30 | 5.0 bar | 73 PSI |
| PE-31 | 2.5 bar | 36 PSI |

### 1.10 Scores (advanced mode)

| ID | Scenario | Expected |
|----|----------|---------|
| PE-32 | Pressure at discipline minimum | comfortScore ≈ 100, efficiencyScore ≈ 0 |
| PE-33 | Pressure at discipline maximum | comfortScore ≈ 0, efficiencyScore ≈ 100 |
| PE-34 | All scores | Clamped to 0–100 |

### 1.11 Input validation

| ID | Input | Expected errors |
|----|-------|----------------|
| PE-35 | `bodyWeightKg = 20` (below 35) | Validation error on `bodyWeightKg` |
| PE-36 | `bodyWeightKg = 200` (above 160) | Validation error on `bodyWeightKg` |
| PE-37 | `widthFrontMm = 10` (below 18) | Validation error on `widthFrontMm` |
| PE-38 | `bikeWeightKg = 25` (above 20) | Validation error on `bikeWeightKg` |
| PE-39 | `currentFrontBar = 0.5` (below 0.8) | Validation error on `currentFrontBar` |
| PE-40 | All fields valid | Empty error array |

---

## 2. Convex Schema Tests

Run via `convex dev` type checking. These are compile-time checks.

| ID | Check |
|----|-------|
| SC-01 | `wheelsets` table accepts all defined fields and rejects unknown fields |
| SC-02 | `tireSetups` table `tubeType` rejects values outside the union |
| SC-03 | `pressureCalculations.inputSnapshot` requires `discipline`, `widthFrontMm`, `widthRearMm`, `bodyWeightKg`, `surface`, `tubeType` |
| SC-04 | `bikes` table accepts new optional fields (`discipline`, `bikeWeightKg`, `photoUrl`, `brand`, `model`) without breaking existing documents |
| SC-05 | All new tables have correct indexes defined |

---

## 3. Convex Mutations & Queries (Integration Tests)

Test environment: local Convex dev instance with test user.

### 3.1 Bikes

| ID | Action | Expected |
|----|--------|---------|
| MQ-01 | Create bike with all new fields | Bike saved with `discipline`, `brand`, `bikeWeightKg` |
| MQ-02 | Create bike with only required fields | Bike saved; optional fields undefined |
| MQ-03 | Update bike `discipline` | Field updated, `updatedAt` refreshed |
| MQ-04 | `list` query | Returns only bikes for authenticated user |
| MQ-05 | `get` query for another user's bike | Returns null |
| MQ-06 | Delete bike | Bike removed from DB |

### 3.2 Wheelsets

| ID | Action | Expected |
|----|--------|---------|
| MQ-07 | Create wheelset for own bike | Saved with correct `bikeId` and `userId` |
| MQ-08 | Create wheelset for another user's bike | Throws authorization error |
| MQ-09 | Create wheelset with `isActive: true` when another wheelset already active | Other wheelset's `isActive` set to `false` |
| MQ-10 | `listForBike` | Returns wheelsets for that bike, ordered by `createdAt` desc |
| MQ-11 | `remove` wheelset | Cascades deletion of all its `tireSetups` |
| MQ-12 | Update wheelset `rimType` | Field updated |

### 3.3 Tire Setups

| ID | Action | Expected |
|----|--------|---------|
| MQ-13 | Create tire setup for own wheelset | Saved correctly |
| MQ-14 | Create tire setup for another user's wheelset | Throws |
| MQ-15 | Create tire setup with `isActive: true` | Deactivates siblings for same wheelset |
| MQ-16 | `listForWheelset` | Returns setups for that wheelset |
| MQ-17 | `remove` tire setup | Removed from DB |

### 3.4 Pressure Profiles

| ID | Action | Expected |
|----|--------|---------|
| MQ-18 | Save profile (new) | Inserted with all fields |
| MQ-19 | Save profile with same `bikeId + useCase` | Existing profile updated (upsert behaviour) |
| MQ-20 | `listForBike` | Returns profiles for that bike only |
| MQ-21 | Remove profile | Removed from DB |

### 3.5 Pressure Calculations

| ID | Action | Expected |
|----|--------|---------|
| MQ-22 | Save calculation with all fields | Saved, `userId` set from auth |
| MQ-23 | Save calculation without `bikeId` (anonymous-style) | Saved with `bikeId: undefined` |
| MQ-24 | `listForBike` | Returns calculations for that bike, ordered newest first |
| MQ-25 | `listForBike` with `limit: 5` | Returns max 5 records |
| MQ-26 | `listForUser` | Returns most recent calculations across all bikes |
| MQ-27 | `getLatestForBike` | Returns single most recent calculation for that bike |

### 3.6 Auth / authorization

| ID | Scenario | Expected |
|----|----------|---------|
| MQ-28 | Any mutation called without auth session | Throws with auth error |
| MQ-29 | Query data for another user's bike | Returns null or empty list |

---

## 4. Public Calculator — UI Tests

Route: `/bandenspanning-calculator`
Browser testing (Playwright or manual).

### 4.1 Page load

| ID | Check |
|----|-------|
| UI-01 | Page loads without JS errors |
| UI-02 | Hero, form, FAQ, and CTA sections are visible |
| UI-03 | Page title matches metadata: "Bandenspanningscalculator \| BestBikeFit4U" |
| UI-04 | Canonical URL tag is present |
| UI-05 | FAQ section contains `application/ld+json` structured data |

### 4.2 Discipline landing pages

| ID | Route | Check |
|----|-------|-------|
| UI-06 | `/bandenspanning/racefiets` | Loads, pre-selects "Road bike" in form |
| UI-07 | `/bandenspanning/gravelbike` | Loads, pre-selects "Gravel bike" |
| UI-08 | `/bandenspanning/mtb` | Loads, pre-selects "MTB" |

### 4.3 Calculator form — basic happy path

| ID | Action | Expected |
|----|--------|---------|
| UI-09 | Select discipline "Road bike", enter 75 kg, 28 mm front/rear, tubeless, average asphalt | Result card appears with front and rear pressure in bar and PSI |
| UI-10 | Change body weight slider to 90 kg | Result updates immediately (real-time) |
| UI-11 | Change tube type to inner_tube | Result updates |
| UI-12 | Change surface to "rough asphalt" | Result decreases |
| UI-13 | Select riding goal "comfort" | Result decreases vs "balance" |

### 4.4 Form validation

| ID | Action | Expected |
|----|--------|---------|
| UI-14 | Enter body weight 20 (below 35) | Validation error shown, no result |
| UI-15 | Enter body weight 200 (above 160) | Validation error shown |
| UI-16 | Enter front width 10 (below 18) | Validation error shown |
| UI-17 | Enter front and rear width leaving one empty | Error or same-width fallback applied |

### 4.5 Result card

| ID | Check |
|----|-------|
| UI-18 | Front and rear pressure shown in both bar (1 decimal) and PSI (integer) |
| UI-19 | Warnings shown when applicable (e.g. unusual tire width) |
| UI-20 | Disclaimer "controleer altijd de maximale druk van band en velg" visible |

### 4.6 Post-result CTA (upsell)

| ID | Check |
|----|-------|
| UI-21 | CTA block appears after result is shown |
| UI-22 | CTA "Vergelijk met mijn huidige setup" leads to login/signup flow |
| UI-23 | CTA "Sla je fiets op" leads to login/signup flow |

### 4.7 Mobile responsiveness

| ID | Check |
|----|-------|
| UI-24 | Form is usable on 375px wide viewport |
| UI-25 | Sliders and segmented controls are finger-friendly (min 44px tap targets) |
| UI-26 | Result card visible without horizontal scroll |

---

## 5. Dashboard — Bike Management

Routes: `/dashboard/bikes`, `/dashboard/bikes/new`, `/dashboard/bikes/[bikeId]`

### 5.1 Bike list (`/dashboard/bikes`)

| ID | Check |
|----|-------|
| DB-01 | Each bike card shows name and discipline |
| DB-02 | If latest pressure calculation exists: shows "Voor X.X bar / Achter X.X bar" |
| DB-03 | Pressure status badge shown: "in lijn" (green), "iets te hoog" (orange), "te hoog" (red), "te laag" (red) |
| DB-04 | "Nieuwe druk berekenen" quick action links to `/dashboard/pressure-calculator?bikeId=<id>` |
| DB-05 | "Fiets toevoegen" button links to `/dashboard/bikes/new` |
| DB-06 | Bikes belonging to another user are not shown |

### 5.2 Create bike (`/dashboard/bikes/new`)

| ID | Action | Expected |
|----|--------|---------|
| DB-07 | Fill required fields (name, bikeType), submit | Bike created, redirect to bike detail |
| DB-08 | Fill optional fields: discipline, brand, model, bikeWeightKg, photoUrl | All saved correctly |
| DB-09 | Proceed to optional step 2: add wheelset | Wheelset creation form shown |
| DB-10 | Add wheelset + tire setup in step 2 | Both saved and linked to new bike |
| DB-11 | Skip wheelset step | Bike saved without wheelset, no error |
| DB-12 | After creation: "Bereken bandenspanning" shortcut visible | Links to wizard pre-selecting new bike |

### 5.3 Bike detail (`/dashboard/bikes/[bikeId]`)

| ID | Check |
|----|-------|
| DB-13 | Bike detail page loads |
| DB-14 | Active wheelset and tire setup displayed |
| DB-15 | "Aanbevolen druk" section shows latest recommended pressure |
| DB-16 | "Huidige druk" shows last recorded pressure (if available) |
| DB-17 | Status label and color indicator match the pressure comparison |
| DB-18 | Pressure history list shows past calculations |
| DB-19 | "Nieuwe berekening" button links to pressure wizard pre-selecting this bike |
| DB-20 | Visiting `[bikeId]` for another user's bike returns 404 or redirect |

---

## 6. Dashboard — Pressure Calculator Wizard

Route: `/dashboard/pressure-calculator`

### 6.1 Step 1 — Bike selection

| ID | Check |
|----|-------|
| WZ-01 | Wizard loads at step 1 |
| WZ-02 | User's bikes listed; selecting a bike enables "Volgende" |
| WZ-03 | If `?bikeId=X` in URL: bike pre-selected |
| WZ-04 | "Nieuwe fiets aanmaken" option works and creates a bike |

### 6.2 Step 2 — Wielset & banden

| ID | Check |
|----|-------|
| WZ-05 | Saved wheelsets for selected bike shown |
| WZ-06 | Selecting a wheelset shows its tire setups |
| WZ-07 | Selecting a tire setup pre-fills width, tube type, casing, rim type, maxPressureBar |
| WZ-08 | "Nieuwe wielset aanmaken" inline form works |
| WZ-09 | "Nieuwe bandenset aanmaken" inline form works |
| WZ-10 | If no wheelset exists: inline tire input form shown (fallback) |
| WZ-11 | Validation: widthFrontMm required |

### 6.3 Step 3 — Gewicht & doel

| ID | Check |
|----|-------|
| WZ-12 | Body weight input pre-filled if profile exists |
| WZ-13 | Bike weight optional |
| WZ-14 | Extra luggage input (0–30 kg) |
| WZ-15 | Wet/dry toggle works |
| WZ-16 | Riding goal selection (speed / balance / comfort) |
| WZ-17 | Current pressure inputs optional; if filled: used for comparison in step 5 |

### 6.4 Step 4 — Route

| ID | Check |
|----|-------|
| WZ-18 | Surface selector shown |
| WZ-19 | Route distance (km) optional |
| WZ-20 | Elevation (m) optional |
| WZ-21 | Off-road percentage (0–100) optional |
| WZ-22 | "Zonder route" option skips route context |

### 6.5 Step 5 — Resultaat

| ID | Check |
|----|-------|
| WZ-23 | Result computed automatically on entering step 5 |
| WZ-24 | Front and rear pressure in bar and PSI shown |
| WZ-25 | comfortScore, gripScore, efficiencyScore shown as percentages or bars |
| WZ-26 | If `currentFrontBar` / `currentRearBar` set: delta vs recommended shown (e.g. "0.4 bar te hoog") |
| WZ-27 | Test advice shown ("Probeer eerst 0.3 bar lager...") |
| WZ-28 | All applicable warnings displayed with clear messages |
| WZ-29 | "Opslaan als preset" button saves a `pressureProfile` |
| WZ-30 | Preset name and useCase (race/endurance/nat weer/gravel mixed/comfort) selectable before saving |
| WZ-31 | After saving, calculation appears in pressure history for this bike |

### 6.6 Wizard navigation

| ID | Check |
|----|-------|
| WZ-32 | "Terug" on step 2 goes to step 1 |
| WZ-33 | "Terug" on step 5 goes to step 4 |
| WZ-34 | Navigating back preserves all entered data |
| WZ-35 | Step indicator shows correct current step |

---

## 7. Navigation & SEO

### 7.1 Public navigation

| ID | Check |
|----|-------|
| NAV-01 | "Tools" or "Calculators" menu item visible in public header |
| NAV-02 | "Bandenspanning Calculator" appears as sub-item or direct link |
| NAV-03 | Link navigates to `/bandenspanning-calculator` |
| NAV-04 | Mobile menu includes the link |

### 7.2 Dashboard navigation

| ID | Check |
|----|-------|
| NAV-05 | Dashboard sidebar has "Bandenspanning" or "Tire Pressure" link |
| NAV-06 | Link navigates to `/dashboard/pressure-calculator` |

### 7.3 Sitemap

| ID | Check |
|----|-------|
| NAV-07 | `/bandenspanning-calculator` present in `sitemap-calculators.xml` |
| NAV-08 | `/bandenspanning/racefiets` present in sitemap |
| NAV-09 | `/bandenspanning/gravelbike` present in sitemap |
| NAV-10 | `/bandenspanning/mtb` present in sitemap |

### 7.4 Dashboard pressure widget

| ID | Check |
|----|-------|
| NAV-11 | Dashboard overview (`/dashboard`) shows pressure status widget |
| NAV-12 | Widget shows per-bike pressure status summary |
| NAV-13 | "Nieuwe druk berekenen" CTA in widget links to wizard |

---

## 8. Edge Cases

| ID | Scenario | Expected |
|----|----------|---------|
| EC-01 | One tire width entered, front/rear same value used | No error, result computed for both axles |
| EC-02 | User doesn't know rim width | Field skipped, calculation proceeds without rim correction |
| EC-03 | User doesn't know current pressure | Comparison skipped on step 5 |
| EC-04 | Hookless rim, no `maxPressureBar` known | `hookless_max_pressure_unknown` warning shown |
| EC-05 | 25 mm road tire + 3.0 bar result + 95 kg rider | Safety warning displayed; result not suppressed |
| EC-06 | Front 28mm / rear 32mm (asymmetric) | Different pressures computed for each axle |
| EC-07 | MTB input in inches (e.g. 2.2") | Handled via conversion or explicit inch input option |
| EC-08 | User with no bikes visits wizard | Step 1 shows "create bike" option rather than empty list |
| EC-09 | User visits `/dashboard/bikes/[nonExistentId]` | 404 page shown |
| EC-10 | Unauthenticated user visits `/dashboard/pressure-calculator` | Redirected to login |

---

## 9. Cross-feature Integration

| ID | Scenario | Expected |
|----|----------|---------|
| CF-01 | Bikefit recommendation page has "Aanvullende setup" section with tire pressure block | Block visible after completing a fit session |
| CF-02 | Tire pressure block in bikefit output links to `/bandenspanning-calculator` | Link works |
| CF-03 | User profile with `weightKg` set — wizard step 3 pre-fills body weight from profile | Correct value shown |

---

## 10. Performance

| ID | Check | Target |
|----|-------|--------|
| PF-01 | Public calculator result renders on input change | < 50 ms (client-side, no network) |
| PF-02 | `/bandenspanning-calculator` initial page load | Lighthouse performance score ≥ 85 on mobile |
| PF-03 | Dashboard bike list with 10 bikes loads | < 1 s (Convex query) |
| PF-04 | Pressure wizard step transitions | < 200 ms |

---

## 11. Acceptance Criteria Summary

The feature is complete when:

- [ ] `calculateBasicPressure` and `calculateAdvancedPressure` pass all unit tests (PE-01 – PE-40)
- [ ] All Convex CRUD operations work with correct authorization (MQ-01 – MQ-29)
- [ ] Public calculator at `/bandenspanning-calculator` is usable without login on mobile
- [ ] Three discipline landing pages exist with correct pre-selected discipline and SEO metadata
- [ ] Dashboard wizard completes all 5 steps and saves a calculation to Convex
- [ ] Saving a preset creates a `pressureProfile` record
- [ ] Bike list cards show pressure status from latest calculation
- [ ] Navigation links are in place (public header + dashboard sidebar)
- [ ] All four calculator routes are in the sitemap
- [ ] Edge cases EC-01 through EC-10 are handled without crashes
