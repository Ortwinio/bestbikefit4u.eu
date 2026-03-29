# 07 — Dashboard Home Page

## Goal
Apply final polish to `src/app/(dashboard)/dashboard/page.tsx` — it's already the most consistent page but has a few gaps compared to the Profile reference.

## File to change
`src/app/(dashboard)/dashboard/page.tsx`

## Current state
- Uses `Card variant="bordered"` + `dashboard-card-surface` ✓
- Uses `FlexibilityScale` and `CoreStabilityBar` directly ✓
- Uses `dashboard-card-surface` and `bg-surface-secondary` tile class ✓
- Missing: icon+title on card section headers
- Missing: profile summary / welcome section doesn't use the gradient hero pattern

## Changes

### 1. Card headers — add icons

The dashboard page has several card sections. Add icons to each:

| Section | Icon |
|---------|------|
| Rider profile summary | `<User />` |
| Your bikes | `<Bike />` |
| Recent fit sessions | `<History />` |
| Flexibility | `<Activity />` |
| Core stability | `<Dumbbell />` |

```tsx
import { SectionHeader } from "@/components/ui";
import { User, Bike, History, Activity, Dumbbell } from "lucide-react";

<Card variant="bordered" className="dashboard-card-surface">
  <SectionHeader
    icon={<User className="h-5 w-5 text-[color:var(--primary)]" />}
    title={messages.dashboardHome.riderProfile}
    action={
      <Button variant="primary-soft" size="sm" asChild>
        <Link href={withLocalePrefix("/profile", locale)}>
          {messages.dashboardHome.editProfile}
        </Link>
      </Button>
    }
  />
  <CardContent>…</CardContent>
</Card>
```

### 2. Welcome / hero section — gradient card

Add a gradient welcome/hero card at the top, matching the Profile page's status card style:

```tsx
<div className="rounded-[var(--radius-xl)] bg-gradient-to-br from-primary to-primary/75 p-6 text-primary-foreground">
  <div className="flex items-center gap-4">
    <ProfilePhotoUpload
      imageSource={profileImageSource}
      size="md"
      readOnly
    />
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
        {messages.dashboardHome.welcomeBack}
      </p>
      <p className="text-xl font-bold text-primary-foreground">{displayName}</p>
      <p className="mt-0.5 text-sm text-primary-foreground/75">
        {messages.dashboardHome.subtitle}
      </p>
    </div>
  </div>
  <div className="mt-4 flex gap-3">
    <Button variant="outline" size="sm" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
      <Link href={withLocalePrefix("/fit", locale)}>
        {messages.dashboardHome.startFit}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Button>
  </div>
</div>
```

### 3. Measurement tiles — verify they use `MeasurementTile`

The dashboard page uses inline tile classes (`bg-surface-secondary rounded-[var(--radius-md)] px-4 py-3`). Replace these with `MeasurementTile`:

```tsx
import { MeasurementTile } from "@/components/ui";

// Replace inline tile divs:
<div className="grid grid-cols-3 gap-3">
  <MeasurementTile label={messages.profile.height} value={profile?.heightCm} unit="cm" />
  <MeasurementTile label={messages.profile.weight} value={profile?.weightKg} unit="kg" />
  <MeasurementTile label={messages.profile.inseam} value={profile?.inseamCm} unit="cm" />
</div>
```

### 4. "No bikes" empty state — verify `EmptyState` is used (already is — no change)

### 5. Inline action links — standardise

Any "View all" or navigation links should use the `bg-primary/10` inline link style.

## Acceptance criteria
- A gradient welcome/hero card appears at the top with user name and avatar
- All card sections have icon + title via `SectionHeader`
- Measurement tiles use the `MeasurementTile` component
- Action links use `bg-primary/10` inline style
- `FlexibilityScale` and `CoreStabilityBar` are unchanged (already correct)
- `npm run build:vercel` passes
