# T06 — Fix health and scientific claim language

**Ticket:** T06
**Effort:** ~2 hours
**Deploys independently:** Yes

---

## Context

Several public-facing copy strings make direct health outcome claims ("reduce pain", "lower injury risk") or vague scientific authority claims ("decades of research"). Under EU consumer protection and health claim regulations, these create legal exposure. More practically, they erode trust with the informed cyclists who are the target audience — those riders know that a calculator cannot promise a medical outcome.

The fix is not to remove pain-related language (it is essential for SEO and relevance) but to reframe claims as position-based rather than medical-outcome-based.

**Rule of thumb:** The product adjusts your bike position. It does not treat, cure, or prevent injury. Write accordingly.

---

## Files to change

- `src/app/(public)/page.tsx` (homepage)
- `src/i18n/messages/en.ts` (EN strings)
- `src/i18n/messages/nl.ts` (NL strings)
- `src/app/(public)/faq/page.tsx`
- `src/app/(public)/guides/data.ts` (add disclaimer to guide data)
- Any guide `page.tsx` that renders guide content

---

## Homepage changes

### Hero description

| Current | Rewrite |
|---------|---------|
| "Start your free bike fit and get practical setup targets to reduce pain, improve power transfer, and ride with more confidence." | "Start your free bike fit and get setup targets matched to your body, riding style, and goals." |

**NL current:** "Start je gratis bikefitting en krijg praktische afstellingswaarden om klachten te verminderen, vermogen beter over te brengen en met meer vertrouwen te rijden."

**NL rewrite:** "Start je gratis bikefitting en krijg afstellingswaarden die zijn afgestemd op jouw lichaam, rijstijl en doelen."

---

### "Why start bike fitting now" section

| Current heading | Rewrite |
|----------------|---------|
| "Reduce recurring pain" | "Target the position factors linked to riding discomfort" |
| "Lower overuse injury risk" | "Build a position that's easier to sustain over time" |

| Current body (Reduce pain) | Rewrite |
|---------------------------|---------|
| Any copy implying pain elimination | "Many common discomforts — knee ache, lower-back fatigue, hand numbness — are closely linked to how your bike is set up. Adjusting position is the practical first step before looking elsewhere." |

| Current body (Injury risk) | Rewrite |
|---------------------------|---------|
| Any copy implying injury prevention | "Riding in an unsustainable position for months builds habits that are hard to undo. A well-fitted position gives your body the best chance to adapt without compensating." |

**NL equivalents:**

| Current | Rewrite |
|---------|---------|
| "Terugkerende pijn verminderen" | "Richt je op de houdingsfactoren die samenhangen met rijklachten" |
| "Blessurerisico verlagen" | "Bouw een houding die vol te houden is over langere ritten" |

---

### Feature card: "Pain-Aware Adjustments"

| Current title | Rewrite |
|--------------|---------|
| "Pain-Aware Adjustments" | "Comfort-Focused Adjustments" |

| Current description | Rewrite |
|--------------------|---------|
| "Targeted position changes for specific discomfort" | "Position targets adjusted for the discomfort you report, with suggestions on where to start." |

**NL:**
| Current | Rewrite |
|---------|---------|
| "Pijngerichte aanpassingen" | "Comfortgerichte aanpassingen" |
| "Gerichte positieveranderingen voor specifiek ongemak" | "Positiedoelen afgestemd op het ongemak dat je aangeeft, met concrete startpunten." |

---

### Feature card: "Science-Based"

| Current title | Keep |
|--------------|------|
| "Science-Based" | No change — accurate |

| Current description | Rewrite |
|--------------------|---------|
| "Powered by decades of research into cycling biomechanics" | "Based on the LeMond/Hamley biomechanical methodology — the established standard for position-based bike fitting." |

**NL:**

| Current | Rewrite |
|---------|---------|
| "Gebaseerd op decennia onderzoek naar wielrenbiomechanica" | "Gebaseerd op de LeMond/Hamley biomechanische methode — de gangbare standaard voor positie-gebaseerde fietspassing." |

