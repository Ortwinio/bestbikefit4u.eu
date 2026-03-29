# 04 — New Fit Session Page

## Goal
Apply the design system to `src/app/(dashboard)/fit/page.tsx`.

## File to change
`src/app/(dashboard)/fit/page.tsx`

## Current state
- Alert boxes (incomplete profile warning, loading errors) are ad-hoc inline `<div>` elements
- Card header has `CardTitle` but no icon
- Bike selection tiles have their own bespoke hover/selected styling (this is fine — keep as-is)
- CTA section at the bottom is a plain `<div>` with inline styles

## Changes

### 1. Page header — add subtitle

The page currently has an `<h1>` title. Add the standard subtitle pattern:

```tsx
<div>
  <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
    {messages.fit.title}
  </h1>
  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
    {messages.fit.subtitle}
  </p>
</div>
```

### 2. Card header — add icon

```tsx
import { SectionHeader } from "@/components/ui";
import { Bike } from "lucide-react";

// Replace CardHeader/CardTitle with:
<SectionHeader
  icon={<Bike className="h-5 w-5 text-[color:var(--primary)]" />}
  title={messages.fit.selectBikeTitle}
/>
```

### 3. Incomplete profile warning — use `InfoBox`

Replace the ad-hoc warning div:

```tsx
import { InfoBox } from "@/components/ui";
import { AlertCircle } from "lucide-react";

// Before (ad-hoc):
// <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 ...">

// After:
<InfoBox
  variant="warning"
  icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}
>
  <p className="font-medium">{messages.fit.incompleteProfileTitle}</p>
  <p className="mt-1 text-[color:var(--muted-foreground)]">
    {messages.fit.incompleteProfileBody}
  </p>
  <Link
    href={withLocalePrefix("/profile", locale)}
    className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
  >
    {messages.fit.goToProfile}
    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
  </Link>
</InfoBox>
```

### 4. Error state — use `InfoBox variant="danger"`

```tsx
<InfoBox variant="danger" icon={<AlertCircle className="h-4 w-4 text-[color:var(--danger)]" />}>
  {createError}
</InfoBox>
```

### 5. Rider profile summary card — add `MeasurementTile` grid

If the page shows rider profile summary (height, weight, inseam), render them as `MeasurementTile`:

```tsx
import { MeasurementTile } from "@/components/ui";

<div className="grid grid-cols-3 gap-3">
  <MeasurementTile label={messages.profile.height} value={profile?.heightCm} unit="cm" />
  <MeasurementTile label={messages.profile.weight} value={profile?.weightKg} unit="kg" />
  <MeasurementTile label={messages.profile.inseam} value={profile?.inseamCm} unit="cm" />
</div>
```

## Acceptance criteria
- Page has `<h1>` + subtitle paragraph
- Card header uses `SectionHeader` with bike icon
- Profile incomplete alert uses `InfoBox variant="warning"` with icon and action link
- Error messages use `InfoBox variant="danger"`
- Any rider profile summary values use `MeasurementTile`
- Bike selection tile UI is unchanged
- `npm run build:vercel` passes
