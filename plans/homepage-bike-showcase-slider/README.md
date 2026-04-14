# Plan: Homepage Bike Showcase Slider

**Status:** Draft — ready for product, design, and engineering review
**Date:** 2026-04-14
**Author:** Claude (PM/UX/Architecture review)

---

## 1. Executive Summary

BestBikeFit4U wants to add a homepage carousel showing recently added bikes with geometry and tire pressure data. The core insight behind the idea is correct: **real bike data is the most credible form of social proof** this platform can show. Visitors who see a Canyon Ultimate CF SLX with stack/reach figures and a tire pressure optimisation summary immediately understand what the product does and why it is useful.

However, the naive implementation — "show the 5 most recently added bikes" — carries significant risks: privacy exposure, low-quality or absent images, thin data, and spam. These risks can each silently destroy the trust effect rather than create it.

**The recommendation is: build this feature, but with a curated eligibility gate rather than a raw recency feed.** The right model is **"5 most recently admin-approved, marketing-eligible bikes"** drawn from a small, carefully controlled pool. This is safe, honest, and still creates genuine social proof.

The feature should be built in three phases. Phase 1 ships a minimal, safe, static version. Phases 2 and 3 add richer data, interactivity, and personalisation once trust is established.

---

## 2. Recommended Product Direction

### 2.1 Why this is a strong idea

- **Platform credibility signal.** The homepage currently has hero copy, feature lists, testimonial quotes, and calculators. It lacks one thing: **evidence that real bikes exist in the system**. A carousel of real bikes with geometry data is the most direct proof of product depth.
- **Data depth as trust.** Most fitness apps show star ratings and testimonials. A Stack/Reach figure or a tire pressure range signals a different kind of expertise. It says: this platform actually knows bikes, not just riders.
- **Conversion hook.** A visitor who recognises their own bike model — or a bike they dream of — has a personalised reason to create an account: "What would my fit look like on that bike?"
- **Low-friction engagement.** The slider creates visual movement on a page that is otherwise static, increasing dwell time without requiring any interaction.

### 2.2 What could go wrong

| Risk | Severity | Description |
|------|----------|-------------|
| Privacy exposure | High | Bikes are linked to users. Even brand/model combinations can be identifying in a small community |
| No image | Medium | Many bikes have no photo. A placeholder grid looks sparse and cheap |
| Thin data | Medium | If geometry or pressure data is missing, the "depth" argument collapses |
| Spam / abuse | High | Any public-facing ingestion path can be gamed if eligibility is automatic |
| Low quality images | Medium | User-uploaded photos vary wildly in quality |
| Homepage performance | Medium | Fetching live data on the homepage can slow LCP |
| Fake-looking | Low-Medium | A hand-curated list may look too polished and raise authenticity doubts |

### 2.3 Eligibility model options

| Model | Pros | Cons | Recommended? |
|-------|------|------|--------------|
| 5 most recently added bikes | Simple, always fresh | Privacy risk, quality risk, spam vector | No |
| 5 most recently added bikes with geometry data | Filters thin records | Still privacy risk, still quality variable | No |
| 5 recently public-opted-in bikes | User-controlled, honest | Requires user to take action; opt-in rate likely very low initially | Possible for Phase 2 |
| 5 recently added bikes with geometry data AND admin marketing flag | Full control, curated quality | Requires admin workflow; not automatically fresh | **Yes — Phase 1** |
| Curated static seed + dynamic top-up | Predictable for launch | Hybrid complexity | Phase 1 fallback |

**Recommended model: `marketingEligible = true` + geometry data present + image available**

This means:
- An admin explicitly marks a bike record as eligible for homepage display
- The bike must have a primary image
- The bike must have at least partial geometry data (stack + reach at minimum)
- The bike owner's identity is never shown

This is honest — these are real bikes in the system — and safe. The "recently added" label can be used loosely (within the last 60 days) without requiring exact timestamps.

### 2.4 Challenge to the original idea

"5 most recently added bikes" optimises for freshness at the cost of quality and safety. The homepage is not the right place for a raw data feed. It is a conversion surface. A curated pool of 20–50 eligible bikes that rotates slowly is more trustworthy than a raw firehose of 5 random recent additions. The component should feel like a curated showcase, not a live feed.

---

## 3. UX Concept

### 3.1 Component placement on the homepage

Insert the showcase section **between the QuotesCarousel and the How It Works section**. This positions it after social proof (quotes) and before product explanation, which is the highest-value trust-building position.

