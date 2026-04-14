# Prompt 03 — Enable Richer Content Rendering in the Guide Page Template

## Context

Read `plans/guide-guideline-alignment/README.md`. Read:
- `src/app/(public)/guides/[slug]/page.tsx` — current rendering
- `src/lib/guides/guide-content.ts` — type definitions
- `src/components/public/PublicSurfaceCard.tsx`
- `src/components/public/PublicSection.tsx`

## Problem

The current leaf section rendering in `[slug]/page.tsx` puts every single bullet item in its own `PublicSurfaceCard`:

```tsx
{section.items.map((item) => (
  <PublicSurfaceCard key={item} description={item} leading={<ShieldCheck aria-hidden="true" className="h-5 w-5" />} />
))}
```

This is fine for short, standalone tips, but it:
- Cannot render multi-sentence paragraphs in a readable way (each sentence would be its own card)
- Cannot render tables (symptom → cause, road vs gravel vs MTB)
- Cannot render highlighted warning blocks
- Makes long step-by-step instructions look like disconnected fragments

## Changes required

### 1. Extend `GuideContentSection` to support a `type` field

In `src/lib/guides/guide-content.ts`, add an optional `type` to `GuideContentSection`:

```ts
export type GuideContentSection = {
  title: string;
  type?: "cards" | "steps" | "prose" | "table";
  items: string[];
  tableHeaders?: string[];   // only for type "table"
  tableRows?: string[][];    // only for type "table"
};
```

- `"cards"` (default): current behavior, one card per item
- `"steps"`: numbered list with clear step numbers (1, 2, 3…), good for "How to measure" and "How to adjust"
- `"prose"`: items rendered as paragraphs in a single card, no icons, suitable for "Introduction" and "Practical recommendation"
- `"table"`: renders a `<table>` with `tableHeaders` and `tableRows`, suitable for symptom→cause and road vs gravel vs MTB comparisons

### 2. Update section rendering in `[slug]/page.tsx`

Replace the current static `section.items.map(…)` with a branch on `section.type`:

**`"steps"` rendering:**
```tsx
<ol className="space-y-3 list-none p-0">
  {section.items.map((item, i) => (
    <li key={item} className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
      <span className="text-sm leading-6 text-muted-foreground pt-0.5">{item}</span>
    </li>
  ))}
</ol>
```

**`"prose"` rendering:**
```tsx
<div className="space-y-3">
  {section.items.map((item) => (
    <p key={item} className="text-sm leading-7 text-muted-foreground">{item}</p>
  ))}
</div>
```

**`"table"` rendering:**
```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border">
        {section.tableHeaders?.map((h) => (
          <th key={h} className="pb-2 pr-4 text-left font-semibold text-foreground">{h}</th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-border/50">
      {section.tableRows?.map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => (
            <td key={j} className="py-2 pr-4 text-muted-foreground">{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**`"cards"` (default):** keep existing behavior unchanged.

### 3. Update the "How to measure" and "How to adjust" sections in content modules to use `type: "steps"`

In all five content modules, set `type: "steps"` on sections titled "How to measure" / "Hoe je het meet" and "How to adjust" / "Hoe je het afstelt".

### 4. Update the "Variations by rider type" sections to use `type: "table"` where appropriate

For guides where a clear comparison table makes sense (e.g. saddle height, reach, handlebar drop), convert the `items` array to `tableHeaders` + `tableRows` format:

```ts
{
  title: "Variations by rider type",
  type: "table",
  items: [],
  tableHeaders: ["Rider type", "Typical setup direction"],
  tableRows: [
    ["Road / race", "Higher saddle, more drop, efficiency-first"],
    ["Endurance / sportive", "2–5 mm lower, reduced drop, durability-first"],
    ["Gravel", "Slightly lower and more upright than road"],
    ["MTB", "Lower for control, dropper post for descents"],
    ["Triathlon", "Slightly higher due to forward saddle position"],
  ]
}
```

### 5. Update "Practical recommendation" sections to use `type: "prose"`

The closing section reads better as flowing paragraphs than as disconnected card bullets.

## Acceptance

- `GuideContentSection` type has optional `type`, `tableHeaders`, and `tableRows`
- `[slug]/page.tsx` renders steps, prose, and table sections correctly
- "How to measure" and "How to adjust" sections render as numbered steps
- At least the saddle height and reach guides use `type: "table"` for "Variations by rider type"
- "Practical recommendation" sections render as prose
- Default `"cards"` behavior unchanged for all other sections
- `npx tsc --noEmit` passes
