# 01 — Shared Primitive Components

## Goal
Extract the four most-repeated visual patterns from the Profile page into small, reusable components that all other pages can import. These become the building blocks for the consistency work in prompts 02–07.

## File to create: `src/components/ui/SectionHeader.tsx`

A card-header pattern: icon + title + optional trailing action.

```tsx
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type SectionHeaderProps = {
  icon?: ReactNode;        // e.g. <User className="h-5 w-5 text-[color:var(--primary)]" />
  title: string;
  action?: ReactNode;      // e.g. an Edit button
  className?: string;
  border?: boolean;        // adds border-b (default true)
};

export function SectionHeader({
  icon,
  title,
  action,
  className,
  border = true,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-4",
        border && "border-b border-[color:var(--border)]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-[color:var(--foreground)]">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
```

**Usage example:**
```tsx
<Card variant="bordered" className="dashboard-card-surface">
  <SectionHeader
    icon={<Bike className="h-5 w-5 text-[color:var(--primary)]" />}
    title="My Bikes"
    action={
      <Button variant="primary-soft" size="sm" asChild>
        <Link href="/bikes/new"><Plus className="h-4 w-4" /> Add bike</Link>
      </Button>
    }
  />
  <CardContent>…</CardContent>
</Card>
```

---

## File to create: `src/components/ui/MeasurementTile.tsx`

A compact tile showing one measurement value with label and optional unit.

```tsx
import { cn } from "@/utils/cn";

type MeasurementTileProps = {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  className?: string;
};

export function MeasurementTile({ label, value, unit, className }: MeasurementTileProps) {
  if (value === null || value === undefined) return null;

  return (
    <div
      className={cn(
        "bg-[color:var(--surface-secondary)] rounded-[var(--radius-md)] px-4 py-3",
        className
      )}
    >
      <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold text-[color:var(--foreground)]">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-[color:var(--muted-foreground)]">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
```

**Usage example:**
```tsx
<div className="grid grid-cols-3 gap-3">
  <MeasurementTile label="Saddle height" value={rec.saddleHeight} unit="cm" />
  <MeasurementTile label="Reach" value={rec.reach} unit="mm" />
  <MeasurementTile label="Stack" value={rec.stack} unit="mm" />
</div>
```

---

## File to create: `src/components/ui/InfoBox.tsx`

A semantic info/alert box using CSS `color-mix` for brand-consistent colouring across themes.

```tsx
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type InfoBoxVariant = "primary" | "warning" | "success" | "danger" | "secondary";

const variantStyles: Record<InfoBoxVariant, string> = {
  primary:
    "border-[color:color-mix(in_oklch,var(--primary)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card)_92%)]",
  warning:
    "border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)]",
  success:
    "border-[color:color-mix(in_oklch,var(--success)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_8%,var(--card)_92%)]",
  danger:
    "border-[color:color-mix(in_oklch,var(--danger)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_8%,var(--card)_92%)]",
  secondary:
    "border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_88%,var(--background)_12%)]",
};

type InfoBoxProps = {
  variant?: InfoBoxVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function InfoBox({ variant = "primary", icon, children, className }: InfoBoxProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border p-4 text-sm",
        variantStyles[variant],
        className
      )}
    >
      {icon ? (
        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0">{icon}</div>
          <div className="text-[color:var(--foreground)]">{children}</div>
        </div>
      ) : (
        <div className="text-[color:var(--foreground)]">{children}</div>
      )}
    </div>
  );
}
```

**Usage examples:**
```tsx
// Warning alert
<InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}>
  Complete your rider profile before starting a fit session.
</InfoBox>

// Primary info
<InfoBox variant="primary">
  Your Strava account is connected.
</InfoBox>
```

---

## File to create: `src/components/ui/StatRow.tsx`

A key-value display row, used in lists of stats (session details, fit numbers, etc.).

```tsx
import { cn } from "@/utils/cn";

type StatRowProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

export function StatRow({ label, value, className }: StatRowProps) {
  if (value === null || value === undefined) return null;

  return (
    <div className={cn("flex items-center justify-between gap-4 py-1.5", className)}>
      <dt className="text-xs text-[color:var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold text-[color:var(--foreground)]">{value}</dd>
    </div>
  );
}
```

**Usage example:**
```tsx
<dl className="divide-y divide-[color:var(--border)]">
  <StatRow label="Experience" value="Intermediate" />
  <StatRow label="Weekly hours" value="6–10 hrs/week" />
  <StatRow label="Ride length" value="Medium (30–80 km)" />
</dl>
```

---

## Export all from `src/components/ui/index.ts`

Add to the existing barrel export:
```typescript
export { SectionHeader } from "./SectionHeader";
export { MeasurementTile } from "./MeasurementTile";
export { InfoBox } from "./InfoBox";
export { StatRow } from "./StatRow";
```

## Acceptance criteria
- All four components exist in `src/components/ui/`
- All four are exported from `src/components/ui/index.ts`
- Each component renders `null` when its primary value prop is empty (MeasurementTile, StatRow)
- InfoBox renders content with or without an icon
- No existing imports are broken
- `npm run build:vercel` passes