### 3.2 Section header

```
[Eyebrow label]   Real bikes. Real data.
[Heading]         Bikes on the platform — from geometry to tyre pressure
[Subtext]         Every bike shown comes with full geometry measurements and optimised tyre pressures.
                  Create an account to run your own.
```

### 3.3 Desktop layout (≥1024px)

- Show **3 cards** simultaneously in a horizontal carousel
- Cards are ~340px wide with a visible overflow hint (partial 4th card visible)
- Arrow navigation (left/right) visible on hover
- Dot/index indicators below
- Auto-scroll: **off by default** — do not auto-scroll. Cycling carousels on marketing pages can feel aggressive and reduce trust. Let the user explore.
- Each card is ~260px tall

```
[← ]  [Card A]  [Card B]  [Card C]  [→]
              [ • • • ○ ○ ]
```

### 3.4 Tablet layout (768px–1023px)

- Show **2 cards** with a partial 3rd visible
- Same arrow + dot navigation
- Touch/swipe enabled

### 3.5 Mobile layout (<768px)

- Show **1 card** with a partial 2nd card visible on the right edge
- No arrow navigation — swipe only
- Dot indicators below
- Cards are full-width minus 32px horizontal padding

### 3.6 Slide card anatomy

Each card contains:

```
┌─────────────────────────────────┐
│  [Bike image — 16:9 ratio]      │
│                          [Badge]│
├─────────────────────────────────┤
│  Brand · Model                  │
│  Year (if available) · Type     │
│                                 │
│  Stack / Reach  │  Geometry tag │
│                                 │
│  [Tyre pressure snippet]        │
└─────────────────────────────────┘
```

**Trust badge** (top-right of image): A small pill badge reading "Geometry verified" or "Data complete" in muted styling. This is subtle — not a marketing shout.

**Type tag**: Colour-coded chip for bike type (Road, Gravel, MTB, etc.). Uses the existing bikeType field.

**Geometry snippet**: Stack and Reach values shown as e.g. `Stack 570mm · Reach 385mm`. If only one is available, show what exists.

**Tyre pressure snippet**: A single-line teaser: `Tyre pressure: 5.8–6.4 bar (road, optimised)`. This is a generalised range, not rider-specific.

**Click target**: The entire card is clickable and opens the detail modal/drawer.

### 3.7 Hover behaviour (desktop)

- Card lifts with subtle box-shadow elevation on hover (existing `PublicSurfaceCard` pattern)
- Cursor changes to pointer
- A "View details →" text fades in at the bottom of the card

### 3.8 Detail modal / drawer

**Desktop**: Centred modal dialog, ~640px wide, scrollable if content exceeds viewport height.

**Mobile**: Bottom drawer (slide-up sheet), full width, with drag-to-dismiss handle.

The existing `AccessibleDialog` / `dialog.tsx` pattern already in the codebase should be reused.

#### Detail card layout

```
┌──────────────────────────────────────────────────────┐
│  [Bike image — wide, 16:9]                            │
├──────────────────────────────────────────────────────┤
│  Trek Domane SL 7 · 2023                              │
│  Endurance Road · 54cm                                │
│                                                       │
│  ── Geometry ──────────────────────────────────────  │
│  Stack     570 mm     Reach      385 mm               │
│  ETT       565 mm     STA        73.5°                │
│  HTA       71.0°      Wheelbase  1,009 mm             │
│                                                       │
│  ── Tyre Pressure ─────────────────────────────────  │
│  25mm tubeless · Road · All-round                     │
│  Front  5.4–6.0 bar    Rear  5.8–6.4 bar             │
│  [i] Based on typical rider weight 70–80 kg           │
│                                                       │
│  ── About this bike ───────────────────────────────  │
│  [Short generated or curated description — 2 lines]   │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │  Want your fit dialled in for this bike?     │    │
│  │  Create a free account →                     │    │
│  └──────────────────────────────────────────────┘    │
│                                                       │
│  [View full bike details]  (links to bike detail page │
│   or signup with bike pre-selected)                   │
└──────────────────────────────────────────────────────┘
```

### 3.9 Empty state

If fewer than 3 eligible bikes exist:
- Show however many exist (1–2 cards)
- Do not show the section if 0 eligible bikes exist — suppress it entirely
- Engineering: the section is conditionally rendered server-side; no empty skeleton on production

### 3.10 Loading state

- **Server-side rendering** is preferred for this component (see Technical Plan)
- If using client-side fetch with Convex: show 3 skeleton card placeholders (grey shimmer boxes) during load
- Loading state must not shift layout (reserve height with CSS)

