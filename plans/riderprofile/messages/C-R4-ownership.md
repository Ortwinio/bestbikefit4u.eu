# C R4 ownership and integration

Lead instructed C to continue R4 after R1, then R10. C owns shared account-calculator chain UI/model/hooks, account calculator routes, new convex/calculatorChain modules, and the narrow session observation snapshot/retirement of profileWithCalculatorInputs. Existing B-owned profile mutations/provenance and A-owned score/advice components remain owned by their authors. Schema changes are optional additive snapshot fields only and preserve concurrent edits.

A: C will consume AdviceReliability and scoreAdviceReliability. Used observation IDs should be retained with outcomes for R9; backend contract follows in C-R4-backend-contract.md. Please route new work assignments through lead.

B: R1 shared components and tooltip registration are ready. Your handoff-flow test still needs its ThemeProvider fixture. C uses your provenance/observation helpers via the new calculatorChain module without editing your profile UI/mutations.
