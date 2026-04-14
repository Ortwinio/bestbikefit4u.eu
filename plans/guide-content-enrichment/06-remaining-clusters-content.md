# Prompt 06 — Remaining Clusters Content (Nutrition, Power, Rider Profiles, Fit Science)

## Context

Read `plans/guide-content-enrichment/README.md`. Task 01 must be complete.

Read:
- `src/lib/guides/guide-content.ts` — add entries here
- `docs/bestbikefit4u_guides_cms_backlog_v1_en.csv` — slugs and briefs

## Task

Write real EN + NL guide content for the four remaining clusters.

---

### Nutrition & Hydration guides

**`cycling-fueling-basics`**
- Sections: "When you need to fuel on a ride" (60-minute threshold), "Pre-ride, during, and post-ride basics", "Simple carb targets by duration", "Common beginner fueling mistakes"
- FAQs: "Do I need to eat on rides under an hour?", "What should I eat before a 3-hour ride?", "Why do I bonk even when I've eaten?"

**`carbs-per-hour-guide`**
- Sections: "The evidence base: 60g vs 90g per hour", "Glucose-fructose ratios for higher intake", "Gut training: why tolerance increases with practice", "Solid vs liquid fueling by intensity"
- FAQs: "How many carbs per hour do I need?", "Can I eat too many carbs on the bike?", "Does intensity change my carb needs?"

**`hydration-and-sweat-rate-guide`**
- Sections: "How to estimate your sweat rate", "Bottle planning by duration and temperature", "Signs of under- and over-hydration", "Electrolyte basics for longer rides"
- FAQs: "How do I measure my sweat rate?", "How much should I drink per hour?", "Does thirst tell me when to drink?"

**`sodium-and-electrolytes-guide`**
- Sections: "What sodium does during exercise", "Estimating sodium loss (sweat salt concentration)", "When electrolyte products make a difference", "The hyponatraemia risk: don't over-drink plain water"
- FAQs: "Do I need electrolytes on every ride?", "How salty is my sweat?", "Can I get enough sodium from food alone?"

---

### Power / FTP / Pacing guides

**`ftp-explained`**
- Sections: "What FTP measures and what it doesn't", "How FTP tests work (20-min, ramp, 8-min protocols)", "Using FTP to set training zones", "Why FTP changes over time"
- FAQs: "What is a good FTP for my level?", "How accurate are FTP estimates without a power meter?", "How often should I retest?"

**`wkg-and-power-zones-guide`**
- Sections: "W/kg: why relative power matters on climbs", "Zone models: 5-zone vs 7-zone", "How to use zones in training", "The limits of zone-based training"
- FAQs: "What W/kg do I need for club rides?", "Which zone model should I use?", "Do zones change when my FTP changes?"

**`power-to-speed-guide`**
- Sections: "The physics: CdA, Crr, gradient, and weight", "Why small power gains don't always mean faster times", "Aerodynamics vs watts: where gains are largest", "Using the speed estimator for goal planning"
- FAQs: "How much power does it take to ride 30 km/h?", "Is it faster to lose weight or add watts?", "How do wind and gradient interact with speed?"

**`climb-time-and-event-pacing-guide`**
- Sections: "Even vs variable pacing: what the data says", "Starting too hard: the most common mistake", "Fueling and pacing as an integrated plan", "Using W/kg to estimate climb time"
- FAQs: "How do I pace a long climb I've never done before?", "Should I pace by power or by feel?", "How does temperature affect pacing?"

---

### Rider Profiles guides

**`bike-fit-for-tall-riders`**
- Sections: "Frame size and what runs out first at larger sizes", "Long legs and torso: how they change setup", "Components that limit fit at larger sizes (stem, cranks, saddle)", "How to shortlist frames using stack and reach"
- FAQs: "What stack and reach should a 195cm rider look for?", "Are longer cranks better for tall riders?", "What frame geometry suits tall riders best?"

**`bike-fit-for-riders-with-a-shorter-torso`**
- Sections: "Why shorter torso riders feel stretched on standard frames", "Frame reach and stem interaction for short-torso fit", "Bar height and drop for shorter arm reach", "Component choices that help"
- FAQs: "How do I know if my torso is short relative to my legs?", "What stem length suits a shorter torso?", "Is a women's-specific frame the answer?"

**`bike-fit-for-riders-with-limited-flexibility`**
- Sections: "How flexibility limits drop and reach sustainably", "Assessing your functional flexibility for cycling", "Position choices that work with limited flexibility", "Stretching and mobility: long-term position improvement"
- FAQs: "How flexible do I need to be for a road bike?", "Can I improve my cycling position through stretching?", "Is an endurance geometry always the answer for inflexible riders?"

**`bike-fit-for-beginners-and-returning-riders`**
- Sections: "The conservative starting position: why it works", "What to check before your first long ride", "How position adapts as fitness and flexibility change", "When to get a professional fit"
- FAQs: "Do I need a professional fit as a beginner?", "How long before my position feels natural?", "What is the most important thing to get right first?"

---

### Fit Science guides

**`when-online-bike-fit-has-limits`**
- Sections: "What online bike fit does well", "Where in-person assessment adds value that online can't replicate", "Clinical vs fit: knowing when to escalate", "How to prepare for an in-person fit appointment"
- FAQs: "When should I see a professional fitter?", "What can't an algorithm assess?", "Is an online fit good enough for racing?"

For every guide: provide equivalent NL content.

## Acceptance

- All guides in the Nutrition, Power, Rider Profiles, and Fit Science clusters have entries in `GUIDE_CONTENT`
- Nutrition and power guides do NOT contain bike-fit pain language
- `npx tsc --noEmit` passes
