# BestBikeFit4U — Product Definition Document

**Version:** 1.0
**Date:** 2026-03-30

---

## 1. Mission

Make professional-grade bike fitting accessible to every cyclist — regardless of budget, location, or experience level.

In-person bike fitting costs €150–€500 and requires specialist access that most cyclists don't have. BestBikeFit4U delivers a personalized, algorithm-driven fit recommendation in minutes, from home, at a fraction of the cost.

---

## 2. Goal

Build the leading self-service bike fit platform in Europe — starting with the Netherlands and English-speaking EU markets — by combining a biomechanically grounded fit algorithm, an intuitive guided experience, and deep third-party integrations (Strava, frame geometry databases) that improve recommendation accuracy over time.

---

## 3. Scope

**In scope:**
- Guided body measurement input with visual reference
- Multi-step dynamic questionnaire (riding style, pain history, goals)
- Deterministic fit algorithm covering saddle, cockpit, crank, and frame
- Tire pressure calculator (public + authenticated)
- Multi-bike management with separate fit profiles
- PDF and email fit reports
- Strava integration for riding context and bike import
- Bilingual platform (EN/NL)
- Tiered SaaS pricing (Free, Pro, Premium)

**Out of scope (now):**
- Real-time motion capture or video analysis
- Hardware integrations (power meters, smart trainers)
- In-person appointment booking
- Bike retail or e-commerce

---

## 4. Ideal Customer Profile

### Primary: The Dedicated Amateur Cyclist

- **Age:** 28–55
- **Rides:** 3–6 hours per week, road or gravel, year-round
- **Pain point:** Persistent discomfort (knee, lower back, neck) with no clear cause; unwilling or unable to spend €300 on a professional fit
- **Motivation:** Wants to ride longer and hurt less; performance improvement is secondary
- **Behaviour:** Researches on forums, trusts science-backed tools, already tracks rides on Strava
- **Device:** Desktop for initial setup, mobile to check results on a ride day
- **Tier fit:** Pro (€9/month)

### Secondary: The Performance-Focused Rider

- **Rides:** 8–15+ hours per week, racing or sportive events
- **Pain point:** Wants to squeeze more speed or power from their position; willing to invest in marginal gains
- **Behaviour:** Monitors watts, has done one fit before, seeks validation and refinement tools
- **Tier fit:** Pro, potential Premium for advanced analytics

### Tertiary: The Professional Fitter / Bike Shop

- **Context:** Runs 5–20 client fits per month, needs reproducible methodology and branded outputs
- **Pain point:** Manual calculation is time-consuming; clients want a take-home document
- **Behaviour:** Looks for tools that integrate into their workflow; values API access and white-label
- **Tier fit:** Premium (€29/month)

### Excluded (for now):
- Casual riders who only commute occasionally (low willingness to pay)
- Elite athletes with existing professional fit setups

---

## 5. Core Functionality

### 5.1 Rider Profile

Users enter body measurements once and reuse them across all fit sessions:

| Field | Required | Used in algorithm |
|-------|----------|-------------------|
| Height | Yes | Frame size, reach fallback |
| Inseam | Yes | Saddle height, all calculations |
| Torso length | No | Reach (primary path) |
| Arm length | No | Reach (primary path) |
| Shoulder width | No | Handlebar width |
| Femur length | No | Stored; reserved for future |
| Weight | No | Tire pressure |
| Flexibility score (1–5) | Yes | Saddle height, bar drop, reach |
| Core stability score (1–5) | Yes | Bar drop, reach adjustments |

### 5.2 Dynamic Questionnaire

A context-aware question set that collects riding intent, injury history, and position priorities. Questions are stored as definitions in the database and can be updated without code changes. Responses are stored per session and influence algorithm adjustments beyond the fixed biomechanical calculation.

### 5.3 Fit Algorithm

The engine (see Section 7) takes the profile and questionnaire responses as input and produces a complete set of fit parameters plus a validation plan for making adjustments safely.

### 5.4 Multi-Bike Management

Users can register multiple bikes. Each bike has:
- Type, brand, model, and year
- Current geometry (measured from the bike)
- Component configuration (saddle, stem, handlebars, cranks)
- One or more wheelsets with tire setups
- Pressure presets per scenario
- Fit sessions linked to it

### 5.5 Tire Pressure Calculator

