# Prompt 03 — StatCounter Component + ProofBar Mobile Fix

## Context

Read `plans/design-language-v1/README.md` first.

**The problem**: `ProofBar` on mobile stacks the three stats ("2.400+", "180+", "Gratis") as three full-width individual pill cards, each ~80px tall. That's ~450px of scroll before the user reaches `BikeQuickCheckCard`. On desktop the stats are small text pills with separators — low visual weight relative to the numbers' importance.

**Files to read before starting**:
- `src/components/home/ProofBar.tsx`
- `src/components/home/homeRedesignContent.ts` (for `HOME_PROOF_BAR_CONTENT`)

## Task

1. Create a reusable `StatCounter` component in `src/components/public/`
2. Refactor `ProofBar` to use it with a `grid-cols-3` layout on mobile

## Deliverable 1: `src/components/public/StatCounter.tsx`

A single stat display: large number + label below.

**Visual spec**:
- Value: `text-3xl font-bold tracking-tight text-[color:var(--primary)]`
- Label: `text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)] mt-1`
- Layout: `flex flex-col items-center text-center` (default) or `items-start` via prop

```ts
type StatCounterProps = {
  value: string;        // "2.400+" or "180+"
  label: string;        // "Fits uitgevoerd"
  align?: "center" | "start";
  className?: string;
};
```

## Deliverable 2: Update `ProofBar.tsx`

**Desktop layout** (unchanged in structure, improved in weight):

Left: testimonial quote (Thomas V. + bike context + italic quote)  
Right: three stats using `StatCounter` in a row with separators

**Mobile layout** (the fix):

Replace the current mapping to individual pill cards with a `grid grid-cols-3 gap-4` layout using `StatCounter` with `align="center"`.

Current (broken on mobile):
```tsx
{content.stats.map((item, index) => (
  <div key={item} className="flex items-center gap-3">
    {index > 0 ? <span className="..." /> : null}
    <span>{item}</span>
  </div>
))}
```

The stats in `HOME_PROOF_BAR_CONTENT` are currently plain strings like `"2.400+ fits"`. To support the `StatCounter` split between value and label, update the content shape in `homeRedesignContent.ts`:

```ts
// Old:
stats: ["2.400+ fits", "180+ merken", "Gratis starten"]

// New:
stats: [
  { value: "2.400+", label: "Fits uitgevoerd" },
  { value: "180+",   label: "Fietsmerken" },
  { value: "Gratis", label: "Om te starten" },
]
```

Update both `nl` and `en` entries. Update the TypeScript type in the file accordingly.

**New ProofBar desktop layout**:
```tsx
<div className="grid grid-cols-3 gap-6 border-l border-[color:var(--border)] pl-6">
  {content.stats.map((stat, i) => (
    <div key={stat.value} className="flex items-center gap-4">
      {i > 0 ? <span className="hidden h-8 w-px bg-[color:var(--border)] lg:block" aria-hidden="true" /> : null}
      <StatCounter value={stat.value} label={stat.label} align="center" />
    </div>
  ))}
</div>
```

**New ProofBar mobile layout**:
```tsx
// On mobile: grid of 3 equal columns below the quote
<div className="grid grid-cols-3 gap-2 border-t border-[color:var(--border)] pt-4 sm:pt-0 lg:hidden">
  {content.stats.map((stat) => (
    <StatCounter key={stat.value} value={stat.value} label={stat.label} align="center" />
  ))}
</div>
```

## Export

Add `StatCounter` to `src/components/public/index.ts`.

## Constraints

- Server component
- Changing the `stats` shape in `homeRedesignContent.ts` is a breaking change — fix all TypeScript errors it causes
- Do not change the testimonial/quote portion of `ProofBar`
- Mobile layout must fit within 390px without overflow

## Completion Checklist

- [ ] `StatCounter` exists in `src/components/public/`
- [ ] On mobile, ProofBar shows 3 stats in a `grid-cols-3` row, not stacked cards
- [ ] On desktop, stats appear as before (right side of the bar) but using `StatCounter`
- [ ] `HOME_PROOF_BAR_CONTENT` type updated, EN + NL content updated
- [ ] `npm run typecheck` passes
