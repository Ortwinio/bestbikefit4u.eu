# Prompt 02 — Add compact bike passport entry to Footer

## Context

`BikeQuickCheckCard` was removed from the homepage in prompt 01, but the tool (check if a shared bike fits you) still has value — it just shouldn't occupy a prominent homepage section. The right place for it is the footer, as a small link in the existing "Calculators" or a new "Tools" sub-column.

The Footer is in `src/components/layout/Footer.tsx`. It already has:
- A 3-column info card at the top (Product / Bronnen / Support)
- A 5-column link grid: Product · Calculators · Support · Juridisch · Bronnen

The bike passport check lives at `/profile` or is triggered via `BikeQuickCheckCard`. Looking at the card's props: it uses `loginHref`, `profileHref`, `fitHref`. The public entry is a link to log in / profile to use the passport.

The simplest footer entry: add a row in the existing **Calculators** column linking to `/profile` (or `/login`) labelled "Bike passport check" / "Bike passport check".

## Task

In `src/components/layout/Footer.tsx`:

1. Add a new list item to the **Calculators** `<ul>` after the existing tire-pressure entry:
   ```tsx
   <li>
     <Link
       href={withLocalePrefix("/login", locale)}
       className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
     >
       {locale === "nl" ? "Bike passport check" : "Bike passport check"}
     </Link>
   </li>
   ```
   Note: No `CalculatorLogo` for this one — it's not a calculator, it's a tool. Plain text link is correct.

2. The label should be the same in NL and EN ("Bike passport check" is already an established product term). If the dictionary already has a translation key for it, use that. Otherwise inline strings are fine.

## Verification

- Footer renders a "Bike passport check" link in the Calculators column.
- Link points to `/login` (or locale-prefixed `/nl/login`).
- `npx tsc --noEmit` passes.
