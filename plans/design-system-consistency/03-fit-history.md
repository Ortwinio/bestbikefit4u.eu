# 03 — Fit History

## Goal
Apply the design system to `src/components/bikes/BikeWithFitHistory.tsx` and `src/components/bikes/BikeFitHistorySection.tsx`.

## Files to change
- `src/components/bikes/BikeWithFitHistory.tsx`
- `src/components/bikes/BikeFitHistorySection.tsx`

## Current state (`BikeWithFitHistory`)
- Bike header is a plain card with a `CardHeader` → `CardTitle` and no icon
- Session list items are plain `<div>` rows with ad-hoc flex layout
- Fit values (confidence, status) use inline colour logic with raw className strings
- Recommended/pending status badges are inline conditional class strings

## Changes to `BikeWithFitHistory.tsx`

### 1. Bike card header — add icon
```tsx
import { SectionHeader } from "@/components/ui";
import { Bike } from "lucide-react";

// Replace existing CardHeader/CardTitle with:
<SectionHeader
  icon={<Bike className="h-5 w-5 text-[color:var(--primary)]" />}
  title={bike?.name ?? messages.bikes.unknownBike}
  action={
    <Button variant="primary-soft" size="sm" asChild>
      <Link href={withLocalePrefix(`/bikes/${bike?._id}`, locale)}>
        {messages.bikes.viewBike}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Button>
  }
/>
```

### 2. Session rows — use `StatRow` for fit details

Inside each session row, replace ad-hoc divs with `StatRow` in a `<dl>`:

```tsx
import { StatRow } from "@/components/ui";

<dl className="mt-2 divide-y divide-[color:var(--border)]">
  <StatRow
    label={messages.fitHistory.saddleHeight}
    value={rec.saddleHeightMm ? `${rec.saddleHeightMm} mm` : null}
  />
  <StatRow
    label={messages.fitHistory.confidence}
    value={rec.globalConfidenceScore ? `${formatConfidence(rec.globalConfidenceScore)}%` : null}
  />
</dl>
```

### 3. Status badges — consistent styling

Replace inline conditional class strings for session status badges with:

```tsx
// Ready badge
<span className="inline-flex items-center gap-1 rounded-full bg-[color:color-mix(in_oklch,var(--success)_12%,var(--card)_88%)] px-2 py-0.5 text-xs font-medium text-[color:var(--success)]">
  <CheckCircle2 className="h-3 w-3" />
  {messages.fitHistory.ready}
</span>

// Pending badge
<span className="inline-flex items-center gap-1 rounded-full bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)] px-2 py-0.5 text-xs font-medium text-[color:var(--warning)]">
  <Clock className="h-3 w-3" />
  {messages.fitHistory.pending}
</span>
```

### 4. Empty state — verify it uses `EmptyState` from ui (already does, no change needed)

### 5. Delete confirmation dialog — use `InfoBox variant="danger"` for warning text

```tsx
import { InfoBox } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

<InfoBox variant="danger" icon={<AlertTriangle className="h-4 w-4 text-[color:var(--danger)]" />}>
  {messages.fitHistory.deleteWarning}
</InfoBox>
```

## Changes to `BikeFitHistorySection.tsx`

### 1. Section header — add icon

```tsx
import { SectionHeader } from "@/components/ui";
import { History } from "lucide-react";

<SectionHeader
  icon={<History className="h-5 w-5 text-[color:var(--primary)]" />}
  title={messages.fitHistory.sectionTitle}
/>
```

### 2. Fit value display — use `MeasurementTile` grid

Where the component shows fit numbers, replace ad-hoc divs with a `MeasurementTile` grid:

```tsx
import { MeasurementTile } from "@/components/ui";

<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
  <MeasurementTile label={messages.fitHistory.saddleHeight} value={rec.saddleHeightMm} unit="mm" />
  <MeasurementTile label={messages.fitHistory.handlebarDrop} value={rec.handlebarDropMm != null ? Math.round(rec.handlebarDropMm) : null} unit="mm" />
  <MeasurementTile label={messages.fitHistory.confidence} value={`${formatConfidence(rec.globalConfidenceScore)}%`} />
</div>
```

## Acceptance criteria
- Bike card header has icon + title + "View bike" action link
- Session rows show fit stats using `StatRow`
- Status badges (ready/pending) are consistently styled with colour-mixed backgrounds
- Delete dialog warning uses `InfoBox variant="danger"`
- `BikeFitHistorySection` has icon+title section header
- Fit numbers in section use `MeasurementTile`
- No data or logic changes
- `npm run build:vercel` passes
