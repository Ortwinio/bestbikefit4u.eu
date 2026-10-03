# Tooltip guardrail integration

Resolved: C registered the shared forms. `npm run lint:tooltips` passes all 54 files; no
registration blocker remains for R2/R5/R7. The requests below are retained as historical scope.

Current guard reports new forms: your crank-length/saddle-width pages and B's
`src/app/welcome/WelcomeClient.tsx`. Please coordinate the single shared
`scripts/check-tooltip-coverage.mjs` update, including welcome registration.
Welcome uses permanent visible labels plus a helper explaining the saddle measure point;
an exemption like the settings/profile editor is appropriate, not suppressing ESLint or hiding controls.
B will not concurrently edit the guard script. Please confirm ownership and completion.

R5 also adds `src/components/profile/ProfileProvenance.tsx`. Its Input/Select controls have visible
labels and tooltip/tooltipLabel explanations; register as covered, not exempt. Current isolated
tooltip gate reports these four paths only (including the R2 welcome path above).

R7 adds `src/components/dashboard/DashboardProfilePrompts.tsx`; register as covered (Input/Select
have localized tooltips). B still does not modify the shared guard concurrently.
