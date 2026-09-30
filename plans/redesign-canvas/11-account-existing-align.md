# 11 — Align the existing account boards with the real app (next free agent)

Copy from `canvas/` to `drafts/` and change only what's needed:

1. `Dashboard.dc.html`: the sidebar items per `src/components/layout/DashboardSidebar.tsx` + links to the new boards; the content blocks match what `src/app/(dashboard)/dashboard/page.tsx` really shows (profile progress, bikes, fit info, next steps). Off-palette colors (`#B42318`, `#B45309`, `#8A6D00`, `#9FB2AC`, `#1E3D36`) → palette/status colors. Keep what fits; mark whatever the real dashboard doesn't have as a suggestion in your notes, and remove it from the board unless it's a clear upgrade (argue that).
2. `BikeProfile.dc.html` (`/bikes/[bikeId]`): add the real bike identity, geometry, passport and report actions (per the page + components). Keep the strong "Nu vs. doel" part. Palette fix (`#C9D6D0`).
3. `History.dc.html` (`/fit-history`): per `BikeWithFitHistory` (sessions grouped by bike). The line chart / comfort trend only if the data exists; otherwise mark it as a suggestion. Palette fix.
4. `Main.dc.html` and `Pricing.dc.html` (not account, but same pass): off-palette colors (`#E9A800`, `#9FB2AC`, `#25403A`) → palette. **Check every claim/number** on Home and Pricing against the real site/code (`src/app/(public)/page.tsx`, `src/app/(public)/pricing/page.tsx`, `src/config/`, the brand guide's claims): real → keep; not verifiable → `[CLAIM — bron?]`. Pricing: payments paused → the CTAs show that state (the real text from the pricing page). Update the header navigation on Home/Pricing: Calculators → `BikeFit.dc.html`, Hoe het werkt → `HowItWorks.dc.html`, Gidsen → `Guides.dc.html`, Prijzen → `Pricing.dc.html`.

Done when: checkers PASS; renders; `audit/11-notes.md` with per board what changed and why (file:line). No app code, no commit. Print `DONE 11`.
