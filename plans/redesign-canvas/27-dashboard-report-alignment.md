# 27 — Align the dashboard with the new report (Codex B)

**App code, don't commit** (the lead reviews). Ortwin has updated the Dashboard board on the canvas so that it matches the new PDF report (brief 26): `canvas/Dashboard.dc.html` (the new version, 1440 × 1764). The previous version is in git history (`git show 0a7183d:plans/redesign-canvas/canvas/Dashboard.dc.html`).

## How
1. **Diff** the old and new boards and list the changes in `audit/27-notes.md` (sections, order, labels, what's new, e.g. the same A–D values/terms, advice confidence, "Pas eerst deze punten aan", the tire pressure per bike, and the language of the report).
2. Build those changes in `/dashboard` (your account-shell and dashboard files). Use the **same data sources and the same terms** as the report (`src/lib/reports/reportV2Mapper.ts`, `reportV2Copy.ts`), so the dashboard and PDF always show the same values. Codex C is building the report in parallel. Coordinate through shared helpers in `src/lib/reports/` only when needed; announce such a change in your notes, and C won't change them without coordinating.
3. Example data on the board is for layout only; the real data comes from Convex. Show states without data gracefully (no fit yet, no pressure advice).
4. NL + EN in your account dictionary (`src/i18n/account/*`).

## Done when
- Tests for the new/changed dashboard parts; existing dashboard tests green.
- typecheck, lint, test:unit, test:i18n and build pass.
- Screenshots at 1440 + 390, light + dark, next to the board render → `code-renders/27-*`.
- `audit/files-27.txt` (no .png). Print `DONE 27`.