Standalone calculator available without login, with a more advanced version in the dashboard:
- Inputs: discipline, rider weight, tire width, tube type, surface, riding goal, bike weight
- Output: front and rear pressure in bar and PSI, safe range, and rationale
- Pressure profiles saved as named presets per wheelset

### 5.6 Reports

- **Email report:** Sent immediately after a session; contains all fit parameters and validation plan
- **PDF report:** Full branded document (in development); required for Premium clients

### 5.7 Strava Integration

- OAuth connect from Settings
- Profile photo import
- Recent rides and gear usage import (background job)
- Riding context inference (frequency, terrain, bike usage patterns)
- Auto-import of Strava bikes on first connect
- Gated to Pro tier and above

---

## 6. Functional Framework

```
PUBLIC LAYER (no login)
├── Homepage + CTA
├── Tire pressure calculator
├── Frame size calculator
├── Saddle height calculator
├── Bike fit calculator (quick estimate)
├── Educational content (science, guides, use-cases)
└── SEO landing pages (per discipline, per topic)

AUTHENTICATED LAYER (dashboard)
├── Profile wizard
│   ├── Step 1: Core measurements (height, inseam, weight)
│   └── Step 2: Advanced measurements + flexibility / core
├── Bikes
│   ├── List + create
│   ├── Bike detail (geometry, components, wheelsets)
│   └── Tire pressure management
├── Fit session
│   ├── Session setup (bike, category, goal)
│   ├── Dynamic questionnaire
│   └── Results + validation plan
├── Settings
│   ├── Account (email, theme, units)
│   ├── Connected apps (Strava)
│   └── Subscription tier
└── Admin (internal)
    ├── User management
    ├── Audit logs
    └── Question seed management
```

---

## 7. The Fitting Engine

### Architecture

The engine is a pure TypeScript function with no side effects — fully deterministic, unit-tested in isolation, importable in both server and client contexts.

```
calculateBikeFit(inputs) → FitResult
calculateQuickEstimate(inputs) → QuickEstimate
calculateSaddleHeight(ctx) → SaddleHeight
calculateTirePressure(inputs) → PressureOutput
```

### Inputs

| Input | Type | Notes |
|-------|------|-------|
| `category` | road / gravel / mtb / city | Drives most category-specific offsets |
| `ambition` | comfort / balanced / performance / aero | Controls aggressiveness of position |
| `heightMm` | number | Required |
| `inseamMm` | number | Required |
| `flexibilityScore` | 0–10 | Mapped from 1–5 user input |
| `coreScore` | 0–10 | Mapped from 1–5 user input |
| `torsoMm` | optional | Unlocks primary reach calculation |
| `armMm` | optional | Unlocks primary reach calculation |
| `shoulderMm` | optional | Handlebar width; defaults to 420 mm |

### 10-Step Calculation Sequence

**Step 1 — Crank Length**
Band lookup from inseam (165–177.5 mm range). MTB shortens if inseam ≥ 820 mm and result ≥ 175 mm.

**Step 2 — Saddle Height**
Base: `inseam × category multiplier` (0.870–0.883 by category).
Adjustments: ±4–6 mm by ambition; ±3–6 mm by flexibility/core scores.
Output includes recommended value and ±10 mm safe range.

**Step 3 — Saddle Setback**
Base: `0.070 × inseam − 5 mm`.
Category offset ±5–10 mm. Ambition offset ±6–18 mm. Clamped ±20 mm.

**Step 4 — Saddle Tilt**
Category baseline: −1° (road/gravel), 0° (MTB/city).
Flexibility/core adjustments: ±0.5–1°.

**Step 5 — Bar Drop**
Base: `saddle height × category ratio` (0.01–0.16 per category).
4-tier ambition scaling per category. Experience ±10 mm. Clamped to per-category bounds.

**Step 6 — Reach (saddle-to-bar)**
Primary path (torso + arm): `(torso × 0.47) + (arm × 0.33) + 25 mm`.
Fallback (height only): `height × 0.30 − 125 mm`.
Ambition offsets: −20 to +25 mm. Category offsets: 0 to −120 mm. Per-category clamp.

**Step 7 — Cleat Offset**
Category × ambition lookup table (3–16 mm behind ball of foot).

**Step 8 — Handlebar Width**
Road/Gravel: `shoulder width + ambition adjustment`.
MTB: `shoulder × 1.8`, clamped 720–820 mm.
City: `shoulder × 1.6`, clamped 600–740 mm.

