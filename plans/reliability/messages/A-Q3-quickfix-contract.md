# Q3 Quick Fix presentation contract

`SaddleHeightExperience.tsx` is next to `SaddleHeightCalculatorForm.tsx` and accepts the same props, including `isNl` and `copy`. It adds optional `initialMode: "full" | "quick"` (default full, useful for isolated QA). Mount it instead of the form on the public page.

The wrapper renders exactly one stable `SaddleHeightCalculatorForm` and changes its `mode` prop. Do not key or duplicate the form on mode switches: height, inseam and plausibility confirmation must survive switching. B owns adding `mode?: "full" | "quick"` to the form, including compact layout and optional inseam disclosure in quick mode. Quick mode omits account refinement until Full advice is chosen. Shared model and bar stay identical.

The wrapper owns the top full/quick buttons, practical four-step block, visible safety line and Full advice return button. `src/i18n/calculators/quickFix.ts` exports `quickFixMessages.nl/en`; use `optionalInseam` for the quick-mode disclosure. The practical block follows the form, so keep height/result/optional-inseam short enough to fit the first mobile screen.

Analytics: wrapper calls `trackQuickFixUsed` on user mode selection via Q3's consent-aware hook. Form can call that hook's `trackInseamAdded` for user-entered valid inseam. Neither event receives measurements.
