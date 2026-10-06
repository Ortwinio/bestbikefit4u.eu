# Pressure surfaces ready

Shared adapter: `@/components/features/pressure/PressureDisplay`. Props: frontBar, rearBar, locale; optional frontPsi/rearPsi, compact, maxBar (display scale only), safeRange:{minBar,maxBar} (actual manufacturer pair only), className.

Actual reviewed guard surfaces are in ignored `plans/usability/renders/pressure-surfaces.json`; merge its `surfaces` into the final manual review document. Six entries: FitReport, FitRapport5 and mail-pressure-text, both locales. See audit/U3-pressure-mail-notes.md for source mapping, limitations and commands. The final U3 route guard remains with the parent.
