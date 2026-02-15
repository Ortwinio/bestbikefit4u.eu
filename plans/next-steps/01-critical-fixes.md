# Step 01: Critical Fixes

## Objective

Close remaining P0/P1 integrity gaps from the architecture review and keep deployment docs accurate.

## Inputs

- `context/architecture-review.md` — issue list with file references
- `convex/recommendations/mutations.ts` — core score bug location
- `docs/DEVELOPMENT_PLAN.md` — outdated sprint status

## Tasks

### 1. Fix core score bug (P0) — Completed

**File**: `convex/recommendations/mutations.ts:97`

Change:
```typescript
coreScore: mapCoreScore(flexNum), // Using flexibility as proxy for now
```
To:
```typescript
coreScore: mapCoreScore(profile.coreStabilityScore),
```

This ensures the algorithm receives the user's actual core stability score (1-5, mapped to 0-10) instead of reusing the flexibility score.

### 2. Pass femur length to algorithm (P1) — Completed

**File**: `convex/recommendations/mutations.ts`

Add to the `fitInputs` object:
```typescript
femurMm: profile.femurLengthCm ? profile.femurLengthCm * 10 : undefined,
```

### 3. Update development plan sprint status (P1) — In Progress

**File**: `docs/DEVELOPMENT_PLAN.md`

Mark Sprints 2-7 items as `[x]` where implemented:
- Sprint 2: Measurement wizard ✓
- Sprint 3: Calculation engine ✓
- Sprint 4: Questionnaire ✓
- Sprint 5: Results display ✓
- Sprint 6: Auth + Dashboard ✓
- Sprint 7: Email reports ✓ (PDF export still pending)

### 4. Seed question definitions — Pending

Create a seed script at `convex/seed.ts` that populates the `questionDefinitions` table with the questions referenced in the questionnaire flow documentation.

## Deliverable

- Core score bug fixed
- Femur length passed through
- Development plan updated
- Seed script created

## Completion Checklist

- [x] `recommendations.generate` uses `profile.coreStabilityScore` for core mapping
- [x] Femur length flows from profile to algorithm
- [x] `DEVELOPMENT_PLAN.md` reflects actual build status
- [ ] Question definitions seed script works on empty database
- [x] All existing functionality still works (manual smoke test)
