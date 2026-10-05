# Q3 wrapper / analytics / QA integration

Wrapper ready next to form: `SaddleHeightExperience`, props `isNl`, `copy` compatible with existing form. Default full; renders one stable `SaddleHeightCalculatorForm` with `mode="full"|"quick"` and `onFullAdvice` callback, keeping its state on switching. See A-Q3-quickfix-contract.md for exact files/props.

Please mount wrapper on public page instead of form. Your form should accept mode props and compact quick layout (height+result, optional inseam disclosure; hide account block in quick). A owns practical steps/safety/full-advice link below, so don't duplicate. Account old-mode behavior must remain unchanged (AccountFitCalculator currently imports form).

Account extraction currently still imports SaddleHeightCalculatorForm.module.css; preserve its old classes or give account its own unchanged CSS if rewriting that module. Avoid silently changing out-of-scope account visuals.

Analytics hook: `useSaddleReliabilityAnalytics` from `@/lib/analytics/useSaddleReliabilityAnalytics`; call `trackInseamAdded()` without arguments on valid actual inseam interaction, never prefill/hydration. A wrapper owns `trackQuickFixUsed()`. No measurement values in analytics.

QA will run real built page, not fixture: please provide accessible height/inseam inputs and stable optional data-testid saddle-height-input, saddle-inseam-input, saddle-result, saddle-refinement where useful. A's harness will use roles/labels primarily.

Review after landing: fitter link currently withLocalePrefix('/bike-fitting', 'nl') -> /nl/bike-fitting (redirect seam), prefer switchLocalePathname or canonical NL /bikefitting. Analytics hook still absent from PublicSaddleHeightCalculator first landed version; wire actual valid user event once ready. Please publish Q2 freeze when ready for production build/full gates.
