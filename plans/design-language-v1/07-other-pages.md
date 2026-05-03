# Prompt 07 — Apply Design Language to Other Public Pages

## Context

Read `plans/design-language-v1/README.md` first.

Prompts 01–06 fix the homepage. This prompt applies the same design language to the three highest-traffic public pages: the calculator pages, the guide pages, and the pricing page.

**Do not start this prompt until prompts 01–06 are complete and passing typecheck.**

---

## Part A — Calculator Pages

### Files to read
- `src/app/(public)/calculators/saddle-height/page.tsx` (representative example)
- `src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.tsx`
- Any `PublicCtaBand` usages on calculator pages

### Issues to fix

**1. CTA at the bottom of every calculator page**

Each calculator page ends with a `PublicCtaBand` that says something like "Wil je een volledig bike fit rapport?". These CTAs currently use whatever copy was hardcoded at the time of creation — they are not consistent.

Audit each of the six calculator pages and ensure the closing CTA:
- Uses `PublicCtaBand` (already the correct component)
- Has consistent copy: primary "Start gratis bike fit" → `/calculators/bike-fit`, secondary "Bekijk prijzen" → `/pricing`
- Donate link only appears when `isConsumerCampaignActive()` is true
- **One primary button only**

**2. Section backgrounds on calculator pages**

Calculator pages typically have: hero/header → form → result → CTA. Apply the zone model:
- Form section: Raised (`public-card-surface` or `bg-background`)
- Result section: Band (`bg-secondary/55` or `bg-muted/44`) — visually separates inputs from outputs
- CTA: CTA zone (`public-cta-surface`)

Audit the six calculator pages and add missing backgrounds where the form and result blend together.

**3. `FeatureIconCard` on calculator intro sections**

Several calculator pages have a 2–3 item "how this works" or "what you get" section using ad-hoc inline cards. Replace these with `FeatureIconCard` where applicable.

---

## Part B — Guide Pages

### Files to read
- `src/components/public/PainPointPageTemplate.tsx`
- One guide page (e.g. `src/app/(public)/guides/bike-fitting-for-knee-pain/page.tsx`) if it exists

### Issues to fix

**1. Closing CTA on guide pages**

Every guide should end with exactly one primary CTA: "Start gratis bike fit". Currently some guides use `PublicCtaBand` and some have ad-hoc CTA sections.

Standardise: all guide pages use `PublicCtaBand` at the end with:
- Eyebrow: "Klaar om je fit te starten?" / "Ready to start your fit?"
- Primary CTA: "Start gratis bike fit" → `/calculators/bike-fit`
- Secondary CTA: "Bekijk alle gidsen" → `/guides`

**2. `GuideLinkButton` in related-guides sections**

Guide pages that have a "related guides" section currently list links as plain text or minimal outline buttons. Replace with `GuideLinkButton` (built in prompt 04).

---

## Part C — Pricing Page

### Files to read
- `src/app/(public)/pricing/page.tsx`

### Issues to fix

**1. Campaign donate block**

The pricing page may have a campaign donation block. Ensure it uses `variant="outline"` — never primary for the donate action.

**2. Free vs paid CTA hierarchy**

The pricing page should have exactly one primary CTA: the paid/full plan upgrade. The free "Start gratis" should be `variant="outline"` or `variant="ghost"` on the pricing page — users are here to compare, not to be pushed to free again.

**3. Apply zone model**

Pricing page sections:
- Plan comparison: Raised
- FAQ: Band
- Closing CTA: CTA zone (`public-cta-surface`)

---

## Part D — Data Fix: Canyon Canyon Grizl

### File to fix

This is a data entry issue in the bike showcase. The bike model is stored as "Canyon Grizl" with brand "Canyon", resulting in "Canyon Canyon Grizl" in the card aria-label and display.

Find where showcase bikes are seeded or entered in the admin panel and correct the model name to "Grizl CF SL 8" (or whatever the correct model designation is).

Check:
- `convex/bikes/` mutations for the affected bike record
- Admin bike entry panel at `/admin/bikes`

---

## Constraints

- All pages must pass `npm run typecheck` after changes
- Do not introduce new components not already defined in prompts 01–06
- Do not change calculator or guide business logic — only visual/structural changes
- Campaign-conditional rendering uses `isConsumerCampaignActive()` — do not hardcode campaign state

## Completion Checklist

### Calculator pages
- [ ] All 6 calculator pages have consistent closing CTA copy
- [ ] Campaign donation link only appears when campaign is active
- [ ] Form and result sections have distinct zone backgrounds on at least 3 calculator pages

### Guide pages
- [ ] All guide pages end with `PublicCtaBand`
- [ ] Related-guides sections use `GuideLinkButton`

### Pricing page
- [ ] Donate action uses `variant="outline"` or `variant="ghost"`
- [ ] Free plan CTA is not primary on the pricing page

### Data
- [ ] "Canyon Canyon Grizl" renamed to correct model name in the database

### General
- [ ] `npm run typecheck` passes on all touched files
