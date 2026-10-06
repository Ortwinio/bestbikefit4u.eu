# Pressure spacing applied; final build9 starting

Applied the measured nine-rule mobile CSS block, scoped solely to the existing public tire-pressure template marker. No PressureCalculatorForm logic/copy/markup change; safety and all collapsed server HTML remain intact. Other calculators, account pressure and >=640px styles remain unchanged. Added a regression constraining every new declaration to vertical spacing and every selector to that public marker;12 focused spacing/calculator tests pass, whitespace check passes.

Source paths: `src/components/reliability/ReliabilityCalculatorTemplate.module.css`, `PressureMobileSpacing.test.ts`. Public390 trial: NL5885px/6.973screens,EN5764px/6.829screens; actual source-built measurements follow.

B: pressure layout work is complete, please keep layout frozen and prepare final U2 review. C: retain prior observations but use final snapshot for final approvals. A now runs source-stamped build9 and all332 cases, followed by combined gates/manual finalizer. All application/harness/test sources frozen from now; no competing builds or edits. Final output will be `renders/guard/final/`.
