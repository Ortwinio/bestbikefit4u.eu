# 05 — Settings Page

## Goal
Apply the design system to `src/app/(dashboard)/settings/page.tsx` and its sub-components.

## File to change
`src/app/(dashboard)/settings/page.tsx`

## Current state
The Settings page already uses `Card variant="bordered" className="dashboard-card-surface"` for most sections. However:
- Card headers are `CardHeader` + `CardTitle` without icons
- Several info/alert boxes use raw inline `color-mix` class strings directly (inconsistent across sections)
- Some sections use `rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-3` for info tiles — should use `InfoBox variant="secondary"` instead
- The destructive (delete account) section uses a non-standard danger card border

## Changes

### 1. Card headers — add icons

Each settings section card needs an icon. Map sections to icons:

| Section | Icon |
|---------|------|
| Account / profile display | `<User />` |
| Language & theme | `<Globe />` or `<Palette />` |
| Integrations (Strava) | `<Zap />` or `<Link2 />` |
| Notifications | `<Bell />` |
| Security / password | `<Shield />` |
| Danger zone / delete account | `<Trash2 />` |

```tsx
import { SectionHeader } from "@/components/ui";
import { User, Globe, Zap, Bell, Shield, Trash2 } from "lucide-react";

// Example for account section:
<Card variant="bordered" className="dashboard-card-surface">
  <SectionHeader
    icon={<User className="h-5 w-5 text-[color:var(--primary)]" />}
    title={messages.settings.accountSection}
    action={<Button variant="primary-soft" size="sm">…</Button>}
  />
  <CardContent>…</CardContent>
</Card>

// Danger zone:
<Card variant="bordered" className="dashboard-card-surface border-[color:color-mix(in_oklch,var(--danger)_28%,var(--border))]">
  <SectionHeader
    icon={<Trash2 className="h-5 w-5 text-[color:var(--danger)]" />}
    title={messages.settings.dangerZone}
  />
  <CardContent>…</CardContent>
</Card>
```

### 2. Info tiles — use `InfoBox`

Replace all ad-hoc coloured info divs with `InfoBox`:

```tsx
import { InfoBox } from "@/components/ui";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

// Strava connected:
<InfoBox variant="success" icon={<CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />}>
  {messages.settings.stravaConnected}
</InfoBox>

// Strava not connected / info:
<InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--muted-foreground)]" />}>
  {messages.settings.stravaDescription}
</InfoBox>

// Warning (e.g. email not verified):
<InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}>
  {messages.settings.emailNotVerified}
</InfoBox>
```

### 3. Display name / profile tile — use `StatRow`

Where the settings page shows current values (e.g. current display name, email), use `StatRow` instead of custom divs:

```tsx
import { StatRow } from "@/components/ui";

<dl className="divide-y divide-[color:var(--border)]">
  <StatRow label={messages.settings.email} value={user?.email} />
  <StatRow label={messages.settings.displayName} value={user?.name} />
</dl>
```

### 4. Page header

Ensure the page has the standard header pattern:

```tsx
<div>
  <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
    {messages.settings.title}
  </h1>
  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
    {messages.settings.subtitle}
  </p>
</div>
```

## Acceptance criteria
- Every card section has an icon in its header using `SectionHeader`
- All coloured info/alert boxes use `InfoBox` with the correct variant
- Static key-value displays use `StatRow`
- Danger zone card retains its danger border but uses `SectionHeader` with a danger-coloured icon
- `npm run build:vercel` passes
