# 07 — FTP W/kg, fuel & hydration

Read `README.md`, `BOARD-RULES.md` and `05-new-tool-contracts.md` first. Use `canvas/SaddleHeight.dc.html` or the approved boards in `drafts/` as the example for structure.

## `drafts/FtpWkg.dc.html` (1440 × ~1240)
Per contract 05 → FTP W/kg.
- Step 1 is the "how do you know your FTP" choice (3 segments). The slider below it changes with the choice (label, range and the conversion factor shown as "FTP = 0,95 × 20-min vermogen").
- Result: W/kg big in DM Mono. Beneath it, a translation to practice using the shared physics from contract 05 (identical code; road bike and road surface as defaults): the time up the reference climb 5 km at 7 %, and the speed on the flat at FTP.
- The level table stays a visible placeholder `[NIVEAUTABEL — bron nog kiezen]`, shown as a greyed-out scale with that text.
- CTA: "Bewaar je FTP in je account" (the climb planner and gearing tools use it).

## `drafts/FuelHydration.dc.html` (1440 × ~1300)
Per contract 05 → Fuel & hydration.
- First read `src/app/(public)/calculators/fuel-hydration/page.tsx` and write down which carbohydrate and fluid ranges the current copy names (file:line). Build the calculation only on those. Where there's no source: a visible placeholder.
- Visual: a **ride timeline** (a horizontal strip over the duration) with eat and drink moments as markers, plus result tiles (g/h, g total, ml/h, bottles).
- Honesty block: "Startpunt — test het op training; bij warmte en lange ritten ook zout".

## Done when
- `check-board.mjs` passes for both.
- `audit/07-notes.md`: the copy sources (file:line) for every fuel/fluid number, and a check that the physics code in FtpWkg is identical to contract 05.
- No app code changed, no commit.

Print `DONE 07` as your last line.
