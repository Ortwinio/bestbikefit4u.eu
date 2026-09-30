# 17 — Account polish

Completed 2026-09-29 by Codex B with four bounded subagents. Parent owned Bikes, sidebar normalization, integration and final rendering/checks. No app code, canvas snapshots, publication or commits changed by this task.

## Scope

Updated the 21 boards explicitly listed in task 17: Profile, ProfileImprove, FitStart, FitQuestionnaire, FitResults, Bikes, BikeAdd, BikeForm, BikeImportMarktplaats, BikeImportPassport, BikeCompare, PressureDashboard, GearingDashboard, SaddleSelector, ShoeCleatFit, Settings, Feedback, FitMethod, Dashboard, BikeProfile and History.

- One petrol-soft, 12px `Voorbeeldgegevens` chip beside the visible H1, including alternate loading/not-found headings. Removed repeated example labels from names, buttons, notes, reports and notices. Missing-fact placeholders remain.
- Every account sidebar derives from the cleaned `drafts/Bikes.dc.html` reference: identical eleven items, order, SVG icons, spacing and plan block. Explicit sidebar typography prevents inherited page styles from changing its appearance.
- Active-route styling is the only sidebar-markup difference. BikeForm retains separate create/edit branches, selecting Nieuwe fiets/Mijn fietsgarage respectively. ShoeCleatFit retains no active item because it has no corresponding sidebar route.
- The plan block consistently shows the reference fixture (Sanne, Free, one of one session, paused payments). It is not live billing/usage data; this supersedes earlier per-board sidebar variations, including task 11's empty-account usage illustration.
- No formulas, event behavior, persistence, product sections or artboard dimensions changed. Small heading wrappers accommodate the chip. Removed redundant explanatory copy may reduce internal spacing. All simulated effects remain local.

## Validation

Both repository checkers PASS on every listed board, without unbound-handler warnings: **1,623 runtime states** total.

| Boards | Runtime states |
|---|---:|
| Bikes | 37 |
| Profile / ProfileImprove / FitStart / FitQuestionnaire / FitResults | 94 / 32 / 37 / 51 / 52 |
| BikeAdd / BikeForm / BikeImportMarktplaats / BikeImportPassport / BikeCompare | 1 / 226 / 94 / 82 / 1 |
| PressureDashboard / GearingDashboard / SaddleSelector / ShoeCleatFit / FitMethod | 82 / 217 / 214 / 1 / 1 |
| Settings / Feedback / Dashboard / BikeProfile / History | 73 / 94 / 70 / 109 / 55 |

Additional parent assertions PASS:

- Removing exact chip text from each of the 21 sources leaves no case-insensitive `voorbeeld` match. This check is scoped to task 17's account boards: public pages/calculators and their legitimate prose are outside the requested change set.
- All 22 account-sidebar branches are byte-identical after normalizing the active link. Other contextual `<aside>` elements, such as Profile's measurement guidance, remain untouched.
- **207 PNGs** refreshed under `drafts/_renders/`, including every pre-existing variant filename for these boards and a default `<Board>.png` for each. Review states, wizard steps, expanded controls, dialogs, loading/error/empty states and local interaction captures are included.
- Across all 207 captures: exactly one visible H1 and one example chip; no residual example wording, unresolved holes, duplicate IDs, horizontal overflow or content beyond the artboard height; no visible button/link/input shorter than 44px.
- All captures share a 264px sidebar, eleven 46px navigation rows, 15px/21px navigation typography, and a 195.984375px plan block. Different artboard heights only change the flexible gap above that bottom block.

Renders use local DCLogic evaluation, DOM expansion and headless Chromium, with loaded fonts and repository illustrations; they are not native-canvas execution. Parent visually inspected representative garage, profile, fit-start, feedback and information screens. Source checking and state behavior remain covered by the repository runtime checker; the lead retains final native-canvas QA/publication.

No open question or blocker.
