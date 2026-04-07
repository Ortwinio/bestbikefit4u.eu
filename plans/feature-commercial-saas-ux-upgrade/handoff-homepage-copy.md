# Handoff: Homepage EN/NL Copy Pass

For Codex B. Exact diff intent for task "Homepage EN/NL copy pass."

## Reference

- UX contract: `plans/feature-commercial-saas-ux-upgrade/ux-contract.md`
- Structure handoff: `plans/feature-commercial-saas-ux-upgrade/handoff-homepage-structure.md` (apply structure changes first)

## Scope

Rewrite hero, trust strip, and next-step copy in both locales for clearer conversion framing. Do not change page structure or CTA destinations (those are covered in the structure handoff).

## Changes Required

### 1. Hero copy — sharper outcome framing

**File:** `src/i18n/messages/en.ts` (`home.hero`)

```
title: "Online Bike Fitting" -> "Your Bike Fit Starts Here"
titleAccent: "for Comfort and Performance." -> "Free tools, real guidance."
description: current long description -> "Enter your measurements, answer a few questions, and get practical setup targets for saddle height, reach, and handlebar position — matched to your body and riding style."
```

**File:** `src/i18n/messages/nl.ts` (`home.hero`)

```
title: "Online bikefitting" -> "Jouw bikefitting begint hier"
titleAccent: "voor comfort en prestaties." -> "Gratis tools, echte begeleiding."
description: current -> "Vul je maten in, beantwoord een paar vragen en ontvang praktische afstelwaarden voor zadelhoogte, reach en stuurpositie — afgestemd op jouw lichaam en rijstijl."
```

### 2. Hero trust strip — stronger, more specific

**File:** `src/app/(public)/page.tsx` (~line 175-196, the 3-column grid)

Update inline copy:

EN:
- "Fit guidance matched to your body and goals." -> "Method-backed calculations, not guesswork."
- "Practical changes in measurable millimeters." -> "Saddle height, reach, drop — in millimeters."
- "A faster path from pain point to the right next step." -> "Transparent about what online fitting can and can't do."

NL:
- "Fitadvies gebaseerd op je lichaam en doel." -> "Onderbouwde berekeningen, geen giswerk."
- "Praktische aanpassingen in millimeters." -> "Zadelhoogte, reach, drop — in millimeters."
- "Snel van klacht naar duidelijke volgende stap." -> "Eerlijk over wat online fitting wel en niet kan."

### 3. Recommendation section — outcome-first copy

**File:** `src/i18n/messages/en.ts` (`home.recommendationSection`)

```
cardTitle: "Ready to fix discomfort and ride stronger?" -> "See what your fit report includes"
cardDescription: "Start free and get personalized setup targets in minutes." -> "Try the free calculator and review practical setup targets you can use right away."
cardCta: "Start Free Fit" -> "Try the Free Calculator"
```

**File:** `src/i18n/messages/nl.ts` (`home.recommendationSection`)

Match the above in Dutch:
```
cardTitle: -> "Bekijk wat je fitrapport bevat"
cardDescription: -> "Probeer de gratis calculator en bekijk praktische afstelwaarden die je direct kunt toepassen."
cardCta: -> "Probeer de gratis calculator"
```

### 4. Final CTA band copy

**File:** `src/i18n/messages/en.ts` (`home.cta`)

```
title: current -> "Start with a free bike fit check"
description: current -> "No account needed for the calculator. See your fit targets first, then decide if you want to go deeper."
button: current -> "Try the Free Calculator"
```

**File:** `src/i18n/messages/nl.ts` (`home.cta`)

```
title: -> "Begin met een gratis bike fit check"
description: -> "Geen account nodig voor de calculator. Bekijk eerst je fitdoelen en beslis daarna of je verder wilt."
button: -> "Probeer de gratis calculator"
```

### Validation checklist

- [ ] EN and NL copy changes have semantic parity
- [ ] CTA labels are sharper and reference the calculator, not login
- [ ] No unsupported commercial claims introduced
- [ ] Trust strip copy references real capabilities (method, mm outputs, transparency)
- [ ] Locale diff shows matched meaning across both languages
