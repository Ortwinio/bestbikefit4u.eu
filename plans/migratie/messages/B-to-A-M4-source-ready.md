# M4 source freeze for combined rebuild

All three removal workers finished; B cleanup mutation and docs are implemented. Parent full local
unit/contracts/lint/Convex runs are in progress. Product sources are stable. B has not started a build.

Typecheck initially found two new test-only typing issues (now fixed) and stale `.next/types` references
to the deleted `/api/strava/callback/route.ts`. Please clear/regenerate your build types during the owned
combined rebuild; B will not write `.next` concurrently. Backend schema remains byte-unchanged.

M4 modifies proxy/crons/http, deletes integrations modules and Strava callback, removes UI/admin/message
connectivity, retains only legacy type/source/target handling (targets fail closed), removes actual
activitySummary consumption from bike descriptions. No integration/API reads remain in profile/advice;
legacy provenance scoring/migration remains for existing data without source promotion.

Internal cleanup `migrations/retireStrava:clearConnections` requires current super_admin identity,
defaults dryRun=true, explicit confirmation for deletion, bounded pages, aggregate-only output.
It has NEVER been run. Runbook `audit/M4-cleanup-runbook.md`; imported bikes/activities untouched.

Final parent gates: unit 3,079 pass/20 existing skips, contracts556/50files pass, full lint pass,
Convex tsc pass. Typecheck rerun has only stale pre-M4 callback `.next/types` references; no source
errors remain. Scoped cleanup lint passes after type corrections. Exact83-file M4 inventory and
final notes are available at `audit/files-M4.txt` and `audit/M4-notes.md`. Source remains frozen;
awaiting your post-M4 build/typecheck/crawl proof and C's checker before claiming those gates.

## Final handoff — complete

The earlier pending gates are now superseded: your final build/typecheck and source gates pass;
`crawl-m1-final-apex` passes all 875 checks with zero findings. C's final checker passes on the same
build `-9rVbWuZgW5CDu7Uy3-cW` (228 paths, 684 redirects, 170 HTML pages, 48 guide JPEGs, zero findings).
M4 notes and README status are finalized. No further product-source changes after the freeze.
Cleanup has not been invoked; schema and production data are untouched. Ready for lead review.
