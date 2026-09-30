# 03 — Fix the existing boards (Codex A)

Read `README.md`, `BOARD-RULES.md` and `audit/engine-alignment.md` first.

## Task

Copy each board below from `canvas/` to `drafts/` and fix it there. Change only what is listed; everything else stays exactly as it is.

1. **`BikeFit.dc.html`**: apply must-fix BF1–BF8 from `audit/engine-alignment.md`.
2. **`SaddleHeight.dc.html`**: SH1–SH6. The knee-angle drawing may stay, but label it as an illustration, not a measurement (SH6).
3. **`FrameSize.dc.html`**: FS1–FS5.
4. **`TirePressure.dc.html`**: TP1–TP8.
5. **`Login.dc.html`**: the live login (`src/app/(auth)/login/page.tsx`) uses an **email code via Resend + Google**, not a password. Redesign the right-hand panel into these states in one artboard, with `<sc-if>` and state: (a) enter email + "Stuur inlogcode" + Google button; (b) enter the 6-digit code (six boxes or one field, with a label) + "Opnieuw sturen" + "Ander e-mailadres". Remove the password field. Take the texts from the real page (NL), or write them concisely in the same tone.
6. **Tab bar**: in the four configurators, replace the tab bar with the complete one from `BOARD-RULES.md` (Cranklengte, Zadelbreedte and Verzet link to `CrankLength.dc.html`, `SaddleWidth.dc.html` and `Gearing.dc.html`).

For every formula that remains, add the comment `// VOORLOPIGE REKENREGEL — echte engine: <file:line>`.

## Also deliver

`audit/03-changes.md`: per board, a list of the must-fix IDs with 1 line describing how you solved each one. If you consciously did not solve an item, give the reason.

## Done when

- `node plans/redesign-canvas/check-board.mjs plans/redesign-canvas/drafts/{BikeFit,SaddleHeight,FrameSize,TirePressure,Login}.dc.html` passes for all five.
- `diff canvas/X drafts/X` shows only the changes that belong to these tasks.
- No app code changed, no commit.

Print `DONE 03` as your last line.
