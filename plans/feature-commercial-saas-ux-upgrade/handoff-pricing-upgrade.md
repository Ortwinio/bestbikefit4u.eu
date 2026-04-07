# Handoff: Pricing Implementation

Exact diff intent for task "Pricing implementation." Can run in parallel with auth once homepage structure is complete.

## Reference

- UX contract: `plans/feature-commercial-saas-ux-upgrade/ux-contract.md`
- Plan prompt: `plans/feature-commercial-saas-ux-upgrade/04-pricing-proof-and-plan-framing.md`

## Current State

`src/app/(public)/pricing/page.tsx`:
- Plan cards from `getVisiblePublicPlans()` — Free (€0) and Pro (€9/mo)
- Feature comparison table using `COMMERCIAL_FEATURE_COPY`
- 3 FAQ cards
- Footer CTA band pointing to `/login`
- Marketing events: `pricing_view`, `pricing_free_cta`, `pricing_pro_cta`

Plan copy defined in `src/config/commercial.ts` (`PUBLIC_PLANS`):
- Free description: "For riders who want a first fit baseline without commitment."
- Pro description: "For committed riders managing multiple bikes and repeated fit iterations."

## Changes Required

### 1. Reframe plan descriptions with outcome language

**File:** `src/config/commercial.ts` (FREE plan copy)

```
EN description: "For riders who want a first fit baseline without commitment." ->
"Try the bike fit tools and see your setup targets. Perfect for a first check on saddle height, reach, and cockpit balance."

NL description: "Voor rijders die zonder verplichting een eerste fit-basis willen." ->
"Probeer de bikefit-tools en bekijk je afstelwaarden. Ideaal voor een eerste check op zadelhoogte, reach en cockpitbalans."
```

**File:** `src/config/commercial.ts` (PRO plan copy)

```
EN description: "For committed riders managing multiple bikes and repeated fit iterations." ->
"Track fit changes across multiple bikes, refine your position over time, and download detailed PDF reports."

NL description: "Voor fanatieke rijders met meerdere fietsen en terugkerende fit-iteraties." ->
"Volg fitveranderingen over meerdere fietsen, verfijn je positie over tijd en download gedetailleerde PDF-rapporten."
```

### 2. Add proof module after plan cards

**File:** `src/app/(public)/pricing/page.tsx`

After the plan cards grid (`</div>` at ~line 194), before the comparison table section, add:

```tsx
<section className="mt-14 rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm sm:p-10">
  <div className="grid gap-8 md:grid-cols-3">
    <div>
      <h3 className="font-semibold text-foreground">
        {locale === "nl" ? "Onderbouwde methode" : "Method-backed calculations"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {locale === "nl"
          ? "Aanbevelingen zijn gebaseerd op beproefde bikefitting-formules plus correcties voor jouw lichaam en rijstijl."
          : "Recommendations are based on established bike fitting formulas plus rider-specific corrections for your body and riding style."}
      </p>
    </div>
    <div>
      <h3 className="font-semibold text-foreground">
        {locale === "nl" ? "Concrete output" : "Concrete fit outputs"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {locale === "nl"
          ? "Zadelhoogte, reach, drop, cranklengte en stuurpositie — in millimeters, met prioriteitsvolgorde."
          : "Saddle height, reach, drop, crank length, and handlebar position — in millimeters, with a prioritized adjustment order."}
      </p>
    </div>
    <div>
      <h3 className="font-semibold text-foreground">
        {locale === "nl" ? "Eerlijk over grenzen" : "Honest about limits"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {locale === "nl"
          ? "Online fitting geeft een sterke basis. Bij complexe klachten of blessures is een persoonlijke fitter de beste volgende stap."
          : "Online fitting gives you a strong starting point. For complex pain or injury, an in-person fitter is the best next step."}
      </p>
    </div>
  </div>
</section>
```

### 3. Add confidence mechanism

**File:** `src/app/(public)/pricing/page.tsx`

After the proof module, add a single-line confidence strip:

```tsx
<p className="mt-6 text-center text-sm text-muted-foreground">
  {locale === "nl"
    ? "Geen contract. Start gratis en upgrade of annuleer op elk moment."
    : "No contract. Start free and upgrade or cancel at any time."}
</p>
```

This is grounded in live product reality (no minimum commitment for either plan).

### 4. Improve CTA labels

**File:** `src/config/commercial.ts`

```
Free CTA EN: "Start free fit" -> "Start free"
Free CTA NL: "Start gratis fit" -> "Start gratis"
Pro CTA EN: "Upgrade to Pro" -> "Start Pro — €9/month"
Pro CTA NL: "Upgrade naar Pro" -> "Start Pro — €9/maand"
```

### 5. Footer CTA band — value-first language

**File:** `src/app/(public)/pricing/page.tsx` (~line 255-294)

Update page-level copy:
```
EN ctaTitle: "Start free. Upgrade when you need more." -> "Start with a free bike fit check"
EN ctaBody: current -> "No account needed for the calculator. See what your fit report includes first."

NL ctaTitle: "Start gratis. Upgrade wanneer je meer nodig hebt." -> "Begin met een gratis bike fit check"
NL ctaBody: current -> "Geen account nodig voor de calculator. Bekijk eerst wat je fitrapport bevat."
```

Change the primary CTA button href from `/login` to `/calculators/bike-fit` and update section to `pricing_footer_cta_primary`.

### Validation checklist

- [ ] Free vs Pro described in rider outcome terms
- [ ] Proof module visible near plan cards
- [ ] Confidence mechanism grounded in real product (no contract, cancel anytime)
- [ ] CTA labels more explicit about next step
- [ ] Footer CTA points to calculator (value-first)
- [ ] No unsupported claims introduced
- [ ] Live plan table remains accurate (`getVisiblePublicPlans()` data unchanged)
- [ ] `PRODUCT_LIVE_FLAGS` respected (no money-back claim)
- [ ] CTA tracking intact (section props updated where destinations changed)
- [ ] EN/NL semantic parity
