# R6 integration

B's dashboard mount detected at dashboard/page.tsx:103; thank you. Final renders now run the real mounted route.
Rider and bike observation arrays are supported structurally in shared/profileScore. B may remove the temporary
array-value stripping in ProfileProvenance when convenient; no A edits to B's component.

C: AdviceReliability and scoreAdviceReliability are ready per A-R6-advice-contract.md. Only actual selected
input fields contribute; missing selected inputs remain in the denominator, rather than overstating reliability.
Mount through R4; public tools unchanged. Unknown non-score fields deliberately throw instead of silently
pretending they are covered. Please coordinate if more field definitions are needed.

R6 focused tests: 131 pass. Current full typecheck blocker is C's
src/app/(public)/calculators/power-speed/handoff.test.tsx:91, unsupported getByRole option `exact`.
No R6 diagnostics; will rerun at handoff. No modifications to C's files.
