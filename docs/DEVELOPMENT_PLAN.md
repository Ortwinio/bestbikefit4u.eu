# BikeFit AI - Development Plan

Based on documentation analysis and technical architecture.

---

## Phase 1: Foundation (Current - Completed)

- [x] Next.js 16 + Convex setup
- [x] Database schema with all tables
- [x] UI component library (Button, Input, Card, Select)
- [x] Route structure ((public), (auth), (dashboard))
- [x] Layout components (Header, Footer, DashboardSidebar)
- [x] Landing page, About, Pricing pages

---

## Phase 2: Input Data Collection System

### 2.1 Measurement Input Form

Create a multi-step form collecting:

**Required Inputs:**
| Field | Type | Validation |
|-------|------|------------|
| Height | number (cm) | 130-210 cm |
| Inseam | number (cm) | 55-105 cm, < 55% of height |
| Riding Type | select | MTB Trail, Road Endurance, Road Race, TT |
| Flexibility Score | 1-5 scale | Sit-and-reach test guide |
| Core Stability Score | 1-5 scale | Plank test guide |

**Optional Inputs (Advanced):**
| Field | Type | Improves |
|-------|------|----------|
| Torso Length | number (cm) | Reach accuracy |
| Arm Length | number (cm) | Reach accuracy |
| Femur Length | number (cm) | Setback accuracy |
| Shoulder Width | number (cm) | Handlebar width |
| Foot Length | number (mm) | Cleat position |

**Current Setup (Optional):**
- Current saddle height (mm)
- Current setback (mm)
- Current drop (mm)
- Stem length (mm)
- Crank length (mm)

### 2.2 Files to Create

```
src/components/measurements/
├── MeasurementWizard.tsx      # Multi-step form container
├── StepBodyMeasurements.tsx   # Height, inseam, torso, arms
├── StepRidingStyle.tsx        # Bike type, ambition
├── StepFlexibility.tsx        # Flexibility test with guide
├── StepCoreStability.tsx      # Core test with plank guide
├── StepCurrentSetup.tsx       # Optional current bike setup
├── MeasurementGuide.tsx       # Visual guide with diagrams
└── BodyDiagram.tsx            # SVG showing measurement points
```

### 2.3 Convex Functions

```
convex/profiles/
├── mutations.ts
│   ├── create()              # Create profile with measurements
│   └── update()              # Update measurements
└── queries.ts
    └── getByUser()           # Get user's profile
```

---

## Phase 3: Bike Fit Calculation Engine

### 3.1 Algorithm Implementation

Based on documentation formulas:

```
convex/lib/fitAlgorithm/
├── index.ts                  # Main calculateBikeFit() function
├── types.ts                  # FitInputs, FitOutputs, BikeCategory
├── constants.ts              # Multipliers, offsets, clamp values
├── validation.ts             # Input validation rules
├── saddleHeight.ts           # SH = inseam * Msh + adjustments
├── saddleSetback.ts          # SS = 0.070*I - 5 + offsets
├── barDrop.ts                # BD = SH * Rbd + flex/core mods
├── reach.ts                  # SR = torso/arm based + offsets
├── crankLength.ts            # Inseam band lookup
├── handlebarWidth.ts         # Shoulder-based + category offset
├── cleatPosition.ts          # Category + ambition lookup
├── frameSizing.ts            # Stack/reach target calculation
└── warnings.ts               # Injury risk detection
```

### 3.2 Key Formulas

**Saddle Height:**
```
SH0 = inseam_mm × Msh(category)
Msh: Road=0.883, Gravel=0.880, MTB=0.875, City=0.870

ΔSH_flex = clamp(-8, +4, 1.5 × (FS - 5))
ΔSH_core = clamp(-4, +2, 0.8 × (CS - 5))
ΔSH_amb = Comfort:-4, Balanced:0, Performance:+3, Aero:+6

SH = SH0 + ΔSH_flex + ΔSH_core + ΔSH_amb
```

