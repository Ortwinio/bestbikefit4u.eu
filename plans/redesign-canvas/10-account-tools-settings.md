# 10 — Account: tools, settings, feedback (next free agent)

Read `README.md`, `BOARD-RULES.md` (including "Account screens" and "Consistency across boards") and `audit/route-map.md` first. **Use subagents if your tooling supports them.** Reuse the approved public configurators in `drafts/` as the base: an account version = the same tool in the account shell + account-specific elements (bike choice, saved values, history).

Boards (under `drafts/`):
1. `PressureDashboard.dc.html` — `/pressure-calculator`: `drafts/TirePressure.dc.html` in the account shell, plus a bike choice (cards for the saved bikes), the extended inputs the account engine supports (per `audit/engine-alignment.md` → TirePressure, "missing from the board": rim width, casing, wet weather, TT), saved pressure profiles.
2. `GearingDashboard.dc.html` — `/gearing`: `drafts/Gearing.dc.html` in the account shell + bike choice and the rider context from `convex/gearing/mutations.ts` (FTP/weight from the profile).
3. `SaddleSelector.dc.html` — `/saddle-selector`: per `SaddleSelectorForm` (the account refiners from the audit: flexibility/core, current saddle width, symptom cards, ride duration).
4. `ShoeCleatFit.dc.html` — `/shoe-cleat-fit`: today an information page. Design it as that (explanation, checklist, CTA to `/fit`, **not** the broken `/dashboard/fit`). Put a suggestion for a real cleat wizard in your notes.
5. `Settings.dc.html` — `/settings`: account, language (NL/EN), units, integrations (Strava status: connected / not connected / error), subscription (payments paused — show the real state), app installation, delete account (with confirmation).
6. `Feedback.dc.html` — `/feedback`: per `FeedbackHubPage` (give feedback, feature requests, status of your own feedback).
7. `FitMethod.dc.html` — `/fit/how-it-works`: the method page in the account shell (measurements → engine → advice), in rider language.
8. `AppInstall.dc.html` — `/app`: install instructions (iOS/Android/desktop as tabs), with no account shell (the page also works logged out).

Done when: `check-board.mjs` + `check-runtime.mjs` PASS; renders in `drafts/_renders/`; `audit/10-notes.md` (sources file:line, states, suggestions). No app code, no commit. Print `DONE 10`.
