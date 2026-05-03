# Prompt 04 — GuideLinkButton Component + Guide/Scenario Section Upgrade

## Context

Read `plans/design-language-v1/README.md` first.

**The problem**: The guides and rider scenarios sections render plain outline buttons with only a text label floating in 80px of vertical space. No icon, no description, no visual signal of what the content contains. These sections look like placeholders.

**Files to read before starting**:
- `src/app/(public)/page.tsx` (the guides and riderScenarios sections at the bottom)
- `src/components/public/PublicSurfaceCard.tsx`

## Task

1. Create a `GuideLinkButton` component in `src/components/public/`
2. Create a typed content module for guide and scenario links
3. Update `page.tsx` to use the new component

## Deliverable 1: `src/components/public/GuideLinkButton.tsx`

A link card that works as a navigational button with a leading icon, a title, and an optional short subtitle.

**Visual spec**:
- Full width, `rounded-2xl`, `border border-[color:var(--border)]`
- Background: `bg-[color:color-mix(in_oklch,var(--card)_90%,var(--background)_10%)]`
- Hover: `hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--primary-soft)]` + `shadow-[var(--public-shadow)]`
- Padding: `px-5 py-4`
- Layout: horizontal flex, `gap-4`, `items-center`
- Icon container: `h-10 w-10 shrink-0 rounded-xl bg-[color:var(--primary-soft)] text-[color:var(--primary)] flex items-center justify-center` with 20px icon
- Text block: title (`text-sm font-semibold text-[color:var(--foreground)]`) + subtitle below (`text-xs leading-5 text-[color:var(--muted-foreground)]`)
- Trailing: `ChevronRight` 16px, `text-[color:var(--muted-foreground)]`, `group-hover:text-[color:var(--primary)]`
- Add `group` class to root for hover transitions
- Renders as `<Link>` via `render` prop on `Button`, or as a plain `<a>` — use `next/link` directly since this is always a navigation element

```ts
type GuideLinkButtonProps = {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
};
```

## Deliverable 2: `src/components/home/homeGuideContent.ts`

A typed content module for guide and scenario links, separate from `homeRedesignContent.ts`.

This removes the hardcoded locale-conditional arrays from `page.tsx`.

```ts
import type { Locale } from "@/i18n/config";

type GuideLink = {
  href: string;
  icon: string;   // lucide icon name key, resolved in the component
  title: string;
  subtitle: string;
};

type Localized<T> = Record<Locale, T>;

export const HOME_GUIDE_LINKS: Localized<GuideLink[]> = {
  nl: [
    {
      href: "/guides/bike-fitting-for-knee-pain",
      icon: "heart-pulse",
      title: "Bikefitting bij kniepijn",
      subtitle: "Hoe zadelpositie en cleats knieklachten beïnvloeden.",
    },
    {
      href: "/guides/bike-fitting-for-lower-back-pain",
      icon: "activity",
      title: "Bikefitting bij lage rugklachten",
      subtitle: "Reach, drop en zadelhoek als oorzaak van rugpijn.",
    },
    {
      href: "/guides/road-bike-fit-guide",
      icon: "gauge",
      title: "Racefiets fit gids",
      subtitle: "Volledige fit van zadel tot stuur voor racefietsen.",
    },
    {
      href: "/guides/gravel-bike-fit-guide",
      icon: "mountain",
      title: "Gravel fit gids",
      subtitle: "Comfortabele positie voor lange gravelritten.",
    },
  ],
  en: [
    {
      href: "/guides/bike-fitting-for-knee-pain",
      icon: "heart-pulse",
      title: "Bike Fitting for Knee Pain",
      subtitle: "How saddle position and cleats affect knee issues.",
    },
    {
      href: "/guides/bike-fitting-for-lower-back-pain",
      icon: "activity",
      title: "Bike Fitting for Lower Back Pain",
      subtitle: "Reach, drop and saddle angle as sources of back pain.",
    },
    {
      href: "/guides/road-bike-fit-guide",
      icon: "gauge",
      title: "Road Bike Fit Guide",
      subtitle: "Full fit from saddle to handlebar for road bikes.",
    },
    {
      href: "/guides/gravel-bike-fit-guide",
      icon: "mountain",
      title: "Gravel Bike Fit Guide",
      subtitle: "Comfortable position for long gravel rides.",
    },
  ],
};

export const HOME_SCENARIO_LINKS: Localized<GuideLink[]> = {
  nl: [
    {
      href: "/guides/bike-fitting-for-lower-back-pain",
      icon: "person-standing",
      title: "Bikefit bij lage rugklachten",
      subtitle: "Veelgebruikte aanpassingen bij rugpijnklachten.",
    },
    {
      href: "/guides/gravel-bike-fit-guide",
      icon: "tree-pine",
      title: "Bikefit voor gravelrijden",
      subtitle: "Balans tussen comfort en controle op gravel.",
    },
    {
      href: "/guides/triathlon-bike-fit-guide",
      icon: "timer",
      title: "Bikefit voor triathlon",
      subtitle: "Aerodynamische positie die hardlopen niet blokkeert.",
    },
    {
      href: "/guides/bike-fit-for-tall-riders",
      icon: "arrow-up",
      title: "Bikefit voor lange rijders",
      subtitle: "Reach, staplengte en framekeuze voor boven 1m90.",
    },
  ],
  en: [
    {
      href: "/guides/bike-fitting-for-lower-back-pain",
      icon: "person-standing",
      title: "Bike Fit for Lower Back Pain",
      subtitle: "Common adjustments for back pain complaints.",
    },
    {
      href: "/guides/gravel-bike-fit-guide",
      icon: "tree-pine",
      title: "Bike Fit for Gravel Riding",
      subtitle: "Balance between comfort and control on gravel.",
    },
    {
      href: "/guides/triathlon-bike-fit-guide",
      icon: "timer",
      title: "Bike Fit for Triathlon",
      subtitle: "Aerodynamic position that doesn't block your run.",
    },
    {
      href: "/guides/bike-fit-for-tall-riders",
      icon: "arrow-up",
      title: "Bike Fit for Tall Riders",
      subtitle: "Reach, stack and frame choice for riders above 190cm.",
    },
  ],
};
```

