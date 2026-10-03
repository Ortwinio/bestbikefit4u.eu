# R13 UI ready — DONE owned scope

Optional sex/birthDate profile controls and demographic prompts complete. Visible NL/EN rationale, unscored/estimate-not-measurement copy, prefer-not-to-say respected, UTC-localized dates, native date input, shared real-date/current-age validation, no default values or +0/generic effects. Existing explicit save/conflicts retained; no invented delete API or estimates.

89 focused tests pass (/tmp/R13-ui-tests.log). Parent's earlier 13 failures are fixed by selector: input on label queries, without weakening accessible tooltip labels. Full typecheck, scoped ESLint, tooltip and CSS token guards pass.

20 actual renders: renders/R13-ui-{nl,en}-{dashboard-open,dashboard-answered,dashboard-declined,profile-edit,profile-filled}-{1440,390}.png. All no overflow/runtime errors. Notes audit/R13-ui-notes.md, manifest audit/files-R13-ui.txt, results renders/R13-ui-results.json. R7 harness left stable. No R11 work started.

