# 06b — Visual QA fixes (Codex B)

Lead visual QA on Gearing, PowerSpeed and ClimbPlanner. The logic and physics are approved (they match the engine: 200 W flat → 33,6; 7 % → 11,2 km/u; 5 km @ 7 % → 26,9 min). Fix the following:

1. **Consistency**: apply the new section "Consistency across boards" in `BOARD-RULES.md` (the "Meer" sub-nav with 4 fixed tools above the eyebrow; remove the sub-nav from Gearing; `km/u`).
2. **DM Mono only for numbers**: "Een 36-tands grootste krans geeft circa 4,6 rpm meer." (Gearing), "Bij één schuifstap minder of meer: …" (PowerSpeed) and "Bij één FTP-schuifstap minder of meer: …" (ClimbPlanner) go in Figtree, with only the numbers in DM Mono.
3. **Jargon**: remove "Dit is geen betrouwbaarheidsinterval" and "Dit is een gevoeligheidscheck, geen betrouwbaarheidsinterval." Rewrite the range as rider copy, e.g. "Met 5 W meer of minder: 33,3–33,9 km/u." Rewrite "Een richtlijn, geen tijdgarantie" + body as short copy without "model".
4. **ClimbPlanner profile**: the climb profile is now a thin line in a large, empty lime panel. Make the profile fill the panel (about 560 × 200 px): a filled mountain surface (petrol-soft with an ink line) whose slope follows the gradient (visually exaggerated, as now), start/finish markers, km ticks along the bottom, and the target power + time as a label on the line. Keep the note "hoogte visueel vergroot".
5. **Renders for 04**: also render `CrankLength.dc.html` (default + refine open) and `SaddleWidth.dc.html` (measured + estimated) to `drafts/_renders/`. Fix CrankLength and SaddleWidth for points 1–3 too, if they apply.
6. Re-render the changed boards.

Done when: `check-board.mjs` + `check-runtime.mjs` PASS for all five, and the renders are updated. No app code, no commit. Print `DONE 06b`.