---

## FAQ page changes

### Pain point question

**Current answer:**
> "During the fit questionnaire, you can report pain points (knees, back, hands, neck, etc.). Our algorithm factors these in and provides specific solutions, such as saddle-height changes for knee pain and cockpit changes for hand numbness."

**Rewrite:**
> "During the fit questionnaire, you can report the discomfort you experience. The algorithm adjusts position targets based on what you report — for example, reviewing saddle height for knee-area discomfort or shortening reach for hand numbness. For persistent or acute pain, a physiotherapist or in-person fitter is the right next step."

**NL rewrite:**
> "Tijdens de vragenlijst kun je aangeven welk ongemak je ervaart. Het algoritme past de positiedoelen aan op basis van wat je invult — bijvoorbeeld zadelhoogte bij knieklachten of kortere reach bij gevoelloze handen. Bij aanhoudende of acute pijn is een fysiotherapeut of professionele fitter de juiste volgende stap."

---

## Standard disclaimer block

Add this block to every guide page and every pain page (T08). It lives above the CTA section.

**EN:**
```
A note on pain and fitting

Position adjustments address many common riding discomforts. They cannot diagnose
or treat injury. If pain is acute, worsening, or does not improve after a few rides
with the adjusted position, see a physiotherapist or sports medicine specialist.
```

**NL:**
```
Een noot over pijn en passing

Positieaanpassingen lossen veel voorkomende rijklachten op. Ze diagnosticeren
of behandelen geen blessures. Als de pijn acuut is, verergert, of na een paar ritten
met de aangepaste positie niet verbetert, raadpleeg dan een fysiotherapeut of
sportarts.
```

Implement as a reusable component:

```tsx
// src/components/content/FitDisclaimer.tsx
export function FitDisclaimer({ locale }: { locale: string }) {
  const isNl = locale === "nl";
  return (
    <aside className="mt-10 rounded-2xl border border-border bg-secondary p-6 text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">
        {isNl ? "Een noot over pijn en passing" : "A note on pain and fitting"}
      </p>
      <p className="mt-2">
        {isNl
          ? "Positieaanpassingen lossen veel voorkomende rijklachten op. Ze diagnosticeren of behandelen geen blessures. Bij acute, verergerende of aanhoudende pijn na aanpassing, raadpleeg een fysiotherapeut of sportarts."
          : "Position adjustments address many common riding discomforts. They cannot diagnose or treat injury. If pain is acute, worsening, or does not improve after a few rides with the adjusted position, see a physiotherapist or sports medicine specialist."}
      </p>
    </aside>
  );
}
```

Wire `<FitDisclaimer locale={locale} />` into:
- Both existing guide pages (`bike-fitting-for-knee-pain`, `bike-fitting-for-lower-back-pain`)
- All five new pain pages (T08)

---

## Acceptance criteria

- [ ] Homepage hero description contains no "reduce pain" or "fix pain" language
- [ ] "Why" section headings rewritten per table above
- [ ] Feature card "Pain-Aware Adjustments" renamed to "Comfort-Focused Adjustments"
- [ ] "Science-Based" description references LeMond/Hamley methodology by name
- [ ] FAQ pain answer includes physiotherapist referral
- [ ] `FitDisclaimer` component exists and renders in both EN and NL
- [ ] Disclaimer is wired into both existing guide pages
- [ ] All EN changes have equivalent NL changes in `nl.ts`

## Edge cases

- Do not remove the word "pain" from page copy — it is essential for SEO keyword matching. Only reframe from outcome claim to position association.
- Meta descriptions may still reference pain conditions ("for cyclists with knee pain") — this is acceptable framing.
- The homepage `og:description` should also be updated if it contains a health claim.

## Human audit checklist

- [ ] Read the homepage hero copy aloud — does any sentence promise a medical outcome?
- [ ] Read the "Why" section — can each bullet be defended as a position-based claim?
- [ ] Open a guide page — is the disclaimer visible above the CTA?
- [ ] Check NL versions of changed strings for translation accuracy
