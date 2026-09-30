# 07b — Visual QA fixes (Codex A)

Lead visual QA on FtpWkg and FuelHydration. The FTP physics are approved (FTP 200 W / 75 kg → 2,67 W/kg; 5 km @ 7 % → 27 min; flat → 33,6 km/u, identical to the engine). The placeholders in FuelHydration are correct (no source available); leave them.

1. **Consistency**: apply the new section "Consistency across boards" in `BOARD-RULES.md`. The sub-nav gets the fixed order and labels **Vermogen ↔ snelheid · Klimplanner · FTP / W/kg · Voeding & drinken** (so "Voeding & drinken", not "Voeding / drinken"). Units use `km/u` (you already do this), and whole sentences are not in DM Mono.
2. FuelHydration: the eyebrow says "Voeding & drinken · bereid je rit voor". Make the pill label match it.
3. Re-render both boards to `drafts/_renders/`.

Do this after 03b. Done when: `check-board.mjs` + `check-runtime.mjs` PASS and the renders are updated. No app code, no commit. Print `DONE 07b`.