### 3.11 Image fallbacks

- If a bike has no primary photo: show a **type-specific placeholder illustration** (e.g. a minimal line-art silhouette of a road bike, gravel bike, MTB). One SVG per bike type. Do not show broken images or empty boxes.
- Fallback images should be consistent in visual weight with real photos. A clean, minimal SVG silhouette on a muted background works well.

### 3.12 Carousel implementation approach

Follow the existing `QuotesCarousel` pattern: CSS `overflow-x: scroll` with `scroll-snap-type: x mandatory` and `scroll-snap-align: start` on each card. Add JS scroll controls (previous/next buttons) for accessibility. This avoids a heavy carousel library.

---

## 4. Functional Requirements

### FR-1: Display 5 eligible bikes
The component renders exactly 5 bike cards. If fewer than 5 eligible bikes exist, render however many do. If 0, suppress the section entirely.

### FR-2: Eligibility criteria (all required)
A bike is eligible for homepage display if and only if:
- `bikes.marketingEligible === true` (new field, set by admin)
- A primary image exists in `bikePhotos` (or `photoUrl` fallback) that has passed image moderation
- At least one of: `bikes.geometryRecordId` is set with an active geometry record, OR `bikes.currentGeometry.stackMm` and `bikes.currentGeometry.reachMm` are both present
- `bikes.brand` is present (cannot be anonymous "My bike")
- The bike owner's account is not suspended

### FR-3: Sort order
Sort by `bikes.updatedAt` descending (most recently updated eligible bike first). This creates a "recently featured" feel without exposing exact creation timestamps.

### FR-4: Primary image display
- Prefer the `bikePhotos` primary image (Convex Storage URL, served via `next/image`)
- Fall back to `bikes.photoUrl` if no bikePhotos record exists
- Fall back to type-specific SVG placeholder if neither exists

### FR-5: Brand, model, year display
- Show `bikes.brand` + `bikes.model` (both optional — show what is available)
- If `bikes.geometryRecordId` is set, show year from the linked `geometry_models.yearStart`/`yearEnd`
- Show `bikes.bikeType` as a localised chip label

### FR-6: Geometry summary (slide card)
On the slide card, show only: Stack and Reach (if available). If neither is available, the bike should not be eligible (FR-2).

### FR-7: Geometry summary (detail modal)
In the detail modal, show all available geometry fields from the linked `geometry_records` row:
- Stack, Reach, Effective Top Tube, Seat Tube Angle, Head Tube Angle, Wheelbase
- Only show fields that are not null
- Show geometry source as a footnote: "Source: manufacturer specifications"

### FR-8: Tyre pressure teaser
On the slide card: a single-line text snippet showing pressure range.
In the detail modal: front/rear split, with tire setup context (width, tube type if available), and a disclaimer.

### FR-9: Tyre pressure values — generic, not rider-specific
Do not expose any rider-specific data. The pressure values shown are derived from the bike's tyre setup configuration (width, tube type, rim type) combined with a **generic rider weight assumption of 70–80 kg** and road discipline. This is clearly labelled.

### FR-10: Modal CTA
The detail modal includes a primary CTA button:
- Text (EN): "Get my fit for this bike"
- Text (NL): "Mijn fit voor deze fiets"
- Link: `/calculators/bike-fit` (or `/fit` with bike pre-selected if technically feasible — V2)
- Tracked as a marketing analytics event: `bike_showcase_cta_click`

### FR-11: Privacy — no user identity
No user names, display names, email addresses, or Strava usernames are ever shown. The slide card and detail modal never identify who owns the bike.

### FR-12: Privacy — no location data
No location metadata is shown. The bike owner's location, Strava activity data, or any inferred location must not appear on the public surface.

### FR-13: Admin control
Admin can set/unset `marketingEligible` on any bike through the existing admin panel. This is the sole mechanism for adding bikes to the showcase. No automated eligibility promotion.

### FR-14: Analytics
Track the following events:
- `bike_showcase_section_view` — section enters viewport
- `bike_showcase_card_click` — individual card is clicked (include bike id anonymised or hashed)
- `bike_showcase_modal_open` — detail modal opens
- `bike_showcase_cta_click` — CTA inside modal is clicked
- `bike_showcase_arrow_click` — prev/next arrow used

### FR-15: i18n
All copy must be internationalised (EN + NL). Geometry field labels and pressure units respect the user's locale. Pressure shown in bar with PSI in parentheses.