**Step 9 — Frame Targets**
Stack and reach targets derived from saddle height, bar drop, and current cockpit position. Simplified; frame geometry database integration is on the roadmap.

**Step 10 — Stem Solution**
Attempts to match target reach using stem length (60–130 mm), angle, and spacer stack (0–40 mm). Returns best-fit cockpit configuration.

### Outputs

| Output | Description |
|--------|-------------|
| `saddleHeightMm` | Floor-to-top-of-saddle |
| `saddleSetbackMm` | BB centre to saddle nose horizontal |
| `saddleTiltDeg` | Saddle angle |
| `barDropMm` | Saddle top to bar top delta |
| `saddleToBarReachMm` | Horizontal reach distance |
| `reachRange` | Safe min–max band |
| `crankLengthMm` | Recommended crank |
| `handlebarWidthMm` | Centre-to-centre |
| `cleatOffsetMm` | Behind ball of foot |
| `frameStackTargetMm` | Target frame stack |
| `frameReachTargetMm` | Target frame reach |
| `stemLengthMm` | Recommended stem |
| `notes[]` | Contextual guidance strings |
| `confidenceScore` | 0–100 algorithm confidence |
| `warnings[]` | Edge case and safety flags |

### Known Limitations

- Femur length is stored but not yet integrated into calculations
- Frame size recommendation uses simplified geometry (no database lookup)
- Effective Top Tube uses `reach + 50 mm` approximation rather than proper seat tube angle geometry
- Shoulder width defaults to 420 mm when not provided (should be height-derived)

---

## 8. Technology Framework

### Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 16 (App Router) | Server components, Turbopack, file-based routing |
| **Styling** | Tailwind CSS v4 | Utility-first, fast iteration, design token support |
| **UI Components** | Prototyper UI (Base UI headless) | Accessible primitives, custom design system |
| **Backend** | Convex | Real-time BaaS, type-safe RPC, no REST layer needed |
| **Auth** | @convex-dev/auth + Resend | Passwordless magic-link, no password management overhead |
| **Language** | TypeScript (end-to-end) | Convex codegen provides full RPC type safety |
| **Forms** | react-hook-form + Zod | Schema-driven validation, minimal boilerplate |
| **Deployment** | Vercel | Native Next.js hosting, zero-config CI/CD |
| **Monitoring** | Sentry | Error tracking and performance monitoring |
| **Testing** | Vitest + Playwright | Unit, contract, and E2E test coverage |

### Architecture Principles

1. **All data through Convex RPC** — No REST endpoints. Every query and mutation is type-safe, end-to-end.
2. **Server-side route protection** — `ConvexAuthNextjsServerProvider` + `src/proxy.ts` enforce auth at the edge.
3. **Authorization at the data layer** — `requireUserId()`, `requireSessionOwner()`, `requireBikeOwner()` pattern in every mutation.
4. **Pure algorithm** — The fit engine is a plain TypeScript function, importable on both client and server, with no side effects. Enables public calculator pages without server round-trips.
5. **Security headers** — CSP, X-Frame-Options, and HSTS configured in `next.config.ts`.

### Internationalization

- EN/NL locale routing (`/en/`, `/nl/` path prefixes)
- Locale detection: URL → cookie → Accept-Language → default (EN)
- Dictionary files: `src/i18n/messages/{en,nl}.ts`
- `getRequestLocale()` available in server components and actions
- Parity tests enforce translation completeness across locales

---

## 9. Strengths

**Algorithm**
- Biomechanically grounded (LeMond/Hamley base methodology), not a lookup table
- Fully deterministic and unit-tested — results are reproducible and auditable
- Handles 4 bike categories × 4 ambition levels with per-category clamping
- Gracefully degrades when optional measurements are missing (fallback formulas)
- Pure function importable in client — powers instant public calculators without server calls

**Product**
- Comprehensive scope: measurements → questionnaire → fit → pressure → report
- Public calculators generate SEO traffic and demonstrate value before sign-up
- Multi-bike and multi-profile support covers real user needs
- Tire pressure calculator adds standalone utility and cross-sell surface
- Strava integration provides automatic context and reduces manual input

