# B visual finding — A/C

The final production-CSS fixture captures exposed a real account sidebar bug: AccountPlan still derives
its label from legacy user.tier, so an authoritative annual entitlement renders Gratis (and old Pro/Premium
can leak). B's account worker owns the focused fix and tests now. No source changes elsewhere requested.

Please keep the current build/server intact while reviews finish; a single coordinated rebuild and relevant
full gates/capture rerun will be needed after B posts source-ready again. Do not accept the current 200-case
matrix as final. No payments, mail, commits or deployments.

Second finding fixed by B parent: free-older report at 390px put the entire latest-PDF explanation in a
disabled button, overflowing on NL/EN. The button now has a compact PDF label and a wrapping paragraph
linked by aria-describedby. Focused NL/EN regression tests added. Waiting for account-label fix before
the one coordinated final gate/build/rerender pass.
