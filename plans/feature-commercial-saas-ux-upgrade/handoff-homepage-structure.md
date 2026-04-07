# Handoff: Homepage Structure Implementation

For Codex B. Exact diff intent for task "Homepage structure implementation."

## Reference

- UX contract: `plans/feature-commercial-saas-ux-upgrade/ux-contract.md`
- Plan prompt: `plans/feature-commercial-saas-ux-upgrade/02-homepage-value-first-funnel.md`

## Changes Required

### 1. Hero primary CTA: `/login` -> `/calculators/bike-fit`

**File:** `src/app/(public)/page.tsx` line ~147

Change the hero primary `TrackedCtaLink` href from:
```tsx
href={withLocalePrefix("/login", locale)}
```
to:
```tsx
href={withLocalePrefix("/calculators/bike-fit", locale)}
```

Keep `section="hero_primary"` unchanged.

### 2. Hero CTA labels (i18n)

**File:** `src/i18n/messages/en.ts` line ~60-61

```
primaryCta: "Start Free Fit" -> "Try the Free Bike Fit Calculator"
secondaryCta: "View Pricing" -> "Compare Free vs Pro"
```

**File:** `src/i18n/messages/nl.ts` line ~61-62

```
primaryCta: "Start gratis fit" -> "Probeer de gratis bike fit calculator"
secondaryCta: "Bekijk prijzen" -> "Vergelijk Free vs Pro"
```

### 3. Add tertiary sign-in link below hero CTAs

After the hero CTA button group (`</div>` after the secondary button), add:

```tsx
<p className="mt-4 text-sm text-primary-foreground/60">
  <TrackedCtaLink
    href={withLocalePrefix("/login", locale)}
    locale={locale}
    pagePath={homePath}
    section="hero_tertiary"
    ctaLabel={locale === "nl" ? "Heb je al een account? Log in" : "Already have an account? Sign in"}
    className="underline underline-offset-2 hover:text-primary-foreground/80"
  >
    {locale === "nl" ? "Heb je al een account? Log in" : "Already have an account? Sign in"}
  </TrackedCtaLink>
</p>
```

### 4. Move calculators section higher

Move the "Popular Calculators" section (currently after the Features section, ~line 334) to immediately after the BikeQuickCheckCard section and before `<QuotesCarousel>`.

Update the calculator subtitle copy:
- EN: `"Directe ingangen naar de belangrijkste gratis tools."` -> `"Free tools you can use right now, no account needed."`
- NL: keep as `"Gratis tools die je direct kunt gebruiken, zonder account."`

Use `py-12 sm:py-16` instead of `py-20` for tighter spacing after quick-check.

### 5. Recommendation card CTA: `/login` -> `/calculators/bike-fit`

**File:** `src/app/(public)/page.tsx` line ~477

Change `recommendation_card` TrackedCtaLink href from `/login` to `/calculators/bike-fit`.

### 6. Final CTA band: `/login` -> `/calculators/bike-fit` + add secondary

**File:** `src/app/(public)/page.tsx` line ~507

- Change the final CTA TrackedCtaLink href from `/login` to `/calculators/bike-fit`
- Change `section="final_cta"` to `section="final_cta_primary"`
- Add a secondary outline button after it pointing to `/pricing` with `section="final_cta_secondary"`
- Wrap both in a flex container: `flex flex-col items-center gap-3 sm:flex-row sm:justify-center`

### Validation checklist

- [ ] Hero primary CTA no longer points to `/login`
- [ ] Calculator grid appears before Quotes carousel and education sections
- [ ] Tertiary sign-in link is visible in hero
- [ ] All existing `TrackedCtaLink` analytics props preserved
- [ ] New `section` values added for new CTAs: `hero_tertiary`, `final_cta_primary`, `final_cta_secondary`
- [ ] Mobile scroll path reaches a useful tool faster
- [ ] EN and NL CTA labels updated in both dictionary files
