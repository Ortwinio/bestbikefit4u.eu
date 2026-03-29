# 06 — Feedback and Pressure Calculator

## Goal
Apply the design system to the feedback hub and pressure calculator components.

## Files to change

First, identify the actual component files by reading:
- `src/app/(dashboard)/feedback/page.tsx` — find which component it delegates to
- `src/app/(dashboard)/pressure-calculator/page.tsx` — find which component it delegates to
- Then read those components and apply the changes below

## Pattern to apply to both

### Card headers
Every `CardHeader` + `CardTitle` should become `SectionHeader` with a relevant icon:

```tsx
import { SectionHeader } from "@/components/ui";

// Feedback
import { MessageSquare, Star, ThumbsUp } from "lucide-react";

// Pressure calculator
import { Gauge, Settings2, AlertCircle } from "lucide-react";
```

### Alert / info boxes
Any coloured `<div>` used as an alert or info block should be replaced with `InfoBox`:

```tsx
import { InfoBox } from "@/components/ui";
```

### Stat/value displays
Any key-value pairs (e.g. current vs recommended pressure) should use `MeasurementTile` or `StatRow`:

```tsx
import { MeasurementTile, StatRow } from "@/components/ui";

// Pressure values as tiles:
<div className="grid grid-cols-2 gap-3">
  <MeasurementTile label="Front" value={`${frontBar.toFixed(1)} bar`} />
  <MeasurementTile label="Rear" value={`${rearBar.toFixed(1)} bar`} />
</div>

// Input summary as stat rows:
<dl className="divide-y divide-[color:var(--border)]">
  <StatRow label="Weight" value={`${weightKg} kg`} />
  <StatRow label="Tyre width" value={`${tyreWidthMm} mm`} />
</dl>
```

### Page headers
Both pages should have:

```tsx
<div>
  <h1 className="text-2xl font-bold text-[color:var(--foreground)]">{title}</h1>
  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{subtitle}</p>
</div>
```

### Action links
Any "recalculate" or navigation links should use the inline link pattern:

```tsx
<Link
  href={…}
  className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
>
  {label} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
</Link>
```

## Acceptance criteria
- All card section headers have icon + title via `SectionHeader`
- Alert/info boxes use `InfoBox` with appropriate variant
- Pressure readings displayed as `MeasurementTile` grid
- Input summaries displayed as `StatRow` in a `<dl>`
- Pages have standard `<h1>` + subtitle header
- Action links use `bg-primary/10` inline link style
- No data or logic changes
- `npm run build:vercel` passes
