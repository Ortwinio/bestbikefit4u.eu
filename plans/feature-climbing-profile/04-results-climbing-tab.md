# 04 — Display climbing profile tab in results

## Goal
Show a "Climbing fit" tab alongside "Your fit" in the results page when a climbing profile was generated for the session.

## Steps

### 1. Locate the results page

Find `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` (or the results component). This page reads the session result and renders the fit recommendations.

### 2. Add tab state

```tsx
const [activeTab, setActiveTab] = useState<"main" | "climbing">("main");
const hasClimbingProfile = Boolean(session.climbingFitResult);
```

### 3. Render tab switcher

When `hasClimbingProfile` is true, show two tabs above the results card:

```tsx
{hasClimbingProfile && (
  <div className="mb-4 flex gap-2">
    <button
      onClick={() => setActiveTab("main")}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        activeTab === "main"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent"
      )}
    >
      Your fit
    </button>
    <button
      onClick={() => setActiveTab("climbing")}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        activeTab === "climbing"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent"
      )}
    >
      Climbing fit
    </button>
  </div>
)}
```

### 4. Pass active profile to results components

Replace the hard-coded `session.fitResult` reference with:

```tsx
const activeResult =
  activeTab === "climbing" && session.climbingFitResult
    ? session.climbingFitResult
    : session.fitResult;
```

Pass `activeResult` to all downstream recommendation display components.

### 5. Add context note for climbing tab

When the climbing tab is active, show a small info banner explaining the profile:

```tsx
{activeTab === "climbing" && (
  <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
    This setup is optimised for climbing — higher bars, adjusted saddle setback,
    and shorter reach to improve power output and comfort on long ascents.
  </div>
)}
```

### 6. Add i18n keys

Add to `en.ts` and `nl.ts` under `fit.results`:
```ts
mainProfileTab: "Your fit",
climbingProfileTab: "Climbing fit",
climbingProfileNote: "This setup is optimised for climbing — higher bars, adjusted saddle setback, and shorter reach to improve power output and comfort on long ascents.",
```

## Acceptance criteria
- [ ] Two tabs appear on the results page when `climbingFitResult` is present
- [ ] "Your fit" tab shows the standard fit values
- [ ] "Climbing fit" tab shows the climbing-adjusted values with the info banner
- [ ] No tabs appear when there is no climbing profile (single-profile sessions unchanged)
- [ ] Switching tabs does not reload the page or lose scroll position
