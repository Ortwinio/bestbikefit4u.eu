# 17 — Polish pass on the account boards (next free agent)

Apply the new section "Example data" in `BOARD-RULES.md` to every account board in `drafts/`: Profile, ProfileImprove, FitStart, FitQuestionnaire, FitResults, Bikes, BikeAdd, BikeForm, BikeImportMarktplaats, BikeImportPassport, BikeCompare, PressureDashboard, GearingDashboard, SaddleSelector, ShoeCleatFit, Settings, Feedback, FitMethod, and (after 11) Dashboard, BikeProfile, History.
- Remove "voorbeeld"/"[VOORBEELD]" from CTAs, names, notes and notices; place one "Voorbeeldgegevens" chip per screen next to the H1.
- Check at the same time that the sidebar is identical on all account boards (items, order, icons, plan block). Use `Bikes.dc.html` as the reference and fix any deviations.
- Change nothing else. Re-render the changed boards.
Done when: `grep -il 'voorbeeld' drafts/*.dc.html` only hits the chip text and the review-state strip; the checkers PASS. Print `DONE 17`.
