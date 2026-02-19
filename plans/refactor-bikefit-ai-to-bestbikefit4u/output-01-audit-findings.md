# Output 01: BikeFit AI Application Audit Findings

Date: `2026-02-19`
Plan step: `01-audit-bikefit-ai-application.md`

## Executive Summary

- The app is functionally live with locale redirects and core routes rendering.
- Brand references are still heavily `BikeFit AI` across UI, SEO metadata, auth/report emails, PDF labels, and tests.
- Domain/config already partially target `bestbikefit4u.eu`, creating mixed identity state.
- Replacement risk is manageable if done in a centralized, ordered rollout.

## Inventory Snapshot

Global search counts (overlapping categories):

- `BikeFit AI`: `115` matches
- `bestbikefit4u.eu`: `9` matches
- `bikefit-ai` / `bikefitAI`: `1` match (`package.json` name)

Category-oriented counts (filter-based, may overlap):

- Public frontend pages (`src/app/(public)`): `81` references
- Auth/layout/components/i18n surfaces: `17` references
- Backend communications + report rendering (`convex/*`, `src/lib/*`): `11` references
- Ops/docs/tests/package (`docs`, `.env.example`, `package.json`, route test): `10` references

## Reference Classification

### 1) User-facing UI copy

Primary files:

- `src/app/(public)/about/page.tsx`
- `src/app/(public)/pricing/page.tsx`
- `src/app/(public)/faq/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/terms/page.tsx`
- `src/app/(public)/privacy/page.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/components/layout/DashboardSidebar.tsx`
- `src/components/layout/Footer.tsx`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

Notes:

- Branding appears in visible headings, CTA copy, subtitles, and legal text in both EN/NL.

### 2) Metadata / SEO / structured data

Primary files:

- `src/app/layout.tsx`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/crank-length/page.tsx`
- `src/app/(public)/science/calculation-engine/page.tsx`
- `src/app/(public)/science/bike-fit-methods/page.tsx`
- `src/app/(public)/science/stack-and-reach/page.tsx`
- `src/app/(public)/faq/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/terms/page.tsx`
- `src/app/(public)/privacy/page.tsx`

Notes:

- Brand appears in title/description/keywords and JSON-LD `name`.

### 3) Transactional communications

Primary files:

- `convex/auth.ts` (login code email)
- `convex/emails/actions.ts` (recommendation email)

Notes:

- Both fallback sender display name and email subject/body include `BikeFit AI`.

### 4) Generated artifacts

Primary files:

- `src/lib/reports/recommendationPdf.ts`
- `src/lib/pdf/simplePdf.ts`

Notes:

- PDF/report labels still present `BikeFit AI` naming.

### 5) Environment / deployment / tests / package identity

Primary files:

- `.env.example`
- `docs/VERCEL_DEPLOYMENT.md`
- `docs/DEVELOPMENT_PLAN.md`
- `src/app/api/reports/[sessionId]/pdf/route.test.ts`
- `package.json`

Notes:

- Domain already points to `bestbikefit4u.eu`.
- Display sender remains `BikeFit AI`.
- Test assertions depend on old report label.
- npm package name still `bikefit-ai`.

## Runtime Smoke Pass (localhost)

Method:

- Local HTTP checks against running dev app on port `3000`.
- Unprefixed routes redirect to locale-prefixed routes (`/en/...`).

Results:

| Route | First response | Redirect target | Final response | Observed title |
|------|------|------|------|------|
| `/` | 307 | `/en` | 200 | `BikeFit AI - Personalized Bike Fitting Recommendations` |
| `/about` | 307 | `/en/about` | 200 | `How BikeFit AI Works - Bike Fitting Methodology` |
| `/pricing` | 307 | `/en/pricing` | 200 | `Pricing - BikeFit AI Plans and Features` |
| `/faq` | 307 | `/en/faq` | 200 | `FAQ - BikeFit AI` |
| `/contact` | 307 | `/en/contact` | 200 | `Contact Us - BikeFit AI` |
| `/measurement-guide` | 307 | `/en/measurement-guide` | 200 | `How To Measure For Bike Fit - Measurement Guide` |
| `/calculators/saddle-height` | 307 | `/en/calculators/saddle-height` | 200 | `Saddle Height Calculator | BikeFit AI` |
| `/calculators/frame-size` | 307 | `/en/calculators/frame-size` | 200 | `Frame Size Calculator | BikeFit AI` |
| `/calculators/crank-length` | 307 | `/en/calculators/crank-length` | 200 | `Crank Length Calculator | BikeFit AI` |
| `/login` | 307 | `/en/login` | 200 | `BikeFit AI` |
| `/dashboard` | 307 | `/en/dashboard` | 307 (`/en/login`) | (redirected to login) |
| `/en/fit` | - | - | 200 | `BikeFit AI` |
| `/en/fit/fake-session/results` | - | - | 200 | `BikeFit AI` |
| `/en/fit/fake-session/questionnaire` | - | - | 200 | `BikeFit AI` |

Auth flow smoke evidence:

- `/en/login` renders with BikeFit AI brand and login form copy.
- Full magic-code submit/delivery was not executed in this step.

## Risks And Blockers

### P1 - High

1. Mixed identity state (brand vs domain)
   - Domain is `bestbikefit4u.eu`, but user-visible name is mostly `BikeFit AI`.
   - Risk: inconsistent trust signals and support confusion.

2. Distributed hardcoded brand strings
   - High string spread across pages/templates increases miss risk during replacement.

3. Transactional email branding mismatch
   - Auth/report emails still include old brand strings.
   - Risk: inconsistent sender trust and user confusion.

### P2 - Medium

4. SEO fragmentation risk
   - Metadata/JSON-LD values still old brand; requires coordinated update.

5. Test coupling to old brand labels
   - `src/app/api/reports/[sessionId]/pdf/route.test.ts` asserts old report title.

6. Potential sender verification impact if from-address changes
   - Display name updates are low risk.
   - Domain/local-part changes may require email provider/domain verification.

### P3 - Low / decision item

7. `package.json` name (`bikefit-ai`)
   - Renaming not required for external brand replacement.
   - Should be explicit defer/keep decision.

### Out-of-scope behavior note discovered during smoke pass

8. Server-side protected path matcher only covers `/dashboard*`
   - `src/i18n/navigation.ts` currently protects `/dashboard` paths only.
   - `/fit` routes return `200` server-side and rely on client auth logic.
   - This is not a branding blocker but should be tracked separately.

## Recommended Sequencing Input For Step 02

1. Define canonical brand constants first (name, sender display, site title suffix, domain policy).
2. Decide exception policy (historical docs/plan outputs vs active product surfaces).
3. Centralize brand usage point before broad replacements.
4. Replace frontend + metadata together to avoid partial SEO drift.
5. Replace backend email/PDF strings and then update tests.
6. Run residual grep audit and smoke checks after each replacement phase.
