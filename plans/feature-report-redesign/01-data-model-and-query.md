# 01 — Data Model and Query Extensions

## Goal
Extend the data pipeline so all new report sections have the fields they need, without breaking the existing fit sections.

## Files to change

### 1. `convex/recommendations/queries.ts` — `getReportV2`

Add to the query handler:
- Fetch the `user` document via `ctx.db.get(session.userId)` to get `name` and `profileImage`
- Fetch questionnaire responses for the session via `ctx.db.query("questionnaireResponses").withIndex("by_session", ...).collect()` — needed to show riding context (experience level, weekly hours, ride distance, position priority, road riding type, terrain)
- Return both as additional fields on the response object

```typescript
const user = await ctx.db.get(session.userId);
const questionnaireResponses = await ctx.db
  .query("questionnaireResponses")
  .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
  .collect();
const responsesMap: Record<string, string | number | string[]> = {};
for (const r of questionnaireResponses) {
  responsesMap[r.questionId] = r.response as string | number | string[];
}

return {
  session,
  recommendation,
  bike,
  bikeProfile,
  profile,
  latestPressureCalculation,
  user,           // NEW
  responses: responsesMap,  // NEW
};
```

### 2. `src/app/api/reports/[sessionId]/pdf/route.ts`

The `reportSource` from the Convex query now includes `user` and `responses`. Pass them through to `mapReportV2Payload`:

```typescript
const mappedReport = mapReportV2Payload({
  ...reportSource,
  bikeImageUrl,
});
```

No change needed here — spreading `reportSource` already picks up new fields. But `mapReportV2Payload` needs its input type updated.

### 3. `src/lib/reports/reportV2Types.ts`

Add new types:

```typescript
export type ReportRiderSection = {
  name: string | null;
  heightCm: number | null;
  weightKg: number | null;
  inseamCm: number | null;
  armLengthCm: number | null;
  torsoLengthCm: number | null;
  shoulderWidthCm: number | null;
  bmi: number | null;
  bmiCategory: "underweight" | "normal" | "overweight" | "obese" | null;
  flexibilityScore: number | null;
  flexibilityLabel: string | null;
  coreStabilityScore: number | null;
  comfortScore: number | null;
};

export type ReportBikeSection = {
  name: string;
  bikeType: string;
  brand: string | null;
  model: string | null;
  ridingStyle: string | null;
  goal: string | null;
  description: string | null;
  imageUrl: string | null;
  questionnaire: {
    experienceLevel: string | null;
    weeklyHours: string | null;
    rideLength: string | null;
    positionPriority: string | null;
    typeOfRiding: string | null;
  };
};
```

Update `ReportV2Payload`:

```typescript
export type ReportV2Payload = {
  rider: ReportRiderSection;    // NEW
  bike: ReportBikeSection;      // NEW (replaces bikeImageUrl on profile)
  profile: ReportProfileSection;
  prioritySummary: ReportPriorityRow[];
  detailedFit: ReportDetailedRow[];
  adjustmentSequence: ReportAdjustmentStep[];
  tirePressure: ReportTirePressureSection;
  frameTargets: { ... };
  fitNotes: string[];
  reportDate: string;           // NEW — ISO date string
};
```

### 4. `src/lib/reports/reportV2Mapper.ts`

Extend `ReportV2Source` type:

```typescript
type ReportV2Source = {
  session: Doc<"fitSessions">;
  recommendation: Doc<"recommendations"> | null;
  bike: Doc<"bikes"> | null;
  bikeProfile: Doc<"bikeProfiles"> | null;
  profile: Doc<"profiles"> | null;
  latestPressureCalculation: Doc<"pressureCalculations"> | null;
  bikeImageUrl?: string | null;
  user?: { name?: string | null } | null;       // NEW
  responses?: Record<string, string | number | string[]>; // NEW
};
```

Add mapping functions:

