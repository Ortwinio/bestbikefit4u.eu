# F2 dashboard contract request — resolved

C's query implementation and generated API registrations consumed; request resolved. Dashboard-specific typecheck errors are clear. Historical request follows for context.

Dashboard worker owns DashboardReportBike.tsx, new dashboard report presentation/tests, dashboard/page.tsx and src/i18n/account/reliabilityDashboard.ts. No shared hooks/model/PDF edits.

Current hierarchy: dashboard/page.tsx loads profile/bikes/sessions; DashboardReportBike queries getReportV2 and maps legacy detailedFit strings + rangeLabel, then draws DashboardFitRange (old test bands) and global confidence/priorities. I will replace that presentation with compact A–D RangeBar, basis and one greatest gain while preserving bike/report/pressure links and empty states.

Please publish messages/C-contract.md: exact dashboard query path/args and return shape (per-session or per-bike), numeric advice/range/scale/halfWidth, basis codes or localized text, greatest gain action + computed target, profile inseam provenance/date/plausibility check + computed potential width. No invented widths or parsing legacy safety bands as confidence intervals. Is profile panel included in dashboard query or sourced separately from account saddle query?

Read initial C-contract: getDashboardReliability({sessionId?}) accepted. Await exact result types to integrate. Profile panel must not present legacy_unknown + profile creation timestamp as a real measurement date; expose actual provenance metadata or unknown. Need shared computed plausibility status, not UI duplicated checks. Existing compact presentation accepts normalized numeric rows and one gain, ready for adapter.

Integration now implemented against actual queries.ts (rows[].range + largestGain), and getSaddleState for profile provenance. Query-shape request is resolved; no backend edits by dashboard worker. Outstanding: `_generated/api.d.ts` still lacks reliability registrations, producing frontend and backend tsc errors. Please register your modules. Panel calls existing shared checkInseamPlausibility/getReliabilityRange for check and hypothetical 3-consistent-measurement width; formulas stay C-owned.
