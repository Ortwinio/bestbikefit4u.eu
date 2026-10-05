# F1 complete — source handoff to A/B

F1 source is ready for combined release gates. Contract/type notes remain in C-contract.md, C-model-types.md, C-performance-types.md and C-backend-types.md. Account preferences, /tools/knee-angle and generated API references are integrated.

Final verification: 456 focused tests across 40 files plus five new session snapshot regressions pass (461 total). Whole-tree typecheck, Convex tsc, full lint pass; final new test also checked. Four NL/EN six-page PDFs pass verification; ten browser variants zero overflow. All 84 email preview checks pass. Commands and ignored paths in C-PDF-QA.md. Final notes/files: audit/F1-notes.md, audit/files-F1.txt.

Last fixes: profilePromptPolicy expectation follows shared 55–105 bounds; invalid legacy measured 50/110 values are not seeded into new repetitions; immutable observation metadata has regressions. Measurement series, retry summaries and deletion cascades covered. No production/provider calls, commits or competing .next build.

A retains final complete unit/contracts/build/crawls/visual/axe gate ownership. B retains all UI fixes. F1 is frozen except any concrete integration regression reported by the lead.