```typescript
function mapRiderSection(source: ReportV2Source, user?: { name?: string | null } | null): ReportRiderSection {
  const p = source.profile;
  const weightKg = p?.weightKg ?? null;
  const heightCm = p?.heightCm ?? null;
  const bmi = weightKg && heightCm
    ? Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10
    : null;
  const bmiCategory = bmi === null ? null
    : bmi < 18.5 ? "underweight"
    : bmi < 25 ? "normal"
    : bmi < 30 ? "overweight"
    : "obese";

  const FLEXIBILITY_LABELS: Record<string, string> = {
    very_limited: "Very limited",
    limited: "Limited",
    average: "Average",
    good: "Good",
    excellent: "Excellent",
  };

  return {
    name: source.user?.name ?? null,
    heightCm,
    weightKg,
    inseamCm: p?.inseamCm ?? null,
    armLengthCm: p?.armLengthCm ?? null,
    torsoLengthCm: p?.torsoLengthCm ?? null,
    shoulderWidthCm: p?.shoulderWidthCm ?? null,
    bmi,
    bmiCategory,
    flexibilityScore: typeof p?.flexibilityScore === "string"
      ? ["very_limited","limited","average","good","excellent"].indexOf(p.flexibilityScore) + 1
      : null,
    flexibilityLabel: p?.flexibilityScore ? FLEXIBILITY_LABELS[p.flexibilityScore] ?? null : null,
    coreStabilityScore: p?.coreStabilityScore ?? null,
    comfortScore: p?.comfortScore ?? null,
  };
}

function mapBikeSection(source: ReportV2Source): ReportBikeSection {
  const b = source.bike;
  const r = source.responses ?? {};
  const RESPONSE_LABELS: Record<string, Record<string, string>> = {
    experience_level: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
    weekly_hours: { "0-3": "0–3 hrs/week", "3-6": "3–6 hrs/week", "6-10": "6–10 hrs/week", "10-15": "10–15 hrs/week", "15+": "15+ hrs/week" },
    typical_ride_length: { short: "Short (<30 km)", medium: "Medium (30–80 km)", long: "Long (80–150 km)", ultra: "Ultra (150+ km)" },
    position_priority: { comfort: "Maximum comfort", balanced: "Balanced", performance: "Performance" },
    road_riding_type: { casual: "Casual / fitness", group: "Group rides", training: "Structured training", racing: "Racing", tt: "TT / triathlon" },
    mtb_terrain: { asphalt: "Asphalt only", paved: "Paved + light gravel", xc: "Cross-country", trail: "Trail", enduro: "Enduro", dh: "Downhill" },
  };

  function resolveResponse(questionId: string): string | null {
    const val = r[questionId];
    if (!val || typeof val !== "string") return null;
    return RESPONSE_LABELS[questionId]?.[val] ?? val;
  }

  return {
    name: b?.name ?? "Unnamed bike",
    bikeType: b?.bikeType ?? source.session.bikeType ?? "unknown",
    brand: b?.brand ?? null,
    model: b?.model ?? null,
    ridingStyle: b?.ridingStyle ?? source.session.ridingStyle ?? null,
    goal: b?.primaryGoal ?? source.session.primaryGoal ?? null,
    description: b?.description ?? null,
    imageUrl: source.bikeImageUrl ?? null,
    questionnaire: {
      experienceLevel: resolveResponse("experience_level"),
      weeklyHours: resolveResponse("weekly_hours"),
      rideLength: resolveResponse("typical_ride_length"),
      positionPriority: resolveResponse("position_priority"),
      typeOfRiding: resolveResponse("road_riding_type") ?? resolveResponse("mtb_terrain"),
    },
  };
}
```

Update `mapReportV2Payload` to call these and include `reportDate`:

```typescript
export function mapReportV2Payload(source: ReportV2Source): ReportV2Payload {
  return {
    rider: mapRiderSection(source, source.user),
    bike: mapBikeSection(source),
    reportDate: new Date().toISOString(),
    profile: mapProfileSection(source),
    // ... rest unchanged
  };
}
```

## Acceptance criteria
- `getReportV2` returns `user` (name field) and `responses` (questionnaire map)
- `ReportV2Payload` has `rider`, `bike`, and `reportDate` fields
- Mapper correctly calculates BMI and maps flexibility string → numeric score
- All existing fields remain unchanged — no regression on existing PDF sections