For icon resolution, create a small `GUIDE_ICONS` map at the top of `GuideLinkButton.tsx`:

```ts
import { Activity, ArrowUp, Gauge, HeartPulse, Mountain, PersonStanding, Timer, TreePine } from "lucide-react";

const GUIDE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "heart-pulse": HeartPulse,
  "activity": Activity,
  "gauge": Gauge,
  "mountain": Mountain,
  "person-standing": PersonStanding,
  "tree-pine": TreePine,
  "timer": Timer,
  "arrow-up": ArrowUp,
};
```

When rendering, accept either a resolved `ReactNode` icon OR an icon key string via an overloaded prop:
```ts
type GuideLinkButtonProps = {
  href: string;
  icon: ReactNode | string;   // ReactNode for direct use, string key from the map
  title: string;
  subtitle?: string;
  className?: string;
};
```

## Deliverable 3: Update `src/app/(public)/page.tsx`

Replace the hardcoded `guideLinks` and `riderScenarios` arrays and inline `Button` rendering with:

```tsx
import { HOME_GUIDE_LINKS, HOME_SCENARIO_LINKS } from "@/components/home/homeGuideContent";
import { GuideLinkButton } from "@/components/public/GuideLinkButton";

// Remove: const guideLinks = locale === "nl" ? [...] : [...]
// Remove: const riderScenarios = locale === "nl" ? [...] : [...]

// Usage:
{HOME_GUIDE_LINKS[locale].map((guide) => (
  <GuideLinkButton key={guide.href} {...guide} />
))}
```

Change the grid to `grid-cols-1 sm:grid-cols-2` (same as now) but the visual quality will improve significantly.

## Export

Add `GuideLinkButton` to `src/components/public/index.ts`.

## Constraints

- Server component
- Icon keys must all resolve via `GUIDE_ICONS` — add a console.warn fallback for unknown keys
- `subtitle` is optional — `GuideLinkButton` must render cleanly without it (for future reuse on other pages)
- The `homeGuideContent.ts` module is separate from `homeRedesignContent.ts` to keep file sizes manageable

## Completion Checklist

- [ ] `GuideLinkButton` exists in `src/components/public/`
- [ ] Guide and scenario buttons show icon + title + subtitle
- [ ] `homeGuideContent.ts` replaces hardcoded arrays in `page.tsx`
- [ ] Both EN and NL content is correct
- [ ] `npm run typecheck` passes
