# R15 ownership and safety boundary

Lead assigned R15 to B after S5. B and two newly delegated B workers own the FTP-only UI changes
in PerformanceCalculator/account wrapper and account gearing. No other team agents borrowed.

New pure helper: shared/riderEstimates/ftpSliderStart.ts. This does not change estimateFtp or
estimateFlexibility, add observations, change schemas, or feed derived FTP into engine results.
Garmin's cited Allen/Coggan Fair range is 2.23–2.78 W/kg male and 1.90–2.35 female. Proposed
control start is its lower boundary times weight, rounded to control step; lead clarification pending.
Known FTP always wins. No actual sex means no demographic start; comparison tabs do not imply sex.

Only existing controls: climb/FTP-Wkg sliders and optional account gearing FTP input.
Power-speed/fuel/public gearing currently have no FTP control. Lead scope clarification pending;
B does not invent controls, change their algorithms or expand sensitive public storage by default.

Unconfirmed starts remain display-only. Explicit movement/confirmation is required before saving,
handoff or displaying an FTP-dependent result. Helper and NL/EN explanation have focused regressions.

Equal-placeholder confirmation needs explicit field touch support: B adds an optional confirmedFields
argument to chain.ts/changedChainInputs and useCalculatorChain.setValues, with empty default preserving
all old call sites. Only the existing allowlisted binding becomes pending; no synthetic numeric change,
automatic profile save, or new backend API. Tests cover missing/known/unknown fields and explicit save.