**Bar Drop:**
```
BD0 = SH × Rbd(category, ambition)
Rbd table:
         Comfort  Balanced  Performance  Aero
Road     0.07     0.10      0.13         0.16
Gravel   0.05     0.07      0.09         0.11
MTB      0.01     0.03      0.05         0.05
City    -0.06    -0.04     -0.02        -0.02
```

**Reach:**
```
If torso + arm exist:
  SR0 = 0.47 × torso_mm + 0.33 × arm_mm + 25
Else (fallback):
  SR0 = 0.33 × height_mm

SR = SR0 + OR(category) + ΔSR_amb + ΔSR_flex + ΔSR_core
```

**Crank Length:**
```
Inseam (mm)    Crank (mm)
< 740          165
740-819        170
820-879        172.5
880-939        175
≥ 940          177.5
```

### 3.3 Output Structure

```typescript
interface FitRecommendation {
  // Core outputs
  saddleHeight: number;        // mm
  saddleSetback: number;       // mm behind BB
  saddleTilt: number;          // degrees
  barDrop: number;             // mm (negative = bar above saddle)
  saddleToBarReach: number;    // mm
  crankLength: number;         // mm
  handlebarWidth: number;      // mm
  cleatOffset: number;         // mm axle behind ball

  // Frame targets (if geometry DB)
  frameStackTarget: number;    // mm ±15
  frameReachTarget: number;    // mm ±10

  // Stem solution
  stemLength: number;          // mm
  stemAngle: number;           // degrees
  spacerStack: number;         // mm

  // Warnings
  warnings: FitWarning[];

  // Comparison (if current setup provided)
  deltas?: FitDeltas;
}
```

---

## Phase 4: Dynamic Questionnaire System

### 4.1 Question Flow

```
1. Riding Style
   ├── Road → Ask: Endurance/Race/TT?
   ├── Gravel → Continue
   ├── MTB → Ask: XC/Trail/Enduro?
   └── City → Continue

2. Primary Goal
   ├── Comfort
   ├── Balanced
   ├── Performance
   └── Aero (Road/TT only)

3. Experience Level
   ├── Beginner (-10mm drop)
   ├── Intermediate (0)
   └── Advanced (+5mm drop)

4. Pain Points (multi-select)
   ├── Knee pain → Follow-up: Front/back of knee?
   ├── Lower back pain → Flag drop warning
   ├── Numb hands → Suggest stack increase
   ├── Saddle discomfort → Follow-up: Type?
   └── None

5. Weekly Riding
   └── Hours per week, typical ride length
```

### 4.2 Files to Create

```
src/components/questionnaire/
├── QuestionnaireContainer.tsx
├── QuestionRenderer.tsx
├── questions/
│   ├── SingleChoice.tsx
│   ├── MultipleChoice.tsx
│   ├── ScaleSlider.tsx
│   └── NumericInput.tsx
├── ProgressBar.tsx
└── QuestionNavigation.tsx

convex/questionnaire/
├── queries.ts
│   ├── getQuestions()
│   └── getNextQuestion()
└── mutations.ts
    └── saveResponse()
```

---

## Phase 5: Results & Recommendations Display

### 5.1 Results Page Components

```
src/components/results/
├── RecommendationSummary.tsx    # Overview of all values
├── FitValueCard.tsx             # Individual measurement card
├── FitDiagram.tsx               # Visual bike with overlay
├── ComparisonTable.tsx          # Current vs recommended
├── AdjustmentOrder.tsx          # Step-by-step adjustment guide
├── WarningBanner.tsx            # Injury risk warnings
├── ExportPDF.tsx                # Download report
└── EmailReportButton.tsx        # Send via email
```

### 5.2 Adjustment Order Guide

Per documentation, show users:
1. Cleats first
2. Saddle height
3. Saddle setback
4. Bar drop (spacers)
5. Reach (stem)

---

## Phase 6: Email Reports

### 6.1 Implementation

```bash
npm install @convex-dev/resend @react-email/components
```

```
convex/emails/
├── templates/
│   └── FitReport.tsx           # React Email template
├── mutations.ts
│   └── queueReport()
└── actions.ts
    └── sendReport()            # Resend integration
```

### 6.2 Email Content

