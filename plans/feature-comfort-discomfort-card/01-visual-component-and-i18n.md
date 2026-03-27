# Prompt 01 — Visual component & i18n

## Goal

Create `ComfortLevelBar` and add all i18n strings needed for the card.

---

## 1. `src/lib/validations/profile.ts`

Add a `comfortLevels` export (mirrors `coreStabilityTests`):

```ts
export const comfortLevels = [
  { score: 1, label: "Severe discomfort",     description: "Significant pain that limits or prevents riding" },
  { score: 2, label: "Significant discomfort", description: "Recurring pain that affects your riding regularly" },
  { score: 3, label: "Moderate discomfort",   description: "Noticeable discomfort on longer or harder rides" },
  { score: 4, label: "Mild discomfort",        description: "Occasional minor discomfort, manageable" },
  { score: 5, label: "Comfortable",            description: "No pain or discomfort while cycling" },
];
```

Add a `deriveComfortScore` helper:

```ts
export function deriveComfortScore(
  hasPain: string | undefined,
  painSeverity: number | undefined
): number {
  if (!hasPain || hasPain === "no") return 5;
  if (!painSeverity) return 3; // default if severity not yet set
  if (painSeverity >= 5) return 1;
  if (painSeverity >= 3) return 2;
  if (painSeverity === 2) return 3;
  return 4; // severity 1
}
```

---

## 2. `src/components/profile/ComfortLevelBar.tsx`

Create this file. Model it on `CoreStabilityBar`:

- Accept `{ score: number; className?: string }`
- Use a `scoreColorMap` keyed 1–5: `danger`, `warning`, `warning`, `success`, `success`
- Render the same segmented bar (5 equal segments, filled up to `score`)
- Show label (`comfortLevels[score-1].label`) and `score/5` badge
- Show description text below

Export `getComfortMeta(score: number)` helper (mirrors `getCoreStabilityMeta`).

---

## 3. i18n — `src/i18n/messages/en.ts`

Add under `profile`:

```ts
comfort: {
  editButton: "Edit",
  saveButton: "Save",
  impactDescription: "Your comfort level directly influences key fit decisions — saddle height, handlebar reach, and bar drop. Persistent discomfort is almost always a sign of a fit issue, not just something to push through.",
  improveLink: "How to improve your comfort",
  noPain: "No discomfort",
  painAreasLabel: "Areas of discomfort",
  testInstructions: {
    title: "Rate your comfort level",
    steps: [
      "Think about your last 3–5 rides of typical duration.",
      "Select the level that best describes your average experience.",
      "If pain varies a lot, choose the level that occurs most often.",
    ],
  },
},
```

Add under `profile.sections`:

```ts
comfort: "Comfort",
```

---

## 4. i18n — `src/i18n/messages/nl.ts`

Add the same keys translated to Dutch:

```ts
comfort: {
  editButton: "Bewerken",
  saveButton: "Opslaan",
  impactDescription: "Je comfortniveau heeft direct invloed op de fit — zadelstand, stuurhoogte en reikwijdte. Aanhoudend ongemak is bijna altijd een teken van een fitprobleem, niet iets om doorheen te fietsen.",
  improveLink: "Hoe verbeter je je comfort",
  noPain: "Geen ongemak",
  painAreasLabel: "Gebieden met ongemak",
  testInstructions: {
    title: "Beoordeel je comfortniveau",
    steps: [
      "Denk aan je laatste 3–5 ritten van gemiddelde duur.",
      "Kies het niveau dat je gemiddelde ervaring het beste omschrijft.",
      "Als pijn veel varieert, kies het niveau dat het vaakst voorkomt.",
    ],
  },
},
```

Add under `profile.sections`:

```ts
comfort: "Comfort",
```

---

## Verification

- `ComfortLevelBar` renders at all 5 score values with correct colours
- `deriveComfortScore("no", undefined)` returns `5`
- `deriveComfortScore("yes", 5)` returns `1`
- No TypeScript errors
