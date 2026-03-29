# 02 — Bikes Garage

## Goal
Apply the design system to `src/components/bikes/BikeGarageOverview.tsx` — the main component that renders each bike card on the My Bikes / Dashboard pages.

## File to change
`src/components/bikes/BikeGarageOverview.tsx`

## Current state
- Card headers are plain `CardHeader` + `CardTitle` with no icon
- Fit numbers (saddle height, handlebar drop, reach) are rendered as ad-hoc `<div>` blocks
- Questionnaire stat rows are raw `<div className="flex justify-between">` elements
- Info/callout boxes use inline one-off colour classes
- Action links are plain `<Link>` or `<Button>` with inconsistent styling

## Changes

### 1. Card headers — add icons

Each of the three cards in `BikeGarageRow` gets an icon in its header using `SectionHeader`:

| Card | Icon (from lucide-react) |
|------|--------------------------|
| Bike info (card 1) | `<Bike />` |
| Bike usage (card 2) | `<BarChart2 />` or `<Activity />` |
| Bikefitting advice (card 3) | `<Ruler />` or `<Settings2 />` |

Replace each `<CardHeader>` + `<CardTitle>` block with:
```tsx
import { SectionHeader } from "@/components/ui";
import { Bike, Activity, Ruler } from "lucide-react";

// Card 1
<SectionHeader
  icon={<Bike className="h-5 w-5 text-[color:var(--primary)]" />}
  title={bike.name}
  action={<Button variant="ghost" size="sm" asChild>…</Button>}
/>

// Card 2
<SectionHeader
  icon={<Activity className="h-5 w-5 text-[color:var(--primary)]" />}
  title={messages.bikeGarage.bikeUsageTitle}
/>

// Card 3
<SectionHeader
  icon={<Ruler className="h-5 w-5 text-[color:var(--primary)]" />}
  title={messages.bikeGarage.fitAdviseTitle}
/>
```

### 2. Fit numbers — use `MeasurementTile`

Replace the ad-hoc fit number `<div>` blocks in card 3 with `MeasurementTile`:

```tsx
import { MeasurementTile } from "@/components/ui";

<div className="grid grid-cols-3 gap-3">
  <MeasurementTile
    label={messages.fitHistory.saddleHeight}
    value={rec.saddleHeightMm}
    unit="mm"
  />
  <MeasurementTile
    label={messages.fitHistory.handlebarDrop}
    value={rec.handlebarDropMm != null ? Math.round(rec.handlebarDropMm) : null}
    unit="mm"
  />
  <MeasurementTile
    label={messages.fitHistory.handlebarReach}
    value={rec.handlebarReachMm != null ? Math.round(rec.handlebarReachMm) : null}
    unit="mm"
  />
</div>
```

### 3. Questionnaire stat rows — use `StatRow`

Replace the inline `<div className="flex justify-between …">` questionnaire rows with `StatRow`:

```tsx
import { StatRow } from "@/components/ui";

<dl className="divide-y divide-[color:var(--border)]">
  {r.experience_level && (
    <StatRow label={messages.profile.ridingStyle.experienceLevel} value={EXPERIENCE_LABELS[…]} />
  )}
  {r.weekly_hours && (
    <StatRow label={…} value={WEEKLY_HOURS_LABELS[…]} />
  )}
  {/* etc. */}
</dl>
```

### 4. Info/callout boxes — use `InfoBox`

Replace the ad-hoc inline-coloured alert divs (climbing profile badge, tyre pressure warning, etc.) with `InfoBox`:

```tsx
import { InfoBox } from "@/components/ui";
import { Mountain, AlertCircle } from "lucide-react";

// Climbing profile included badge
<InfoBox variant="success" icon={<Mountain className="h-4 w-4 text-[color:var(--success)]" />}>
  {messages.bikeGarage.climbingProfileIncluded}
</InfoBox>

// Stale pressure warning
<InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}>
  {messages.bikeGarage.stalePressureWarning}
</InfoBox>
```

### 5. Action links — use the inline action link pattern

Replace plain `<Link>` or `<Button variant="ghost">` action links with the Profile-style inline link:

```tsx
<Link
  href={…}
  className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
>
  {messages.bikeGarage.recalculateFit}
  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
</Link>
```

## Acceptance criteria
- All three card headers have an icon + title using `SectionHeader`
- Fit numbers (saddle height, handlebar drop, reach) render as `MeasurementTile` components
- Questionnaire stat rows use `StatRow` wrapped in a `<dl>` with divider lines
- Callout/alert boxes use `InfoBox` with the correct variant and icon
- Action links use the `bg-primary/10` inline link style
- No data or layout logic is changed — only visual presentation
- `npm run build:vercel` passes