- Summary of recommendations
- Adjustment order guide
- Visual fit diagram
- Link to view full results online
- Safety disclaimers

---

## Phase 7: Content Pages (SEO)

### 7.1 Public Pages to Create

Based on sitemap from documentation:

```
src/app/(public)/
├── page.tsx                          # Homepage (done)
├── about/page.tsx                    # How it works (done)
├── pricing/page.tsx                  # Pricing (done)
├── measurement-guide/page.tsx        # Visual measurement guide
├── faq/page.tsx                      # FAQ
├── bike-types/
│   ├── road-endurance/page.tsx
│   ├── road-race/page.tsx
│   ├── time-trial/page.tsx
│   └── mountain-bike/page.tsx
├── science/
│   ├── calculation-engine/page.tsx
│   ├── stack-and-reach/page.tsx
│   └── bike-fit-methods/page.tsx
├── fit-help/
│   ├── knee-pain/page.tsx
│   ├── numb-hands/page.tsx
│   ├── lower-back-pain/page.tsx
│   └── saddle-discomfort/page.tsx
└── calculators/
    ├── saddle-height/page.tsx
    ├── frame-size/page.tsx
    └── crank-length/page.tsx
```

---

## Phase 8: Authentication & User Dashboard

### 8.1 Magic Link Auth

```
convex/
├── auth.config.ts
└── auth.ts

src/app/(auth)/
├── login/page.tsx               # Email input
└── verify/page.tsx              # Magic link landing
```

### 8.2 Dashboard Features

```
src/app/(dashboard)/
├── dashboard/page.tsx           # Session history
├── profile/page.tsx             # Edit measurements
├── fit/
│   ├── page.tsx                 # Start new session
│   └── [sessionId]/
│       ├── page.tsx             # Session overview
│       ├── questionnaire/page.tsx
│       └── results/page.tsx
└── bikes/
    ├── page.tsx                 # List bikes
    └── new/page.tsx             # Add bike
```

---

## Development Priority Order

_Status refreshed on 2026-02-15 to match implemented code._

### Sprint 1 (Current)
- [x] Project setup
- [x] Database schema
- [x] UI components
- [x] Route structure
- [x] Public pages

### Sprint 2
- [x] Measurement input wizard
- [x] Profile CRUD operations
- [x] Measurement validation
- [ ] Visual measurement guides (public `/measurement-guide` page pending)

### Sprint 3
- [x] Bike fit calculation engine
- [x] All formulas implemented
- [x] Validation and warnings
- [ ] Unit tests for calculations (in progress: base coverage added)

### Sprint 4
- [x] Dynamic questionnaire
- [x] Conditional question logic
- [x] Response storage

### Sprint 5
- [x] Results display
- [ ] Fit diagram visualization
- [x] Adjustment order guide
- [ ] Comparison view

### Sprint 6
- [x] Authentication (magic links)
- [x] User sessions
- [x] Dashboard functionality

### Sprint 7
- [x] Email reports (Resend)
- [ ] PDF export
- [x] History tracking

### Sprint 8
- [ ] SEO content pages
- [ ] Troubleshooting guides
- [ ] Science/methodology pages

### Sprint 9
- [ ] Polish & testing
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Production deployment

---

## Technical Notes

### Validation Rules (from docs)

```typescript
// Hard rejects
height_mm not in [1300, 2100]
inseam_mm not in [550, 1050]
inseam_mm >= height_mm

// Warnings
inseam/height < 0.40 or > 0.52
torso_mm < 450 or > 750
arm_mm < 450 or > 750
```

### Injury Risk Warnings

```typescript
// Saddle height risk
SH > inseam * 0.890 → "Saddle may be too high"
SH < inseam * 0.865 → "Saddle may be too low"

// Drop risk
FS <= 3 && BD > 90 → "Lumbar/neck strain risk"
CS <= 3 && BD > 80 → "Shoulder/neck fatigue risk"
```

---

## File Summary

Total new files to create: ~60+
- Components: ~35 files
- Convex functions: ~15 files
- Pages: ~20 files
- Lib/utils: ~10 files
