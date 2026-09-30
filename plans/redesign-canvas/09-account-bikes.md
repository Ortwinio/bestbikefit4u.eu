# 09 — Account: my bikes (Codex B)

Read `README.md`, `BOARD-RULES.md` (including "Account screens"), `audit/route-map.md` (Dashboard/account) and `reference/design-language.md` → "Achter de login" first. **Use subagents if your tooling supports them**: one per board, and you do the final check yourself.

Boards (all under `drafts/`):
1. `Bikes.dc.html` — `/bikes`: the garage with bike cards (type, fit status, last session), an empty state, and "Fiets toevoegen".
2. `BikeAdd.dc.html` — `/bikes/new`: choose between manual / Marktplaats / bike passport (3 large option cards).
3. `BikeForm.dc.html` — `/bikes/new/manual` + `/bikes/[id]/edit`: one form in create and edit states. Use the real fields from `CreateBikeForm`/`BikeForm`. Geometry (stack/reach etc.) goes through a guided brand/model/size picker (`feature-bike-geometry-guided-picklist` in `plans/` and the components), and numbers through sliders where possible.
4. `BikeImportMarktplaats.dc.html` — `/bikes/import/marktplaats`: paste URL → preview → confirm, plus error states (per `MarktplaatsBikeImportFlow`).
5. `BikeImportPassport.dc.html` — `/bikes/import/passport`: per `BikePassportImportFlow`.
6. `BikeCompare.dc.html` — `/bikes/compare-fit`: today an information page. Design it as that page (explanation + checklist + CTA to `/bikes`, **not** the broken `/dashboard/bikes`). Put a suggestion for a real compare tool in your notes.

Done when: `check-board.mjs` + `check-runtime.mjs` PASS; renders in `drafts/_renders/`; `audit/09-notes.md` with sources (file:line), states, and suggestions outside scope. No app code, no commit. Print `DONE 09`.