**Technology**
- Type-safe end-to-end with Convex codegen — runtime type errors at the API boundary are eliminated
- No REST layer means no serialization bugs or documentation drift
- Turbopack development build is fast
- Vercel + Convex deployment is near-zero-ops
- Vitest unit tests cover algorithm steps — safe to iterate on calculation logic

**Market**
- Bilingual from day one (EN/NL) — positioned for EU expansion
- Freemium model lowers acquisition barrier while creating upgrade pressure
- Price point (€9/month) is ~50× cheaper than a professional fit session
- Premium tier opens a B2B channel (fitters, shops) without a separate product

---

## 10. Weaknesses

**Algorithm**
- Femur length collected but not used — a measurement that affects optimal saddle setback goes to waste
- Shoulder width defaults to a fixed 420 mm instead of deriving from height — degrades handlebar width accuracy for unmeasured users
- Frame size recommendation is simplistic: no brand geometry database, relies on stack/reach thresholds only
- Effective Top Tube uses a magic constant (`reach + 50 mm`) instead of actual seat tube angle geometry
- No feedback loop: the algorithm has no way to learn from whether users accepted or rejected recommendations

**Product**
- PDF export is promised in the pricing page but not yet implemented — creates expectation gap
- Questionnaire is powerful but relies on question definitions being seeded — new environments start empty
- Bike detail pages are partially built — backend CRUD exists but UI is incomplete
- Admin dashboard is minimal — operations team has limited tooling for user management and support
- Client management portal (the core Premium differentiator) is not yet designed or built

**Technology**
- Convex vendor lock-in — the entire backend relies on Convex's hosted platform; no easy migration path
- Convex has limited SQL-style querying — complex analytics queries are harder to express
- No offline support — the dashboard requires an active Convex connection
- Development plan in the codebase is out of date — misleads contributors about what is complete

**Market**
- Single-person or small-team operation — limited bandwidth for simultaneous product, content, and sales work
- B2B Premium tier requires client management tooling that does not yet exist
- Currency display uses $ in some places but targets EU market — minor trust issue
- No social proof mechanism yet (user testimonials are placeholder text)

---

## 11. Product Roadmap

### Now (Active)

| Item | Status |
|------|--------|
| Engine v2 migration (10 phases) | Phases 1–9 complete; phase 10 (cutover) pending |
| Tire pressure module (public + dashboard) | Public calculator live; dashboard wizard complete |
| Strava OAuth + photo import | Live |
| Profile wizard with measurement illustrations | Live |
| Slider-based calculator UI across all public tools | Live |
| SEO content expansion (guides, use-cases, science) | Ongoing |

### Next (1–2 months)

| Item | Priority |
|------|----------|
| Engine v2 default cutover | High — unblocks confidence ranges and shadow-mode validation |
| PDF report export | High — promised on pricing page; blocks Premium conversion |
| Strava phase 2: per-bike ride data import | Medium |
| Bikes frontend completion (edit, delete, photo) | Medium |
| Admin dashboard: user management + audit logs | Medium |
| Femur length integration into algorithm | Low |

### Later (3–6 months)

| Item | Priority |
|------|----------|
| Frame geometry database integration | High — improves frame size recommendations significantly |
| Client management portal (Premium tier) | High — required to monetise Premium properly |
| Dynamic validation feedback loop | Medium — Strava or manual ride feedback → algorithm confidence |
| Strava phase 3: terrain-aware fit intelligence | Medium |
| Branded PDF export for Premium tier | Medium |
| API access for integrations (Premium) | Low |

### Future Vision

- Wearable data integration (power, HR, cadence) for dynamic fit refinement
- Population-level biomechanics insights for algorithm improvement
- White-label platform for bike shops and fitting studios
- Event-specific fit profiles (race-day vs. training vs. climbing)
- Direct integration with geometry databases (e.g., Bike Insights, manufacturer APIs)

---

## 12. Success Metrics

| Metric | What it measures |
|--------|-----------------|
| Monthly active users | Platform health and retention |
| Fit sessions completed per user | Engagement depth |
| Free → Pro conversion rate | Freemium model effectiveness |
| Pro → Premium conversion rate | B2B channel viability |
| Monthly churn rate | Product-market fit signal |
| Session completion rate | UX quality and friction |
| Email report open rate | Report value to users |
| Organic search traffic | SEO investment ROI |
| Algorithm confidence score distribution | Recommendation quality |

---

*Last updated: 2026-03-30*