### FR-16: Accessibility
- Carousel has `role="region"` with `aria-label`
- Each card is a `<button>` or `<a>` with descriptive `aria-label` (e.g. "View Trek Domane SL 7 details")
- Arrow buttons have accessible labels
- Modal follows ARIA dialog pattern (focus trap, close on Escape)
- `prefers-reduced-motion`: disable any scroll animations, do not auto-scroll

### FR-17: SEO
The section is rendered server-side. Bike names and types are in the DOM for crawlers. No structured data injection required for Phase 1, but bike name + geometry can be added as `Product` schema in Phase 2.

### FR-18: Performance
- Images served through `next/image` with appropriate `sizes` attribute
- The homepage section adds ≤ 100ms to LCP on a 4G connection
- Convex query result is cached (see Technical Plan)

---

## 5. Data Model and Privacy Model

### 5.1 Required schema change: `bikes` table

Add two fields to the `bikes` table:

```typescript
// New fields on bikes table
marketingEligible: v.optional(v.boolean()),
marketingEligibleAt: v.optional(v.number()),   // timestamp set by admin
marketingEligibleBy: v.optional(v.id("users")), // admin user who approved
imageModerated: v.optional(v.boolean()),         // image passed moderation
imageModerationAt: v.optional(v.number()),
```

Add a Convex index:

```typescript
.index("by_marketing_eligible", ["marketingEligible"])
```

### 5.2 New Convex query: `bikes/publicQueries.ts`

```typescript
// Public query — no auth required
// Returns the 5 most recently updated marketing-eligible bikes
// with geometry and image data joined

export const getMarketingEligibleBikes = query({
  args: {},
  handler: async (ctx) => {
    // Query eligible bikes
    // Join geometry record
    // Join primary photo
    // Strip all user-identifying fields
    // Return sanitised public projection
  }
})
```

**Public projection — fields allowed on public surface:**

| Field | Source | Public? |
|-------|--------|---------|
| `_id` (hashed) | bikes | Hashed only |
| `name` | bikes | No — omit (could be personalised) |
| `brand` | bikes | Yes |
| `model` | bikes | Yes |
| `bikeType` | bikes | Yes |
| `description` | bikes | Yes — if admin-reviewed |
| `photoUrl` (CDN) | bikePhotos / bikes | Yes — moderated image only |
| `stack`, `reach`, `seatTubeAngle`, `headTubeAngle`, `wheelbase`, `effectiveTopTube` | geometry_records | Yes |
| `yearStart`, `yearEnd` | geometry_models | Yes |
| `recommendedFrontBar`, `recommendedRearBar` | pressureProfiles | Yes — illustrative range only |
| `userId` | bikes | **Never** |
| `stravaGearId` | bikes | **Never** |
| `activitySummary` | bikes | **Never** |
| `importSourceUrl` | bikes | **Never** |
| `createdAt` | bikes | **Never** — use `marketingEligibleAt` only |
| `updatedAt` | bikes | **Never** |
| User's name, email | users | **Never** |
| Location data | any | **Never** |

### 5.3 Tyre pressure public data model

The pressure values shown in the slider come from the following calculation:

1. If the bike has a linked `pressureProfile` with `useCase = "endurance"` or `"race"`: use those values directly, labelled as "illustrative — based on typical 70–80 kg rider weight"
2. If no pressure profile exists: use the `pressureCalculations` engine with hardcoded generic inputs (75 kg total, road discipline, bike's tire setup width, tubeless assumption) to produce illustrative values on the fly — not stored, computed in the query handler
3. If no tire setup data exists: show "Pressure optimisation available for this bike" as a teaser without values

**What is shown:**
```
Front: 5.4–6.0 bar (79–87 psi)
Rear:  5.8–6.4 bar (84–93 psi)
Tyre: 28mm tubeless · Road
Based on 70–80 kg total rider+bike weight
```

**What is never shown:**
- The actual bike owner's weight
- Rider-specific fit data
- Any data that could identify the owner

### 5.4 Geometry data completeness tiers

| Tier | Criteria | Show in slider? | Show in modal? |
|------|----------|----------------|----------------|
| Full | Stack + Reach + ETT + HTA + STA + Wheelbase all present | Yes | Full grid |
| Partial | Stack + Reach present | Yes | Show available fields + note |
| Minimal | Only stack OR reach present | No — ineligible | N/A |
| None | No geometry data | No — ineligible | N/A |

### 5.5 Content moderation requirements

Before a bike can receive `marketingEligible = true`:

1. **Image review**: Admin must confirm the primary image shows a real bike in acceptable quality. The admin panel should show the image before the admin can set the flag.
2. **Brand/model check**: `bikes.brand` must be a known brand (ideally from `bikeBrands` catalogue, not free text).
3. **No sensitive content**: The bike name (`bikes.name`) must not contain personal information. Consider showing a warning in the admin panel if it contains email-like strings or proper names.
4. **Geometry verified**: The linked geometry record must have `status = "active"`.

---

## 6. Technical Implementation Plan

### 6.1 Data layer

**New Convex query** (`convex/bikes/publicQueries.ts`):
- `getMarketingShowcaseBikes`: no auth required (public query)
- Queries `bikes` table with `by_marketing_eligible` index, filtered `marketingEligible === true`
- Sorted by `marketingEligibleAt` descending, limit 5
- For each bike: joins `geometry_records` via `geometryRecordId`, `geometry_models` via `geometry_records.modelId`, `geometry_brands` via `geometry_records.brandId`, `bikePhotos` primary image
- Returns a narrow, sanitised public projection (see §5.2)
- No user data in response at any level

**New Convex mutation** (`convex/admin/bikeMarketing.ts`):
- `setMarketingEligible(bikeId, eligible: boolean)`: admin-only, uses existing `requireAdminRole()` pattern
- Sets `marketingEligible`, `marketingEligibleAt`, `marketingEligibleBy`

**Schema migration** (`convex/schema.ts`):
- Add `marketingEligible`, `marketingEligibleAt`, `marketingEligibleBy`, `imageModerated`, `imageModerationAt` to `bikes` table
- Add `by_marketing_eligible` index

### 6.2 Frontend — component architecture

```
src/
  components/
    home/
      BikeShowcaseSection.tsx      # Server component — fetches data, renders section shell
      BikeShowcaseCarousel.tsx     # Client component — carousel state, navigation
      BikeShowcaseCard.tsx         # Pure presentational card
      BikeShowcaseModal.tsx        # Modal/drawer with detail view
      BikeShowcaseSkeleton.tsx     # Loading skeleton
      bike-showcase.types.ts       # Shared types for public bike projection
```

### 6.3 Rendering strategy

**SSR (Server Component) for the section wrapper.** The homepage is already a server component. `BikeShowcaseSection` is a server component that fetches data using the Convex HTTP client (or a pre-fetch pattern), renders the section with bikes data passed to `BikeShowcaseCarousel` as a prop.

This is the critical decision: **do not use `useQuery` / real-time Convex subscription on the homepage**. The marketing homepage is a high-traffic, SEO-sensitive surface. Real-time subscriptions are not needed for a slowly-changing curated list.

**Options:**
1. **Convex HTTP query via `fetchQuery`** — call the Convex query from a Next.js Server Component using the Convex HTTP API. No client subscription. Data is as fresh as the last page render.
2. **ISR (Incremental Static Regeneration)** — `revalidate: 3600` (1 hour). The page regenerates hourly. For a curated list that changes rarely, this is ideal.

**Recommendation: ISR with 1-hour revalidation.** The curated list changes only when an admin updates it. 1-hour staleness is acceptable. On-demand revalidation can be triggered from the admin panel when a new bike is added to the showcase.

### 6.4 Image optimisation

- `next/image` with `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- Convex Storage URLs are served from a CDN — these can be used directly with `next/image`'s `remotePatterns` config
- Aspect ratio: 16:9, enforced with `aspect-ratio: 16/9` CSS
- `priority={false}` — the carousel is below the fold; do not mark images as priority
- `loading="lazy"` by default

### 6.5 Carousel implementation

Follow the existing `QuotesCarousel` pattern — CSS scroll snap, no JavaScript carousel library.

```tsx
// BikeShowcaseCarousel.tsx (client component)
// - useState for current index
// - scrollTo() on button click
// - IntersectionObserver on cards to update active dot
// - No external carousel dependency
```

Accessibility: Wrap in `<section>` with `aria-roledescription="carousel"`, each card as `aria-roledescription="slide"`, navigation buttons with `aria-label="Next bike"` / `aria-label="Previous bike"`.

### 6.6 Admin panel integration

Add a "Marketing Showcase" tab or section to the existing admin bike management UI (`src/app/(dashboard)/admin/`). This panel shows:
- All bikes eligible to be marked for marketing
- Current `marketingEligible` status toggle
- Preview of the bike's primary image
- A warning if no image exists
- Geometry completeness indicator

### 6.7 Caching strategy

| Layer | Cache | Invalidation |
|-------|-------|-------------|
| Next.js page (ISR) | 1 hour | On-demand via `revalidatePath('/')` triggered from admin action |
| Convex query | Convex internal (automatic) | On write to `bikes` with eligible flag |
| Image CDN | Convex Storage CDN | Immutable (content-addressed) |

### 6.8 Analytics

Use existing `TrackedCtaLink` and `MarketingEventTracker` patterns. Add new event types to `src/lib/analytics/marketing.ts`:
- `bike_showcase_section_view`
- `bike_showcase_card_click`
- `bike_showcase_modal_open`
- `bike_showcase_cta_click`
- `bike_showcase_nav_click`

### 6.9 SEO implications

- Section is SSR — bike names and types are in HTML for crawlers
- No additional structured data needed for Phase 1
- Phase 2: Consider `ItemList` + `Product` schema for the bikes in the carousel
- Do not use `<Image priority>` for carousel images — they are below the fold and should not compete with hero LCP

### 6.10 Performance targets

| Metric | Target |
|--------|--------|
| LCP impact (carousel section) | < 50ms additional |
| JS bundle increase | < 8 KB gzipped |
| Images | Lazy-loaded, served from CDN |
| No layout shift | Reserve height via fixed aspect ratio containers |

---

## 7. Risk Analysis

### 7.1 Privacy and data exposure

**Risk:** Bike owner identity leaks through bike name, description, or metadata.
**Mitigation:**
- Strip all user-identifying fields at the query layer
- Admin must review bike name before approving — flag if it looks personalised
- Never show `bikes.name` (users often name their bike "John's Cervelo") — use brand + model from catalogue instead
- Bike `_id` in URL/API is hashed or omitted entirely — no direct lookup of owner possible

**Risk:** Strava activity data or location appears in description fields.
**Mitigation:** Auto-generated or admin-reviewed descriptions only; raw user descriptions never shown.

### 7.2 Low-quality images

**Risk:** User-uploaded photos are blurry, sideways, or show inappropriate content.
**Mitigation:**
- `imageModerated = true` required before `marketingEligible` can be set
- Admin must visually confirm the image in the approval UI
- Type-specific SVG fallback if image is unavailable or moderation fails

### 7.3 Thin or inconsistent data

**Risk:** Some cards show geometry, others don't, creating an uneven quality impression.
**Mitigation:**
- Stack + Reach are required for eligibility (FR-2)
- Geometry tier system (§5.4) ensures all public cards meet a minimum data standard
- Cards with only 2 geometry fields still show a pressure teaser, maintaining visual consistency

### 7.4 Homepage performance regression

**Risk:** Live Convex query on the homepage slows LCP.
**Mitigation:**
- ISR rendering: data is pre-rendered and served from Vercel edge
- No real-time subscription on the public homepage
- Lazy-loaded images with reserved aspect-ratio containers prevent CLS

### 7.5 Fake-looking social proof

**Risk:** A hand-curated list of perfect bikes looks staged, not organic.
**Mitigation:**
- Show the "Geometry verified" badge, not a "Featured" badge — the framing is about data quality, not curation
- Allow minor imperfections: show "Partial geometry" label if not all fields are present
- Use honest microcopy: "Bikes on the platform" not "Top bikes" or "Best bikes"
- Phase 2: Allow opt-in so users can contribute their own bikes to the showcase

### 7.6 Confusing CTA

**Risk:** Visitors don't understand what clicking "Get my fit for this bike" means.
**Mitigation:**
- CTA text is action-oriented and specific ("for this bike" creates relevance)
- Supporting subtext in the modal: "Answer a few questions about your body measurements and get personalised fit recommendations for this exact bike"
- Secondary CTA: "How does it work?" links to `/how-it-works`

### 7.7 Spam and content abuse

**Risk:** A bad actor creates accounts and adds spam bikes to game the showcase.
**Mitigation:**
- Marketing eligibility is 100% admin-controlled — no automated path from user action to homepage appearance
- This is the most important mitigation; do not compromise it for Phase 1 convenience

### 7.8 Legal — GDPR and privacy

**Risk:** Showing a user's bike on a public page without explicit consent violates GDPR.
**Mitigation:**
- The public projection never includes user-identifying data
- The bike is shown purely as a product/equipment record, not as a user record
- Even so, consider adding a terms clause noting that admin-approved bikes may be shown on the marketing site
- In Phase 2 (user opt-in flow), add explicit consent at opt-in point

### 7.9 i18n coverage

**Risk:** Copy is missing for NL locale, or geometry labels are not translated.
**Mitigation:**
- All new copy added to `i18n/` dictionary files for EN + NL simultaneously
- Geometry field labels use a shared constants file, not inline strings

---

## 8. Rollout Phases

### Phase 1 — Safe Static Showcase (MVP)

**Scope:**
- Admin adds `marketingEligible` flag to bikes schema
- Admin panel UI to set/unset the flag, with image preview and geometry check
- New public Convex query returning sanitised bike data
- `BikeShowcaseSection` (SSR) + `BikeShowcaseCarousel` (client) + `BikeShowcaseCard` + `BikeShowcaseModal`
- CSS snap scroll carousel (no library)
- Type-specific SVG placeholders for bikes without photos
- Geometry summary (Stack + Reach) on card, full geometry table in modal
- Generic tyre pressure snippet (pre-computed for 75 kg, road, tubeless assumption)
- CTA links to `/calculators/bike-fit`
- EN + NL copy
- ISR with 1-hour revalidation
- Basic analytics events (section view, card click, modal open, CTA click)

**Dependencies:** Schema migration, admin panel update, manual curation of first 5–10 eligible bikes

**Expected value:** Social proof signal on homepage, evidence of platform depth for new visitors

**Complexity:** Medium (schema change + 1 new query + 4 new components + admin UI)

**Risk:** Low — fully admin-controlled, no user data exposed

---

### Phase 2 — User Opt-In and Richer Detail

**Scope:**
- User-facing opt-in flow: "Share my bike on the BestBikeFit4U showcase"
- Opt-in sets a `sharedForMarketing` flag, triggers admin review queue
- Admin reviews and approves/rejects
- Show user's own tire profile data in modal (if they have pressure profiles set up) — with clear consent
- "Bikes near you" or "Bikes for your riding style" soft personalisation (cookie-based, no account needed)
- Add `ItemList` + `Product` structured data for SEO
- On-demand ISR revalidation from admin panel (cache bust when new bike approved)
- Deeper bike detail page (`/bikes/[slug]`) as link destination from modal

**Dependencies:** Phase 1 complete, user consent flow, admin review queue in admin panel

**Expected value:** Higher showcase freshness, community feel, improved SEO, higher CTA specificity

**Complexity:** Medium-High

**Risk:** Medium — opt-in path introduces potential for abuse (mitigated by admin review requirement)

---

### Phase 3 — Personalised and Dynamic

**Scope:**
- Signed-in users see bikes matching their own bike type / riding style preference
- "Bikes like yours" contextual label if a user's own bike is a similar model
- Pre-select the showcase bike in the fit calculator (deep-link with bike pre-populated)
- Live revalidation: when a new bike is approved, homepage updates within 5 minutes (reduce ISR TTL)
- A/B test: curated showcase vs. user-voted showcase
- Analytics dashboard showing which bikes drive the most CTA clicks

**Dependencies:** Phase 2 complete, fit calculator deep-link API, A/B testing infrastructure

**Expected value:** Personalised conversion lift, higher CTA specificity for signed-in users

**Complexity:** High

**Risk:** Low-Medium — personalisation is additive, does not change Phase 1/2 safety model

---

## 9. Success Metrics

### Primary conversion metrics

| Metric | Measurement | Target (Phase 1) |
|--------|-------------|-----------------|
| CTA click-through (showcase → calculator) | Marketing analytics event `bike_showcase_cta_click` / total modal opens | > 15% |
| Signup uplift (A/B test) | % of visitors who create account — with vs without carousel | +3–8% relative |
| Section engagement rate | % of visitors who interact with carousel (click/swipe) | > 8% |
| Modal open rate | Modal opens / section views | > 5% |

### Engagement metrics

| Metric | Measurement |
|--------|-------------|
| Card click-through rate | `bike_showcase_card_click` / `bike_showcase_section_view` |
| Cards browsed per session | Average nav clicks per session with carousel interaction |
| Time-on-page | Compare pages with/without carousel section |
| Bounce rate | Compare bounce rate for homepage with/without carousel |

### Technical metrics

| Metric | Target |
|--------|--------|
| LCP (homepage) | No regression vs. baseline |
| CLS (carousel section) | CLS = 0 (reserved containers) |
| Time to first meaningful paint | No regression |
| Error rate (image load failures) | < 1% (fallback covers remainder) |

### Qualitative validation

- User testing: 5 first-time visitor sessions — do they understand what the carousel shows?
- Ask: "What does BestBikeFit4U do, based on this page?" — carousel should increase specificity of answers
- Check: does the carousel create a sense of an active, real platform?

### What success is NOT

- Number of bikes in the showcase pool
- Raw pageviews on the homepage
- Social share count of individual bike pages

---

## 10. Final Recommendation

### Should BestBikeFit4U build this feature?

**Yes.** The bike showcase carousel is the most credible, differentiated social proof element available to this platform. It shows what the product actually does — geometry analysis, tyre pressure optimisation — without requiring the visitor to commit to anything. It works as both a trust signal and a conversion hook.

### What should be built first?

**Phase 1 as described above.** The entire admin-controlled, fully curated version. Target 8–12 eligible bikes to seed the showcase before launch. The slider should never look empty.

### What should be excluded from V1?

- User opt-in flow (Phase 2)
- Personalisation (Phase 3)
- Exact timestamps ("Added 3 days ago") — use generic "On the platform" labelling
- Rider-specific pressure values — illustrative generics only
- Bike detail page (deep-link to fit calculator is sufficient for V1)
- Auto-scroll / auto-play — never add this without a user study

### The best balance

**Trust** is achieved by showing real bike data with explicit quality standards (geometry verified badge, pressure ranges with disclaimer). **Privacy** is protected by a strict public projection and admin-only eligibility. **Product depth** is demonstrated through geometry fields and pressure teasers, not through complexity. **Conversion** is served by a single, specific CTA that makes the value proposition concrete: "Get my fit for this bike."

The risk of doing nothing is that the homepage continues to feel like a calculator aggregator rather than a bike intelligence platform. This carousel, done carefully, closes that perception gap.

---

## Appendix A: Microcopy

### Section eyebrow
- EN: "Real bikes. Real data."
- NL: "Echte fietsen. Echte data."

### Section heading
- EN: "Bikes on the platform"
- NL: "Fietsen op het platform"

### Section subtext
- EN: "Every bike shown has verified geometry and optimised tyre pressures. Create a free account to run your own."
- NL: "Elke getoonde fiets heeft geverifieerde geometrie en geoptimaliseerde bandenspanning. Maak gratis een account aan."

### Trust badge on card
- EN: "Geometry verified"
- NL: "Geometrie geverifieerd"

### CTA (modal, primary)
- EN: "Get my fit for this bike"
- NL: "Mijn fit voor deze fiets"

### CTA (modal, secondary)
- EN: "How does it work?"
- NL: "Hoe werkt het?"

### Pressure disclaimer
- EN: "Based on typical 70–80 kg total weight (rider + bike). Your result may vary."
- NL: "Gebaseerd op een typisch totaalgewicht van 70–80 kg (rijder + fiets). Jouw resultaat kan afwijken."

### Empty state (section suppressed — internal only)
- No visible empty state. If 0 bikes: section is not rendered.

### Geometry source note
- EN: "Geometry: manufacturer specifications"
- NL: "Geometrie: fabrieksspecificaties"

---

## Appendix B: Geometry Fields for Public Display

| Field | Symbol | Unit | Show in card? | Show in modal? | Why include? |
|-------|--------|------|--------------|----------------|-------------|
| Stack | — | mm | Yes | Yes | Most accessible frame fit dimension; every cyclist cares about this |
| Reach | — | mm | Yes | Yes | Paired with stack as the primary fit signature |
| Effective Top Tube | ETT | mm | No | Yes | Traditional size reference; still widely used |
| Seat Tube Angle | STA | ° | No | Yes | Signals aggressive vs. relaxed position; relevant for fit |
| Head Tube Angle | HTA | ° | No | Yes | Handling character; visible to informed cyclists |
| Wheelbase | — | mm | No | Yes | Overall bike length / stability signature |
| Chainstay | — | mm | No | No | Too technical for marketing; omit |
| BB Drop | — | mm | No | No | Too technical for marketing; omit |
| Fork Rake | — | mm | No | No | Too technical for marketing; omit |
| Standover | — | mm | No | No | Rarely a deciding factor; omit |
| Head Tube Length | — | mm | No | No | Derived info; omit |

The 6 fields shown in the modal (Stack, Reach, ETT, STA, HTA, Wheelbase) tell a compelling story about the bike's character without overwhelming visitors.
